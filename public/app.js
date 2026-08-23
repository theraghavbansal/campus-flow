const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

let requests = [], runs = [];

async function api(url, options={}) {
  const r = await fetch(url, {headers: {"Content-Type":"application/json"}, ...options});
  if (!r.ok) throw new Error((await r.json()).error || "Request failed");
  return r.json();
}
function statusClass(s){return s.toLowerCase().replace(" ","-")}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function time(iso){return new Date(iso).toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("toast-show");setTimeout(()=>t.classList.remove("toast-show"),2500)}

async function load(){
  [requests,runs]=await Promise.all([api("/api/requests"),api("/api/runs")]);
  render();
}
function render(){
  const pending=requests.filter(r=>r.status==="Pending").length;
  const manual=requests.filter(r=>r.status==="Manual Review").length;
  $("#total").textContent=requests.length;
  $("#pending").textContent=pending;
  $("#manual").textContent=manual;
  $("#completed").textContent=runs.filter(r=>r.status==="Completed").length;
  $("#pendingBadge").textContent=pending+manual;

  $("#recentRequests").innerHTML=requests.slice(0,5).map(r=>`
    <div class="item"><div><b>${esc(r.student)}</b><small>${esc(r.message)}</small></div><span class="badge ${statusClass(r.status)}">${esc(r.status)}</span></div>`).join("");

  const q=$("#search").value.toLowerCase();
  $("#requestsTable").innerHTML=requests.filter(r=>(r.student+r.message+r.status).toLowerCase().includes(q)).map(r=>`
    <tr>
      <td class="request-cell"><b>${esc(r.student)}</b><span>${esc(r.message)}</span><div class="confidence">AI confidence: ${Math.round(r.confidence*100)}%</div></td>
      <td><b>${esc(r.reason)}</b><div class="confidence">${esc(r.dates)} • ${esc(r.type)}</div></td>
      <td><span class="badge">${esc(r.priority)}</span></td>
      <td><span class="badge ${statusClass(r.status)}">${esc(r.status)}</span></td>
      <td>${esc(r.owner)}</td>
      <td>${r.status==="Pending"||r.status==="Manual Review"?`<button class="btn-sm approve" onclick="decision('${r.id}','Approved')">Approve</button> <button class="btn-sm reject" onclick="decision('${r.id}','Rejected')">Reject</button>`:"—"}</td>
    </tr>`).join("");

  const approvals=requests.filter(r=>r.status==="Pending"||r.status==="Manual Review");
  $("#approvalList").innerHTML=approvals.length?approvals.map(r=>`
    <div class="approval-card"><span class="pill">${esc(r.status)}</span><h3 style="margin-top:10px">${esc(r.student)} <span style="color:#a0a8b6;font-weight:400">• ${esc(r.id)}</span></h3>
      <div class="message">“${esc(r.message)}”</div>
      <p><b>AI recommendation:</b> ${esc(r.reason)} • ${esc(r.dates)} • ${esc(r.priority)} priority</p>
      <p><b>Confidence:</b> ${Math.round(r.confidence*100)}% — ${r.confidence<.7?"human review recommended":"ready for approval"}</p>
      <div class="approval-actions"><button class="primary" onclick="decision('${r.id}','Approved')">✓ Approve & Execute</button><button class="btn-sm reject" onclick="decision('${r.id}','Rejected')">Reject</button></div>
    </div>`).join(""):"<div class='panel'><h3>Queue is clear.</h3><p>No consequential decisions are waiting for a human.</p></div>";

  $("#runsTable").innerHTML=runs.map(r=>`<tr><td>${time(r.timestamp)}</td><td><b>${esc(r.requestId)}</b></td><td><span class="badge completed">Completed</span></td><td>${esc(r.action)}</td><td>${esc(r.decision)}</td><td>${esc(r.writtenBy)}</td></tr>`).join("");
}
async function decision(id, decisionValue){
  try{await api(`/api/requests/${id}/decision`,{method:"POST",body:JSON.stringify({decision:decisionValue})});toast(decisionValue==="Approved"?"Approved — real action simulated and logged.":"Request rejected and logged.");await load();show("approvals")}catch(e){toast(e.message)}
}
window.decision=decision;

function show(view){
  $$(".view").forEach(v=>v.classList.remove("active"));
  $("#"+view).classList.add("active");
  $$(".nav").forEach(n=>n.classList.toggle("active",n.dataset.view===view));
  const titles={dashboard:"Operations Overview",requests:"Requests Database",approvals:"Approval Queue",runs:"Run Log",system:"System Architecture"};
  $("#pageTitle").textContent=titles[view];
}
$$(".nav").forEach(n=>n.onclick=()=>show(n.dataset.view));
$$("[data-go]").forEach(n=>n.onclick=()=>show(n.dataset.go));
$("#search").oninput=render;
$("#newRequestBtn").onclick=()=>$("#modal").classList.remove("hidden");
$("#closeModal").onclick=()=>$("#modal").classList.add("hidden");
$("#resetBtn").onclick=async()=>{await api("/api/demo/reset",{method:"POST"});toast("Demo data reset.");load()};

$("#requestForm").onsubmit=async e=>{
  e.preventDefault();
  try{
    const item=await api("/api/requests",{method:"POST",body:JSON.stringify({student:$("#student").value,email:$("#email").value,message:$("#message").value})});
    $("#modal").classList.add("hidden");e.target.reset();await load();show(item.status==="Manual Review"?"approvals":"requests");
    toast(item.status==="Duplicate"?"Duplicate suppressed — logged safely.":"AI processed the request and routed it.");
  }catch(err){toast(err.message)}
};

load();

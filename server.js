const express = require("express");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const requests = [];
const runs = [];

const seed = [
  {
    id: "CF-1001",
    student: "Aarav Sharma",
    email: "aarav@example.com",
    message: "Sir kal ghar mein function hai, college nahi aa paunga.",
    type: "Leave",
    priority: "Normal",
    confidence: 0.96,
    status: "Approved",
    owner: "M. Sharma",
    reason: "Family function",
    dates: "24 Aug 2026",
    createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString()
  },
  {
    id: "CF-1002",
    student: "Riya Verma",
    email: "riya@example.com",
    message: "sir urgent leave pls",
    type: "Leave",
    priority: "Low-conf",
    confidence: 0.48,
    status: "Manual Review",
    owner: "—",
    reason: "Reason not provided",
    dates: "Not specified",
    createdAt: new Date(Date.now() - 1000 * 60 * 24).toISOString()
  },
  {
    id: "CF-1003",
    student: "Rahul Iyer",
    email: "rahul@example.com",
    message: "Fever hai, 2 din leave chahiye",
    type: "Leave",
    priority: "High",
    confidence: 0.91,
    status: "Pending",
    owner: "R. Iyer",
    reason: "Fever",
    dates: "2 days",
    createdAt: new Date(Date.now() - 1000 * 60 * 9).toISOString()
  }
];
seed.forEach(x => requests.push(x));

function extract(message) {
  const m = message.toLowerCase();
  let reason = "General leave";
  if (m.includes("fever") || m.includes("sick") || m.includes("ill")) reason = "Health";
  else if (m.includes("function") || m.includes("wedding") || m.includes("shaadi")) reason = "Family event";
  else if (m.includes("exam") || m.includes("test")) reason = "Exam";
  else if (m.includes("emergency") || m.includes("urgent")) reason = "Urgent personal matter";

  let priority = "Normal";
  if (m.includes("emergency") || m.includes("hospital") || m.includes("urgent")) priority = "High";

  const number = m.match(/(\d+)\s*(day|days|din)/);
  const dates = number ? `${number[1]} day(s)` : "Next working day";

  let confidence = 0.91;
  if (message.trim().length < 20 || m.includes("urgent leave pls")) confidence = 0.48;
  if (!m.includes("leave") && !m.includes("aa") && !m.includes("college") && !m.includes("nahi")) confidence -= 0.15;

  return { reason, priority, dates, confidence: Math.max(0.2, Math.min(confidence, 0.99)) };
}

function duplicateOf(message) {
  const normalized = message.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  return requests.find(r =>
    r.status !== "Duplicate" &&
    r.message.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim() === normalized
  );
}

app.get("/api/health", (_, res) => res.json({ ok: true, service: "CampusFlow AI" }));

app.get("/api/requests", (_, res) => res.json(requests));

app.get("/api/runs", (_, res) => res.json(runs));

app.post("/api/requests", (req, res) => {
  const { student, email, message } = req.body;
  if (!student || !message) return res.status(400).json({ error: "Student and message are required." });

  const dup = duplicateOf(message);
  if (dup) {
    const item = {
      id: `CF-${Math.floor(1000 + Math.random() * 9000)}`,
      student,
      email: email || "student@example.com",
      message,
      type: "Leave",
      priority: "Normal",
      confidence: 0.99,
      status: "Duplicate",
      owner: "System",
      reason: "Duplicate request detected",
      dates: "—",
      createdAt: new Date().toISOString()
    };
    requests.unshift(item);
    runs.unshift({
      id: crypto.randomUUID(),
      requestId: item.id,
      status: "Completed",
      action: "Duplicate suppressed",
      decision: "Suppressed",
      timestamp: new Date().toISOString(),
      writtenBy: "CampusFlow integration"
    });
    return res.json(item);
  }

  const ai = extract(message);
  const item = {
    id: `CF-${Math.floor(1000 + Math.random() * 9000)}`,
    student,
    email: email || "student@example.com",
    message,
    type: "Leave",
    ...ai,
    status: ai.confidence < 0.7 ? "Manual Review" : "Pending",
    owner: ai.confidence < 0.7 ? "—" : "Faculty",
    createdAt: new Date().toISOString()
  };
  requests.unshift(item);

  if (item.status === "Manual Review") {
    runs.unshift({
      id: crypto.randomUUID(),
      requestId: item.id,
      status: "Completed",
      action: "Routed to manual review",
      decision: "AI confidence below threshold",
      timestamp: new Date().toISOString(),
      writtenBy: "CampusFlow integration"
    });
  }
  res.json(item);
});

app.post("/api/requests/:id/decision", (req, res) => {
  const item = requests.find(r => r.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Request not found." });

  const { decision, override } = req.body;
  if (!["Approved", "Rejected", "Manual Review"].includes(decision)) {
    return res.status(400).json({ error: "Invalid decision." });
  }

  item.status = decision;
  item.owner = decision === "Rejected" ? "Faculty" : (override || "M. Sharma");

  const run = {
    id: crypto.randomUUID(),
    requestId: item.id,
    status: "Completed",
    action: decision === "Approved" ? "Approval email sent" : decision === "Rejected" ? "Rejection email sent" : "Routed to manual review",
    decision: decision + (override ? ` • Override: ${override}` : ""),
    timestamp: new Date().toISOString(),
    writtenBy: "CampusFlow integration"
  };
  runs.unshift(run);
  res.json({ item, run });
});

app.post("/api/demo/reset", (_, res) => {
  requests.splice(0, requests.length, ...seed);
  runs.splice(0, runs.length);
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`CampusFlow AI running at http://localhost:${PORT}`));

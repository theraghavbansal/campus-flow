# CampusFlow AI

**Automate India Hackathon 2026 — Notion Track**
Team: Coding Brats

> Your code is the engine. Notion is the interface.

CampusFlow AI turns messy student requests — WhatsApp messages, forms, emails, in English, Hindi, or Hinglish — into a structured, auditable workflow. AI does the reading and drafting. A human makes every real decision, inside Notion. A real backend performs the real-world action and proves it happened.

---

## The problem

Small requests still become manual workflows. A student's leave request arrives informally, and a staff member has to read it, interpret it, decide, act, and remember to follow up — every single time. Nothing is hard here; it's just repetitive, and nothing tracks what was decided or whether the action actually happened.

## The solution

1. **Message received** — a request comes in through any channel, in whatever language or phrasing the student actually used.
2. **AI extracts & classifies** — pulls out date, duration, reason, request type, and a priority/confidence score. No rigid forms, no keyword templates.
3. **Notion approval queue** — every decision a human needs to make happens natively inside Notion. Notion is the interface, not a middleman.
4. **Human decision** — the authorized staff member approves, rejects, or overrides. Nothing moves without them.
5. **Real action executed** — the backend performs the actual action outside Notion (e.g. sends the approval email).
6. **Run Log updated** — that same execution writes a timestamped, attributed row to the Run Log. Never typed by hand.

**Design principle:** if an if-statement could have done it, an if-statement did it. AI is reserved for what rules genuinely can't handle — reading messy input and drafting a response for review. It never makes the final call.

**Reliability:** duplicate requests are detected and suppressed automatically. Low-confidence extractions are routed to manual review instead of guessed at. Nothing fails silently — everything the system can't handle goes to a human.

---

## Where this stands right now

Being direct about what's real versus simulated, since that distinction matters for judging:

| Piece | Status |
|---|---|
| AI extraction & classification | **Real** — live call to Claude, not scripted |
| Approval Queue / Requests Database / Run Log UI | **Real**, built as an interactive prototype (see `campusflow-prototype.jsx`) |
| Duplicate suppression & manual-review routing | **Real**, running logic — not a hardcoded demo path |
| Notion workspace (real API, real integration-written rows) | **In progress** — Notion connector authorized, databases not yet provisioned |
| Node/Express backend, deployed webhook/cron | **Not yet built** — currently simulated inside the prototype |
| Real email sending | **Not yet wired** — approvals currently simulate the send |
| MongoDB/PostgreSQL persistence | **Not yet built** — prototype persists to local artifact storage |

The interactive prototype demonstrates the full logic and UX end to end and is safe to demo as-is. The claim that would need to hold up under a "delete-the-repo" style challenge — a live Notion workspace being written to by a real backend — isn't true yet. Treat the sections above marked "in progress" or "not yet built" as the remaining work, not as already shipped.

---

## Tech stack

- **Frontend:** HTML5, CSS3, JavaScript, React
- **Backend (planned):** Node.js, Express.js
- **AI:** LLM-based extraction, classification, and response drafting
- **Workspace/interface:** Notion API, own integration token
- **Data (planned):** MongoDB or PostgreSQL
- **External action:** Email provider + deployed webhook/cron

---

## Running the prototype

The prototype (`campusflow-prototype.jsx`) is a self-contained React artifact — open it in Claude (claude.ai) as an artifact to run it directly, no build step needed. It persists demo data across sessions and includes quick-fill sample messages (a normal request, a high-priority medical one, and a deliberately vague one) so you can walk through the extraction, routing, approval, and duplicate-suppression paths without typing from scratch.

To turn it into a standalone web app outside Claude, it would need to be dropped into a normal React project (Vite or Create React App), with `lucide-react` installed and Tailwind configured — it currently relies on both being available in the artifact environment.

## Next steps to close the gap with the pitch

1. Provision the Notion workspace: a `CampusFlow AI` page with Requests Database and Run Log databases, matching the columns above.
2. Wire the prototype's Approve/Reject actions to write real rows via the Notion API instead of simulating them.
3. Stand up a small Node/Express service to own the actual side effects (sending the approval email, writing the Run Log row) and deploy it somewhere reachable, so the flow works even with this chat closed.
4. Swap local artifact storage for MongoDB/PostgreSQL once there's a real backend to own that data.

---

## Team

**Coding Brats** — Automate India Hackathon 2026, Notion Track

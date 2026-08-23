# CampusFlow AI

**Human-in-the-loop college workflow automation prototype**

CampusFlow AI turns messy student leave requests into a structured workflow:

**Message → AI extraction → Human approval → Real action → Run Log**

The prototype is based on the CampusFlow AI hackathon concept: Notion is the human control center, while a real Node/Express backend acts as the automation engine. The UI included here is a GitHub-ready local prototype of that experience.

## What this prototype demonstrates

- Natural-language / Hinglish leave request intake
- AI-style extraction of reason, dates, priority and confidence
- Low-confidence requests routed to **Manual Review**
- Duplicate detection and suppression
- Human approval / rejection
- Simulated external email action after approval
- Timestamped Run Log attributed to `CampusFlow integration`
- Requests database and approval queue
- System architecture / reliability view
- Responsive dashboard

## Run locally

```bash
npm install
npm start
```

Open:

```text
http://localhost:3000
```

## Demo scenarios

### 1. Normal request

Try:

> Sir kal ghar mein function hai, college nahi aa paunga.

The system extracts the reason, gives a confidence score, and places it into the approval workflow.

### 2. Low-confidence request

Try:

> sir urgent leave pls

This is intentionally incomplete and is routed to **Manual Review**.

### 3. Duplicate

Submit the exact same request twice. The second request is marked **Duplicate** and the second action is suppressed.

### 4. Approval

Open **Approval Queue**, click **Approve & Execute**, then open **Run Log**. The execution proof is recorded by the backend.

## Architecture

```text
Student
   ↓
Web UI / Webhook
   ↓
Node.js + Express
   ↓
AI Extraction + Classification
   ↓
Human Control Center
   ↓
Approve / Reject / Override
   ↓
External Action
   ↓
Run Log
```

## Production upgrade path

For a real deployment, replace the heuristic extraction function with an LLM provider, persist requests/runs in PostgreSQL or MongoDB, connect the approval layer to the Notion API, and connect the action layer to a real email provider.

## Important

This is a hackathon prototype. The email action is intentionally simulated; it does not send real emails without connecting an external provider.

Team: **HackForge**

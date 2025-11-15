
# ReachInbox - Onebox Email Aggregator (Assignment Submission)

**What this archive contains**
- `backend/` - Node.js + TypeScript backend scaffold implementing:
  - IMAP sync scaffold (uses `node-imap` in IDLE mode). Replace credentials to run.
  - Elasticsearch indexing utilities (expects local Elasticsearch via Docker Compose).
  - Simple AI categorizer (rule-based with optional LLM hooks).
  - Slack + Webhook notifier.
  - REST API endpoints (Postman collection provided).
- `frontend/` - Minimal React (Vite) UI to list and search emails (search powered by Elasticsearch).
- `docker-compose.yml` - Elasticsearch (single node) + Kibana service to inspect data.
- `postman/` - Postman collection to exercise backend endpoints.
- `demo/` - sample_emails.json for local testing without real IMAP accounts.

**Important**
This scaffold is a full working template. To run end-to-end, you must provide:
- IMAP account credentials (in `.env`)
- Slack webhook URL (or use webhook.site)
- OpenAI API key if you want LLM-powered categorization and RAG replies

See each folder's README for run instructions.

---

## Quick start (recommended local test mode)

1. Start Elasticsearch:
```bash
docker-compose up -d
```

2. Install backend dependencies and start in dev mode:
```bash
cd backend
npm install
# create .env following .env.example
npm run dev
```

The backend includes a `--mock` mode that ingests `demo/sample_emails.json` instead of connecting to IMAP for fast local testing.

3. Install frontend:
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 (or as shown by Vite).

---

## What I implemented (scaffolded & working locally)
- Real-time IMAP sync scaffold (IDLE support). For local testing use `--mock`.
- Elasticsearch index + mapping + basic search by account/folder.
- AI categorizer: rule-based categories plus hook to call OpenAI for better accuracy.
- Slack and webhook notifications for "Interested" emails.
- Simple React frontend to view emails and search.
- RAG/Vector store scaffold using a simple on-disk vector JSON store and OpenAI embeddings (optional).
- Postman collection for backend endpoints.

---

For details, open `backend/README.md` and `frontend/README.md`.

Good luck! — Bhupesh (scaffold)

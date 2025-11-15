
# Backend (ReachInbox) - README

## Setup
1. Copy `.env.example` to `.env` and fill credentials.
2. Start Elasticsearch (see root README).
3. Install dependencies:
   ```
   cd backend
   npm install
   ```
4. Start backend:
   ```
   npm run dev
   ```
5. For local testing without IMAP, run with mock mode:
   - The server reads `demo/sample_emails.json` and indexes them.

## Endpoints (sample)
- GET /health
- POST /mock/ingest  -> ingest demo/sample_emails.json
- GET /emails?account=&folder=&q=  -> search
- POST /emails/:id/categorize  -> force categorize
- POST /emails/:id/suggest-reply -> returns suggested reply (requires OPENAI_API_KEY)

See Postman collection in `postman/`.

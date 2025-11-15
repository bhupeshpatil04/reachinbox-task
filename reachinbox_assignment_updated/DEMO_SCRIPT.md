
# Demo script (≤ 5 minutes) - ReachInbox Assignment

1. Start services
   - `docker-compose up -d` (starts Elasticsearch + Kibana)
2. Start backend
   - `cd backend && npm install && npm run dev`
3. Ingest demo emails
   - POST http://localhost:3000/mock/ingest  (use Postman or curl)
4. Start frontend
   - `cd frontend && npm install && npm run dev`
   - Open the UI (default Vite port shown in terminal)
5. Demo flow (approx 2-3 minutes)
   - Show UI listing emails; apply account/folder filters.
   - Search for "interested" and show results.
   - Click "Categorize" on an email to run the AI/rule-based categorizer.
   - Click "Suggest Reply" to show the RAG/LLM reply (requires OPENAI_API_KEY in backend/.env to generate LLM replies; otherwise returns template).
6. IMAP sync (optional)
   - To demo IMAP IDLE in a local environment, POST to `http://localhost:3000/sync/start` with JSON body:
     {
       "user":"youremail@example.com",
       "password":"yourpassword",
       "host":"imap.example.com",
       "port":993,
       "tls": true
     }
   - NOTE: Use app-specific passwords for Gmail and be cautious with credentials in demo.
7. Slack / Webhook
   - Configure SLACK_WEBHOOK_URL and WEBHOOK_URL in backend/.env to receive notifications when emails are marked Interested (future enhancement: automatic on categorize).

# Talking points:
- Real-time IMAP IDLE sync scaffold included.
- Elasticsearch used for indexing & search.
- Rule-based AI categorizer with optional OpenAI integration.
- Simple vector store for RAG (on-disk JSON) and suggest-reply endpoint.
- Frontend demonstrates search, filters, categorize, suggest-reply.


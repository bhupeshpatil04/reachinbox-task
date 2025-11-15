
import express from "express";
import fs from "fs";
import path from "path";
import { client } from "./elastic";
import { categorizeEmail, suggestReplyForEmail } from "./utils";

export const mockIngestRoute = express.Router();
export const emailsRoute = express.Router();

mockIngestRoute.post("/ingest", async (req, res) => {
  const demo = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "demo", "sample_emails.json"), "utf-8"));
  for(const e of demo) {
    await client.index({ index: "emails", document: e });
  }
  await client.indices.refresh({ index: "emails" });
  res.json({ ok:true, count: demo.length });
});

emailsRoute.get("/", async (req, res) => {
  const { account, folder, q } = req.query;
  const must:any[] = [];
  if(account) must.push({ term: { account }});
  if(folder) must.push({ term: { folder }});
  if(q) must.push({ multi_match: { query: q, fields: ["subject","body","from","to"] }});
  const body:any = must.length ? { query: { bool: { must } }} : { query: { match_all: {} } };
  const r = await client.search({ index: "emails", body, size: 100 });
  const hits = r.hits.hits.map(h => ({ id: h._id, ...h._source }));
  res.json(hits);
});

emailsRoute.post("/:id/categorize", async (req, res) => {
  const id = req.params.id;
  // fetch doc
  const doc = await client.get({ index: "emails", id }).catch(()=>null);
  if(!doc) return res.status(404).json({error:"not found"});
  const email = doc._source as any;
  const category = await categorizeEmail(email);
  await client.update({ index: "emails", id, doc: { category } });
  res.json({ id, category });
});

emailsRoute.post("/:id/suggest-reply", async (req, res) => {
  const id = req.params.id;
  const doc = await client.get({ index: "emails", id }).catch(()=>null);
  if(!doc) return res.status(404).json({error:"not found"});
  const email = doc._source as any;
  const reply = await suggestReplyForEmail(email);
  res.json({ id, reply });
});

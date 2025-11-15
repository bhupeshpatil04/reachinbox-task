
import express from "express";
import { startImapIdleSync } from "./imapSync";
export const syncRoute = express.Router();

const active:any = {};

syncRoute.post("/start", (req, res) => {
  const { user, password, host, port, tls } = req.body;
  if(!user || !password) return res.status(400).json({ error: "user & password required (for demo only)"});
  if(active[user]) return res.json({ ok:true, message: "already syncing" });
  try {
    const imap = startImapIdleSync({ user, password, host, port, tls });
    active[user] = imap;
    res.json({ ok:true, message: "sync started for " + user });
  } catch(e){
    res.status(500).json({ error: e.message || e });
  }
});

syncRoute.post("/stop", (req, res) => {
  const { user } = req.body;
  if(!user || !active[user]) return res.status(400).json({ error: "no active sync for user" });
  try {
    active[user].end();
    delete active[user];
    res.json({ ok:true });
  } catch(e){
    res.status(500).json({ error: e.message || e });
  }
});

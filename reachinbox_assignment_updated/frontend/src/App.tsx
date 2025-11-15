
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function App(){
  const [emails, setEmails] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [account, setAccount] = useState("");
  const [folder, setFolder] = useState("");
  const [accounts, setAccounts] = useState<string[]>([]);
  const [folders, setFolders] = useState<string[]>([]);

  useEffect(()=>{ fetchEmails(); }, []);

  async function fetchEmails(){
    const r = await axios.get("http://localhost:3000/emails");
    setEmails(r.data);
    const accs = Array.from(new Set(r.data.map((e:any)=>e.account)));
    const flds = Array.from(new Set(r.data.map((e:any)=>e.folder)));
    setAccounts(accs);
    setFolders(flds);
  }
  async function doSearch(){
    const r = await axios.get("http://localhost:3000/emails", { params: { q, account, folder }});
    setEmails(r.data);
  }
  async function categorize(id:string){
    await axios.post(`http://localhost:3000/emails/${id}/categorize`);
    doSearch();
  }
  async function suggest(id:string){
    const r = await axios.post(`http://localhost:3000/emails/${id}/suggest-reply`);
    alert("Suggested reply:\n\n" + r.data.reply);
  }

  return (
    <div style={{margin:20,fontFamily:"Arial"}}>
      <h1>ReachInbox - Demo UI</h1>
      <div style={{display:"flex",gap:10,marginBottom:10}}>
        <input placeholder="Search..." value={q} onChange={e=>setQ(e.target.value)} />
        <select value={account} onChange={e=>setAccount(e.target.value)}>
          <option value="">All accounts</option>
          {accounts.map(a=> <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={folder} onChange={e=>setFolder(e.target.value)}>
          <option value="">All folders</option>
          {folders.map(f=> <option key={f} value={f}>{f}</option>)}
        </select>
        <button onClick={doSearch}>Search</button>
        <button onClick={fetchEmails}>Refresh</button>
      </div>
      <ul style={{listStyle:"none",padding:0}}>
        {emails.map(e=>(
          <li key={e.id} style={{border:"1px solid #ddd",padding:10,margin:10}}>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <div><strong>{e.subject}</strong> — <em>{e.from}</em></div>
              <div><small>{new Date(e.date||'').toLocaleString()}</small></div>
            </div>
            <div style={{marginTop:6,whiteSpace:"pre-wrap"}}>{e.body}</div>
            <div style={{marginTop:6}}>Account: {e.account} | Folder: {e.folder} | Category: <strong>{e.category || "—"}</strong></div>
            <div style={{marginTop:6}}>
              <button onClick={()=>categorize(e.id)}>Categorize</button>
              <button onClick={()=>suggest(e.id)} style={{marginLeft:8}}>Suggest Reply</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

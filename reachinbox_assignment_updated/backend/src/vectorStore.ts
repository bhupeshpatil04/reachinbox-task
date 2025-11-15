
import fs from "fs";
import path from "path";
import crypto from "crypto";

const STORE = path.join(process.cwd(), "backend", "vector_store.json");

type VecItem = { id:string, text:string, vector:number[] };

function cosSim(a:number[], b:number[]){
  const dot = a.reduce((s, v, i) => s + v*(b[i]||0), 0);
  const na = Math.sqrt(a.reduce((s,v)=>s+v*v,0));
  const nb = Math.sqrt(b.reduce((s,v)=>s+v*v,0));
  return dot / (na*nb + 1e-9);
}

export function upsert(text:string, vector:number[]){
  let data:VecItem[] = [];
  if(fs.existsSync(STORE)) data = JSON.parse(fs.readFileSync(STORE,"utf-8"));
  const id = crypto.createHash("sha1").update(text).digest("hex");
  const item = { id, text, vector };
  const idx = data.findIndex(d=>d.id===id);
  if(idx>=0) data[idx] = item; else data.push(item);
  fs.writeFileSync(STORE, JSON.stringify(data,null,2));
  return id;
}

export function querySimilar(vector:number[], top=5){
  if(!fs.existsSync(STORE)) return [];
  const data:VecItem[] = JSON.parse(fs.readFileSync(STORE,"utf-8"));
  const scored = data.map(d=>({ ...d, score: cosSim(vector, d.vector) }));
  scored.sort((a,b)=>b.score - a.score);
  return scored.slice(0, top);
}


import axios from "axios";
import { client } from "./elastic";
import fs from "fs";
const OPENAI_KEY = process.env.OPENAI_API_KEY || "";

export async function categorizeEmail(email:any){
  // Simple rule-based categorizer as baseline.
  const body = (email.body || "").toLowerCase();
  const subject = (email.subject || "").toLowerCase();
  if(body.includes("out of office") || body.includes("out of office") || subject.includes("ooo")) return "Out of Office";
  if(body.includes("unsubscribe") || body.includes("spam") ) return "Spam";
  if(body.includes("interested") || body.includes("interested in") || subject.includes("interested")) return "Interested";
  if(body.includes("schedule") || body.includes("interview") || body.includes("book") ) return "Meeting Booked";
  if(body.includes("not interested") || body.includes("no thanks")) return "Not Interested";
  // Optional: fall back to LLM if API key present
  if(OPENAI_KEY){
    try {
      const resp = await axios.post("https://api.openai.com/v1/chat/completions", {
        model: "gpt-4o-mini",
        messages: [{role:"system", content:"Classify the following email into: Interested, Meeting Booked, Not Interested, Spam, Out of Office"},
                   {role:"user", content: JSON.stringify(email)}],
        max_tokens: 50
      }, { headers: { Authorization: `Bearer ${OPENAI_KEY}` }});
      const cat = resp.data.choices?.[0]?.message?.content?.trim();
      if(cat) return cat;
    }catch(e){
      console.warn("LLM categorize failed:", e.message || e);
    }
  }
  return "Not Interested";
}

export async function suggestReplyForEmail(email:any){
  // Simple templated RAG-style reply using a stored product/agendafile
  const instructions = fs.existsSync("backend/demo/rag_instructions.txt") ?
    fs.readFileSync("backend/demo/rag_instructions.txt","utf-8") :
    "If lead is interested, share meeting link: https://cal.com/example";
  // If no OpenAI key, return a template:
  if(!OPENAI_KEY) {
    return `Thanks for reaching out. ${instructions}`;
  }
  // Call OpenAI to generate a reply (simple)
  try {
    const resp = await axios.post("https://api.openai.com/v1/chat/completions", {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an assistant that composes a polite short reply based on the email and the instructions." },
        { role: "user", content: `Instructions: ${instructions}

Email: ${JSON.stringify(email)}` }
      ],
      max_tokens: 200
    }, { headers: { Authorization: `Bearer ${OPENAI_KEY}` }});
    const reply = resp.data.choices?.[0]?.message?.content?.trim();
    return reply || `Thanks for reaching out. ${instructions}`;
  } catch (e) {
    console.warn("LLM reply failed:", e.message || e);
    return `Thanks for reaching out. ${instructions}`;
  }
}

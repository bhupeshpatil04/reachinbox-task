
import Imap from "node-imap";
import { simpleParser } from "mailparser";
import { client as esClient } from "./elastic";
import axios from "axios";

export function startImapIdleSync(config:any){
  const imap = new Imap({
    user: config.user,
    password: config.password,
    host: config.host || "imap.gmail.com",
    port: config.port || 993,
    tls: config.tls !== false
  });
  function openInbox(cb:any) {
    imap.openBox('INBOX', true, cb);
  }
  imap.once('ready', () => {
    console.log("IMAP ready for", config.user);
    openInbox((err:any, box:any) => {
      if(err) throw err;
      // fetch last 30 days
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const searchCriteria = [['SINCE', since.toISOString().split('T')[0]]];
      imap.search(searchCriteria, (err:any, results:any) => {
        if(err) console.error("Search error:", err);
        if(results && results.length){
          const f = imap.fetch(results, { bodies: '', struct: true });
          f.on('message', (msg:any, seqno:any) => {
            msg.on('body', (stream:any) => {
              simpleParser(stream, async (err:any, parsed:any) => {
                if(err) return console.error(err);
                const doc:any = {
                  account: config.user,
                  folder: 'INBOX',
                  subject: parsed.subject,
                  from: parsed.from?.text,
                  to: parsed.to?.text,
                  date: parsed.date,
                  body: parsed.text,
                  category: ""
                };
                await esClient.index({ index: "emails", document: doc });
              });
            });
          });
        }
      });
      // set up IDLE notifications
      imap.on('mail', (numNewMsgs:any) => {
        console.log("New mail event:", numNewMsgs);
        // fetch the newest message
        const f = imap.seq.fetch(box.messages.total + ":" + (box.messages.total), { bodies: ''});
        f.on('message', (msg:any) => {
          msg.on('body', (stream:any) => {
            simpleParser(stream, async (err:any, parsed:any) => {
              if(err) return console.error(err);
              const doc:any = {
                account: config.user,
                folder: 'INBOX',
                subject: parsed.subject,
                from: parsed.from?.text,
                to: parsed.to?.text,
                date: parsed.date,
                body: parsed.text,
                category: ""
              };
              const resp = await esClient.index({ index: "emails", document: doc });
              await esClient.indices.refresh({ index: "emails" });
              // Optionally notify webhook for Interested category after categorization step
              console.log("Indexed new email from IDLE");
            });
          });
        });
      });
    });
  });
  imap.once('error', (err:any)=> console.error("IMAP error for", config.user, err));
  imap.once('end', ()=> console.log("IMAP connection ended for", config.user));
  imap.connect();
  return imap;
}

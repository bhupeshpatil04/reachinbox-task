
import { Client } from "@elastic/elasticsearch";
const url = process.env.ELASTICSEARCH_URL || "http://localhost:9200";
export const client = new Client({ node: url });

export async function setupElastic(){
  try {
    const exists = await client.indices.exists({ index: "emails" });
    if(!exists) {
      await client.indices.create({
        index: "emails",
        body: {
          mappings: {
            properties: {
              account: { type: "keyword" },
              folder: { type: "keyword" },
              subject: { type: "text" },
              from: { type: "text" },
              to: { type: "text" },
              date: { type: "date" },
              body: { type: "text" },
              category: { type: "keyword" }
            }
          }
        }
      });
      console.log("Created index emails");
    } else {
      console.log("Index emails already exists");
    }
  } catch(err){
    console.error("Elastic setup error:", err);
  }
}

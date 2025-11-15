
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import { setupElastic } from "./elastic";
import { mockIngestRoute, emailsRoute } from "./routes";
dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get("/health", (_, res) => res.json({ok:true}));

app.use("/mock", mockIngestRoute);
app.use("/emails", emailsRoute);
app.use("/sync", require("./sync").syncRoute);


const port = process.env.PORT || 3000;
app.listen(port, async () => {
  console.log(`Backend listening on ${port}`);
  await setupElastic();
});

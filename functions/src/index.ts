import * as functions from "firebase-functions";
import * as express from "express";
import {addEntry} from "./controllers/netopiaController";
const app = express();

app.get("/", (_req, res) => res.status(200).send("Hey there!"));
exports.app = functions.https.onRequest(app);

app.get("/netopia", addEntry);

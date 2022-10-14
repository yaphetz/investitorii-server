const functions = require("firebase-functions");
const cors = require("cors");
const express = require("express");
const fetch = require("node-fetch");
const crypto = require("crypto");
const lodash = require("lodash");

const api = express();
api.use(cors());

const objectMap = (obj, fn) => Object.fromEntries(Object.entries(obj).map(([k, v], i) => [k, fn(v, k, i)]));

api.post("/order", async (req, res) => {
  let event = lodash.cloneDeep(req.body);
  event.data[0].event_time = Math.floor(new Date().getTime() / 1000);
  event.data[0].user_data = objectMap(event.data[0].user_data, (data) => crypto.createHash("sha256").update(data).digest("hex"));
  console.log(JSON.stringify(event))

  Promise.all([
    fetch(
        "https://graph.facebook.com/v15.0/195324979372461/events?access_token=EAADbwyncwZAEBAIjnA7j6YNFKnDXsG8mDAAd8Ta87UdpGdsTjCzZBovdJNt4qZCQXhMv6kRboXPMUEHPUHm5QB4mxKPGZCfKEX3QZAVsnWnyAxR41t1aa1FslXy5MJO6mNfSh1CWZBa7EhdSCDwBZATtU17YcQ5ew1yLj0FS8kYiD2uvIuDs1rZBsRrMR8fnxgwZD",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      ).then((resp) => resp.text().then((result) => console.log(result))),

    fetch(
      "https://graph.facebook.com/v15.0/382464103878420/events?access_token=EAARp6yc6RlgBAPScbAHHmMlY9cUh0ONNwo7M9o7vzZChgO9HqTd6GGLAEQZCjqA0g3JPU4KOZCY8zltyuVZCZCXIldRHwGNyZB698MRPxKY6MxlWGntNOveyBTinGPnvIcVAtNIxrrEZBaMw28NY3kSo4XRGGZAaa9UdroNnd2dGztGCG161hLImCFnteF1d85wZD",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    ).then((resp) => resp.text().then((result) => console.log(result))),
  ]).then(res.send("succes"));
});

exports.order = functions.https.onRequest(api);

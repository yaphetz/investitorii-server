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
    // fetch(
    //   "https://graph.facebook.com/v12.0/195324979372461/events?access_token=EAADbwyncwZAEBALnH3ezPnXNuZCqWoDSEJUAFyOeKZCpelVVgXnIy5vhO7GWJBdTWxfi0gDmzM3JEZCVaSV5K1ZAJL9PCUgU7UfpOzQM4oFjFTKMyZCvfoclWplvZCWEDAH1obwUZBeTxN1kRNsET2xpn4Q8Klz0ZCNQFEggwUBIEDR2fZCbT6xDkZAH9ak0d9AqA8ZD",
    //   {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(event),
    //   }
    // ).then((resp) => resp.json().then((result) => console.log(result))),

    fetch(
      "https://graph.facebook.com/v12.0/382464103878420/events?access_token=EAARp6yc6RlgBAAIvSr6QDO6peyVacmmZAyZAgdjo1nSW8ZCvFxW04zSnJ4pZB04BIybrsUZA4hqlDZAheIr37HNJlCB0mD90XdGhhP9UF4vaq9YzSJA1sbN0zjtfczkvjZCsA6M8qiK9OqtBnd4ZCLc6E3p97ZByuLPPZChe65kGVPGMIieBdLFPaychZAUDFpZAl9AZD",
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

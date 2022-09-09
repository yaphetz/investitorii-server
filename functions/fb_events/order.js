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
        "https://graph.facebook.com/v12.0/195324979372461/events?access_token=EAADbwyncwZAEBAMVNJZCh1m6KZBExKo2qz4GWPdbVgqKQjpURu4ZC0sifsjDObwLrsgFGzlAswZAuPD3mJ72u7VwzxyZALKii4qc1cZCSzkCzjN09ApaubIMHrgyEnhnLWkfzyczoZBcv2VnkfqhaWT1nSZBH5XaVNaZAYoINuJJZAYDhtFPjrwsCuT8RUlMwd3QfQZD",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      ).then((resp) => resp.text().then((result) => console.log(result))),

    fetch(
      "https://graph.facebook.com/v12.0/382464103878420/events?access_token=EAARp6yc6RlgBAN00ClTthqxNVuQKKcY0X9cqbcDi7bTcbnXktZAF0AEkGofLIaseUaOZAtIueZAGRpZCyJkgAh6D5WvXnnpCJCMz3cl1xFasx7NzfcOSE4OdndNzPpn2XS6ZCKbbADmYfplrWMY0Cxi49KTp645B4RM5G5uxF66dSGzhBk2YMdl6b1d6CPQUZD",
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

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
  let body = req.body;
  let user_data = body.user_data;
  let custom_data = body.custom_data;
  let event_name = body.event_name;
  let event_id = body.event_id;
  let test_event_code = body.test_event_code;

  user_data = objectMap(user_data, (data) => crypto.createHash("sha256").update(data).digest("hex"));

  let eventData = {
    data: [
      {
        event_name: event_name,
        event_time: Math.floor(new Date().getTime() / 1000),
        event_id: event_id,
        user_data: user_data,
        custom_data: custom_data,
      },
    ],
    test_event_code: test_event_code,
  };

  let event = lodash.cloneDeep(eventData);

  Promise.all([
    fetch(
      "https://graph.facebook.com/v12.0/195324979372461/events?access_token=EAADbwyncwZAEBALnH3ezPnXNuZCqWoDSEJUAFyOeKZCpelVVgXnIy5vhO7GWJBdTWxfi0gDmzM3JEZCVaSV5K1ZAJL9PCUgU7UfpOzQM4oFjFTKMyZCvfoclWplvZCWEDAH1obwUZBeTxN1kRNsET2xpn4Q8Klz0ZCNQFEggwUBIEDR2fZCbT6xDkZAH9ak0d9AqA8ZD",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    ).then((resp) => resp.json().then((result) => console.log(result))),

    fetch(
      "https://graph.facebook.com/v12.0/382464103878420/events?access_token=EAARp6yc6RlgBAMZAhWD4vp2cDWwL3Ca1WoOssuw5cOnUlZAuovtGJWRDEkjkNlRwDcAXaA8U1WuxWmfnZAlCNMYauyomKCAwPKiZBmEoZCy60u8IAW5wx8S9ZCXVACBvBqZCWGZBe4cvBZBHMLhw4ebVtiXZBV6pu9Cs3TWuR5HWOiKrIMWO63lgko",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    ).then((resp) => resp.json().then((result) => console.log(result))),
  ]).then(res.send("succes"));
});

exports.order = functions.https.onRequest(api);

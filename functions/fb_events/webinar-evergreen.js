const functions = require("firebase-functions");
const express = require("express");
const api = express();
const fetch = require("node-fetch");

api.post("/webinar-evergreen", async (req, res) => {
  let object = req.body;
  let eventTitle = 'Inscriere Webinar Evergreen';

  let event = {
    event: eventTitle,
    event_data: { eventID: object.event_id },
    user_data: {
      em: object.form_response.answers[3].email,
      ph: object.form_response.answers[4].phone_number,
      fn: object.form_response.answers[1].text,
    },
  };

  Promise.all([
    fetch('https://ennp1tgfp7yaxlt.m.pipedream.net', { method: "POST", body: JSON.stringify(event) }).then(resp => resp.json()),
    fetch('https://enkbo1a3hlbh21q.m.pipedream.net', { method: "POST", body: JSON.stringify(event) }).then(resp => resp.json()),
  ]).then(res.send("successsss"))

});

exports.evergreen = functions.https.onRequest(api);

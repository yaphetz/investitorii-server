const functions = require("firebase-functions");
const express = require("express");
const fetch = require("node-fetch");

const api = express();

api.post("/webinar-harta", async (req, res) => {
  let object = req.body;
  let eventTitle = 'Inscriere Webinar Typefrom';

  let event = {
    event: eventTitle,
    event_data: { eventID: object.form_response.answers[4].email },
    user_data: {
      em: object.form_response.answers[4].email,
      ph: object.form_response.answers[5].phone_number,
      fn: object.form_response.answers[1].text,
    },
  };

  Promise.all([
    fetch('https://ennp1tgfp7yaxlt.m.pipedream.net', { method: "POST", body: JSON.stringify(event) }).then(resp => resp.text()),
    fetch('https://enkbo1a3hlbh21q.m.pipedream.net', { method: "POST", body: JSON.stringify(event) }).then(resp => resp.text()),
  ]).then(res.send("successsss"))

});

api.post("/webinar-harta-evergreen", async (req, res) => {
  console.log(req.body)
  let object = req.body;
  let eventTitle = 'Inscriere Webinar Typefrom Evergreen';

  let event = {
    event: eventTitle,
    event_data: { eventID: object.form_response.answers[4].email },
    user_data: {
      em: object.form_response.answers[4].email,
      ph: object.form_response.answers[5].phone_number,
      fn: object.form_response.answers[1].text,
    },
  };

  Promise.all([
    fetch('https://ennp1tgfp7yaxlt.m.pipedream.net', { method: "POST", body: JSON.stringify(event) }).then(resp => resp.text()),
    fetch('https://enkbo1a3hlbh21q.m.pipedream.net', { method: "POST", body: JSON.stringify(event) }).then(resp => resp.text()),
  ]).then(res.send("succes"))

});

exports.pixel = functions.https.onRequest(api);

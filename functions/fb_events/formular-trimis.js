const functions = require("firebase-functions");
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const api = express();
api.use(cors());

function mapTypeform(response) {
  return response.answers.map((answerElement) => {
    let question = response.definition.fields.find((question) => question.id === answerElement.field.id);
    let answer;
    if (answerElement.text) answer = answerElement.text;
    if (answerElement.choice) answer = answerElement.choice.label;
    if (answerElement.email) answer = answerElement.email;
    if (answerElement.phone_number) answer = answerElement.phone_number;
    return { question: question.title, answer: answer };
  });
}

api.post("/formularTrimis", async (req, res) => {
  let eventTitle = "Formular Trimis";
  const responses = mapTypeform(req.body.form_response);
  const userProfile = {
    name: responses[0],
    email: responses[2],
    phone: responses[3],
    fbp: req.body.form_response.hidden.fbp,
    fbc: req.body.form_response.hidden.fbc,
    ip: req.body.form_response.hidden.ip,
    agent: req.body.form_response.hidden.agent,
  };

  let eventID = Buffer.from(userProfile.email.answer + userProfile.name.answer).toString("base64");

  let event = {
    event: eventTitle,
    event_data: { eventID: eventID },
    fbp: userProfile.fbp ? userProfile.fbp : null,
    fbclid: userProfile.fbc ? userProfile.fbc : null,
    user_ip: userProfile.ip,
    user_agent: userProfile.agent,
    user_data: {
      em: userProfile.email.answer,
      ph: userProfile.phone.answer,
      fn: userProfile.name.answer,
    },
  };

  if (!event.fbp) {
    delete event.fbp;
  }
  if (!event.fbc) {
    delete event.fbc;
  }

  try {
    Promise.all([
      fetch("https://ennp1tgfp7yaxlt.m.pipedream.net", { method: "POST", body: JSON.stringify(event) }).then((resp) => resp.text()),
      fetch("https://enkbo1a3hlbh21q.m.pipedream.net", { method: "POST", body: JSON.stringify(event) }).then((resp) => resp.text()),
    ]).then(res.send(`${eventTitle} triggered`));
  } catch (error) {
    res.send(`${eventTitle} ERROR `, error);
  }
});

exports.formularTrimis = functions.https.onRequest(api);

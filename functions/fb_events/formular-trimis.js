const functions = require("firebase-functions");
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const api = express();
api.use(cors());

const UA_ID = "UA-197472981-1";
const UA_VERSION = 1;
const EVENT_TYPE = "event";
const EVENT_TITLE = "Formular Trimis";
const EVENT_CATEGORY = "Typeform";
const GTAG_URL = "www.google-analytics.com/collect";

function mapTypeform(response) {
  return response.answers.map((answerElement) => {
    let question = response.definition.fields.find((question) => question.id === answerElement.field.id);
    let answer;
    if (answerElement.text) answer = answerElement.text;
    if (answerElement.choice) answer = answerElement.choice.label;
    if (answerElement.email) answer = answerElement.email;
    if (answerElement.phone_number) answer = answerElement.phone_number;
    return { question: question.title, questionId: question.id, answer: answer };
  });
}

api.post("/formularTrimis", async (req, res) => {
  let eventTitle = "Formular Trimis";
  const responses = mapTypeform(req.body.form_response);
  const userProfile = {
    name: responses.find((answer) => answer.questionId === "PessVezjp7UX" || answer.questionId === "s5wVqHEntThb"),
    email: responses.find((answer) => answer.questionId === "GV2MUVQDMdDj" || answer.questionId === "v8Qld2T0j5Mu"),
    phone: responses.find((answer) => answer.questionId === "e9J3ttqQ6CQq" || answer.questionId === "cdoou2Dik4Y1"),
    fbp: req.body.form_response.hidden.fbp,
    fbc: req.body.form_response.hidden.fbc,
    ip: req.body.form_response.hidden.ip,
    agent: req.body.form_response.hidden.agent,
  };
  console.log(userProfile);
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
      fetch(GTAG_URL + `?v=${UA_VERSION}&t=${EVENT_TYPE}&tid=${UA_ID}&cid=${eventID}&ec=${EVENT_CATEGORY}&ea=${EVENT_TITLE}&el=${EVENT_TITLE}`, {
        method: "POST",
      }).then((resp) => resp.text()),
    ]).then(res.send(`${eventTitle} triggered`));
  } catch (error) {
    res.send(`${eventTitle} ERROR `, error);
  }
});

exports.formularTrimis = functions.https.onRequest(api);

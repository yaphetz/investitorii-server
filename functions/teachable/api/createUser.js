const functions = require("firebase-functions");
const cors = require("cors");
const express = require("express");
const lodash = require("lodash");
const fetch = require("node-fetch");

const api = express();
api.use(cors());

function createUser(email) {
  const url = "https://developers.teachable.com/v1/users";
  var myHeaders = new fetch.Headers();
  myHeaders.append("apiKey", "UjJtbn9z2kjVvoIQpPk7kTvKzE9lPH2c");
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    email: email,
  });

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  return fetch("https://developers.teachable.com/v1/users", requestOptions);
}

api.post("/createUser", async (req, res) => {
  let email = req.body.email;
  createUser(email).then((response) => response.text())
    .then((result) => {
      console.log(result);
      res.send(result);
    })
    .catch((error) => {
      console.log("error", error);
      res.status(500).send(error);
    });
});

function enrollUser(body) {
  const url = "https://developers.teachable.com/v1/enroll";
  var myHeaders = new fetch.Headers();
  myHeaders.append("apiKey", "UjJtbn9z2kjVvoIQpPk7kTvKzE9lPH2c");
  myHeaders.append("Content-Type", "application/json");
  console.log(JSON.stringify(body))

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(body),
    redirect: "follow",
  };

  return fetch(url, requestOptions);
}

api.post("/enroll", async (req, res) => {
  let body = req.body;
  enrollUser(body).then((response) => response.text())
    .then((result) => {
      console.log(result, body);
      res.send(result);
    })
    .catch((error) => {
      console.log("error", error);
      res.status(500).send(error);
    });
});

exports.teachable = functions.https.onRequest(api);

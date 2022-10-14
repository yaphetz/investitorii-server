const functions = require("firebase-functions");
const cors = require("cors");
const express = require("express");
const lodash = require("lodash");
const fetch = require("node-fetch");

const api = express();
api.use(cors());

function enrollUser(body) {
  const url = "https://developers.teachable.com/v1/users";
  var myHeaders = new fetch.Headers();
  myHeaders.append("apiKey", "UjJtbn9z2kjVvoIQpPk7kTvKzE9lPH2c");
  myHeaders.append("Content-Type", "application/json");

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: body,
    redirect: "follow",
  };

  return fetch("https://developers.teachable.com/v1/users", requestOptions);
}

api.post("/enroll", async (req, res) => {
  let body = req.body;
  enrollUser(body).then((response) => response.text())
    .then((result) => {
      console.log(result);
      res.send(result);
    })
    .catch((error) => {
      console.log("error", error);
      res.status(500).send(error);
    });
});

exports.teachable = functions.https.onRequest(api);

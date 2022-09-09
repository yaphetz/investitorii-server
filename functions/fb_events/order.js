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
        "https://graph.facebook.com/v12.0/195324979372461/events?access_token=EAADbwyncwZAEBAI6HZC4cM2FMHaMJZAY2PSrPlrVJT2XbKfQ6epZCb48oQDxfhE6l9ZBzhnZA12WtixLGpBOlFtJ1REeObhIboMAf9MoexcbNghw9LZCoZCZCvneoy8KG4BCeDm7ImCCGJyZCVleyVTLZAoT516aw0y24ogZCFbAqZCTj8hQ01xWdQajjw0lV5bQX4k8ZD",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      ).then((resp) => resp.text().then((result) => console.log(result))),

    fetch(
      "https://graph.facebook.com/v12.0/382464103878420/events?access_token=EAARp6yc6RlgBAMsSZA5fmVWQvG8N7XeAYCHVZAmeZACf8wnsldgLy36Aes28ovflGdvRF91DgGrHSlPHui8LIkUzM4dELjIbaZBY6ZCztIk1NJbXE2dOoNOLMv60ZAjeXi5lyA5ZCqGltcShTUYP3lVoZCZCFVy5ZCVXy5vZA2AwsW538ZBlOdsLzzNZAZARKZAMbsFvyIZD",
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

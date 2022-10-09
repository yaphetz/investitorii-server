const functions = require("firebase-functions");
const cors = require("cors");
const express = require("express");
const firebase = require('firebase-admin');

const api = express();
api.use(cors());

api.post("", async (req, res) => {
    let email = req.body;
    const emailExists = firebase.auth().getUserByEmail(email).then(() => true).catch(() => false)
    emailExists.then( x=> {
        console.log(x)
        res.send(req.body);
    })
});

exports.userExists = functions.https.onRequest(api);
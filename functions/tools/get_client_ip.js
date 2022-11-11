const functions = require("firebase-functions");
const cors = require("cors");
const express = require("express");
const requestIp = require('request-ip');



const api = express();
api.use(cors());
api.set('trust proxy', true);

api.get("", async (req, res) => {
    const clientIp = requestIp.getClientIp(req); 
    console.log(clientIp)
    res.send(clientIp)
});

exports.getClientIP = functions.https.onRequest(api)
const Freshdesk = require('@freshworks/freshdesk');

const functions = require("firebase-functions");
const cors = require("cors");
const express = require("express");
const lodash = require("lodash");

const api = express();
api.use(cors());

api.get("/contacts/create", async (req, res) => {
    let freshDesk = new Freshdesk({ domain: 'investitoriicorporation.myfreshworks.com/crm/sales', api_key: 'ZDaC_X5SXo4sHKMh-sPExQ' });
    freshDesk.contacts.createContact({"name": "Marius","email": "dobre@gmail.com", phone: "0614232432", mobile: "412321321",}).then( ()=> {
        console.log('added')
    }).catch(e=> {
        console.log('error', e)
    });
});

exports.createContact = functions.https.onRequest(api);
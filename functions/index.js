const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const url = require("url");
var paylike = require("paylike")("51669e53-16ab-4bb4-b5de-34c575c047cc");
const MobilPay = require("mobilpay-card"); // ES5
const firebase = require('firebase-admin');

const serviceAccount = require('./certificates/investitoriiromania-1a1effdbe203.json');
const { user } = require("firebase-functions/v1/auth");
firebase.initializeApp({
 credential: firebase.credential.cert(serviceAccount)
});
const db = firebase.firestore();

const pixel = require('./fb_events/webinar-harta');


const app = express();
app.use(cors({ origin: true }));

Object.defineProperty(Date.prototype, 'YYYYMMDDHHMMSS', {
  value: function() {
      function pad2(n) {  // always returns a string
          return (n < 10 ? '0' : '') + n;
      }

      return this.getFullYear() +
             pad2(this.getMonth() + 1) + 
             pad2(this.getDate()) +
             pad2(this.getHours()) +
             pad2(this.getMinutes()) +
             pad2(this.getSeconds());
  }
});


app.post("/verify", async (req, res)=> {
  let body = req.body;
  const mobilPay = new MobilPay("2CJ2-DCWJ-THVI-FZ1C-NZTM");
  mobilPay.setPrivateKeyFromPath('./certificates/live.2CJ2-DCWJ-THVI-FZ1C-NZTMprivate.key');

  let response = mobilPay.validatePayment(body.env_key, body.data);
  response.then( result=> {
    console.log(result)
    let userId = result.orderInvoice.details.split(',')[0].trim();
    let transactionId = result.orderInvoice.details.split(',')[1].trim();

    let status;
    if(result.error !== null)
    status = {description: 'Tranzacție respinsă', reason: result.errorMessage};
    else{
      switch(result.action){
        case 'confirmed' : status = {description: 'Tranzacție confirmată, produsul tău va fi valabil în contul client.', reason: result.errorMessage}
        break;
        case 'paid' :
        case 'paid_pending' :
        case 'confirmed_pending' : status = {description: 'Tranzacție în verificare, se așteaptă rezultatul analizei antifraudă.', reason: result.errorMessage}
        break;
        case 'credit ' : status = {description: 'Tranzacție creditată (rambursată), banii vor fi rambursați pe card..', reason: result.errorMessage}
        break;
      }
    }

    db.collection('users').doc(userId).collection('transactions').doc(transactionId).update({status: status});
    res.send(result.res.send);
  })
})


app.post("/netopia", async (req, res) => {
  const userData = req.body;
  const mobilPay = new MobilPay("2CJ2-DCWJ-THVI-FZ1C-NZTM");

  mobilPay.setPublicKeyFromPath('./certificates/live.2CJ2-DCWJ-THVI-FZ1C-NZTM.public.cer')

  mobilPay.setClientBillingData(userData.firstName, userData.lastName, userData.county, userData.city, userData.street, userData.email, userData.phone);

  mobilPay.setPaymentData({
    orderId: Date.now().toString(),
    amount: userData.order.amount,
    currency: userData.order.currency,
    details: `${userData.user.uid}, ${userData.transactionId}`,
    confirmUrl: "https://us-central1-investitoriiromania.cloudfunctions.net/paylike/verify",
    returnUrl: `http://checkout.investitoriiromania.ro/transaction/${userData.transactionId}?userid=${userData.user.uid}`,
  });
  let request = mobilPay.buildRequest(false);

  res.send(request);

});

exports.paylike = functions.https.onRequest(app);
exports.pixel = pixel.pixel;
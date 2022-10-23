const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const url = require("url");
const MobilPay = require("mobilpay-card"); // ES5
const firebase = require("firebase-admin");
const fetch = require("node-fetch");

const serviceAccount = require("./certificates/investitoriiromania-1a1effdbe203.json");
const { user } = require("firebase-functions/v1/auth");
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
});
const db = firebase.firestore();

const teachable = require("./teachable/api/createUser");
const pixel = require("./fb_events/webinar-harta");
const order = require("./fb_events/order");
const userExists = require("./tools/check-if-user-exists");

const app = express();
app.use(cors());

Object.defineProperty(Date.prototype, "YYYYMMDDHHMMSS", {
  value: function () {
    function pad2(n) {
      // always returns a string
      return (n < 10 ? "0" : "") + n;
    }

    return this.getFullYear() + pad2(this.getMonth() + 1) + pad2(this.getDate()) + pad2(this.getHours()) + pad2(this.getMinutes()) + pad2(this.getSeconds());
  },
});

app.post("/verify", async (req, res) => {
  let body = req.body;
  const mobilPay = new MobilPay("2CJ2-DCWJ-THVI-FZ1C-NZTM");
  mobilPay.setPrivateKeyFromPath("./certificates/live.2CJ2-DCWJ-THVI-FZ1C-NZTMprivate.key");

  let response = mobilPay.validatePayment(body.env_key, body.data);
  response.then(async (result) => {
    console.log(result);
    let details = JSON.parse(result.orderInvoice.details);
    let userId = details.userId;
    let userEmail = details.userEmail;
    let transactionId = details.transactionId;
    let userPassword = details.userPassword;

    let status;
    if (result.error !== null) status = { description: "Tranzacție respinsă", reason: result.errorMessage };
    else {
      switch (result.action) {
        case "confirmed":
          status = { description: "Tranzacție confirmată, produsul tău va fi valabil în contul client.", reason: result.errorMessage };
          let orderConfirmed = await isOrderConfirmed(userId, transactionId);
          if (!orderConfirmed) {
            console.log("Should be requested only one time");
            await handleProducts(userId, transactionId);
            let teachableUser = await createUser(userEmail, userPassword);
            let userProducts = await getUserPaidProducts(userId);
            let enrollRes = await enrollUser(teachableUser.id, userProducts);
            console.log(enrollRes);
          }
          await confirmTransaction(userId, transactionId, status);

          break;
        case "paid":
        case "paid_pending":
        case "confirmed_pending":
          status = { description: "Tranzacție în verificare, se așteaptă rezultatul analizei antifraudă.", reason: result.errorMessage };
          break;
        case "credit ":
          status = { description: "Tranzacție creditată (rambursată), banii vor fi rambursați pe card..", reason: result.errorMessage };
          break;
      }
    }
    res.send(result.res.send);
  });
});

async function confirmTransaction(userId, transactionId, status) {
  db.collection("users").doc(userId).collection("transactions").doc(transactionId).update({ status: status, confirmed: true });
}

async function isOrderConfirmed(userId, transactionId) {
  return new Promise((resolve) => {
    db.collection("users")
      .doc(userId)
      .collection("transactions")
      .doc(transactionId)
      .get()
      .then((product) => {
        resolve(product.data().confirmed);
      });
  });
}

async function handleProducts(userId, transactionId) {
  db.collection("users")
    .doc(userId)
    .collection("transactions")
    .doc(transactionId)
    .get()
    .then((transaction) => {
      let products = transaction.data().product;
      products.forEach(async (product) => {
        //daca produs exista update avans, altfel creeaza cu paid = price
        productExist = await checkIfProductExist(userId, product);
        console.log(productExist);
        if (productExist) {
          updateProductAdvance(userId, product);
        } else {
          product.paid = product.price;
          return await db
            .collection("users")
            .doc(userId)
            .collection("products")
            .doc(product.id)
            .set({ ...product });
        }
      });
    });
}

function checkIfProductExist(userId, productToCheck) {
  return new Promise((resolve) => {
    db.collection("users")
      .doc(userId)
      .collection("products")
      .get()
      .then((prods) => {
        let productDocs = prods.docs;
        let prodIds = productDocs.map((prod) => prod.id);
        resolve(prodIds.some((prod) => prod === productToCheck.id));
      });
  });
}

async function updateProductAdvance(userId, product) {
  let productRef = db.collection("users").doc(userId).collection("products").doc(product.id);
  let productBeforeUpdate = await productRef.get();
  let totalPaid = productBeforeUpdate.data().paid ? productBeforeUpdate.data().paid + product.price : productBeforeUpdate.data().price + product.price;
  productRef.update({ paid: totalPaid });
}

async function getUserPaidProducts(userId) {
  let userProducts = await db.collection("users").doc(userId).collection("products").get();
  userProducts = userProducts.docs;
  userProducts = userProducts.map((userProduct) => userProduct.data());
  console.log(
    "paid products: ",
    userProducts.filter((product) => product.paid >= product.threshold || !product.threshold)
  );
  return userProducts.filter((product) => product.paid >= product.threshold || !product.threshold);
}

async function createUser(email, password) {
  const url = "https://developers.teachable.com/v1/users";
  var myHeaders = new fetch.Headers();
  myHeaders.append("apiKey", "UjJtbn9z2kjVvoIQpPk7kTvKzE9lPH2c");
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    email: email,
    password: password,
  });

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };
  return await fetch(url, requestOptions).then((resp) => resp.json());
}

async function enrollUser(teachableUserId, courses) {
  const url = "https://developers.teachable.com/v1/enroll";
  var myHeaders = new fetch.Headers();
  myHeaders.append("apiKey", "UjJtbn9z2kjVvoIQpPk7kTvKzE9lPH2c");
  myHeaders.append("Content-Type", "application/json");
  console.log("enrolling user id " + teachableUserId, " with ", courses);

  enrollmentPromises = courses.map((course) => {
    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({ user_id: teachableUserId, course_id: course.course_id }),
      redirect: "follow",
    };
    return fetch(url, requestOptions).then((resp) => resp.json());
  });
  return Promise.all(enrollmentPromises);
}

app.get("/test", async (req, res) => {
  res.send(await getUserPaidProducts("Qi8iK60zNiPSgnQQ1C9Mejnuwc13"));
});

app.post("/netopia", async (req, res) => {
  const userData = req.body;
  const mobilPay = new MobilPay("2CJ2-DCWJ-THVI-FZ1C-NZTM");

  mobilPay.setPublicKeyFromPath("./certificates/live.2CJ2-DCWJ-THVI-FZ1C-NZTM.public.cer");
  mobilPay.setClientBillingData(userData.firstName, userData.lastName, userData.county, userData.city, userData.street, userData.email, userData.phone);

  let details = {
    userId: userData.user.uid,
    userEmail: userData.user.email,
    transactionId: userData.transactionId,
    userPassword: userData.order.customerInfo.teachablePassword,
  };

  mobilPay.setPaymentData({
    orderId: Date.now().toString(),
    amount: userData.order.amount,
    currency: userData.order.currency,
    details: JSON.stringify(details),
    //http://0598-2a02-2f01-f41a-8800-48c3-2210-29e2-f5f9.ngrok.io/investitoriiromania/us-central1/paylike/verify
    //https://us-central1-investitoriiromania.cloudfunctions.net/paylike/verify
    confirmUrl: "https://us-central1-investitoriiromania.cloudfunctions.net/paylike/verify",
    returnUrl: `https://checkout.investitoriiromania.ro/transaction/${userData.transactionId}?userid=${userData.user.uid}`,
  });
  let request = mobilPay.buildRequest(false);

  res.send(request);
});

exports.paylike = functions.https.onRequest(app);
exports.pixel = pixel.pixel;
exports.order = order.order;
exports.teachable = teachable.teachable;
exports.userExists = userExists.userExists;

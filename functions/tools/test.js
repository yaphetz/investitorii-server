function getCookies() {
  const REGEXP = /([\w\.]+)\s*=\s*(?:"((?:\\"|[^"])*)"|(.*?))\s*(?:[;,]|$)/g;
  let cookies = {};
  let match;
  while ((match = REGEXP.exec(document.cookie)) !== null) {
    let value = match[2] || match[3];
    cookies[match[1]] = decodeURIComponent(value);
  }
  return cookies;
}

const urlParams = new URLSearchParams(window.location.search);
let eventName = "Formular Trimis";
let pixelInfo = JSON.parse(urlParams.get("pixel"));
const eventID = window.btoa(pixelInfo.email.split("@")[0] + pixelInfo.name);

const interval = setInterval(() => {
  if (getCookies()._fbp) {
    
    clearInterval(interval);
    fbq("trackCustom", eventName, {}, { eventID: eventID });
    if (document.referrer.includes("youcanbook")) {
      const callEventName = "Book a call";
      fbq("trackCustom", callEventName, {}, { eventID: eventID });
    }
  }
}, 100);



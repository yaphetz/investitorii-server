document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('[onclick="openLinkWithQueryParams()"]').forEach((button) => {
    addEventListener("touchstart", () => {
      openLinkWithQueryParams();
    });
  });
});
let params = new URLSearchParams(window.location.search);
let utmSource = params.get("utm_source");
let utmMedium = params.get("utm_medium");
let utmTerm = params.get("utm_term");
let utmContent = params.get("utm_content");
let utmCampaign = params.get("utm_campaign");
let fbp = null;
let fbc = null;
let ip = null;
let agent = null;
console.log(`utm_source: ${utmSource}`);
console.log(`utm_medium: ${utmMedium}`);
console.log(`utm_term: ${utmTerm}`);
console.log(`utm_content: ${utmContent}`);
console.log(`utm_campaign: ${utmCampaign}`);
function openLinkWithQueryParams() {
  try {
    Promise.all([cookieStore.get("_fbp"), cookieStore.get("_fbc")]).then((cookies) => {
      fetch("https://legacy.investitoriiromania.ro/typeform/getUserDataForPixel.php")
        .then((res) => res.text())
        .then((x) => {
          x = JSON.parse(x);
          ip = x.ip;
          agent = x.agent;
          cookies[0] ? (fbp = cookies[0].value) : null;
          cookies[1] ? (fbc = cookies[1].value) : null;
          window.open(
            `https://investitorii.pro.typeform.com/VIPform#fbp=${fbp}&fbc=${fbc}&ip=${ip}&agent=${agent}&utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}&utm_term=${utmTerm}&utm_content=${utmContent}`,
            `_self`
          );
        });
    });
  } catch (err) {
    window.open(`https://investitorii.pro.typeform.com/VIPform#fbp=${fbp}&fbc=${fbc}&ip=${ip}&agent=${agent}&utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}&utm_term=${utmTerm}&utm_content=${utmContent}`, "_self");
  }
}

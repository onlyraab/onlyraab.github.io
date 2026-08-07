const index = "";
let hasFuture = false;
const dayMills = 24 * 60 * 60 * 1e3;
const nowMills = Date.now();
const thresholdMills = nowMills - dayMills;
const dateDivs = Array.from(document.querySelectorAll('a.date[data-iso-date]:not([data-iso-date=""])'));
for (let i = 0; i < dateDivs.length; i++) {
  const dateDiv = dateDivs[i];
  const dateIsoString = dateDiv.getAttribute("data-iso-date");
  const dateMills = Date.parse(dateIsoString);
  if (isNaN(dateMills) || dateMills < thresholdMills) {
    break;
  }
  hasFuture = true;
  dateDiv.classList.add("future");
}
if (hasFuture) {
  document.body.classList.add("has-future");
}
//# sourceMappingURL=index.js.map

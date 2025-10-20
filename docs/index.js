console.log("Hello from TypeScript!");
function t(e) {
  return `Hello, ${e}!`;
}
document.addEventListener("DOMContentLoaded", () => {
  const e = t("Only Raab 3");
  console.log(e);
  const o = document.body;
  o && o.setAttribute("data-ts-loaded", "true");
});
export {
  t as greet
};
//# sourceMappingURL=index.js.map

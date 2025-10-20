console.log("Hello from TypeScript!");
function greet(name) {
  return `Hello, ${name}!`;
}
document.addEventListener("DOMContentLoaded", () => {
  const message = greet("Only Raab 334d4");
  console.log(message);
  const body = document.body;
  if (body) {
    body.setAttribute("data-ts-loaded", "true");
  }
});
//# sourceMappingURL=index.js.map

function c(e) {
  const t = e.querySelector("ul");
  if (!t) return;
  t.querySelectorAll("li").forEach((n) => {
    n.addEventListener("click", () => {
      n.classList.toggle("highlighted");
    });
  }), e.dataset.enhanced = "true";
}
function a() {
  document.querySelectorAll(
    '[data-enhance="example"]'
  ).forEach(c);
}
document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", a) : a();
//# sourceMappingURL=example.js.map

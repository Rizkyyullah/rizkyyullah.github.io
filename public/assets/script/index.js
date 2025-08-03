window.addEventListener("load", () => {
  setTimeout(() => {
    const loader = document.querySelector("#loader");
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.style.display = "none";
    }, 500);
  }, 2_000);
});

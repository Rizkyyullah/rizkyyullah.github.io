const li = document.querySelectorAll("header ul li");

li.forEach((li) =>
  li.addEventListener("click", () => {
    const arr = Array.from(li.parentElement.children);
    arr.forEach((li) => li.classList.remove("active"));
    li.classList.add("active");
  })
);

window.addEventListener("scroll", () => {
  const header = document.querySelector("header");
  header.classList.toggle("sticky", window.scrollY > 0);
});

const menuToggle = document.querySelector(".menu-toggle"),
  header = document.querySelector("header");

menuToggle.onclick = () => {
  header.classList.toggle("show");
};

const card = document.querySelectorAll(".card"),
  cardInfo = document.querySelectorAll(".card-info");
for (let i = 0; i < card.length; i++) {
  card[i].addEventListener("mousemove", () => {
    card[i].classList.add("aktif");
  });
  card[i].addEventListener("mouseleave", () => {
    card[i].classList.remove("aktif");
  });
}

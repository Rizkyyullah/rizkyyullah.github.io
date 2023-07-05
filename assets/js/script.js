const li = document.querySelectorAll('header ul li');

// Menampilkan garis bawah saat a header di hover
li.forEach(li =>
  li.addEventListener("click", () => {
      const arr = Array.from(li.parentElement.children);
      arr.forEach(li => li.classList.remove("active"));
      li.classList.add("active");
  })
);

// Sticky Navbar
window.addEventListener('scroll', () => {
  const header = document.querySelector('header');
  header.classList.toggle('sticky', window.scrollY > 0);
})

// Menu Toggle/Hamburger Menu
const menuToggle = document.querySelector('.menu-toggle');
const header = document.querySelector('header');

menuToggle.onclick = () => {
  header.classList.toggle('show');
};

// Tes
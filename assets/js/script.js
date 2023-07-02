const li = document.querySelectorAll('header ul li');

li.forEach(li =>
  li.addEventListener("click", () => {
      const arr = Array.from(li.parentElement.children);
      arr.forEach(li => li.classList.remove("active"));
      li.classList.add("active");
  })
);
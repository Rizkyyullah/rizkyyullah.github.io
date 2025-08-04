const hamburger = document.querySelector('#hamburger');
const menu = document.querySelector('#menu');
const links = document.querySelectorAll('#menu a');

window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.querySelector('#loader');
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
    }, 500);
  }, 2_000);
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  menu.classList.toggle('active');
});

links.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    menu.classList.remove('active');
  });
});

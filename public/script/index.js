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

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px',
};

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
  observer.observe(el);
});

const alertConfig = {
  success: {
    icon: '✓',
    class: 'alert-success',
  },
  error: {
    icon: '✗',
    class: 'alert-error',
  },
  warning: {
    icon: '⚠',
    class: 'alert-warning',
  },
  info: {
    icon: 'ℹ',
    class: 'alert-info',
  },
};

function showAlert(type, title, message, showCancel = false) {
  const overlay = document.querySelector('#alertOverlay');
  const box = document.querySelector('#alertBox');
  const icon = document.querySelector('#alertIcon');
  const title = document.querySelector('#alertTitle');
  const message = document.querySelector('#alertMessage');
  const cancelBtn = document.querySelector('#alertCancelBtn');

  box.className = 'alert-box';

  const config = alertConfig[type];
  icon.textContent = config.icon;
  title.textContent = title;
  message.textContent = message;

  box.classList.add(config.class);

  cancelBtn.style.display = showCancel ? 'inline-block' : 'none';

  overlay.classList.add('show');

  box.classList.add('pulse');
  setTimeout(() => {
    box.classList.remove('pulse');
  }, 600);
}

function hideAlert() {
  const overlay = document.getElementById('alertOverlay');
  overlay.classList.remove('show');
}

function showConfirmAlert(title, message, onConfirm) {
  showAlert('warning', title, message, true);

  document.getElementById('alertOkBtn').onclick = function () {
    hideAlert();
    if (onConfirm) onConfirm();
  };
}

async function sendMessage(contactForm) {
  return await axios.post(API_LINK(), contactForm, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

document
  .querySelector('#contact-form')
  .addEventListener('submit', async function (e) {
    e.preventDefault();

    const sendButton = document.querySelector('#sendButton');
    const sendText = document.querySelector('.send-text');
    const spinner = document.createElement('div');

    sendButton.disabled = true;
    spinner.className = 'spinner';
    spinner.innerHTML = '<div></div><div></div><div></div>';
    sendText.textContent = 'SENDING ...';
    sendButton.insertBefore(spinner, sendText);

    try {
      const { data } = await sendMessage(this);

      sendButton.disabled = false;

      const spinner = sendButton.querySelector('.spinner');
      if (spinner) {
        spinner.remove();
      }

      sendText.textContent = 'SEND MESSAGE';

      console.log(data);
      alert('Message has been sent successfully!');
    } catch (e) {
      alert('Message failed to send!');
      console.log(`There's an error occurred : ${e}`);
    } finally {
      this.reset();
    }
  });

const li = document.querySelectorAll("header ul li");

li.forEach(li =>
  li.addEventListener("click", () => {
    const arr = Array.from(li.parentElement.children);
    arr.forEach(li => li.classList.remove("active"));
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

const alertConfig = {
  success: {
    icon: "✓",
    class: "alert-success",
  },
  error: {
    icon: "✗",
    class: "alert-error",
  },
  warning: {
    icon: "⚠",
    class: "alert-warning",
  },
  info: {
    icon: "ℹ",
    class: "alert-info",
  },
};

function showAlert(type, title, message, showCancel = false) {
  const overlay = document.getElementById("alertOverlay"),
    box = document.getElementById("alertBox"),
    icon = document.getElementById("alertIcon"),
    titleEl = document.getElementById("alertTitle"),
    messageEl = document.getElementById("alertMessage"),
    cancelBtn = document.getElementById("alertCancelBtn");

  box.className = "alert-box";

  const config = alertConfig[type];
  icon.textContent = config.icon;
  titleEl.textContent = title;
  messageEl.textContent = message;

  box.classList.add(config.class);

  cancelBtn.style.display = showCancel ? "inline-block" : "none";

  overlay.classList.add("show");

  box.classList.add("pulse");
  setTimeout(() => {
    box.classList.remove("pulse");
  }, 600);
}

function hideAlert() {
  const overlay = document.getElementById("alertOverlay");
  overlay.classList.remove("show");
}

function showConfirmAlert(title, message, onConfirm) {
  showAlert("warning", title, message, true);

  document.getElementById("alertOkBtn").onclick = function () {
    hideAlert();
    if (onConfirm) onConfirm();
  };
}

document.getElementById("alertOverlay").addEventListener("click", function (e) {
  if (e.target === this) {
    hideAlert();
  }
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    hideAlert();
  }
});

function startLoading() {
  const button = document.querySelector(".submit"),
    buttonText = button.querySelector(".button-text");

  button.classList.add("loading");
  button.disabled = true;

  const spinner = document.createElement("div");
  spinner.className = "spinner";
  spinner.innerHTML = "<div></div><div></div><div></div>";
  buttonText.textContent = "Mengirim...";

  button.insertBefore(spinner, buttonText);
}

function stopLoading() {
  const button = document.querySelector(".submit"),
    buttonText = button.querySelector(".button-text");

  button.classList.remove("loading");
  button.disabled = false;

  const spinner = button.querySelector(".spinner");
  if (spinner) {
    spinner.remove();
  }

  buttonText.textContent = "Kirim";
}

const scriptURL =
  "https://script.google.com/macros/s/AKfycbyXxNCR0W_QbfRsN9qYtKAvMVGA-BkW0OvLFkVLrQKRS9ivCJo79jXujek8AfcnPbV_/exec";
const form = document.forms["rizkyyullah-contact-form"];

form.addEventListener("submit", e => {
  e.preventDefault();

  startLoading();
  fetch(scriptURL, { method: "POST", body: new FormData(form) })
    .then(() => {
      stopLoading();
      showAlert("success", "Berhasil", "Pesan anda telah terkirim!");
    })
    .catch(e => {
      console.error("Error!", e.message);
      showAlert("error", "Gagal", "Pesan anda gagal terkirim!");
    })
    .finally(() => form.reset());
});

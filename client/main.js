import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat-container");

let historys;
const HISTORY_KEY = "chatHistory";
const MAX_HISTORY_LENGTH = 5;

let loadInterval;
function loader(element) {
  element.textContent = "";
  loadInterval = setInterval(() => {
    element.textContent += ".";
    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalNumber = randomNumber.toString(16);
  return `id-${timestamp}-${hexadecimalNumber}`;
}

function chatStripe(isAi, value, uniqueId) {
  return `<div class="wrapper ${isAi && "ai"}">
        <div class="chat">
        <div class="profile">
        <img src="${isAi ? bot : user}"
        alt = "${isAi ? "bot" : "user"}"
        />
        </div>
        <div class="message" id=${uniqueId}>${value}</div>
        </div>
        </div>`;
}

const handleSubmit = async (e) => {
  e.preventDefault();
  const data = new FormData(form);

  //users chatstripe
  const reqMsg = data.get("prompt");
  chatContainer.innerHTML += chatStripe(false, reqMsg);
  form.reset();
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, "", uniqueId);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);

  // fetch data from server
  const response = await fetch("https://chatgpt-3-wxxd.onrender.com/", {
    method: "POST",
    headers: { "Content-Type": "application/json  " },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";
  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();
    typeText(messageDiv, parsedData);
    saveHistory(reqMsg, parsedData);
  } else {
    const err = await response.text();
    messageDiv.innerHTML = "Something went wrong";
    alert(err);
  }
};

function saveHistory(q, a) {
  historys.push({ q, a });
  if (historys.length > MAX_HISTORY_LENGTH) historys.splice(0, historys.length - MAX_HISTORY_LENGTH);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(historys));
}

function loadHistory() {
  try {
    historys = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    historys.forEach(({ q, a }) => {
      chatContainer.innerHTML += chatStripe(false, q);
      chatContainer.innerHTML += chatStripe(true, a);
    })
    // scorll to bottom
    window.scrollTo(0, chatContainer.scrollHeight);
  } catch {
    historys = []
  }
}

loadHistory();
form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});

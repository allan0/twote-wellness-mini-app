// Telegram WebApp setup
const webApp = window.Telegram.WebApp;
webApp.ready();
const username = webApp.initDataUnsafe?.user?.username || "Traveler";

// Welcome message
const welcomeDiv = document.getElementById("welcome");
welcomeDiv.innerHTML = `
  <svg width="50" height="50" viewBox="0 0 100 100">
    <path d="M50 10 L60 40 L90 40 L65 60 L75 90 L50 70 L25 90 L35 60 L10 40 L40 40 Z" fill="none" stroke="#ffd700" stroke-width="3">
      <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="5s" repeatCount="indefinite" />
    </path>
  </svg>
  <p>Welcome, ${username}, to The Way of the Third Eye.<br>Awaken your inner light!</p>
`;
welcomeDiv.classList.remove("hidden");
setTimeout(() => welcomeDiv.classList.add("hidden"), 3000);

// Points system
let innerLight = localStorage.getItem("innerLight") || 0;
document.getElementById("light").textContent = innerLight;

function addLight(points) {
  innerLight = parseInt(innerLight) + points;
  localStorage.setItem("innerLight", innerLight);
  document.getElementById("light").textContent = innerLight;
  updateLeaderboard();
}

// Tasks
const tasks = [
  {
    name: "Breathe",
    svg: `<svg width="30" height="30" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="#ffd700" stroke-width="5"><animate attributeName="r" values="40;45;40" dur="2s" repeatCount="indefinite" /></circle></svg>`,
    action: () => {
      webApp.showAlert("Breathe deeply for 30 seconds...");
      setTimeout(() => addLight(10), 30000);
    }
  },
  {
    name: "Reflect",
    svg: `<svg width="30" height="30" viewBox="0 0 100 100"><path d="M30 70 Q50 30 70 70" fill="none" stroke="#ffd700" stroke-width="5"><animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" /></path></svg>`,
    action: () => {
      const reflection = prompt("Type a positive thought:");
      if (reflection) addLight(20);
    }
  }
];

const tasksDiv = document.getElementById("tasks");
tasks.forEach(task => {
  const btn = document.createElement("button");
  btn.innerHTML = `${task.svg}${task.name}`;
  btn.onclick = task.action;
  tasksDiv.appendChild(btn);
});

// Social features
document.getElementById("refer").onclick = () => {
  const refLink = `https://t.me/yourthird eyebot?start=${webApp.initDataUnsafe.user.id}`;
  webApp.showPopup({ message: `Share this link: ${refLink}`, buttons: [{ type: "copy", text: "Copy Link" }] });
  // Simulate referral success (in reality, track via bot)
  setTimeout(() => {
    webApp.showAlert("Friend joined! +30 Inner Light");
    addLight(30);
  }, 5000);
};

document.getElementById("social").onclick = () => {
  webApp.openLink("https://twitter.com/yoursocial");
  addLight(25);
};

// Leaderboard (simplified local version)
const leaderboardDiv = document.getElementById("leaderboard");
let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [{ name: username, points: innerLight }];

function updateLeaderboard() {
  leaderboard = leaderboard.filter(entry => entry.name !== username);
  leaderboard.push({ name: username, points: innerLight });
  leaderboard.sort((a, b) => b.points - a.points);
  leaderboard = leaderboard.slice(0, 10);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  leaderboardDiv.innerHTML = "<h3>Leaderboard</h3>" + leaderboard.map((entry, i) => 
    `<p>${i + 1}. ${entry.name} - ${entry.points}</p>`).join("");
}

updateLeaderboard();

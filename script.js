const webApp = window.Telegram.WebApp;
webApp.ready();
const username = webApp.initDataUnsafe?.user?.username || "Traveler";

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    document.getElementById("loading-screen").classList.add("hidden");
    showWelcomePage();
  }, 3000); // Show loading screen for 3 seconds
});

function showWelcomePage() {
  const welcomePage = document.getElementById("welcome-page");
  welcomePage.classList.remove("hidden");

  document.getElementById("start-journey").addEventListener("click", () => {
    const birthDate = document.getElementById("birth-date").value;
    if (birthDate) {
      welcomePage.classList.add("hidden");
      initializeApp(birthDate);
    } else {
      alert("Please enter your birth date.");
    }
  });
}

function initializeApp(birthDate) {
  const gameDiv = document.getElementById("game");
  gameDiv.classList.remove("hidden");

  // Rest of your game initialization code
  // ...

  // You can use the birthDate variable here if needed
  console.log("User's birth date:", birthDate);
}

// Rest of your existing JavaScript code
// ...
const webApp = window.Telegram.WebApp;
webApp.ready();
const username = webApp.initDataUnsafe?.user?.username || "Traveler";

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    document.getElementById("loading-screen").classList.add("hidden");
    showWelcomePage();
  }, 3000); // Show loading screen for 3 seconds
});

function showWelcomePage() {
  const welcomePage = document.getElementById("welcome-page");
  welcomePage.classList.remove("hidden");

  document.getElementById("start-journey").addEventListener("click", () => {
    const birthDate = document.getElementById("birth-date").value;
    if (birthDate) {
      welcomePage.classList.add("hidden");
      initializeApp(birthDate);
    } else {
      alert("Please enter your birth date.");
    }
  });
}

function initializeApp(birthDate) {
  const gameDiv = document.getElementById("game");
  gameDiv.classList.remove("hidden");

  // Rest of your game initialization code
  // ...

  // You can use the birthDate variable here if needed
  console.log("User's birth date:", birthDate);
}

// Rest of your existing JavaScript code
// ...

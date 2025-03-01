const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const comboDisplay = document.getElementById('combo');
const referBtn = document.getElementById('refer-btn');
const socialsBtn = document.getElementById('socials-btn');

// Adjust canvas for responsiveness
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let score = 0;
let combo = 1;
let lastClickTime = 0;
let coins = [];
const coinImage = new Image();
coinImage.src = 'coin.png'; // Add your own coin image to the repository

class Coin {
    constructor() {
        this.x = Math.random() * (canvas.width - 40);
        this.y = -40;
        this.size = 40;
        this.speed = Math.random() * 2 + 2;
        this.opacity = 1;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        if (coinImage.complete) {
            ctx.drawImage(coinImage, this.x, this.y, this.size, this.size);
        } else {
            // Fallback gradient if image fails
            const gradient = ctx.createRadialGradient(this.x, this.y, 5, this.x, this.y, this.size / 2);
            gradient.addColorStop(0, '#FFD700');
            gradient.addColorStop(1, '#DAA520');
            ctx.beginPath();
            ctx.arc(this.x + this.size / 2, this.y + this.size / 2, this.size / 2, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.closePath();
        }
        ctx.restore();
    }

    update() {
        this.y += this.speed;
        if (this.y > canvas.height) this.opacity -= 0.05; // Fade out when off-screen
    }
}

function spawnCoin() {
    coins.push(new Coin());
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    coins = coins.filter(coin => coin.opacity > 0); // Remove faded coins
    coins.forEach(coin => {
        coin.update();
        coin.draw();
    });

    requestAnimationFrame(animate);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    coins.forEach((coin, index) => {
        const distance = Math.sqrt((clickX - (coin.x + coin.size / 2)) ** 2 + (clickY - (coin.y + coin.size / 2)) ** 2);
        if (distance < coin.size / 2) {
            coins.splice(index, 1);
            const currentTime = Date.now();
            if (currentTime - lastClickTime < 1000) combo = Math.min(combo + 0.5, 5); // Max combo x5
            else combo = 1;
            lastClickTime = currentTime;
            score += 10 * combo;
            scoreDisplay.textContent = Math.floor(score);
            comboDisplay.textContent = combo.toFixed(1);
        }
    });
});

// Interactive Buttons
referBtn.addEventListener('click', () => {
    const referralLink = `https://t.me/yourBot?start=ref_${Math.random().toString(36).slice(2, 7)}`;
    navigator.clipboard.writeText(`Join Golden Wellness Quest! ${referralLink}`);
    alert('Referral link copied! Share it with friends.');
});

socialsBtn.addEventListener('click', () => {
    window.open('https://x.com/yourHandle', '_blank'); // Replace with your social link
});

// Spawn coins and start animation
setInterval(spawnCoin, 800);
animate();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');

canvas.width = 400;
canvas.height = 400;

let score = 0;
let coins = [];

class Coin {
    constructor() {
        this.x = Math.random() * (canvas.width - 30);
        this.y = -30;
        this.radius = 15;
        this.speed = Math.random() * 2 + 1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#FFD700';
        ctx.fill();
        ctx.strokeStyle = '#DAA520';
        ctx.stroke();
        ctx.closePath();
    }

    update() {
        this.y += this.speed;
    }
}

function spawnCoin() {
    coins.push(new Coin());
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    coins.forEach((coin, index) => {
        coin.update();
        coin.draw();

        if (coin.y > canvas.height) {
            coins.splice(index, 1); // Remove coins that fall off-screen
        }
    });

    requestAnimationFrame(animate);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    coins.forEach((coin, index) => {
        const distance = Math.sqrt((clickX - coin.x) ** 2 + (clickY - coin.y) ** 2);
        if (distance < coin.radius) {
            coins.splice(index, 1); // Remove clicked coin
            score += 10;
            scoreDisplay.textContent = score;
        }
    });
});

// Spawn coins every second
setInterval(spawnCoin, 1000);

// Start the animation
animate();

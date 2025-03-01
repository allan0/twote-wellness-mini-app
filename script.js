document.addEventListener('DOMContentLoaded', function() {
    let score = 0;
    const coin = document.getElementById('coin');
    const scoreDisplay = document.getElementById('score');
    const coinSound = document.getElementById('coinSound');

    coin.addEventListener('click', function() {
        score++;
        scoreDisplay.textContent = `Score: ${score}`;
        coinSound.play();
    });
});

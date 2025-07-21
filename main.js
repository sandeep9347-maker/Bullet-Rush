const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const shootSound = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_50bfe31f5b.mp3?filename=laser-gun-81720.mp3");
const killSound = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_f66fe2399a.mp3?filename=short-success-sound-glockenspiel-treasure-video-game-6346.mp3");
const bgMusic = new Audio("https://cdn.pixabay.com/download/audio/2022/03/16/audio_7a7d83f1b0.mp3?filename=8-bit-arcade-114166.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.4;
bgMusic.play();

const enemyImg = new Image();
enemyImg.src = "https://i.imgur.com/T5qHyzl.png"; // Human enemy
const playerImg = new Image();
playerImg.src = "https://i.imgur.com/Xos76oF.png"; // Cowboy with gun
const powerUpImg = new Image();
powerUpImg.src = "https://i.imgur.com/2JYQc0C.png"; // Example power-up icon

const player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 80,
  width: 50,
  height: 60,
  speed: 6,
  lives: 5,
  power: false
};

let bullets = [];
let enemies = [];
let powerUps = [];
let keys = {};
let score = 0;
let gameOver = false;
let level = 1;
let enemySpeed = 2;

function drawPlayer() {
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
}

function drawEnemy(enemy) {
  ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);
}

function drawPowerUp(powerUp) {
  ctx.drawImage(powerUpImg, powerUp.x, powerUp.y, powerUp.width, powerUp.height);
}

function drawRect(obj) {
  ctx.fillStyle = obj.color;
  ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
}

function drawUI() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 20, 30);
  ctx.fillText("Lives: " + player.lives, canvas.width - 120, 30);
  ctx.fillText("Level: " + level, canvas.width / 2 - 30, 30);
}

function spawnEnemy() {
  if (Math.random() < 0.03 + level * 0.005) {
    enemies.push({
      x: Math.random() * (canvas.width - 40),
      y: -40,
      width: 40,
      height: 50,
      speed: enemySpeed + Math.random() * 2
    });
  }
}

function spawnPowerUp() {
  if (Math.random() < 0.002) {
    powerUps.push({
      x: Math.random() * (canvas.width - 30),
      y: -30,
      width: 30,
      height: 30,
      speed: 3
    });
  }
}

function resetGame() {
  bullets = [];
  enemies = [];
  powerUps = [];
  score = 0;
  level = 1;
  enemySpeed = 2;
  player.lives = 5;
  gameOver = false;
  updateGame();
}

function updateGame() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
  if (keys["ArrowRight"] && player.x + player.width < canvas.width) player.x += player.speed;

  drawPlayer();

  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= bullets[i].speed;
    drawRect(bullets[i]);
    if (bullets[i].y < 0) bullets.splice(i, 1);
  }

  spawnEnemy();
  spawnPowerUp();

  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].y += enemies[i].speed;
    drawEnemy(enemies[i]);

    if (
      enemies[i].x < player.x + player.width &&
      enemies[i].x + enemies[i].width > player.x &&
      enemies[i].y < player.y + player.height &&
      enemies[i].y + enemies[i].height > player.y
    ) {
      enemies.splice(i, 1);
      player.lives--;
      if (player.lives <= 0) gameOver = true;
      continue;
    }

    if (enemies[i].y > canvas.height) enemies.splice(i, 1);
  }

  for (let i = powerUps.length - 1; i >= 0; i--) {
    const p = powerUps[i];
    p.y += p.speed;
    drawPowerUp(p);

    if (
      p.x < player.x + player.width &&
      p.x + p.width > player.x &&
      p.y < player.y + player.height &&
      p.y + p.height > player.y
    ) {
      player.power = true;
      powerUps.splice(i, 1);
      setTimeout(() => player.power = false, 5000);
    }

    if (p.y > canvas.height) powerUps.splice(i, 1);
  }

  for (let i = bullets.length - 1; i >= 0; i--) {
    for (let j = enemies.length - 1; j >= 0; j--) {
      const b = bullets[i];
      const e = enemies[j];
      if (
        b.x < e.x + e.width &&
        b.x + b.width > e.x &&
        b.y < e.y + e.height &&
        b.y + b.height > e.y
      ) {
        bullets.splice(i, 1);
        enemies.splice(j, 1);
        score++;
        killSound.currentTime = 0;
        killSound.play();
        if (score % 10 === 0) {
          level++;
          enemySpeed += 0.5;
        }
        break;
      }
    }
  }

  drawUI();

  if (!gameOver) requestAnimationFrame(updateGame);
  else {
    ctx.fillStyle = "red";
    ctx.font = "40px Arial";
    ctx.fillText("GAME OVER", canvas.width / 2 - 120, canvas.height / 2);
    ctx.font = "20px Arial";
    ctx.fillText("Click to Restart", canvas.width / 2 - 80, canvas.height / 2 + 40);
  }
}

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if ((e.key === " " || e.code === "Space") && bullets.length < 10) {
    bullets.push({
      x: player.x + player.width / 2 - 3,
      y: player.y,
      width: 6,
      height: 12,
      speed: 8,
      color: player.power ? "red" : "yellow"
    });
    shootSound.currentTime = 0;
    shootSound.play();
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

canvas.addEventListener("click", () => {
  if (gameOver) resetGame();
});

updateGame();
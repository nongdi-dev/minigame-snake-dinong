const LCD_BG = "#a8b04a";
const LCD_INK = "#1a1a10";
const STEP_TIME = 180;
const COLS = 20;
const ROWS = 20;

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let cellSize = 20;

let gameState = "ready";
let snake = [];
let direction = { x: 1, y: 0 };
let keyQueue = [];
let moveTimer = 0;
let lastTime = 0;

function resetGame() {
  let middle = Math.floor(ROWS / 2);
  snake = [{ x: 3, y: middle }, { x: 2, y: middle }, { x: 1, y: middle }];
  direction = { x: 1, y: 0 };
  keyQueue = [];
  moveTimer = 0;
  gameState = "ready";
}

function update(delta) {
  moveTimer = moveTimer + delta;
  if (moveTimer >= STEP_TIME) {
    moveTimer = moveTimer - STEP_TIME;
    moveSnake();
  }
}

function moveSnake() {
  if (keyQueue.length > 0) {
    direction = keyQueue.shift();
  }

  let newX = snake[0].x + direction.x;
  let newY = snake[0].y + direction.y;
  if (newX < 0) {
    newX = COLS - 1;
  } else if (newX >= COLS) {
    newX = 0;
  }
  if (newY < 0) {
    newY = ROWS - 1;
  } else if (newY >= ROWS) {
    newY = 0;
  }

  snake.unshift({ x: newX, y: newY });
  snake.pop();
}

function draw() {
  ctx.fillStyle = LCD_BG;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = LCD_INK;
  for (let i = 0; i < snake.length; i++) {
    ctx.fillRect(snake[i].x * cellSize + 1, snake[i].y * cellSize + 1, cellSize - 2, cellSize - 2);
  }
  if (gameState === "ready") {
    ctx.font = "bold 14px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText("Nhấn phím mũi tên hoặc WASD để bắt đầu", canvas.width / 2, canvas.height / 2 - 40);
  }
}

function gameLoop(time) {
  if (lastTime === 0) {
    lastTime = time;
  }
  let delta = time - lastTime;
  lastTime = time;
  if (delta > 100) {
    delta = 100;
  }

  if (gameState === "playing") {
    update(delta);
  }
  draw();
  requestAnimationFrame(gameLoop);
}
//quay đầu
function addDirection(newDir) {
  let last = direction;
  if (keyQueue.length > 0) {
    last = keyQueue[keyQueue.length - 1];
  }
  if (newDir.x === last.x && newDir.y === last.y) {
    return;
  }
  if (newDir.x + last.x === 0 && newDir.y + last.y === 0) {
    return;
  }
  if (keyQueue.length < 2) {
    keyQueue.push(newDir);
  }
}

document.addEventListener("keydown", function (event) {
  let key = event.key;

  let newDir = null;
  if (key === "ArrowUp" || key === "w" || key === "W") {
    newDir = { x: 0, y: -1 };
  } else if (key === "ArrowDown" || key === "s" || key === "S") {
    newDir = { x: 0, y: 1 };
  } else if (key === "ArrowLeft" || key === "a" || key === "A") {
    newDir = { x: -1, y: 0 };
  } else if (key === "ArrowRight" || key === "d" || key === "D") {
    newDir = { x: 1, y: 0 };
  }
  if (newDir === null) {
    return;
  }
  event.preventDefault();

  if (gameState === "ready") {
    if (newDir.x === -1) {
      return;
    }
    direction = newDir;
    gameState = "playing";
  } else if (gameState === "playing") {
    addDirection(newDir);
  }
});

//run
canvas.width = cellSize * COLS;
canvas.height = cellSize * ROWS;
resetGame();
requestAnimationFrame(gameLoop);

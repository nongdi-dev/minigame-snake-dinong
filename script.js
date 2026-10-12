var col = 20;
var row = 20;
var speed = 180;
var currentSpeed = speed;
var game = document.getElementById("game");
var gameState = "ready";
var snake = [];
var direction = {x: 0, y: 1};
var score = 0;

initGame(col, row);
resetGame();

function gameLoop() {
  if (gameState === "playing") {
    moveSnake();
    cleanupFood();
  }
  render();
  setTimeout(gameLoop, currentSpeed);
}
gameLoop();

//add mồi đặt biệt
setInterval(() => {
  if (gameState === "playing") {
    let types = ["gold", "speed", "slow"];
    let randomType = types[parseInt(Math.random() * types.length)];
    placeFood(randomType);
  }
}, 8000);

//tạo bảng
function initGame(col, row) {
  for (let i = 0; i < row; i++) {
    let tr = document.createElement("tr");
    for (let j = 0; j < col; j++) {
      let td = document.createElement("td");
      td.id = "cell_" + i + "_" + j;
      td.classList.add("cell");
      tr.appendChild(td);
    }
    game.appendChild(tr);
  }
}

//tạo snake
function initSnake() {
  let x = Math.floor(row / 2);
  return [{x, y: 1}, {x, y: 2}, {x, y: 3}];
}

function resetGame() {
  snake = initSnake();
  direction = {x: 0, y: 1};
  clearKey();
  score = 0;
  gameState = "ready";
  resetFood();
  resetEffect();
  document.getElementById("info").textContent = "Nhấn phím mũi tên hoặc WASD để bắt đầu";
}

//di chuyển rắn
function moveSnake() {
  direction = getDirection(direction);

  let head = snake.at(-1);
  let newHead = {x: head.x + direction.x, y: head.y + direction.y};
  //đi hết mép thì xuất hiện ở mép đối diện
  if (newHead.x < 0) {
    newHead.x = row - 1;
  } else if (newHead.x >= row) {
    newHead.x = 0;
  }
  if (newHead.y < 0) {
    newHead.y = col - 1;
  } else if (newHead.y >= col) {
    newHead.y = 0;
  }

  let food = getFoodAt(newHead.x, newHead.y);
  let grow = false;
  if (food !== null) {
    grow = foodTypes[food.type].grow;
  }

  //cắn thân là thua
  let start = 1;
  if (grow === true) {
    start = 0;
  }
  for (let i = start; i < snake.length; i++) {
    if (snake[i].x === newHead.x && snake[i].y === newHead.y) {
      gameOver();
      return;
    }
  }

  snake.push(newHead);
  if (food !== null) {
    eatFood(food);
  }
  if (grow === false) {
    snake.shift();
  }
}

//vẽ
function render() {
  //xóa hết
  for (let i = 0; i < row; i++) {
    for (let j = 0; j < col; j++) {
      document.getElementById("cell_" + i + "_" + j).className = "cell";
    }
  }
  //thân rắn
  for (const dot of snake) {
    document.getElementById("cell_" + dot.x + "_" + dot.y).classList.add("dot");
  }
  //đầu rắn
  let head = snake.at(-1);
  document.getElementById("cell_" + head.x + "_" + head.y).classList.add("head");
  //mồi
  renderFood();
  //điểm
  document.getElementById("score").textContent = score;
}

//thua
function gameOver() {
  gameState = "over";
  document.getElementById("info").textContent = "Thua rồi! Nhấn Enter để chơi lại";
}

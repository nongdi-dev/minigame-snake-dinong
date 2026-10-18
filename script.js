var keyQueue = [];
var foods = [];
var effectTimer = null;
var speed = 180;
var currentSpeed = speed;
var game = document.getElementById("game");
var gameState = "menu";
var snake = [];
var direction = {x: 0, y: 1};
var score = 0;
var level = null;
var block = [];

// Key sang Hướng
function getKeyToDirection(key) {
  if (key === "ArrowUp" || key ==="W" || key === "w") {
    return {x: -1, y: 0};
  }
  if (key === "ArrowDown" || key ==="S" || key === "s") {
    return {x: 1, y: 0};
  }
  if (key === "ArrowRight" || key ==="D" || key === "d") {
    return {x: 0, y: 1};
  }
  if (key === "ArrowLeft" || key ==="A" || key === "a") {
    return {x: 0, y: -1};
  }
  return null;
}
//xóa hàng đợi phím
function clearKey(){
  keyQueue = [];
}
function addDirection(dir){
  let last = direction;
  if (keyQueue.length > 0) {
    last = keyQueue[keyQueue.length - 1];
  }
  //cùng hướng
  if (dir.x === last.x && dir.y === last.y) {
    return;
  }
  //ngược huóng
  if (dir.x + last.x === 0 && dir.y + last.y === 0) {
    return;
  }
  if (keyQueue.length < 2) {
    keyQueue.push(dir);
  }
}
//lấy hướng tiếp theo
function getDirection(temp){
  if (keyQueue.length > 0) {
    return keyQueue.shift(); //xóa và trả về hướng tiếp theo
  }
  return temp;
}
document.addEventListener("keydown", function (event) {
  let dir = getKeyToDirection(event.key);
  if (dir === null) {
    return;
  }
  event.preventDefault(); //ko cuộn trang
  if (gameState === "ready") {
    if (dir.x +direction.x === 0 && dir.y +direction.y === 0) {
      return;
    }
    direction = dir;
    gameState = "playing";
  } else if (gameState === "playing") {
    addDirection(dir);
  }
});

//các loại mồi
var foodTypes = {
  normal: {score: 1, grow: true, css: "normal", time: 0},
  gold:   {score: 5, grow: true, css: "gold", time: 5000},
  speed:  {score: 1, grow: true, css: "speed", time: 5000, effect: 0.5, effectTime: 5000},
  slow:   {score: 1, grow: true, css: "slow", time: 5000, effect: 2, effectTime: 5000},
};

function resetFood() {
  foods = [];
  placeFood("normal");
}

//tìm ô trống
function findEmptyCell() {
  let cell = {x: 0, y: 0};
  let ok = false;
  while (ok === false) {
    cell = {x: parseInt(Math.random() * row), y: parseInt(Math.random() * col)};
    ok = true;
    for (const dot of snake) {
      if (dot.x === cell.x && dot.y === cell.y) {
        ok = false;
      }
    }
    if (getFoodAt(cell.x, cell.y) !== null) {
      ok = false;
    }
    if (isBlock(cell.x, cell.y) === true) {
      ok = false;
    }
  }
  return cell;
}

//đặt một mồi type vào ô trống
function placeFood(type) {
  //hết chỗ kết thúc
  if (snake.length + foods.length + countBlock() >= row * col) {
    gameOver();
    return;
  }
  let cell = findEmptyCell();
  foods.push({x: cell.x, y: cell.y, type: type, created: Date.now()});
}

//lấy mồi ở ô x, y
function getFoodAt(x, y) {
  for (const food of foods) {
    if (food.x === x && food.y === y) {
      return food;
    }
  }
  return null;
}
//hiệu ứng
function applyEffect(type) {
  let info = foodTypes[type];
  if (!info.effect) {
    return;
  }
  currentSpeed = speed * info.effect;
  showEffectBar(info.effectTime);
  clearTimeout(effectTimer);
  effectTimer = setTimeout(() => {
    currentSpeed = speed;
  }, info.effectTime);
}
function showEffectBar(duration) {
  let fill = document.getElementById("effect-fill");
  fill.style.transition = "none";
  fill.style.width = "100%";
  fill.offsetWidth; //vẽ lại để transition
  fill.style.transition = "width " + duration + "ms linear";
  fill.style.width = "0%";
}
function hideEffectBar() {
  let fill = document.getElementById("effect-fill");
  fill.style.transition = "none";
  fill.style.width = "0%";
}

function resetEffect() {
  clearTimeout(effectTimer);
  currentSpeed = speed;
  hideEffectBar();
}

function eatFood(food) {
  score = score + foodTypes[food.type].score;
  let index = foods.indexOf(food);
  foods.splice(index, 1);
  applyEffect(food.type);
  //mồi thường spam
  if (food.type === "normal") {
    placeFood("normal");
  }
}

//xóa mồi hết time
function cleanupFood() {
  let now = Date.now();
  for (let i = foods.length - 1; i >= 0; i--) {
    let food = foods[i];
    if (foodTypes[food.type].time > 0 && now - food.created > foodTypes[food.type].time) {
      foods.splice(i, 1);
    }
  }
}


function renderFood() {
  for (const food of foods) {
    document.getElementById("cell_" + food.x + "_" + food.y).classList.add(foodTypes[food.type].css);
  }
}

var levels = [
  {name: "Màn 1", col: 20, row: 20, wall: false, block: []},
  {name: "Màn 2", col: 20, row: 20, wall: true, block: []},
  {name: "Màn 3", col: 25, row: 20, wall: false, block: [
      {x: 4, y: 5, h: 6, w: 1}, {x: 10, y: 19, h: 6, w: 1},
      {x: 14, y: 10, h: 1, w: 6}, {x: 5, y: 10, h: 1, w: 6}
    ]}
]

createMenu();
loadMenu();
document.getElementById("btnMenu").onclick = backToMenu;

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

//tạo màn
function createMenu() {
  let list = document.getElementById("levelList");
  for (let i = 0; i < levels.length; i++) {
    let card = document.createElement("button");
    card.classList.add("card");

    let name = document.createElement("strong");
    name.textContent = levels[i].name;

    let size = document.createElement("span");
    size.textContent = levels[i].col + " x " + levels[i].row;

    card.appendChild(name);
    card.appendChild(size);
    card.onclick = () => {
      startLevel(i);
    };
    list.appendChild(card);
  }
}

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

//di chuyển
function moveSnake() {
  direction = getDirection(direction);

  let head = snake.at(-1);
  let newHead = {x: head.x + direction.x, y: head.y + direction.y};
  //chek có wall k
  if (level.wall === true) {
    if (newHead.x < 0 || newHead.x >= row || newHead.y < 0 || newHead.y >= col) {
      gameOver();
      return;
    }
  }
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
  //đụng vật cản
  if (isBlock(newHead.x, newHead.y) === true) {
    gameOver();
    return;
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
  //ở menu
  if (gameState === "menu") {
    return;
  }
  //xóa hết
  for (let i = 0; i < row; i++) {
    for (let j = 0; j < col; j++) {
      document.getElementById("cell_" + i + "_" + j).className = "cell";
      if (isBlock(i, j) === true) {//vật cản
        document.getElementById("cell_" + i + "_" + j).classList.add("block");
      }
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
  document.getElementById("info").textContent = "Bạn đã thua";
}
//danh sách màn
function loadMenu() {
  gameState = "menu";
  document.getElementById("menu").classList.remove("hidden");
  document.getElementById("gameplay").classList.add("hidden");
}
//nut back về menu
function backToMenu() {
  resetEffect();
  loadMenu();
}
//vào màn chơi
function startLevel(index) {
  level = levels[index];
  col = level.col;
  row = level.row;
  createBlock();
  game.replaceChildren();//xóa bảng cũ
  if (level.wall === true) {
    game.className = "wall";
  } else {
    game.className = "nowall";
  }
  initGame(col, row);
  resetGame();
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("gameplay").classList.remove("hidden");
}
//tạo vật cản: true là có
function createBlock() {
  block = [];
  for (let i = 0; i < row; i++) {
    let line = [];
    for (let j = 0; j < col; j++) {
      line.push(false);
    }
    block.push(line);
  }
  let list = level.block;
  if (list === undefined) {
    list = [];
  }
  for (const o of list) {
    for (let i = o.x; i < o.x + o.h; i++) {
      for (let j = o.y; j < o.y + o.w; j++) {
        block[i][j] = true;
      }
    }
  }
}
//check có cản k
function isBlock(x, y) {
  return block[x][y];
}
//đếm ô vật cản
function countBlock() {
  let count = 0;
  for (let i = 0; i < row; i++) {
    for (let j = 0; j < col; j++) {
      if (block[i][j] === true) {
        count = count + 1;
      }
    }
  }
  return count;
}

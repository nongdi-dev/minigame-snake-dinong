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
var timeBoss = 0;
var stateBlockBoss = [];
var lastLoop = Date.now();
var doorClose = [];
var doorState = [];
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
    if (isBlock(cell.x, cell.y) === true || isSwap(cell.x, cell.y) === true) {
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
  let t = 1;
  if (level.foodTime !== undefined) {
    t = level.foodTime;
  }
  for (let i = foods.length - 1; i >= 0; i--) {
    let food = foods[i];
    if (foodTypes[food.type].time > 0 && now - food.created > foodTypes[food.type].time * t) {
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
      {x: 14, y: 10, h: 1, w: 6}, {x: 5, y: 10, h: 1, w: 6} ]},
  {name: "Màn 4", col: 60, row: 30, wall: false, see: 5, foodTime: 2, block:[
      {x: 5, y: 10, h: 8, w: 1}, {x: 20, y: 15, h: 1, w: 12},
      {x: 8, y: 30, h: 1, w: 10}, {x: 15, y: 45, h: 10, w: 1},
      {x: 24, y: 5, h: 1, w: 8}, {x: 3, y: 50, h: 1, w: 6},
      {x: 12, y: 20, h: 1, w: 8}, {x: 2, y: 22, h: 6, w: 1},
      {x: 26, y: 30, h: 1, w: 12}, {x: 10, y: 38, h: 6, w: 1},
      {x: 5, y: 55, h: 8, w: 1}, {x: 20, y: 52, h: 1, w: 7},
      {x: 22, y: 35, h: 4, w: 1} ]},
  {name: "Màn 5", col: 20, row: 20, wall: true,foodTime: 3 , block: [
      {x: 0, y: 10, h: 9, w: 1}, {x: 11, y: 10, h: 9, w: 1},
      {x: 12, y: 11, h: 1, w: 4}, {x: 12, y: 17, h: 1, w: 3} ],
    door: [
      {x: 9, y: 10, h: 2, w: 1, closed: true},
      {x: 12, y: 15, h: 1, w: 2, closed: true} ],
    swap: [
      {x: 10, y: 6,  doors: [0]},
      {x: 3,  y: 3,  doors: [0]},
      {x: 5,  y: 15, doors: [0, 1]},
      {x: 2,  y: 18, doors: [1]},
      {x: 17, y: 13, doors: [0, 1]} ]},
  {name: "Màn 6", col: 25, row: 20, wall: true, boss: 50,
    block: [{x: 8, y: 10, h: 4, w: 5}],
    blockBoss: [{x: 3, y: 4, h: 1, w: 10, an: 3000, baoTruoc: 1000, hien: 3000, tre: 0},
      {x: 16, y: 11, h: 1, w: 10, an: 3000, baoTruoc: 1000, hien: 3000, tre: 2000},
      {x: 4, y: 19, h: 9, w: 1, an: 3000, baoTruoc: 1000, hien: 3000, tre: 4000},
      {x: 11, y: 6, h: 6, w: 1, an: 3000, baoTruoc: 1000, hien: 3000, tre: 6000} ]}
]

createMenu();
loadMenu();
document.getElementById("btnMenu").onclick = backToMenu;

function gameLoop() {
  var now = Date.now();
  if (gameState === "playing") {
    moveSnake();
    updateDoor();
    cleanupFood();
    updateBlockBoss(now - lastLoop);
  }
  lastLoop = now;
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
  //đi hết ra ở mép đối diện
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
  if (level.boss !== undefined) {
    grow = false;
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
  stepOnSwap(newHead.x, newHead.y);
  if (food !== null) {
    eatFood(food);
  }
  if (grow === false) {
    snake.shift();
  }
  //boss 0 máu
  if (level.boss !== undefined && score >= level.boss) {
    gameWin();
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
  veBaoTruoc();
  drawDoor();
  //thân rắn
  for (const dot of snake) {
    document.getElementById("cell_" + dot.x + "_" + dot.y).classList.add("dot");
  }
  //đầu rắn
  let head = snake.at(-1);
  document.getElementById("cell_" + head.x + "_" + head.y).classList.add("head");
  //mồi
  renderFood();
  //sương mù
  if (level.see !== undefined) {
    drawFog();
  }
  //điểm
  document.getElementById("score").textContent = score;
  //máu boss
  renderBoss();
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
  resetBlockBoss();
  resetDoor();
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
  //block boss đang hiện và cửa đang đóng
  if (level.blockBoss !== undefined) {
    addBlockBoss();
  }
  addDoorBlock();
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

//reset trạng thái cửa
function resetDoor() {
  doorClose = [];
  doorState = [];
  if (level.door !== undefined) {
    for (const d of level.door) {
      doorClose.push(d.closed === true);
      doorState.push(d.closed === true);
    }
  }
}
//add cửa đang đóng vào block
function addDoorBlock() {
  if (level.door === undefined) {
    return;
  }
  for (let k = 0; k < level.door.length; k++) {
    if (doorClose[k] === true) {
      let d = level.door[k];
      for (let i = d.x; i < d.x + d.h; i++) {
        for (let j = d.y; j < d.y + d.w; j++) {
          block[i][j] = true;
        }
      }
    }
  }
}
//ô là công tắc k
function isSwap(x, y) {
  if (level.swap === undefined) {
    return false;
  }
  for (const s of level.swap) {
    if (s.x === x && s.y === y) {
      return true;
    }
  }
  return false;
}
//đảo trạng thái công tắc khi đi qua
function stepOnSwap(x, y) {
  if (level.swap === undefined) {
    return;
  }
  for (const s of level.swap) {
    if (s.x === x && s.y === y) {
      for (const k of s.doors) {
        doorState[k] = !doorState[k];
      }
    }
  }
}

function updateDoor() {
  if (level.door === undefined) {
    return;
  }
  let doi = false;
  for (let k = 0; k < level.door.length; k++) {
    if (doorState[k] === doorClose[k]) {
      continue;
    }
    //còn snake thì chờ
    if (doorState[k] === true && checkSnakeInBlock(level.door[k]) === true) {
      continue;
    }
    doorClose[k] = doorState[k];
    doi = true;
  }
  if (doi === true) {
    createBlock();
    chuyenMoi();
  }
}
//vẽ cửa và công tắc
function drawDoor() {
  if (level.door === undefined) {
    return;
  }
  for (let k = 0; k < level.door.length; k++) {
    let d = level.door[k];
    let css = "baotruoc";
    if (doorClose[k] === true) {
      css = "door";
    } else if (doorState[k] === true) {
      css = "baotruoc"; //sắp đóng
    }
    for (let i = d.x; i < d.x + d.h; i++) {
      for (let j = d.y; j < d.y + d.w; j++) {
        document.getElementById("cell_" + i + "_" + j).classList.add(css);
      }
    }
  }
  if (level.swap !== undefined) {
    for (const s of level.swap) {
      document.getElementById("cell_" + s.x + "_" + s.y).classList.add("swap");
    }
  }
}
//sương mù
function drawFog() {
  let head = snake.at(-1);
  let r = level.see;
  for (let i = 0; i < row; i++) {
    for (let j = 0; j < col; j++) {
      let dx = Math.abs(i - head.x);
      let dy = Math.abs(j - head.y);
      //không block
      if (level.wall !== true) {
        dx = Math.min(dx, row - dx);
        dy = Math.min(dy, col - dy);
      }
      if ((dx > r || dy > r) && getFoodAt(i, j) === null) {
        document.getElementById("cell_" + i + "_" + j).className = "cell fog";
      }
    }
  }
}

//thắng
function gameWin() {
  gameState = "win";
  document.getElementById("info").textContent = "Bạn đã WIN";
}
//reset giờ và state block boss
function resetBlockBoss() {
  timeBoss = 0;
  stateBlockBoss = [];
  if (level.blockBoss !== undefined) {
    for (let i = 0; i < level.blockBoss.length; i++) {
      stateBlockBoss.push(false);
    }
  }
}
//trạng thái block
function stateBoss(g) {
  let t = timeBoss - g.tre;
  if (t < 0) {
    return "an";
  }
  t = t % (g.an + g.baoTruoc + g.hien);
  if (t < g.an) {
    return "an";
  }
  if (t < g.an + g.baoTruoc) {
    return "baotruoc";
  }
  return "hien";
}
//kiểm tra block có snake k
function checkSnakeInBlock(g) {
  for (const dot of snake) {
    if (dot.x >= g.x && dot.x < g.x + g.h && dot.y >= g.y && dot.y < g.y + g.w) {
      return true;
    }
  }
  return false;
}
//cập nhật block boss, delta là time vừa trôi qua
function updateBlockBoss(delta) {
  if (level.blockBoss === undefined) {
    return;
  }
  if (delta > 500) {
    delta = 500;
  }
  timeBoss = timeBoss + delta;
  let doi = false;
  for (let k = 0; k < level.blockBoss.length; k++) {
    let gd = stateBoss(level.blockBoss[k]);
    if (gd === "hien") {
      //có rắn trong vùng thì đợi
      if (stateBlockBoss[k] === false && checkSnakeInBlock(level.blockBoss[k]) === false) {
        stateBlockBoss[k] = true;
        doi = true;
      }
    } else if (stateBlockBoss[k] === true) {
      stateBlockBoss[k] = false;
      doi = true;
    }
  }
  if (doi === true) {
    createBlock();
    chuyenMoi();
  }
}
//thêm blockBoss đang hiện vào bảng vật cản
function addBlockBoss() {
  for (let k = 0; k < level.blockBoss.length; k++) {
    if (stateBlockBoss[k] === true) {
      let g = level.blockBoss[k];
      for (let i = g.x; i < g.x + g.h; i++) {
        for (let j = g.y; j < g.y + g.w; j++) {
          block[i][j] = true;
        }
      }
    }
  }
}
//mồi trong block chuyển sang ô trống
function chuyenMoi() {
  for (const food of foods) {
    if (isBlock(food.x, food.y) === true) {
      let cell = findEmptyCell();
      food.x = cell.x;
      food.y = cell.y;
    }
  }
}
//vẽ vùng báo trước
function veBaoTruoc() {
  if (level.blockBoss === undefined) {
    return;
  }
  for (let k = 0; k < level.blockBoss.length; k++) {
    let g = level.blockBoss[k];
    if (stateBlockBoss[k] === false && stateBoss(g) !== "an") {
      for (let i = g.x; i < g.x + g.h; i++) {
        for (let j = g.y; j < g.y + g.w; j++) {
          document.getElementById("cell_" + i + "_" + j).classList.add("baotruoc");
        }
      }
    }
  }
}
//máu boss
function renderBoss() {
  let bar = document.getElementById("boss-bar");
  if (level.boss === undefined) {
    bar.classList.add("hidden");
    return;
  }
  bar.classList.remove("hidden");
  let hp = level.boss - score;
  if (hp < 0) {
    hp = 0;
  }
  document.getElementById("boss-text").textContent = "Boss " + hp + "/" + level.boss;
  document.getElementById("boss-fill").style.width = (hp / level.boss * 100) + "%";
}
//các loại mồi
var foodTypes = {
    normal: {score: 1, grow: true, css: "normal", time: 0},
    gold:   {score: 5, grow: true, css: "gold", time: 5000},
    speed:  {score: 1, grow: true, css: "speed", time: 5000, effect: 0.5, effectTime: 5000},
    slow:   {score: 1, grow: true, css: "slow", time: 5000, effect: 2, effectTime: 5000},
};

var foods = [];
var effectTimer = null;

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
    }
    return cell;
}

//đặt một mồi type vào ô trống
function placeFood(type) {
    //hết chỗ kết thúc
    if (snake.length + foods.length >= row * col) {
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
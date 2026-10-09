let keyQueue = [];
// Key sang Hướng
function getKeyToDirection(key) {
    if (key === "ArrowUp" || key ==="W" || key === "w") {
        return {x: 0, y: -1};
    }
    if (key === "ArrowDown" || key ==="S" || key === "s") {
        return {x: 0, y: 1};
    }
    if (key === "ArrowRight" || key ==="D" || key === "d") {
        return {x: 1, y: 0};
    }
    if (key === "ArrowLeft" || key ==="A" || key === "a") {
        return {x: -1, y: 0};
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
//lấy hướng
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
        if (dir.x === -1) {
            return;
        }
        direction = dir;
        gameState = "playing";
    } else if (gameState === "playing") {
        addDirection(dir);
    }
});


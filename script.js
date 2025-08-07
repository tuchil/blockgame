const WIDTH = 8;
const HEIGHT = 8;
const CELL_SIZE = 40; // セルの大きさ(px)

let score = 0;
let board = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(0));

const blockTypes = [
  { shape: [[1, 1, 1, 1]], color: "#f00" },
  { shape: [[1, 1], [1, 1]], color: "#0f0" },
  { shape: [[1]], color: "#00f" },
  { shape: [[1, 1, 0], [0, 1, 1]], color: "#ff0" },
  { shape: [[0, 1, 1], [1, 1, 0]], color: "#0ff" },
  { shape: [[1, 0], [1, 1], [1, 0]], color: "#f0f" },
  { shape: [[0, 1, 0], [1, 1, 1]], color: "#999" }
];

let currentBlocks = pickRandomBlocks();

let draggingBlock = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let gameOver = false;

updateScore();
createBoard();
renderBoard();
renderBlocks();

function updateScore() {
  const scoreEl = document.getElementById("score");
  if (scoreEl) {
    scoreEl.textContent = `スコア: ${score}`;
  }
}

function createBoard() {
  const boardElement = document.getElementById("game-board");
  boardElement.innerHTML = "";
  for (let i = 0; i < HEIGHT * WIDTH; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    boardElement.appendChild(cell);
  }
}

function renderBoard() {
  const cells = document.querySelectorAll("#game-board .cell");
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const index = y * WIDTH + x;
      cells[index].style.backgroundColor = board[y][x] ? "#666" : "#fff";
    }
  }
}

function pickRandomBlocks() {
  const shuffled = [...blockTypes].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}

function renderBlocks() {
  const picker = document.getElementById("block-picker");
  picker.innerHTML = "";

  for (let i = 0; i < 3; i++) {
    const blockSlot = document.createElement("div");
    blockSlot.classList.add("block-slot");

    const block = currentBlocks[i];
    if (block) {
      const blockDiv = document.createElement("div");
      blockDiv.classList.add("block");
      blockDiv.dataset.index = i;
      blockDiv.style.position = "relative";
      blockDiv.style.transform = "scale(0.5)";

      block.shape.forEach(row => {
        const rowDiv = document.createElement("div");
        rowDiv.style.display = "flex";
        row.forEach(cell => {
          const cellDiv = document.createElement("div");
          cellDiv.classList.add("block-cell");
          cellDiv.style.backgroundColor = cell ? block.color : "transparent";
          rowDiv.appendChild(cellDiv);
        });
        blockDiv.appendChild(rowDiv);
      });

      // PC用ドラッグ開始
      blockDiv.addEventListener("mousedown", e => {
        e.preventDefault();
        if (gameOver) return;
        startDragging(blockDiv, i, e.clientX, e.clientY);
      });

      // スマホ用ドラッグ開始
      blockDiv.addEventListener("touchstart", e => {
        e.preventDefault();
        if (gameOver) return;
        const touch = e.touches[0];
        startDragging(blockDiv, i, touch.clientX, touch.clientY);
      });

      picker.appendChild(blockSlot);
      blockSlot.appendChild(blockDiv);
    } else {
      blockSlot.innerHTML = "";
      blockSlot.style.pointerEvents = "none";
      picker.appendChild(blockSlot);
    }
  }
}

function startDragging(blockDiv, index, clientX, clientY) {
  draggingBlock = { blockDiv, index };

  const rect = blockDiv.getBoundingClientRect();

  dragOffsetX = clientX - rect.left;
  dragOffsetY = clientY - rect.top;

  blockDiv.style.position = "absolute";
  blockDiv.style.transform = "scale(1)";
  blockDiv.style.width = `${CELL_SIZE * currentBlocks[index].shape[0].length}px`;
  blockDiv.style.height = `${CELL_SIZE * currentBlocks[index].shape.length}px`;
  blockDiv.style.zIndex = 1000;
  blockDiv.classList.add("dragging");

  moveAt(clientX, clientY);

  function moveAt(pageX, pageY) {
    blockDiv.style.left = (pageX - dragOffsetX) + "px";
    blockDiv.style.top = (pageY - dragOffsetY) + "px";
  }

  function onMove(event) {
    event.preventDefault();
    let x, y;
    if (event.type.startsWith("touch")) {
      x = event.touches[0].clientX;
      y = event.touches[0].clientY;
    } else {
      x = event.clientX;
      y = event.clientY;
    }
    moveAt(x, y);
  }

  function onEnd(event) {
    event.preventDefault();
    let x, y;
    if (event.type.startsWith("touch")) {
      x = event.changedTouches[0].clientX;
      y = event.changedTouches[0].clientY;
    } else {
      x = event.clientX;
      y = event.clientY;
    }

    const boardRect = document.getElementById("game-board").getBoundingClientRect();

    // ドロップ位置を盤面内座標に変換（左上セルの座標に補正せずブロック中心で判断）
    const dropX = x - boardRect.left - (blockDiv.offsetWidth / 2);
    const dropY = y - boardRect.top - (blockDiv.offsetHeight / 2);

    const gridX = Math.round(dropX / CELL_SIZE);
    const gridY = Math.round(dropY / CELL_SIZE);

    if (canPlaceBlock(currentBlocks[index], gridX, gridY)) {
      placeBlock(currentBlocks[index], gridX, gridY);
      currentBlocks[index] = null;
      score += 10;
      updateScore();
      renderBlocks();

      if (currentBlocks.every(b => b === null)) {
        currentBlocks = pickRandomBlocks();
        renderBlocks();
      }
    } else {
      renderBlocks();
    }

    blockDiv.style.position = "relative";
    blockDiv.style.transform = "scale(0.5)";
    blockDiv.style.width = "";
    blockDiv.style.height = "";
    blockDiv.style.left = "";
    blockDiv.style.top = "";
    blockDiv.style.zIndex = "";
    blockDiv.classList.remove("dragging");

    draggingBlock = null;

    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("touchmove", onMove);
    window.removeEventListener("mouseup", onEnd);
    window.removeEventListener("touchend", onEnd);
    window.removeEventListener("touchcancel", onEnd);
  }

  window.addEventListener("mousemove", onMove);
  window.addEventListener("touchmove", onMove, { passive: false });
  window.addEventListener("mouseup", onEnd);
  window.addEventListener("touchend", onEnd);
  window.addEventListener("touchcancel", onEnd);
}

function canPlaceBlock(block, x, y) {
  if (!block) return false;
  const shape = block.shape;
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      if (shape[i][j]) {
        if (
          y + i < 0 || y + i >= HEIGHT ||
          x + j < 0 || x + j >= WIDTH ||
          board[y + i][x + j]
        ) {
          return false;
        }
      }
    }
  }
  return true;
}

function placeBlock(block, x, y) {
  const shape = block.shape;
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      if (shape[i][j]) {
        board[y + i][x + j] = 1;
      }
    }
  }
  removeFullRows();
  renderBoard();
  checkGameOver();
}

function removeFullRows() {
  let removedCount = 0;

  const newBoard = board.filter(row => {
    if (row.every(cell => cell)) {
      removedCount++;
      return false;
    }
    return true;
  });

  while (newBoard.length < HEIGHT) {
    newBoard.unshift(Array(WIDTH).fill(0));
  }

  board = newBoard;

  if (removedCount > 0) {
    score += removedCount * 50;
    updateScore();
  }
}

function canPlaceAnywhere(block) {
  if (!block) return false;
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      if (canPlaceBlock(block, x, y)) {
        return true;
      }
    }
  }
  return false;
}

function checkGameOver() {
  if (gameOver) return;
  const anyPlacable = currentBlocks.some(block => canPlaceAnywhere(block));
  if (!anyPlacable) {
    gameOver = true;
    const gameOverEl = document.getElementById("game-over");
    if (gameOverEl) gameOverEl.style.display = "block";
  }
}

function resetGame() {
  board = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(0));
  score = 0;
  updateScore();
  currentBlocks = pickRandomBlocks();
  renderBoard();
  renderBlocks();
  const gameOverEl = document.getElementById("game-over");
  if (gameOverEl) gameOverEl.style.display = "none";
  gameOver = false;
  draggingBlock = null;
}

window.addEventListener("DOMContentLoaded", () => {
  const resetBtn = document.getElementById("reset-button");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetGame);
  }
});

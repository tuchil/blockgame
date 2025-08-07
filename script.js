const WIDTH = 8;
const HEIGHT = 8;
let score = 0;
let gameOver = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

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

updateScore();
createBoard();
renderBoard();
renderBlocks();

document.getElementById("reset-button").addEventListener("click", resetGame);

function updateScore() {
  const scoreEl = document.getElementById("score");
  scoreEl.textContent = `スコア: ${score}`;
}

function createBoard() {
  const boardElement = document.getElementById("game-board");
  boardElement.innerHTML = "";
  for (let i = 0; i < HEIGHT * WIDTH; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("dragover", e => e.preventDefault());
    cell.addEventListener("drop", handleDrop);
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
  if (gameOver) return;

  const picker = document.getElementById("block-picker");
  picker.innerHTML = "";

  for (let i = 0; i < 3; i++) {
    const blockSlot = document.createElement("div");
    blockSlot.classList.add("block-slot");

    const block = currentBlocks[i];
    if (block) {
      const blockDiv = document.createElement("div");
      blockDiv.classList.add("block");
      blockDiv.setAttribute("draggable", true);
      blockDiv.dataset.index = i;

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

      blockDiv.addEventListener("dragstart", e => {
        const rect = e.target.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        e.dataTransfer.setData("text/plain", i);
      });

      blockSlot.appendChild(blockDiv);
    }

    picker.appendChild(blockSlot);
  }
}

function handleDrop(e) {
  if (gameOver) return;

  e.preventDefault();

  const draggedIndex = Number(e.dataTransfer.getData("text/plain"));
  const block = currentBlocks[draggedIndex];

  // 盤面の左上座標を取得
  const boardRect = document.getElementById("game-board").getBoundingClientRect();

  // ドロップしたマウス座標から、ブロック掴み位置を引いて
  // 盤面内の相対座標を計算
  const dropX = e.clientX - boardRect.left - dragOffsetX;
  const dropY = e.clientY - boardRect.top - dragOffsetY;

  // 1マスのサイズ（CSSで40px + 2px gap = 42px と仮定）
  const cellSize = 42;

  // 左上のマス座標を計算
  const x = Math.round(dropX / cellSize);
  const y = Math.round(dropY / cellSize);

  if (canPlaceBlock(block, x, y)) {
    placeBlock(block, x, y);
    currentBlocks[draggedIndex] = null;
    score += 10;
    updateScore();
    renderBlocks();

    if (currentBlocks.every(b => b === null)) {
      currentBlocks = pickRandomBlocks();
      renderBlocks();
    }
  }
}



function canPlaceBlock(block, x, y) {
  const shape = block.shape;
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      if (shape[i][j]) {
        if (y + i >= HEIGHT || x + j >= WIDTH || board[y + i][x + j]) {
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
  const canPlaceAny = currentBlocks.some(block => block && canPlaceAnywhere(block));
  if (!canPlaceAny) {
    gameOver = true;
    const gameOverEl = document.getElementById("game-over");
    gameOverEl.style.display = "block";
  }
}

function resetGame() {
  board = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(0));
  score = 0;
  gameOver = false;
  currentBlocks = pickRandomBlocks();
  document.getElementById("game-over").style.display = "none";
  updateScore();
  renderBoard();
  renderBlocks();
}

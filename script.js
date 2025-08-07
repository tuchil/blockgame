const WIDTH = 8;
const HEIGHT = 8;
const CELL_SIZE = 42; // 40px + 2px gap

let score = 0;
let board = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(0));
let currentBlocks = [];
let gameOver = false;

// ドラッグ中情報（タッチ兼用）
let draggingBlock = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

const blockTypes = [
  { shape: [[1, 1, 1, 1]], color: "#f00" },
  { shape: [[1, 1], [1, 1]], color: "#0f0" },
  { shape: [[1]], color: "#00f" },
  { shape: [[1, 1, 0], [0, 1, 1]], color: "#ff0" },
  { shape: [[0, 1, 1], [1, 1, 0]], color: "#0ff" },
  { shape: [[1, 0], [1, 1], [1, 0]], color: "#f0f" },
  { shape: [[0, 1, 0], [1, 1, 1]], color: "#999" }
];

// 初期化
resetGame();

function resetGame() {
  score = 0;
  updateScore();
  board = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(0));
  currentBlocks = pickRandomBlocks();
  gameOver = false;
  document.getElementById("game-over").style.display = "none";
  createBoard();
  renderBoard();
  renderBlocks();
}

// スコア表示更新
function updateScore() {
  document.getElementById("score").textContent = `スコア: ${score}`;
}

// 盤面作成（div.cell）
function createBoard() {
  const boardElement = document.getElementById("game-board");
  boardElement.innerHTML = "";
  for (let i = 0; i < WIDTH * HEIGHT; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    // PC向けドロップ
    cell.addEventListener("dragover", e => e.preventDefault());
    cell.addEventListener("drop", handleDrop);
    boardElement.appendChild(cell);
  }
}

// 盤面描画
function renderBoard() {
  const cells = document.querySelectorAll("#game-board .cell");
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const index = y * WIDTH + x;
      if (board[y][x]) {
        cells[index].classList.add("filled");
      } else {
        cells[index].classList.remove("filled");
      }
    }
  }
}

// ランダムに3つブロック選ぶ
function pickRandomBlocks() {
  const shuffled = [...blockTypes].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}

// ブロック表示＆ドラッグイベント設定
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
      blockDiv.setAttribute("draggable", !gameOver);
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

      // PC用ドラッグイベント
      blockDiv.addEventListener("dragstart", e => {
        if (gameOver) {
          e.preventDefault();
          return;
        }
        const rect = e.target.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        draggingBlock = { blockDiv, index: i };
        e.dataTransfer.setData("text/plain", i);
      });

      // スマホ用タッチドラッグ設定
      setupTouchDrag(blockDiv, i);

      blockSlot.appendChild(blockDiv);
    } else {
      blockSlot.innerHTML = "";
      blockSlot.style.pointerEvents = "none";
    }

    picker.appendChild(blockSlot);
  }
}

// PC向けドロップ処理
function handleDrop(e) {
  if (gameOver) return;
  e.preventDefault();

  const draggedIndex = Number(e.dataTransfer.getData("text/plain"));
  const block = currentBlocks[draggedIndex];

  const boardRect = document.getElementById("game-board").getBoundingClientRect();
  const dropX = e.clientX - boardRect.left - dragOffsetX;
  const dropY = e.clientY - boardRect.top - dragOffsetY;

  const x = Math.round(dropX / CELL_SIZE);
  const y = Math.round(dropY / CELL_SIZE);

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
  draggingBlock = null;
}

// タッチ用ドラッグセットアップ
function setupTouchDrag(blockDiv, index) {
  blockDiv.addEventListener("touchstart", e => {
    if (gameOver) return;
    e.preventDefault();
    draggingBlock = { blockDiv, index };
    const touch = e.touches[0];
    const rect = blockDiv.getBoundingClientRect();
    dragOffsetX = touch.clientX - rect.left;
    dragOffsetY = touch.clientY - rect.top;
    blockDiv.style.position = "absolute";
    blockDiv.style.zIndex = 1000;
    moveAt(touch.clientX, touch.clientY);

    function

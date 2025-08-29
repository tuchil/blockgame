const BOARD_SIZE = 8;
const CELL_SIZE = 40;
const boardEl = document.getElementById("game-board");
const blockSlotsEl = document.getElementById("block-picker");
const scoreEl = document.getElementById("score");
const gameOverEl = document.getElementById("game-over");
let board = [];
let currentBlocks = [];
let selectedBlock = null;
let selectedX = 0;
let selectedY = 0;
let score = 0;
let gameOver = false;

function createBoard() {
  boardEl.innerHTML = "";
  board = [];
  for (let y = 0; y < BOARD_SIZE; y++) {
    let row = [];
    for (let x = 0; x < BOARD_SIZE; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      boardEl.appendChild(cell);
      row.push(null);
    }
    board.push(row);
  }
}

function renderBoard() {
  const cells = boardEl.querySelectorAll(".cell");
  let idx = 0;
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      cells[idx].className = "cell"; // reset
      if (board[y][x]) {
        cells[idx].classList.add("filled");
        cells[idx].style.backgroundColor = "gray"; // ← 常に灰色
      } else {
        cells[idx].style.backgroundColor = "transparent";
      }
      idx++;
    }
  }
}


const blockShapes = [
  { shape: [[1]], color: "yellow" },       // 1×1
  { shape: [[1,1]], color: "orange" },     // 1×2
  { shape: [[1],[1]], color: "cyan" },     // 2×1
  { shape: [[1,1,1]], color: "lime" },    // 1×3
  { shape: [[1],[1],[1]], color: "rgba(186,85,211)" }, // 3×1
  { shape: [[1,1],[1,1]], color: "rgba(127,255,212)" },  // 2×2
  { shape: [[1,0],[0,1]], color: "rgba(225,0,0,0.5)" },
  { shape: [[0,1],[1,0]],color: "blue" },
  { shape: [[1,1,0],[0,1,1]],color: "rgba(255,105,180)" },
  { shape: [[1,1,1],[1,1,1]],color: "rgba(65,105,225)" }
];

function randomBlock() {
  const idx = Math.floor(Math.random() * blockShapes.length);
  return { ...blockShapes[idx] }; // shape と color をそのままコピー
}


function renderBlocks() {
  blockSlotsEl.innerHTML = "";

  for (let i = 0; i < 3; i++) {
    const blockSlot = document.createElement("div");
    blockSlot.classList.add("block-slot");

    const block = currentBlocks[i];
    if (block) {
      const blockDiv = document.createElement("div");
      blockDiv.classList.add("block");
      blockDiv.dataset.index = i;

      block.shape.forEach(row => {
        const rowDiv = document.createElement("div");
        rowDiv.style.display = "flex";
        row.forEach(cell => {
          const cellDiv = document.createElement("div");
          cellDiv.classList.add("block-cell");
          cellDiv.style.width = CELL_SIZE + "px";
          cellDiv.style.height = CELL_SIZE + "px";
          cellDiv.style.backgroundColor = cell ? block.color : "transparent";
          rowDiv.appendChild(cellDiv);
        });
        blockDiv.appendChild(rowDiv);
      });

      blockDiv.addEventListener("click", () => {
        selectedBlock = { ...block, slot: i };
        selectedX = 0;
        selectedY = 0;
        previewSelected();
      });

      blockSlot.appendChild(blockDiv);
    }

    blockSlotsEl.appendChild(blockSlot);
  }
}



function previewSelected() {
  renderBoard(); // 既存ブロック描画

  if (!selectedBlock) return;

  const cells = boardEl.querySelectorAll(".cell");
  const canPlaceBlock = canPlace(selectedBlock, selectedX, selectedY);

  selectedBlock.shape.forEach((row, dy) => {
    row.forEach((val, dx) => {
      if (val) {
        const px = selectedX + dx;
        const py = selectedY + dy;
        if (px >= 0 && px < BOARD_SIZE && py >= 0 && py < BOARD_SIZE) {
          const idx = py * BOARD_SIZE + px;
          cells[idx].classList.remove("filled", "preview", "blocked-preview");

          if (canPlaceBlock) {
            // 置けるとき → ブロック固有の色
            cells[idx].style.backgroundColor = selectedBlock.color;
          } else {
            // 置けないとき → 赤
            cells[idx].style.backgroundColor = "rgba(255, 0, 0, 0.7)";
          }
        }
      }
    });
  });
}




function canPlace(block, x, y) {
  for (let dy=0; dy<block.shape.length; dy++) {
    for (let dx=0; dx<block.shape[0].length; dx++) {
      if (block.shape[dy][dx]) {
        const px = x+dx, py = y+dy;
        if (px<0 || px>=BOARD_SIZE || py<0 || py>=BOARD_SIZE) return false;
        if (board[py][px]) return false;
      }
    }
  }
  return true;
}

function placeBlock() {
  if (!selectedBlock) return;
  if (!canPlace(selectedBlock, selectedX, selectedY)) return;
  selectedBlock.shape.forEach((row, dy) => {
    row.forEach((val, dx) => {
      if (val) {
        board[selectedY+dy][selectedX+dx] = "gray";  // ← 確定時は灰色で固定！
      }
    });
  });
  currentBlocks[selectedBlock.slot] = null;
  selectedBlock = null;
  score += 10;
  checkLines();
  renderBlocks();
  renderBoard();
  updateScore();
  checkGameOver();
}


function checkLines() {
  let cleared = 0;
  // 横
  for (let y=0; y<BOARD_SIZE; y++) {
    if (board[y].every(cell => cell)) {
      board[y] = Array(BOARD_SIZE).fill(null);
      cleared++;
    }
  }
  // 縦
  for (let x=0; x<BOARD_SIZE; x++) {
    if (board.every(row => row[x])) {
      for (let y=0; y<BOARD_SIZE; y++) board[y][x] = null;
      cleared++;
    }
  }
  score += cleared * 50;
}

function updateScore() {
  scoreEl.textContent = "スコア: " + score;
}

function checkGameOver() {
  if (currentBlocks.every(b => b===null)) {
    currentBlocks = [randomBlock(), randomBlock(), randomBlock()];
    renderBlocks();
    return;
  }
  for (let block of currentBlocks) {
    if (!block) continue;
    for (let y=0; y<BOARD_SIZE; y++) {
      for (let x=0; x<BOARD_SIZE; x++) {
        if (canPlace(block, x, y)) return;
      }
    }
  }
  gameOver = true;
  gameOverEl.classList.remove("hidden");
}

// --- 操作ボタン ---
document.getElementById("up").addEventListener("click", () => {
  if (!selectedBlock) return;
  selectedY = Math.max(0, selectedY-1);
  previewSelected();
});

document.getElementById("down").addEventListener("click", () => {
  if (!selectedBlock) return;
  const maxY = BOARD_SIZE - selectedBlock.shape.length;
  selectedY = Math.min(maxY, selectedY + 1);
  previewSelected();
});
document.getElementById("left").addEventListener("click", () => {
  if (!selectedBlock) return;
  selectedX = Math.max(0, selectedX-1);
  previewSelected();
});
document.getElementById("right").addEventListener("click", () => {
  if (!selectedBlock) return;
  const maxX = BOARD_SIZE - selectedBlock.shape[0].length;
  selectedX = Math.min(maxX, selectedX + 1);
  previewSelected();
});

document.getElementById("place").addEventListener("click", placeBlock);

document.getElementById("reset").addEventListener("click", () => {
  score = 0;
  gameOver = false;
  gameOverEl.classList.add("hidden");
  createBoard();
  renderBoard();
  currentBlocks = [randomBlock(), randomBlock(), randomBlock()];
  renderBlocks();
  updateScore();
});

let lastTouchTime = 0;
document.addEventListener('touchstart', function(e) {
  const now = Date.now();
  if (now - lastTouchTime <= 300) { // 300ms以内の連続タップを無効
    e.preventDefault();
  }
  lastTouchTime = now;
}, { passive: false });

// --- 初期化 ---
createBoard();
renderBoard();
currentBlocks = [randomBlock(), randomBlock(), randomBlock()];
renderBlocks();
updateScore();

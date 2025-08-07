body {
  font-family: Arial, sans-serif;
  padding: 20px;
}

h1 {
  margin-bottom: 10px;
}

#score {
  margin-bottom: 10px;
  font-weight: bold;
}

#reset-btn {
  float: right;
  margin-bottom: 10px;
  padding: 5px 10px;
  font-size: 16px;
  cursor: pointer;
}

#block-picker {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  min-height: 60px;
  position: relative;
}

.block-slot {
  width: 80px;
  height: 80px;
  border: 1px dashed #ccc;
  position: relative;
}

.block {
  display: inline-block;
  cursor: grab;
  user-select: none;
  position: relative;
}

.block-cell {
  width: 18px;
  height: 18px;
  margin: 1px;
  box-sizing: border-box;
  border-radius: 3px;
}

#game-board {
  width: 344px; /* 8 * (40 + 2 gap) - 2px */
  height: 344px;
  display: grid;
  grid-template-columns: repeat(8, 40px);
  grid-template-rows: repeat(8, 40px);
  gap: 2px;
  background-color: #ddd;
  border: 2px solid #333;
  position: relative;
}

.cell {
  background-color: #fff;
  border-radius: 3px;
  box-sizing: border-box;
  border: 1px solid #999;
}

.cell.filled {
  background-color: #666;
}

#game-over {
  display: none;
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 48px;
  font-weight: bold;
  color: red;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 20px 40px;
  border: 3px solid red;
  border-radius: 10px;
  z-index: 1000;
  pointer-events: none;
}

.block.dragging {
  opacity: 0.7;
  cursor: grabbing;
  position: absolute;
  z-index: 1000;
  pointer-events: none;
  user-select: none;
}

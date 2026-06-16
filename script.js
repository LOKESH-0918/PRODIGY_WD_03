const cells = Array.from(document.querySelectorAll(".cell"));
const statusText = document.getElementById("statusText");
const newRoundButton = document.getElementById("newRoundButton");
const resetScoreButton = document.getElementById("resetScoreButton");
const playerModeButton = document.getElementById("playerModeButton");
const aiModeButton = document.getElementById("aiModeButton");
const xScore = document.getElementById("xScore");
const oScore = document.getElementById("oScore");
const drawScore = document.getElementById("drawScore");

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

let board = Array(9).fill("");
let currentPlayer = "X";
let gameOver = false;
let gameMode = "players";
let aiThinking = false;
let score = {
  X: 0,
  O: 0,
  draw: 0,
};

function updateStatus(message) {
  if (message) {
    statusText.textContent = message;
    return;
  }

  if (gameMode === "ai" && currentPlayer === "O") {
    statusText.textContent = "Computer thinking";
    return;
  }

  statusText.textContent = currentPlayer === "X" ? "Player X" : "Player O";
}

function renderBoard() {
  cells.forEach((cell, index) => {
    const value = board[index];
    cell.textContent = value;
    cell.className = "cell";
    if (value) {
      cell.classList.add(value.toLowerCase());
    }
    cell.disabled = Boolean(value) || gameOver || aiThinking;
  });
}

function renderScore() {
  xScore.textContent = score.X;
  oScore.textContent = score.O;
  drawScore.textContent = score.draw;
}

function findWinningLine() {
  return winningLines.find(([a, b, c]) => {
    return board[a] && board[a] === board[b] && board[a] === board[c];
  });
}

function findLineFor(player) {
  return winningLines.find(([a, b, c]) => {
    const line = [board[a], board[b], board[c]];
    return line.filter((value) => value === player).length === 2 && line.includes("");
  });
}

function chooseAiMove() {
  const winLine = findLineFor("O");
  if (winLine) {
    return winLine.find((index) => !board[index]);
  }

  const blockLine = findLineFor("X");
  if (blockLine) {
    return blockLine.find((index) => !board[index]);
  }

  if (!board[4]) {
    return 4;
  }

  const corners = [0, 2, 6, 8].filter((index) => !board[index]);
  if (corners.length) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  const emptyCells = board
    .map((value, index) => (value ? null : index))
    .filter((index) => index !== null);
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function finishGame(winningLine) {
  if (winningLine) {
    score[currentPlayer] += 1;
    winningLine.forEach((index) => cells[index].classList.add("win"));
    updateStatus(gameMode === "ai" && currentPlayer === "O" ? "Computer wins" : `Player ${currentPlayer} wins`);
  } else {
    score.draw += 1;
    updateStatus("Match draw");
  }

  gameOver = true;
  cells.forEach((cell) => {
    cell.disabled = true;
  });
  renderScore();
}

function placeMove(index) {
  if (board[index] || gameOver) {
    return false;
  }

  board[index] = currentPlayer;
  renderBoard();

  const winningLine = findWinningLine();
  if (winningLine) {
    finishGame(winningLine);
    return true;
  }

  if (board.every(Boolean)) {
    finishGame(null);
    return true;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateStatus();
  return true;
}

function makeAiMove() {
  if (gameMode !== "ai" || currentPlayer !== "O" || gameOver) {
    return;
  }

  aiThinking = true;
  updateStatus();
  renderBoard();

  window.setTimeout(() => {
    const aiMove = chooseAiMove();
    aiThinking = false;
    if (aiMove !== undefined) {
      placeMove(aiMove);
    }
    renderBoard();
  }, 450);
}

function handleMove(index) {
  if (aiThinking || (gameMode === "ai" && currentPlayer === "O")) {
    return;
  }

  const moved = placeMove(index);
  if (moved && gameMode === "ai" && currentPlayer === "O" && !gameOver) {
    makeAiMove();
  }
}

function startNewRound() {
  board = Array(9).fill("");
  currentPlayer = "X";
  gameOver = false;
  aiThinking = false;
  updateStatus();
  renderBoard();
}

function setMode(mode) {
  gameMode = mode;
  playerModeButton.classList.toggle("active", mode === "players");
  aiModeButton.classList.toggle("active", mode === "ai");
  resetScore();
}

function resetScore() {
  score = {
    X: 0,
    O: 0,
    draw: 0,
  };
  renderScore();
  startNewRound();
}

cells.forEach((cell, index) => {
  cell.addEventListener("click", () => handleMove(index));
});

newRoundButton.addEventListener("click", startNewRound);
resetScoreButton.addEventListener("click", resetScore);
playerModeButton.addEventListener("click", () => setMode("players"));
aiModeButton.addEventListener("click", () => setMode("ai"));

renderBoard();
renderScore();
updateStatus();

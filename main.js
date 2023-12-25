
    let difficulty = 5; // Default difficulty

    function startGame() {
      difficulty = parseInt(document.getElementById('difficulty-select').value, 10);
      document.getElementById('start-screen').style.display = 'none';
      document.getElementById('board').style.display = 'grid';
      createBoard();
      updateBoard();
    }

    const ROWS = 6;
    const COLS = 7;
    const board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    let currentPlayer = 'red';

    function createCell(row, col) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener('click', () => makeMove(col));
      document.getElementById('board').appendChild(cell);
    }

    function createBoard() {
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          createCell(row, col);
        }
      }
    }

    function makeMove(col) {
      if (isColumnFull(col)) {
        return;
      }

      const row = getEmptyRow(col);
      board[row][col] = currentPlayer;

      const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
      const coin = document.createElement('div');
      coin.classList.add('coin', currentPlayer);
      cell.appendChild(coin);

      setTimeout(() => {
        coin.style.top = '0';
        coin.style.animation = 'none'; // Disable animation after sliding
        coin.offsetHeight; // Trigger reflow
        coin.style.animation = null; // Re-enable animation

        if (checkWin(row, col)) {
          coin.classList.add('winning-coin');
          alert(`${currentPlayer.toUpperCase()} wins!`);
          resetGame();
        } else {
          coin.classList.remove('winning-coin');
          currentPlayer = currentPlayer === 'red' ? 'yellow' : 'red';
          if (currentPlayer === 'yellow') {
            setTimeout(makeComputerMove, 250); // Delay computer move after player's move
          }
        }
      }, 500);
    }

    function isColumnFull(col) {
      return board[0][col] !== 0;
    }

    function getEmptyRow(col) {
      for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row][col] === 0) {
          return row;
        }
      }
      return -1; // Should not happen if isColumnFull is checked first
    }

    
    function makeComputerMove() {
        console.log(difficulty);
        const bestMove = getBestMove();
        console.log('Best Move:', bestMove);
        setTimeout(() => makeMove(bestMove), 100); // Adjust the delay as needed
}

function getBestMove() {
  return minimax(board, difficulty, -Infinity, Infinity, true).column;
}

function minimax(board, depth, alpha, beta, isMaximizing) {
  const result = checkGameOver();
  if (result !== null || depth === 0) {
    return { score: evaluateBoard(board), column: null };
  }

  const availableCols = getAvailableColumns(board);
  let bestMove = null;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const col of availableCols) {
      const row = getEmptyRow(col);
      board[row][col] = 'yellow';

      const eval = minimax(board, depth - 1, alpha, beta, false).score;
      board[row][col] = 0; // Undo the move

      if (eval > maxEval) {
        maxEval = eval;
        bestMove = col;
      }

      alpha = Math.max(alpha, eval);
      if (beta <= alpha) {
        break;
      }
    }
    return { score: maxEval, column: bestMove };
  } else {
    let minEval = Infinity;
    for (const col of availableCols) {
      const row = getEmptyRow(col);
      board[row][col] = 'red';

      const eval = minimax(board, depth - 1, alpha, beta, true).score;
      board[row][col] = 0; // Undo the move

      if (eval < minEval) {
        minEval = eval;
        bestMove = col;
      }

      beta = Math.min(beta, eval);
      if (beta <= alpha) {
        break;
      }
    }
    return { score: minEval, column: bestMove };
  }
}

    function getAvailableColumns(board) {
      const availableCols = [];
      for (let col = 0; col < COLS; col++) {
        if (!isColumnFull(col, board)) {
          availableCols.push(col);
        }
      }
      return availableCols;
    }

    function evaluateBoard(board) {
        let score = 0;
      
        // Check for a winning state
        const winner = checkGameOver();
        if (winner === 'yellow') {
          score = 100000; // AI wins
        } else if (winner === 'red') {
          score = -1000; // Opponent wins
        } else {
          // Evaluate each cell in the board
          for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
              if (board[row][col] === 'yellow') {
                score += evaluateCell(row, col, 'yellow');
              } else if (board[row][col] === 'red') {
                score -= evaluateCell(row, col, 'red');
              }
            }
          }
      
          // Check for potential winning moves for both AI and opponent
          const aiWinningMove = checkPotentialWinningMove(board, 'yellow');
          const opponentWinningMove = checkPotentialWinningMove(board, 'red');
      
          // Adjust the score based on potential winning moves
          score += aiWinningMove ? 500 : 0; // Encourage AI winning moves
          score -= opponentWinningMove ? 500 : 0; // Discourage opponent winning moves
        }
      
        return score;
      }
      
      function checkPotentialWinningMove(board, color) {
        // Check for a potential winning move for the specified color
        for (let col = 0; col < COLS; col++) {
          const row = getEmptyRow(col);
          if (row !== -1) {
            board[row][col] = color;
            if (checkWin(row, col)) {
              // Undo the move and return true if it's a winning move
              board[row][col] = 0;
              return true;
            }
            board[row][col] = 0; // Undo the move
          }
        }
        return false;
      }
      

    function evaluateCell(row, col, color) {
      // Evaluate a single cell for a given color
      let score = 0;

      // Check horizontally
      score += evaluateDirection(row, col, color, 0, 1);

      // Check vertically
      score += evaluateDirection(row, col, color, 1, 0);

      // Check diagonally (/)
      score += evaluateDirection(row, col, color, 1, 1);

      // Check diagonally (\)
      score += evaluateDirection(row, col, color, 1, -1);

      return score;
    }

    function evaluateDirection(row, col, color, rowDirection, colDirection) {
        let score = 0;
        let consecutiveCount = 0;
      
        for (let i = -3; i <= 3; i++) {
          const newRow = row + i * rowDirection;
          const newCol = col + i * colDirection;
      
          if (
            newRow >= 0 && newRow < ROWS &&
            newCol >= 0 && newCol < COLS &&
            board[newRow][newCol] === color
          ) {
            consecutiveCount++;
          } else {
            consecutiveCount--;
          }
      
          if (consecutiveCount === 4) {
            // Four consecutive cells found, increase the score
            score += color === 'yellow' ? 100 : -100;
          } else if (consecutiveCount > 0) {
            // Partial consecutive cells found, add to the score
            score += color === 'yellow' ? Math.pow(10, consecutiveCount) : -Math.pow(10, consecutiveCount);
          }
        }
      
        return score;
      }
      

    function checkWin(row, col) {
      // Check horizontally
      if (checkDirection(row, col, 0, 1)) return true;

      // Check vertically
      if (checkDirection(row, col, 1, 0)) return true;

      // Check diagonally (/)
      if (checkDirection(row, col, 1, 1)) return true;

      // Check diagonally (\)
      if (checkDirection(row, col, 1, -1)) return true;

      return false;
    }

    function checkDirection(row, col, rowDirection, colDirection) {
      const color = board[row][col];
      let count = 1;

      for (let i = 1; i <= 3; i++) {
        const newRow = row + i * rowDirection;
        const newCol = col + i * colDirection;

        if (
          newRow >= 0 && newRow < ROWS &&
          newCol >= 0 && newCol < COLS &&
          board[newRow][newCol] === color
        ) {
          count++;
        } else {
          break;
        }
      }

      for (let i = 1; i <= 3; i++) {
        const newRow = row - i * rowDirection;
        const newCol = col - i * colDirection;

        if (
          newRow >= 0 && newRow < ROWS &&
          newCol >= 0 && newCol < COLS &&
          board[newRow][newCol] === color
        ) {
          count++;
        } else {
          break;
        }
      }

      return count >= 4;
    }

    function checkGameOver() {
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          if (board[row][col] !== 0) {
            const color = board[row][col];

            // Check horizontally
            if (col <= COLS - 4 && board[row][col + 1] === color && board[row][col + 2] === color && board[row][col + 3] === color) {
              return color;
            }

            // Check vertically
            if (row <= ROWS - 4 && board[row + 1][col] === color && board[row + 2][col] === color && board[row + 3][col] === color) {
              return color;
            }

            // Check diagonally (/)
            if (row >= 3 && col <= COLS - 4 && board[row - 1][col + 1] === color && board[row - 2][col + 2] === color && board[row - 3][col + 3] === color) {
              return color;
            }

            // Check diagonally (\)
            if (row <= ROWS - 4 && col <= COLS - 4 && board[row + 1][col + 1] === color && board[row + 2][col + 2] === color && board[row + 3][col + 3] === color) {
              return color;
            }
          }
        }
      }

      // Check for a tie
      if (board.every(row => row.every(cell => cell !== 0))) {
        return 'tie';
      }

      return null;
    }

    function resetGame() {
      setTimeout(() => {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
          cell.innerHTML = '';
        });
        for (let row = 0; row < ROWS; row++) {
          for (let col = 0; col < COLS; col++) {
            board[row][col] = 0;
          }
        }
        currentPlayer = 'red';
        updateBoard();
      }, 1000); // Delay reset for 1 second to allow winning coin animation
    }

    function updateBoard() {
      const cells = document.querySelectorAll('.cell');
      cells.forEach(cell => {
        const row = parseInt(cell.dataset.row, 10);
        const col = parseInt(cell.dataset.col, 10);
        const value = board[row][col];
        cell.innerHTML = '';
        cell.classList.remove('red', 'yellow');
        if (value === 'red' || value === 'yellow') {
          cell.classList.add(value);
        }
      });
    }

    // createBoard();
    // updateBoard();
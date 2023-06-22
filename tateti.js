document.addEventListener("DOMContentLoaded", async () => {
  const modelPath = "/ttt_model.json";
  await tf.loadLayersModel(modelPath).then((model) => {
    // Board and players
    let board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    const playerX = -1;
    const playerO = 1;
    let turn = playerX;

    // Function to make a move
    const makeMove = (cell) => {
      if (board[cell] !== 0) {
        return; // Cell already occupied, cannot play here
      }

      if (turn === playerX) {
        board[cell] = playerX;
        document.getElementById(`cell-${cell}`).textContent = "X";
      } else if (turn === playerO) {
        board[cell] = playerO;
        document.getElementById(`cell-${cell}`).textContent = "O";
      } else {
        return; // Not the turn of any player, cannot play here
      }

      // Check for a winner or a draw
      if (checkWinner(board, turn)) {
        showMessage(
          turn === playerX
            ? "Congratulations, you won! :D"
            : "Sorry, the AI outsmarted you! :("
        );

        resetGame();
      } else if (!board.includes(0)) {
        showMessage("It's a draw! Play again! :D");
        resetGame();
      } else {
        // Switch turn
        turn = turn === playerX ? playerO : playerX;

        if (turn === playerO) {
          setTimeout(() => playAI(), 500);
        }
      }
    };

    const playAI = async () => {
      const tensorBoard = tf.tensor(board);
      const result = await model.predict(tensorBoard.reshape([1, 9]));
      const availableMoves = [];

      result.data().then((data) => {
        for (let i = 0; i < data.length; i++) {
          if (board[i] === 0) {
            availableMoves.push({ index: i, score: data[i] });
          }
        }
        availableMoves.sort((a, b) => b.score - a.score);

        if (availableMoves.length > 0) {
          makeMove(availableMoves[0].index);
        }
      });
    };

    // Function to check for a winner
    const checkWinner = (board, player) => {
      const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8], // rows
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8], // columns
        [0, 4, 8],
        [2, 4, 6], // diagonals
      ];

      for (let combination of winningCombinations) {
        if (
          board[combination[0]] === player &&
          board[combination[1]] === player &&
          board[combination[2]] === player
        ) {
          return true;
        }
      }

      return false;
    };

    // Function to show a message in the DOM
    const showMessage = (message) => {
      const messageElem = document.createElement("p");
      messageElem.textContent = message;
      document.body.appendChild(messageElem);
      setTimeout(() => {
        messageElem.remove();
      }, 2000);
    };

    // Function to reset the game
    const resetGame = () => {
      board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const cells = document.getElementsByTagName("td");
      for (let i = 0; i < cells.length; i++) {
        cells[i].textContent = "";
      }
      turn = playerX;
    };

    // Handle click events on the cells of the board
    const cells = document.getElementsByTagName("td");
    for (let i = 0; i < cells.length; i++) {
      cells[i].addEventListener("click", function () {
        makeMove(i);
      });
    }
  });
});

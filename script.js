// Pub Sub
const PubSub = {
    events: {},
    subscribe: function(eventName, fn) {
        this.events[eventName] = this.events[eventName] || [];
        this.events[eventName].push(fn);
    },
    publish: function(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(fn => fn(data));
        }
    }
};


// Player Object
//  Properties:
//      name - name of the player
//      marker - marker type (X or O)
//  Methods:
//      makeMove(square) - player makes a move
//
function createPlayer(name, marker) {
    function makeMove(square) {
        const success = square.addPlayer(this);
        return success;
    }
    return {name, marker, makeMove};
}

// Gameboard Square Object
//  Properties:
//      occupyingPlayer - Player object for the player occupying the square
//  Methods:
//      addPlayer(Player) - adds player as occupying player
//      clearSquare() - clears the square of any occupying players
function createGameSquare() {
    return {
        occupyingPlayer: null,
        addPlayer: function(Player) {
            let success = false;
            if (this.occupyingPlayer === null) { 
                this.occupyingPlayer = Player;
                success = true;  // successful move
            }
            return success;
        },
        clearSquare: function() {
            this.occupyingPlayer = null;
        }
    }
}


// Gameboard Module
//  Properties:
//      squares - array of Gameboard Square objects
//  Methods:
//      checkGameOver() - checks to board to see if game is over
//      reset() - clear the gameboard
const gameboard = (function () {

    const squares = [];
    for (let i = 0; i < 9; i++) {
        squares.push(createGameSquare());
    }

    // Returns the i-th square (0 indexed)
    function getSquare(i) {
        return squares[i];
    }

    // Checks if the game is over and returns winner
    function checkGameOver() {
        let winner = null;
        let gameOver = false;
        // Check rows
        for (let i = 0; i < squares.length; i += 3) {
            const row = squares.slice(i, i+3).map(square => square.occupyingPlayer);
            if (row[0] !== null && row[0] === row[1] && row[1] === row[2]) {
                // Winning row!
                gameOver = true;
                winner = row[0];
                return {gameOver, winner};
            }
        }
        // Check columns
        for (let i = 0; i < 3; i++) {
            const col = [squares[i].occupyingPlayer, squares[i+3].occupyingPlayer, squares[i+6].occupyingPlayer];
            if (col[0] !== null && col[0] === col[1] && col[1] === col[2]) {
                // Winning column!
                gameOver = true;
                winner = col[0];
                return {gameOver, winner};
            }
        }
        // Check diagonals
        const diag1 = [squares[0].occupyingPlayer, squares[4].occupyingPlayer, squares[8].occupyingPlayer];
        if (diag1[0] !== null && diag1[0] === diag1[1] && diag1[1] === diag1[2]) {
            // Winning diagonal #1!
            gameOver = true;
            winner = diag1[0];
            return {gameOver, winner};
        }
        const diag2 = [squares[2].occupyingPlayer, squares[4].occupyingPlayer, squares[6].occupyingPlayer];
        if (diag2[0] !== null && diag2[0] === diag2[1] && diag2[1] === diag2[2]) {
            // Winning diagonal #2!
            gameOver = true;
            winner = diag2[0];
            return {gameOver, winner};
        }

        // If no winner was found, see if the board is full
        gameOver = squares.every(square => square.occupyingPlayer !== null); // full board without a winner
        return {gameOver, winner};
    }

    // Resets the gameboard
    function reset() {
        squares.forEach(square => square.clearSquare());
    }

    return {getSquare, checkGameOver, reset}
})();


// UI controller
const uiController = (function() {

    const playerXNameEl = document.querySelector('#player-x-name');
    const playerONameEl = document.querySelector('#player-o-name');
    squareEls = document.querySelectorAll(".square");

    // ---- Captures player inputs and interactions ----
    // Add event listeners to the squares
    squareEls.forEach(squareEl => {
        squareEl.addEventListener('click', function() {
            PubSub.publish('squareClicked', {index: squareEl.dataset.index});
        });
    });
    // Add event listener to start button
    startBtn = document.querySelector("#start-btn");
    startBtn.addEventListener('click', () => {
        // Get player names. If name not provided, assign name to be marker type.
        const playerXName = playerXNameEl.value == "" ? "X" : playerXNameEl.value;
        const playerOName = playerONameEl.value == "" ? "O" : playerXNameEl.value;
        PubSub.publish('startBtnClicked', { playerXName, playerOName });
    });

    // ---- Renders game elements ----
    // Render gameboard
    function updateGameboard() {
        squareEls.forEach(squareEl => {
            const index = squareEl.dataset.index;
            const square = gameboard.getSquare(index);
            if (square.occupyingPlayer === null) {
                squareEl.textContent = "";
            } else {
                squareEl.textContent = square.occupyingPlayer.marker;
            }
        });
    }

    // Updates UI when game starts
    function startGame() {
        // Update gameboard
        updateGameboard();
        // Hide game menu
        playerXNameEl.disabled = true;
        playerONameEl.disabled = true;
    }

    function endGame(winner) {
        // Display results
        if (winner === null) {
            console.log('Tie!');
        } else {
            console.log(`The winner is ${winner.name}!`);
        }
        // Show game menu
        playerXNameEl.disabled = false;
        playerONameEl.disabled = false;
    }

    return { updateGameboard, startGame, endGame }

})();


// Game controller
const gameController = (function() {
    let playerX, playerO;
    let currPlayer;
    let gameStarted = false;

    function initPlayers(playerXName, playerOName) {
        playerX = createPlayer(playerXName, 'x');
        playerO = createPlayer(playerOName, 'o');
    }

    function nextPlayer() {
        if (currPlayer === playerX) {
            currPlayer = playerO;
        } else {
            currPlayer = playerX;
        }
    }

    function startGame(data) {
        if (!gameStarted) {
            console.log('STARTING GAME!')
            gameboard.reset();
            uiController.startGame();
            gameStarted = true;
            initPlayers(data.playerXName, data.playerOName);
            currPlayer = playerX;
        } else {
            console.log('GAME ALREADY STARTED!');
        }
    }

    function squareClicked(data) {
        if (gameStarted) {
            const square = gameboard.getSquare(data.index);
            const success = currPlayer.makeMove(square);
            if (success) {
                uiController.updateGameboard();
                const {gameOver, winner} = gameboard.checkGameOver();
                if (gameOver) {
                    if (winner === null) {
                        console.log(`GAME OVER: It's a tie!`);
                    } else {
                        console.log(`GAME OVER: Winner is ${winner.name}`);
                    }
                    gameStarted = false;
                    uiController.endGame(winner);
                } else {
                    nextPlayer();
                }
            }
        }
    }

    PubSub.subscribe('startBtnClicked', function(data) {
        startGame(data);
    });

    PubSub.subscribe('squareClicked', function(data) {
        squareClicked(data);
    })

    return {};
})();
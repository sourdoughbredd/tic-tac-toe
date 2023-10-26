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

    // Store the gameboard as a 1D array of squares
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
        ({ playerXName, playerOName } = startGame());
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
    const menuEl = document.querySelector(".menu");
    const playerXNameIn = document.querySelector('#player-x-name');
    const playerONameIn = document.querySelector('#player-o-name');
    const gameInfoEl = document.querySelector(".game-info");
    const playerXNameEl = document.querySelector('#player-x .name');
    const playerONameEl = document.querySelector('#player-o .name');
    const playerXMarkerEl = document.querySelector('#player-x .marker');
    const playerOMarkerEl = document.querySelector('#player-o .marker');

    function startGame() {
        // Update gameboard
        updateGameboard();
        // Hide game menu
        menuEl.classList.add('hidden');
        // Get player names
        playerXName = playerXNameIn.value;
        playerOName = playerONameIn.value;
        // Update in-game name display
        playerXNameEl.innerText = playerXName;
        playerONameEl.innerText = playerOName;
        // Show game info (player names and markers)
        gameInfoEl.classList.remove('hidden');
        // Return the names for others to use
        return { playerXName, playerOName };
    }

    // Updates UI when game ends
    function endGame(winner) {
        // Display results
        if (winner === null) {
            results = "It's a tie!";
        } else {
            results = `The winner is ${winner.name}!`;
        }
        menuEl.querySelector('#instructions').innerText = results + " Enter names and press START to play again!";
        // Show game menu
        menuEl.classList.remove('hidden');
    }

    // Updates UI when current player changes
    function updateActivePlayer(player) {
        if (player.marker == 'x') {
            playerXMarkerEl.style.opacity = 1;
            playerOMarkerEl.style.opacity = 0.1;
        } else if (player.marker == 'o') {
            playerXMarkerEl.style.opacity = 0.1;
            playerOMarkerEl.style.opacity = 1;
        } else {
            /// Do nothing.
        }
    }

    return { updateGameboard, startGame, endGame, updateActivePlayer }

})();


// Game controller
const gameController = (function() {
    let playerX, playerO;
    let currPlayer;
    let gameStarted = false;

    PubSub.subscribe('startBtnClicked', function(data) {
        startGame(data);
    });

    PubSub.subscribe('squareClicked', function(data) {
        squareClicked(data);
    })

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

    // Randomly chooses x or y (with equal probability) and returns the choice. 
    function randomChoice(x, y) {
            return Math.random() < 0.5 ? x : y;
    }

    function startGame(data) {
        if (!gameStarted) {
            // Check names
            const playerXName = data.playerXName == "" ? "X" : data.playerXName;
            const playerOName = data.playerOName == "" ? "O" : data.playerOName;
            // Start game
            gameStarted = true;
            gameboard.reset();
            uiController.startGame();
            initPlayers(playerXName, playerOName);
            currPlayer = randomChoice(playerX, playerO);
            uiController.updateActivePlayer(currPlayer);
        } else {
            // Do nothing. Game already started.
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
                    gameStarted = false;
                    uiController.endGame(winner);
                } else {
                    nextPlayer();
                    uiController.updateActivePlayer(currPlayer);
                }
            }
        }
    }
})();
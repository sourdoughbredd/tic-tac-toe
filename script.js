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
//      reset() - clear the gameboard
const gameboard = (function () {

    const squares = [];
    for (let i = 0; i < 9; i++) {
        squares.push(createGameSquare());
    }

    function gameOver() {
        return squares.every(square => square.occupyingPlayer !== null);
    }

    function reset() {
        squares.forEach(square => square.clearSquare());
    }

    return {squares, reset}
})();

// UI controller
const uiController = (function() {
    // ---- Renders game elements ----
    // ---- Captures player inputs and interactions ----
    // Add event listeners to the squares
    squareElems = document.querySelectorAll(".square");
    squareElems.forEach(squareEl => {
        squareEl.addEventListener('click', function() {
            PubSub.publish('squareClicked', {index: squareEl.dataset.index});
        });
    });
    // Add event listener to start button
    startBtn = document.querySelector("#start-btn");
    startBtn.addEventListener('click', () => {
        // Get player names and pass along with the publish message
        const playerXName = document.querySelector('#player-x-name').value;
        const playerOName = document.querySelector('#player-o-name').value;
        PubSub.publish('startBtnClicked', { playerXName, playerOName });
    });

    // Render gameboard
    function updateGameboard() {
        squareElems.forEach(squareEl => {
            const index = squareEl.dataset.index;
            const square = gameboard.squares[index];
            if (square.occupyingPlayer !== null) {
                squareEl.textContent = square.occupyingPlayer.marker;
            }
        });
    }

    return { updateGameboard }

})();

// Player Info
const players = (function() {
    let x, o;
    
})();

// Game controller
const gameController = (function() {
    let playerX, playerO;
    let currPlayer;
    let gameStarted = false;
    let readyForMove = false;

    // function getPlayerX() {
    //     return playerX;
    // }

    // function getPlayerO() {
    //     return playerO;
    // }

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
            gameStarted = true;
            initPlayers(data.playerXName, data.playerOName);
            currPlayer = playerX;
            readyForMove = true;
        } else {
            console.log('GAME ALREADY STARTED!');
        }
    }

    function squareClicked(data) {
        console.log(data.index);
        if (readyForMove) {
            const square = gameboard.squares[data.index];
            const success = currPlayer.makeMove(square);
            if (success) {
                uiController.updateGameboard();
                nextPlayer();
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
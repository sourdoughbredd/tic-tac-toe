// Player Object
//  Properties:
//      name - name of the player
//      marker - marker type (X or O)
//  Methods:
//      makeMove(square) - player makes a move
//      setName() - sets name of the player
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
function createGameSquare(i) {
    return {
        occupyingPlayer: null,
        domElem: document.getElementById(`square-${i}`), // think I need to go data attribute route to track
        addPlayer: function(Player) {
            let success = false;
            if (this.occupyingPlayer === null) { 
                this.occupyingPlayer = Player;
                this.domElem.textContent = Player.marker;
                success = true;  // successful move
            }
            return success;
        },
        clearSquare: function() {
            this.occupyingPlayer = null;
            this.domElem.textContent = "";
        }
    }
}


// Gameboard Module
//  Properties:
//      squares - array of Gameboard Square objects
//  Methods:
//      clearGameboard() - clear the gameboard
//      render() - renders the gameboard (draws marker type of players occupying squares)
const gameboard = (function () {

    const squares = [];
    for (let i = 0; i < 9; i++) {
        squares.push(createGameSquare(i))
    }

    function render() {
        let markers = "";
        squares.forEach(square => {
            if (square.occupyingPlayer === null) {
                markers += "|-|";
            } else {
                markers += "|" + square.occupyingPlayer.marker + "|";
            }
        });
        console.log(markers)
    }

    function reset() {
        squares.forEach(square => square.clearSquare());
    }

    return {squares, render, reset}
})();

// Game Controller
// Controls the flow of the game
// 1. Wait for user to press Start
// 2. Get name and marker choice of each player
// 3. Create Player objects
// 4. Create game board
// 5. Randomly choose someone to go first
// 6. Wait for them to choose a spot
// 7. Make move on that spot
// 8. Check if anyone has won game -> end game
// 9. Check if board is full -> end game
//10. Next players turn and repeat 6-10
function playGame() {
    name1 = "Brett";
    marker1 = "x";
    name2 = "Priscilla";
    marker2 = "o";
    player1 = createPlayer(name1, marker1);
    player2 = createPlayer(name2, marker2);
    let turnsCount = 0;
    while (!gameOver()) {
        const currPlayer = (turnsCount % 2 === 0) ? player2 : player1;
        let successfulMove = false;
        while (!successfulMove) {
            // Wait for player to choos
            // Hmmmm I may need to rethink approach.
        }
        turnsCount++;
    }

}
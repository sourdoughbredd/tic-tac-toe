// Player Object
//  Properties:
//      name - name of the player
//      marker - marker type (X or O)
//  Methods:
//      makeMove() - player makes a move
//      setName() - sets name of the player
//
function createPlayer(name, marker) {
    function makeMove() {
        
    }
}

// Gameboard Square Object
//  Properties:
//      occupyingPlayer - Player object for the player occupying the square
//  Methods:
//      addPlayerMove(Player) - adds player as occupying player
//      clearSquare() - clears the square of any occupying players
function createGameSquare() {
    let occupyingPlayer = null;
    function addMove(Player) {
    }
    function clearSquare() {
        occupyingPlayer = null;
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
        squares.push(createGameSquare());
    }

    function render() {
        let markers = squares.reduce((markers, square) => {
                const marker = square.occupyingPlayer.marker;
                if (marker === null) return "|-|";
                return "|" + squares.occupyingPlayer.marker + "|" }, "");
        console.log(markers)
    }
})();
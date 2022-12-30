let game = {
    statePosition: 0,
    moveStack: null
}

function initState(){
    game.statePosition = 0;
    game.moveStack = [];

    const cState = {
        board: [['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
            ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
            ['.', '.', '.', '.', '.', '.', '.', '.'],
            ['.', '.', '.', '.', '.', '.', '.', '.'],
            ['.', '.', '.', '.', '.', '.', '.', '.'],
            ['.', '.', '.', '.', '.', '.', '.', '.'],
            ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
            ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']],
        curPlayer: "white",
        whiteKingSideCastleMoved: false,
        whiteQueenSideCastleMoved: false,
        whiteKinkMoved: false,
        blackKingSideCastleMoved: false,
        blackQueenSideCastleMoved: false,
        blackKinkMoved: false,
        epPos: null
    }

    game.moveStack[0] = cState
}

function currentState(){
    return game.moveStack[game.statePosition]
}

function pushState(state){
    game.statePosition++
    game.moveStack[game.statePosition] = state
    game.moveStack.length = game.statePosition + 1
}

function goToFirstState(){
    game.statePosition = 0
}

function prevState(){
    if(game.statePosition > 0) game.statePosition--
}

function nextState(){
    if(game.statePosition < (game.moveStack.length - 1)) game.statePosition++
}

function clearStatesAfterCurrent(){
    game.moveStack.length = game.statePosition + 1
}

function toggleTurn(state){
    if (state.curPlayer === 'white') {
        state.curPlayer = 'black';
    } else {
        state.curPlayer = 'white';
    }
}

function finalPosition(rawPosition){
    return !boardFlipped ? rawPosition : [7 - rawPosition[0], 7 - rawPosition[1]]
}

function loadGame(filename, startFlag = true){
    readTextFile("games/" + filename, (gameStr) => {
        const gameObject = JSON.parse(gameStr)
        boardFlipped = gameObject.boardFlipped
        game = gameObject
        if(startFlag) goToFirstState()
        refreshUI(true)
    })
}

function saveGame(){
    game.boardFlipped = boardFlipped
    const gameStr = JSON.stringify(game)

    const filename = prompt("Please enter filename");
    const link = document.createElement("a");
    const file = new Blob([gameStr], { type: 'text/plain' });
    link.href = URL.createObjectURL(file);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}
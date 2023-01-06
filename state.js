let game = {
    statePosition: 0,
    white_name: "White",
    black_name: "Black",
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
        startPosition: null,
        endPosition: null,
        epPos: null
    }

    game.moveStack[0] = cState
}

function currentState(){
    return game.moveStack[game.statePosition]
}

function getCurrentStateClone(){
    const clone = JSON.parse(JSON.stringify(currentState()))
    clone.lmrate = "normal"
    return clone
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

function stateStartAndEndPosition(state, startingPosition, endingPosition){
    state.startPosition = startingPosition
    state.endPosition = endingPosition
}

function finalPosition(rawPosition){
    return !boardFlipped ? rawPosition : [7 - rawPosition[0], 7 - rawPosition[1]]
}

function rateMoveNormal(){
    currentState().lmrate = "normal"
    refreshUI()
}

function rateMoveBlunder(){
    currentState().lmrate = "blunder"
    refreshUI()
}

function rateMovePerfect(){
    currentState().lmrate = "perfect"
    refreshUI()
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
    openModal();
}

function save(){
    const cateSelect = document.getElementById("category");
    const filenameInp = document.getElementById("filename")
    let extra = {}
    let finalFn = ""

    if(cateSelect.value === 'full_game'){
        const white_name = document.getElementById("white_name")
        const black_name = document.getElementById("black_name")
        const result = document.getElementById("result")
        extra = {
            type: "full_game",
            white_name: white_name.value,
            black_name: black_name.value,
            result: result.value
        }
        finalFn = "fg-" + filenameInp.value
    }
    else {
        const openings = document.getElementById("openings")
        extra = {
            type: "trap",
            opening: openings.value,
            trap_name: filenameInp.value
        }
        finalFn = "tr-" + openings.value + "-" + filenameInp.value
    }
    game.extra = extra

    game.boardFlipped = boardFlipped
    const gameStr = JSON.stringify(game)

    const link = document.createElement("a");
    const file = new Blob([gameStr], { type: 'text/plain' });
    link.href = URL.createObjectURL(file);
    link.download = finalFn;
    link.click();
    URL.revokeObjectURL(link.href);
}
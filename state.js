let moveStack;
let statePosition = 0;

function initState(){
    statePosition = 0;
    moveStack = [];

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

    moveStack[0] = cState
}

function currentState(){
    return moveStack[statePosition]
}

function pushState(state){
    statePosition++
    moveStack[statePosition] = state
    moveStack.length = statePosition + 1
}

function prevState(){
    if(statePosition > 0) statePosition--
}

function nextState(){
    if(statePosition < (moveStack.length - 1)) statePosition++
}

function clearStatesAfterCurrent(){
    moveStack.length = statePosition + 1
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
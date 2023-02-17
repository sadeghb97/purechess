let intervalID = 0
let game = {
    statePosition: 0,
    white_name: "White",
    black_name: "Black",
    moveStack: null
}

function initState(board = [['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']], curPlayer = "white"){
    clearInterval(intervalID)
    game.statePosition = 0;
    game.moveStack = [];
    delete game.white_time
    delete game.black_time

    const cState = {
        id: Date.now(),
        board: board,
        curPlayer: curPlayer,
        whiteKingSideCastleMoved: false,
        whiteQueenSideCastleMoved: false,
        whiteKinkMoved: false,
        blackKingSideCastleMoved: false,
        blackQueenSideCastleMoved: false,
        blackKinkMoved: false,
        startPosition: null,
        endPosition: null,
        epPos: null,
        eval: null,
        opening: null
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

    state.eval = null
    state.id = Date.now();
    state.opening = null
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

function isEqualBoards(firstBoard, secBoard){
    for(let i=0; 8>i; i++){
        for(let j=0; 8>j; j++){
            if(firstBoard[i][j] !== secBoard[i][j]){
                return false
            }
        }
    }
    return true
}

function isPracticing(){
    return (game.moveStack.length - 1) > game.statePosition &&
        game.moveStack[game.statePosition + 1].lmrate === 'perfect' && isTraining
}

function initClock(){
    clearInterval(intervalID)
    const inp = prompt("Please enter timers config: ")
    const conf = inp.split("-");
    if(isNaN(conf[0]) || isNaN(conf[1])) return
    const bt = parseInt(conf[0]) * 60000
    const rt = parseInt(conf[1]) * 1000

    game.white_time = bt
    game.black_time = bt
    game.reward_time = rt
}

function pauseClock(){
    clearInterval(intervalID)
}

function startClock(){
    clearInterval(intervalID)
    if(game.white_time == null || game.black_time == null) initClock()

    intervalID = setInterval(() => {
        if(currentState().curPlayer === "white"){
            if(game.white_time >= 50) game.white_time -= 50
            else game.white_time = 0
        }
        else {
            if(game.black_time >= 50) game.black_time -= 50
            else game.black_time = 0
        }

        refreshTimers()
    }, 50)
}

function incrementTimer(){
    if (currentState().curPlayer === 'white') {
        if(game.white_time != null) game.white_time += game.reward_time
    }
    else {
        if(game.black_time != null) game.black_time += game.reward_time
    }
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

function getLastKnownOpening(maxIndex){
    let index = maxIndex
    while(index >= 0){
        if(game.moveStack[index].opening){
            return {
                index: index,
                op: game.moveStack[index].opening
            }
        }
        index--
    }
    return null
}

function fastLoadGame(gameObject, fromStart = false){
    startGame()
    boardFlipped = gameObject.flipped

    pgnMoves(gameObject.moves)

    if(fromStart) goToFirstState()
    refreshUI()
}

function loadGameFromPrompt(){
    const gameStr = prompt("Enter game: ")
    if(!gameStr) return

    try {
        const gameObject = JSON.parse(gameStr)
        fastLoadGame(gameObject, false)
    }
    catch (ex){}
}

function loadGamePromptPGN(){
    const gameStr = prompt("Enter game PGN: ")
    if(!gameStr) return

    try {
        loadPGN(gameStr, false)
    }
    catch (ex){}
}

function loadBoard(){
    const boardStr = prompt("Enter Board: ")
    if(!boardStr) return
    const curPlayer = confirm("White?") ? 'white' : 'black'
    const board = JSON.parse(boardStr)

    try {
        boardFlipped = false
        initState(board, curPlayer)
        refreshUI()
    }
    catch (ex){}
}

function loadGame(filename, startFlag = true){
    readTextFile("games/" + filename, (gameStr) => {
        const gameObject = JSON.parse(gameStr)
        boardFlipped = gameObject.boardFlipped
        game = gameObject
        if(startFlag) goToFirstState()
        refreshUI()
    })
}

function saveGame(){}

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
        const openings = document.getElementById("myopenings")
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

function exportGame(){
    disableFilenameListeners()
    const filenameInp = document.getElementById("filename")
    const moves = []

    for(let i=1; game.moveStack.length > i; i++){
        const move = game.moveStack[i]
        let pgn = move.pgn
        if(move.lmrate === 'blunder') pgn += "?"
        else if(move.lmrate === 'perfect') pgn += "!"
        moves.push(pgn)
    }

    let gameOut = {
        title: filenameInp.value,
        flipped: boardFlipped,
        moves: moves
    }

    window.prompt("Game", JSON.stringify(gameOut));

    setTimeout(() => {
        enableFilenameListeners()
    }, 250)
}

function getCurrentStatePGNLog(statePosition, forceExt = false){
    let pgnLog = ""
    for(let i=1; statePosition >= i; i++){
        const move = game.moveStack[i]
        let pgn = !forceExt ? move.pgn : move.altPgn
        if(move.lmrate === 'blunder') pgn += "?"
        else if(move.lmrate === 'perfect') pgn += "!"

        if(i !== 1) pgnLog += " "
        if(( (i-1) % 2) === 0){
            const num = Math.floor((i / 2) + 1)
            pgnLog += (num + ". ")
        }
        pgnLog += pgn
    }

    return pgnLog
}

function getCurrentStateEnginePositionLog(statePosition){
    let engineLog = ""
    for(let i=1; statePosition >= i; i++){
        const move = game.moveStack[i]
        const spStr = getPGNPosition(move.startPosition)
        const epStr = getPGNPosition(move.endPosition)
        if(engineLog.length !== 0) engineLog += " "
        engineLog += (spStr + epStr)
    }

    return engineLog
}

function getPartUciMoves(startIndex, endIndex){
    const fullUci = getCurrentStateEnginePositionLog(endIndex)
    const pieces = fullUci.split(" ")
    const out = []
    for(let i=startIndex; pieces.length>i; i++){
        out.push(pieces[i])
    }
    return out
}
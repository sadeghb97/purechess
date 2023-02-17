let curHeldPiece;
let curHeldPieceStartingPosition;
let boardFlipped;
let readOnly = false
let isTraining = false
const USE_ENGINE = true
let isLoading = false

function resetBoard() {
    boardFlipped = false
    initState()
    refreshUI()

    const gameTitleEl = document.getElementById("game_title")
    gameTitleEl.style.display = "none"
}

function stateMovePiece(nextState, startingPosition, endingPosition, turnFinishing = true){
    const attackerPiece = nextState.board[startingPosition[0]][startingPosition[1]];

    if (attackerPiece !== '.') {
        const isBlackTurn = attackerPiece === attackerPiece.toUpperCase() && nextState.curPlayer === 'black'
        const isWhiteTurn = attackerPiece === attackerPiece.toLowerCase() && nextState.curPlayer === 'white'

        if (isBlackTurn || isWhiteTurn) {
            if(attackerPiece.toLowerCase() === 'k' || attackerPiece.toLowerCase() === 'r'){
                if(isWhiteTurn){
                    if(attackerPiece.toLowerCase() === 'k'){
                        nextState.whiteKinkMoved = true
                    }
                    else if(startingPosition[0] === 7 && startingPosition[1] === 7){
                        nextState.whiteKingSideCastleMoved = true
                    }
                    else if(startingPosition[0] === 7 && startingPosition[1] === 0){
                        nextState.whiteQueenSideCastleMoved = true
                    }
                }
                else {
                    if(attackerPiece.toLowerCase() === 'k'){
                        nextState.blackKinkMoved = true
                    }
                    else if(startingPosition[0] === 0 && startingPosition[1] === 7){
                        nextState.blackKingSideCastleMoved = true
                    }
                    else if(startingPosition[0] === 0 && startingPosition[1] === 0){
                        nextState.blackQueenSideCastleMoved = true
                    }
                }
            }

            nextState.enPos = null
            if(attackerPiece.toLowerCase() === 'p'){
                if(Math.abs(endingPosition[0] - startingPosition[0]) === 2){
                    if(attackerPiece === 'p') nextState.enPos = [endingPosition[0] + 1, endingPosition[1]]
                    else nextState.enPos = [endingPosition[0] - 1, endingPosition[1]]
                }
            }

            const isCapture = nextState.board[endingPosition[0]][endingPosition[1]] !== '.';
            nextState.board[startingPosition[0]][startingPosition[1]] = '.';
            nextState.board[endingPosition[0]][endingPosition[1]] = attackerPiece;

            if(attackerPiece.toLowerCase() === 'p' && (endingPosition[0] === 7 || endingPosition[0] === 0)){
                if(attackerPiece === 'p') nextState.board[endingPosition[0]][endingPosition[1]] = 'q'
                else nextState.board[endingPosition[0]][endingPosition[1]] = 'Q'
            }
            stateStartAndEndPosition(nextState, startingPosition, endingPosition)

            if(turnFinishing){
                nextState.pgn = getPGNString(currentState(), attackerPiece,
                    startingPosition, endingPosition, isCapture)
                nextState.altPgn = getPGNString(currentState(), attackerPiece,
                    startingPosition, endingPosition, isCapture, "normal", true)
                finishTurn(nextState)
            }
        }
    }

    return nextState
}

function movePiece(startingPosition, endingPosition, fullTurn = true) {
    const nextState = getCurrentStateClone()
    const piece = nextState.board[startingPosition[0]][startingPosition[1]]
    let isOk = true

    if(piece.toLowerCase() === 'k'){
        const val = validateKingMovement(
            nextState,
            piece.toLowerCase() === piece ? 'white' : 'black',
            startingPosition, endingPosition)

        if(!val) isOk = false
    }
    else if(piece.toLowerCase() === 'p'){
        const val = validatePawnMovement(
            nextState,
            piece.toLowerCase() === piece ? 'white' : 'black',
            startingPosition, endingPosition)
        if(!val) isOk = false
    }
    if(isOk) return stateMovePiece(nextState, startingPosition, endingPosition, fullTurn)
}

function finishTurn(nextState){
    if(!checkKingsSafety(nextState)) return
    toggleTurn(nextState)
    pushState(nextState)
    incrementTimer()
    refreshUI()
}

function getPieceValue(piece){
    if(piece.toLowerCase() === 'p') return 1
    if(piece.toLowerCase() === 'r') return 5
    if(piece.toLowerCase() === 'n') return 3
    if(piece.toLowerCase() === 'b') return 3
    if(piece.toLowerCase() === 'q') return 9
    return 0
}

function loadFirstState(){
    goToFirstState()
    refreshUI()
}

function undo(){
    prevState()
    refreshUI()
}

function redo(){
    if(isPracticing()){
        setPieceHoldEvents()
        return
    }

    nextState()
    refreshUI()
}

function doBestMove(){
    if(currentState().eval !== null && currentState().eval.bm_from !== null){
        const sp = getPositionArray(currentState().eval.bm_from)
        const ep = getPositionArray(currentState().eval.bm_target)
        movePiece(sp, ep);
    }
}

function castling(state, isKingSide){
    let cloneState = JSON.parse(JSON.stringify(state))
    cloneState.lmrate = "normal"
    const pieceColor = cloneState.curPlayer
    let sp = null
    let ep = null

    if(pieceColor === 'white'){
        if(isKingSide){
            sp = [7, 4]
            ep = [7, 6]
            cloneState = stateMovePiece(cloneState, [7, 4], [7, 6], false)
            cloneState = stateMovePiece(cloneState, [7, 7], [7, 5], false)
        }
        else if(!isKingSide){
            sp = [7, 4]
            ep = [7, 2]
            cloneState = stateMovePiece(cloneState, [7, 4], [7, 2], false)
            cloneState = stateMovePiece(cloneState, [7, 0], [7, 3], false)
        }
    }
    else {
        if(isKingSide){
            sp = [0, 4]
            ep = [0, 6]
            cloneState = stateMovePiece(cloneState, [0, 4], [0, 6], false)
            cloneState = stateMovePiece(cloneState, [0, 7], [0, 5], false)
        }
        else if(!isKingSide){
            sp = [0, 4]
            ep = [0, 2]
            cloneState = stateMovePiece(cloneState, [0, 4], [0, 2], false)
            cloneState = stateMovePiece(cloneState, [0, 0], [0, 3], false)
        }
    }

    stateStartAndEndPosition(cloneState, sp, ep)

    if(isKingSide){
        cloneState.pgn = "o-o"
        cloneState.altPgn = "O-O"
    }
    else{
        cloneState.pgn = "o-o-o"
        cloneState.altPgn = "O-O-O"
    }
    finishTurn(cloneState)
}

function enPassant(startingPosition){
    const cloneState = getCurrentStateClone()
    const attackerPiece = cloneState.board[startingPosition[0]][startingPosition[1]];

    cloneState.board[startingPosition[0]][startingPosition[1]] = '.';
    cloneState.board[cloneState.enPos[0]][cloneState.enPos[1]] = attackerPiece;
    if(cloneState.curPlayer === 'white'){
        cloneState.board[cloneState.enPos[0] + 1][cloneState.enPos[1]] = '.'
    }
    else {
        cloneState.board[cloneState.enPos[0] - 1][cloneState.enPos[1]] = '.'
    }
    stateStartAndEndPosition(cloneState, startingPosition, cloneState.enPos)
    cloneState.pgn = getPGNString(currentState(), '',
        startingPosition, cloneState.enPos, true)
    cloneState.altPgn = getPGNString(currentState(), '',
        startingPosition, cloneState.enPos, true, "normal", true)

    cloneState.enPos = null
    finishTurn(cloneState)
}
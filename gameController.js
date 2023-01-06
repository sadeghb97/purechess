let curHeldPiece;
let curHeldPieceStartingPosition;
let boardFlipped;
let readOnly = false

function startGame() {
    boardFlipped = false
    initState()
    refreshUI()
}

function studyGame(filename){
    loadGame(filename, true)
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

            nextState.board[startingPosition[0]][startingPosition[1]] = '.';
            nextState.board[endingPosition[0]][endingPosition[1]] = attackerPiece;

            if(attackerPiece.toLowerCase() === 'p' && (endingPosition[0] === 7 || endingPosition[0] === 0)){
                if(attackerPiece === 'p') nextState.board[endingPosition[0]][endingPosition[1]] = 'q'
                else nextState.board[endingPosition[0]][endingPosition[1]] = 'Q'
            }

            stateStartAndEndPosition(nextState, startingPosition, endingPosition)
            if(turnFinishing) finishTurn(nextState)
        }
    }

    return nextState
}

function movePiece(startingPosition, endingPosition, fullTurn = true) {
    const nextState = getCurrentStateClone()
    return stateMovePiece(nextState, startingPosition, endingPosition, fullTurn)
}

function finishTurn(nextState){
    if(!checkKingsSafety(nextState)) return
    toggleTurn(nextState)
    pushState(nextState)
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

function resetBoard(){
    startGame()
}

function undo(){
    prevState()
    refreshUI()
}

function redo(){
    nextState()
    refreshUI()
}

function castling(pieceColor, isKingSide){
    let cloneState = null
    let sp = null
    let ep = null

    if(pieceColor === 'white'){
        if(isKingSide){
            sp = [7, 4]
            ep = [7, 7]
            cloneState = movePiece([7, 4], [7, 6], false)
            cloneState = stateMovePiece(cloneState, [7, 7], [7, 5], false)
        }
        else if(!isKingSide){
            sp = [7, 4]
            ep = [7, 0]
            cloneState = movePiece([7, 4], [7, 2], false)
            cloneState = stateMovePiece(cloneState, [7, 0], [7, 3], false)
        }
    }
    else {
        if(isKingSide){
            sp = [0, 4]
            ep = [0, 7]
            cloneState = movePiece([0, 4], [0, 6], false)
            cloneState = stateMovePiece(cloneState, [0, 7], [0, 5], false)
        }
        else if(!isKingSide){
            sp = [0, 4]
            ep = [0, 0]
            cloneState = movePiece([0, 4], [0, 2], false)
            cloneState = stateMovePiece(cloneState, [0, 0], [0, 3], false)
        }
    }

    stateStartAndEndPosition(cloneState, sp, ep)
    finishTurn(cloneState)
}

function enPassant(startingPosition){
    const cloneState = getCurrentStateClone()
    const attackerPiece = cloneState.board[startingPosition[0]][startingPosition[1]];

    cloneState.enPos = null
    cloneState.board[startingPosition[0]][startingPosition[1]] = '.';
    cloneState.board[currentState().enPos[0]][currentState().enPos[1]] = attackerPiece;
    if(currentState().curPlayer === 'white'){
        cloneState.board[currentState().enPos[0] + 1][currentState().enPos[1]] = '.'
    }
    else {
        cloneState.board[currentState().enPos[0] - 1][currentState().enPos[1]] = '.'
    }

    stateStartAndEndPosition(cloneState, startingPosition, currentState().enPos)
    finishTurn(cloneState)
}
let curHeldPiece;
let curHeldPieceStartingPosition;
let boardFlipped;

function startGame() {
    boardFlipped = false
    initState()
    refreshUI()
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

            nextState.board[startingPosition[0]][startingPosition[1]] = '.';
            nextState.board[endingPosition[0]][endingPosition[1]] = attackerPiece;

            nextState.whiteKingSideCastleMoved = false
            nextState.whiteQueenSideCastleMoved = false
            nextState.whiteKinkMoved = false
            nextState.blackKingSideCastleMoved = false
            nextState.blackQueenSideCastleMoved = false
            nextState.blackKinkMoved = false

            if(turnFinishing) {
                toggleTurn(nextState)
                pushState(nextState)
                refreshUI()
            }
        }
    }

    return nextState
}

function movePiece(startingPosition, endingPosition, fullTurn = true) {
    const nextState = JSON.parse(JSON.stringify(currentState()))
    return stateMovePiece(nextState, startingPosition, endingPosition, fullTurn)
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
    if(pieceColor === 'white'){
        if(isKingSide){
            const nextState = movePiece([7, 4], [7, 6], false)
            stateMovePiece(nextState, [7, 7], [7, 5], true)
        }
        else if(!isKingSide){
            const nextState = movePiece([7, 4], [7, 2], false)
            stateMovePiece(nextState, [7, 0], [7, 3], true)
        }
    }
    else {
        if(isKingSide){
            const nextState = movePiece([0, 4], [0, 6], false)
            stateMovePiece(nextState, [0, 7], [0, 5], true)
        }
        else if(!isKingSide){
            const nextState = movePiece([0, 4], [0, 2], false)
            stateMovePiece(nextState, [0, 0], [0, 3], true)
        }
    }
}

function validateMovement(startingPosition, endingPosition) {
    const boardPiece = currentState().board[startingPosition[0]][startingPosition[1]];
    
    switch (boardPiece) {
        case 'r':
        case 'R': return validateRookMovement(startingPosition, endingPosition);
        case 'n':
        case 'N': return validateKnightMovement(startingPosition, endingPosition);
        case 'b':
        case 'B': return validateBishopMovement(startingPosition, endingPosition);
        case 'q':
        case 'Q': return validateQueenMovement(startingPosition, endingPosition);
        case 'k': return validateKingMovement('white', startingPosition, endingPosition);
        case 'K': return validateKingMovement('black', startingPosition, endingPosition);
        case 'p': return validatePawnMovement('white', startingPosition, endingPosition);
        case 'P': return validatePawnMovement('black', startingPosition, endingPosition);
    }
}

function validateBishopMovement(startingPosition, endingPosition) {
    if (endingPosition[0] - endingPosition[1] == startingPosition[0] - startingPosition[1] ||
        endingPosition[0] + endingPosition[1] == startingPosition[0] + startingPosition[1]) {
            if (!validatePathIsBlocked(startingPosition, endingPosition)) {
                return false;
            }
            // validate if move puts own king in check
            return true;
    } else {
        return false;
    }
}

function validateRookMovement(startingPosition, endingPosition) {
    if (endingPosition[0] == startingPosition[0] || endingPosition[1] == startingPosition[1]) {
        if (!validatePathIsBlocked(startingPosition, endingPosition)) {
            return false;
        }
        // validate if move puts own king in check
        return true;
    } else {
        return false;
    }
}

function positionReadyToCastle(x, y){
    if(currentState().board[x][y] !== '.') return false

    for(let i=0; 8>i; i++){
        for(let j=0; 8>j; j++){
            const piece = currentState().board[i][j];
            if(piece === '.') continue;
            if(isFriendlyPieceOnPosition([i, j])) continue;
            if(validateMovement([i, j], [x, y])) return false;
        }
    }

    return true
}

function validateKingMovement(pieceColor, startingPosition, endingPosition) {
    if ([-1, 0, 1].includes(endingPosition[0] - startingPosition[0]) && [-1, 0, 1].includes(endingPosition[1] - startingPosition[1])) {
        if (isFriendlyPieceOnPosition(endingPosition)) {
            return false;
        }
        // validate if move puts own king in check
        // validate castling
        return true;
    } else {
        if(pieceColor === 'white' && currentState().curPlayer === 'white' && !currentState().whiteKinkMoved){
            if(startingPosition[0] === 7 && startingPosition[1] === 4){
                if(endingPosition[0] === 7 && endingPosition[1] === 6 && !currentState().whiteKingSideCastleMoved){
                    if(positionReadyToCastle(7,5) && positionReadyToCastle(7,6)){
                        castling(pieceColor, true)
                    }
                }
                else if(endingPosition[0] === 7 && endingPosition[1] === 2 && !currentState().whiteQueenSideCastleMoved){
                    if(positionReadyToCastle(7,1) && positionReadyToCastle(7,2) && positionReadyToCastle(7,3)) {
                        castling(pieceColor, false)
                    }
                }
            }
        }
        else if(pieceColor === 'black' && currentState().curPlayer === 'black' && !currentState().blackKinkMoved) {
            if(startingPosition[0] === 0 && startingPosition[1] === 4){
                if(endingPosition[0] === 0 && endingPosition[1] === 6 && !currentState().blackKingSideCastleMoved){
                    if(positionReadyToCastle(0,5) && positionReadyToCastle(0,6)) {
                        castling(pieceColor, true)
                    }
                }
                else if(endingPosition[0] === 0 && endingPosition[1] === 2 && !currentState().blackQueenSideCastleMoved){
                    if(positionReadyToCastle(0,1) && positionReadyToCastle(0,2) && positionReadyToCastle(0,3)) {
                        castling(pieceColor, false)
                    }
                }
            }
        }
        return false;
    }
}

function validateQueenMovement(startingPosition, endingPosition) {
    if (endingPosition[0] - endingPosition[1] == startingPosition[0] - startingPosition[1] ||
        endingPosition[0] + endingPosition[1] == startingPosition[0] + startingPosition[1] ||
        endingPosition[0] == startingPosition[0] || endingPosition[1] == startingPosition[1]) {
            if (!validatePathIsBlocked(startingPosition, endingPosition)) {
                return false;
            }
            // validate if move puts own king in check
            return true;
    } else {

        return false;
    }
}

function validatePawnMovement(pawnColor, startingPosition, endingPosition) {
    const direction = pawnColor == 'black' ? 1 : -1;

    let isCapture = false;

    if (endingPosition[0] == startingPosition[0] + direction &&
        [startingPosition[1] - 1, startingPosition[1] + 1].includes(endingPosition[1])) {
            // validate if is en passant
            if (isEnemyPieceOnPosition(endingPosition)) {
                isCapture = true;
            }
        }

    // validate if is promotion
    let isFirstMove = (pawnColor === 'white' && startingPosition[0] === 6)
        || (pawnColor === 'black' && startingPosition[0] === 1)

    if (((endingPosition[0] == startingPosition[0] + direction || (endingPosition[0] == startingPosition[0] + direction * 2 && isFirstMove)) &&
         endingPosition[1] == startingPosition[1]) || isCapture) {
            if (isFriendlyPieceOnPosition(endingPosition)) {
                return false;
            } else if (!isCapture && isEnemyPieceOnPosition(endingPosition)) {
                return false;
            }

            // validate if move puts own king in check
            return true;
    } else {
        return false;
    }
}

function validateKnightMovement(startingPosition, endingPosition) {
    if (([-2, 2].includes(endingPosition[0] - startingPosition[0]) && [-1, 1].includes(endingPosition[1] - startingPosition[1])) || 
        ([-2, 2].includes(endingPosition[1] - startingPosition[1]) && [-1, 1].includes(endingPosition[0] - startingPosition[0]))) {
            if (isFriendlyPieceOnPosition(endingPosition)) {
                return false;
            }
            // validate if move puts own king in check
            return true;
    } else {
        return false;
    }
}

function validatePathIsBlocked(startingPosition, endingPosition) {
    const xDifference = endingPosition[0] - startingPosition[0]
    const yDifference = endingPosition[1] - startingPosition[1]

    let xDirection = 0;
    let yDirection = 0;

    if (xDifference < 0) {
        xDirection = -1;
    } else if (xDifference > 0) {
        xDirection = 1;
    }

    if (yDifference < 0) {
        yDirection = -1;
    } else if (yDifference > 0) {
        yDirection = 1;
    }

    let squareX = startingPosition[0] + xDirection;
    let squareY = startingPosition[1] + yDirection;

    while (squareX != endingPosition[0] || squareY != endingPosition[1]) {
        const isSquareOccupied = currentState().board[squareX][squareY] !== '.'

        if (isSquareOccupied) {
            return false;
        }

        squareX += xDirection;
        squareY += yDirection;
    }
    
    if (isFriendlyPieceOnPosition(endingPosition)) {
        return false;
    } else {
        // enemy piece has been captured
    }

    return true;
}

function isFriendlyPieceOnPosition(endingPosition) {
    const destinationPiece = currentState().board[endingPosition[0]][endingPosition[1]]

    if (destinationPiece !== '.') {
        return destinationPiece === destinationPiece.toUpperCase() && currentState().curPlayer === 'black' ||
            destinationPiece === destinationPiece.toLowerCase() && currentState().curPlayer === 'white';
    } else {
        return false;
    }
}

function isEnemyPieceOnPosition(endingPosition) {
    const destinationPiece = currentState().board[endingPosition[0]][endingPosition[1]]

    if (destinationPiece !== '.') {
        return destinationPiece === destinationPiece.toUpperCase() && currentState().curPlayer === 'white' ||
            destinationPiece === destinationPiece.toLowerCase() && currentState().curPlayer === 'black';
    } else {
        return false;
    }
}

startGame();
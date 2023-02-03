function getKingsPos(state){
    let whiteKingPos = null
    let blackKingPos = null

    for(let i=0; 8>i; i++){
        for(let j=0; 8>j; j++){
            const piece = state.board[i][j]
            if(piece === 'k') whiteKingPos = [i, j]
            else if(piece === 'K') blackKingPos = [i, j]
        }
    }

    return {
        'white': whiteKingPos,
        'black': blackKingPos
    }
}

function checkKingsSafety(state){
    const cloneState = JSON.parse(JSON.stringify(state))
    cloneState.prevent_castling = true
    cloneState.prevent_en_passant = true
    toggleTurn(cloneState)
    const kingsPos = getKingsPos(cloneState)

    return checkKingSafety(cloneState, kingsPos.white) &&
        checkKingSafety(cloneState, kingsPos.black)
}

function checkKingSafety(state, kingPos){
    for(let i=0; 8>i; i++){
        const kingPiece = state.board[kingPos[0]][kingPos[1]]
        const kingColor = kingPiece === 'k' ? 'white' : 'black'

        for(let j=0; 8>j; j++){
            const attackerPiece = state.board[i][j]
            if(attackerPiece === '.') continue

            const attackerPieceColor = attackerPiece === attackerPiece.toLowerCase() ? 'white' : 'black'
            if(kingColor === attackerPieceColor) continue

            if(validateMovement(state, [i, j], kingPos)){
                return false
            }
        }
    }

    return true
}

function validateMovement(state, startingPosition, endingPosition) {
    const boardPiece = state.board[startingPosition[0]][startingPosition[1]];
    switch (boardPiece) {
        case 'r':
        case 'R': return validateRookMovement(state, startingPosition, endingPosition);
        case 'n':
        case 'N': return validateKnightMovement(state, startingPosition, endingPosition);
        case 'b':
        case 'B': return validateBishopMovement(state, startingPosition, endingPosition);
        case 'q':
        case 'Q': return validateQueenMovement(state, startingPosition, endingPosition);
        case 'k': return validateKingMovement(state, 'white', startingPosition, endingPosition);
        case 'K': return validateKingMovement(state, 'black', startingPosition, endingPosition);
        case 'p': return validatePawnMovement(state, 'white', startingPosition, endingPosition);
        case 'P': return validatePawnMovement(state, 'black', startingPosition, endingPosition);
    }
}

function validateBishopMovement(state, startingPosition, endingPosition) {
    if (endingPosition[0] - endingPosition[1] == startingPosition[0] - startingPosition[1] ||
        endingPosition[0] + endingPosition[1] == startingPosition[0] + startingPosition[1]) {
        if (!validatePathIsBlocked(state, startingPosition, endingPosition)) {
            return false;
        }
        // validate if move puts own king in check
        return true;
    } else {
        return false;
    }
}

function validateRookMovement(state, startingPosition, endingPosition) {
    if (endingPosition[0] == startingPosition[0] || endingPosition[1] == startingPosition[1]) {
        if (!validatePathIsBlocked(state, startingPosition, endingPosition)) {
            return false;
        }
        // validate if move puts own king in check
        return true;
    } else {
        return false;
    }
}

function positionReadyToCastle(state, x, y, tp = '.'){
    if(state.board[x][y] !== tp) return false

    for(let i=0; 8>i; i++){
        for(let j=0; 8>j; j++){
            const piece = state.board[i][j];
            if(piece === '.') continue;
            if(isFriendlyPieceOnPosition(state, [i, j])) continue;

            const cloneState = getCurrentStateClone()
            toggleTurn(cloneState)
            if(validateMovement(cloneState, [i, j], [x, y])) return false;
        }
    }

    return true
}

function validateKingMovement(state, pieceColor, startingPosition, endingPosition) {
    const preventCastling = "prevent_castling" in state && state.prevent_castling

    if ([-1, 0, 1].includes(endingPosition[0] - startingPosition[0]) && [-1, 0, 1].includes(endingPosition[1] - startingPosition[1])) {
        if (isFriendlyPieceOnPosition(state, endingPosition)) {
            return false;
        }
        // validate if move puts own king in check
        // validate castling
        return true;
    }
    if(preventCastling) return false

    if(pieceColor === 'white' && state.curPlayer === 'white' && !state.whiteKinkMoved){
        if(startingPosition[0] === 7 && startingPosition[1] === 4){
            if(endingPosition[0] === 7 && endingPosition[1] === 6 && !state.whiteKingSideCastleMoved){
                const rtc = positionReadyToCastle(state, 7,4, 'k') && positionReadyToCastle(state, 7,5) &&
                    positionReadyToCastle(state, 7,6) && positionReadyToCastle(state, 7,7, 'r')

                if(rtc) castling(state, true)
            }
            else if(endingPosition[0] === 7 && endingPosition[1] === 2 && !state.whiteQueenSideCastleMoved){
                const rtc = positionReadyToCastle(state, 7,0, 'r') && positionReadyToCastle(state, 7,1) &&
                    positionReadyToCastle(state, 7,2) && positionReadyToCastle(state, 7,3) &&
                    positionReadyToCastle(state, 7,4, 'k')

                if(rtc) castling(state, false)
            }
        }
    }
    else if(pieceColor === 'black' && state.curPlayer === 'black' && !state.blackKinkMoved) {
        if(startingPosition[0] === 0 && startingPosition[1] === 4){
            if(endingPosition[0] === 0 && endingPosition[1] === 6 && !state.blackKingSideCastleMoved){
                const rtc = positionReadyToCastle(state, 0,4, 'K') && positionReadyToCastle(state, 0,5) &&
                    positionReadyToCastle(state, 0,6) && positionReadyToCastle(state, 0,7, 'R')

                if(rtc) castling(state, true)
            }
            else if(endingPosition[0] === 0 && endingPosition[1] === 2 && !state.blackQueenSideCastleMoved){
                const rtc = positionReadyToCastle(state, 0,0, 'R') && positionReadyToCastle(state, 0,1) &&
                    positionReadyToCastle(state, 0,2) && positionReadyToCastle(state, 0,3) &&
                    positionReadyToCastle(state, 0,4, 'K')

                if(rtc) castling(state, false)
            }
        }
    }
    return false;
}

function validateQueenMovement(state, startingPosition, endingPosition) {
    if (endingPosition[0] - endingPosition[1] == startingPosition[0] - startingPosition[1] ||
        endingPosition[0] + endingPosition[1] == startingPosition[0] + startingPosition[1] ||
        endingPosition[0] == startingPosition[0] || endingPosition[1] == startingPosition[1]) {
        if (!validatePathIsBlocked(state, startingPosition, endingPosition)) {
            return false;
        }
        // validate if move puts own king in check
        return true;
    } else {

        return false;
    }
}

function validatePawnMovement(state, pawnColor, startingPosition, endingPosition) {
    const preventEnPassant = "prevent_en_passant" in state && state.prevent_en_passant
    const direction = pawnColor === 'black' ? 1 : -1;

    let isCapture = false;

    if (endingPosition[0] == startingPosition[0] + direction &&
        [startingPosition[1] - 1, startingPosition[1] + 1].includes(endingPosition[1])) {
        // validate if is en passant
        if (isEnemyPieceOnPosition(state, endingPosition)) {
            isCapture = true;
        }
    }

    // validate if is promotion
    let isFirstMove = (pawnColor === 'white' && startingPosition[0] === 6)
        || (pawnColor === 'black' && startingPosition[0] === 1)

    if (((endingPosition[0] == startingPosition[0] + direction || (endingPosition[0] == startingPosition[0] + direction * 2 && isFirstMove)) &&
        endingPosition[1] == startingPosition[1]) || isCapture) {
        if (isFriendlyPieceOnPosition(state, endingPosition)) {
            return false;
        } else if (!isCapture && isEnemyPieceOnPosition(state, endingPosition)) {
            return false;
        }
        return true;
    } else {
        if(state.enPos != null && endingPosition[0] === state.enPos[0] && endingPosition[1] === state.enPos[1]){
            if(pawnColor === 'white' && state.curPlayer === 'white'){
                const isEnPassant = Math.abs(endingPosition[1] - startingPosition[1]) === 1 &&
                    startingPosition[0] - endingPosition[0] === 1
                if(!preventEnPassant && isEnPassant) enPassant(startingPosition)
            }
            else if(pawnColor === 'black' && state.curPlayer === 'black') {
                const isEnPassant = Math.abs(endingPosition[1] - startingPosition[1]) === 1 &&
                    endingPosition[0] - startingPosition[0] === 1
                if(!preventEnPassant && isEnPassant) enPassant(startingPosition)
            }
        }
        return false;
    }
}

function validateKnightMovement(state, startingPosition, endingPosition) {
    if (([-2, 2].includes(endingPosition[0] - startingPosition[0]) && [-1, 1].includes(endingPosition[1] - startingPosition[1])) ||
        ([-2, 2].includes(endingPosition[1] - startingPosition[1]) && [-1, 1].includes(endingPosition[0] - startingPosition[0]))) {
        if (isFriendlyPieceOnPosition(state, endingPosition)) {
            return false;
        }
        // validate if move puts own king in check
        return true;
    } else {
        return false;
    }
}

function validatePathIsBlocked(state, startingPosition, endingPosition) {
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
        const isSquareOccupied = state.board[squareX][squareY] !== '.'

        if (isSquareOccupied) {
            return false;
        }

        squareX += xDirection;
        squareY += yDirection;
    }

    if (isFriendlyPieceOnPosition(state, endingPosition)) {
        return false;
    } else {
        // enemy piece has been captured
    }

    return true;
}

function isFriendlyPieceOnPosition(state, endingPosition) {
    const destinationPiece = state.board[endingPosition[0]][endingPosition[1]]

    if (destinationPiece !== '.') {
        return destinationPiece === destinationPiece.toUpperCase() && state.curPlayer === 'black' ||
            destinationPiece === destinationPiece.toLowerCase() && state.curPlayer === 'white';
    } else {
        return false;
    }
}

function isEnemyPieceOnPosition(state, endingPosition) {
    const destinationPiece = state.board[endingPosition[0]][endingPosition[1]]

    if (destinationPiece !== '.') {
        return destinationPiece === destinationPiece.toUpperCase() && state.curPlayer === 'white' ||
            destinationPiece === destinationPiece.toLowerCase() && state.curPlayer === 'black';
    } else {
        return false;
    }
}
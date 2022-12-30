let curHeldPiece;
let curHeldPieceStartingPosition;
let boardFlipped;

function startGame() {
    boardFlipped = false
    initState()
    refreshUI()
}

function refreshUI() {
    let curBoard = JSON.parse(JSON.stringify(currentState().board))

    if(boardFlipped){
        const flippedBoard = []
        for(let i = 0; 8 > i; i++){
            flippedBoard[i] = []
            for(let j = 0; 8>j; j++){
                flippedBoard[i][j] = curBoard[7-i][7-j]
            }
        }
        curBoard = flippedBoard
    }

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            loadPiece(curBoard[i][j], [i + 1, j + 1]);
        }
    }
    setPieceHoldEvents();
}

function loadPiece(piece, position) {
    const squareElement = document.getElementById(`${position[0]}${position[1]}`);
    if (piece == '.') {
        if(squareElement.hasChildNodes())
            squareElement.removeChild(squareElement.children[0])
        return;
    }

    const pieceElement = document.createElement('img');
    pieceElement.classList.add('piece');
    pieceElement.id = piece;
    pieceElement.draggable = false;
    pieceElement.src = getPieceImageSource(piece);

    squareElement.textContent = '';
    squareElement.appendChild(pieceElement);
}

function getPieceImageSource(piece) {
    switch (piece) {
        case 'R': return 'assets/black_rook.png';
        case 'N': return 'assets/black_knight.png';
        case 'B': return 'assets/black_bishop.png';
        case 'Q': return 'assets/black_queen.png';
        case 'K': return 'assets/black_king.png';
        case 'P': return 'assets/black_pawn.png';
        case 'r': return 'assets/white_rook.png';
        case 'n': return 'assets/white_knight.png';
        case 'b': return 'assets/white_bishop.png';
        case 'q': return 'assets/white_queen.png';
        case 'k': return 'assets/white_king.png';
        case 'p': return 'assets/white_pawn.png';
    }
}

function setPieceHoldEvents() {
    let mouseX, mouseY = 0;

    document.addEventListener('mousemove', function(event) {
        mouseX = event.clientX;
        mouseY = event.clientY;
    });

    let pieces = document.getElementsByClassName('piece');
    let movePieceInterval;
    let hasIntervalStarted = false;

    for (const piece of pieces) {
        piece.addEventListener('mousedown', function(event) {
            mouseX = event.clientX;
            mouseY = event.clientY;
        
            if (hasIntervalStarted === false) {
                piece.style.position = 'absolute';

                curHeldPiece = piece;
                const curHeldPieceStringPosition = piece.parentElement.id.split('');

                curHeldPieceStartingPosition = [parseInt(curHeldPieceStringPosition[0]) - 1, parseInt(curHeldPieceStringPosition[1]) - 1];

                movePieceInterval = setInterval(function() {
                    piece.style.top = mouseY - piece.offsetHeight / 2 + window.scrollY + 'px';
                    piece.style.left = mouseX - piece.offsetWidth / 2 + window.scrollX + 'px';
                }, 1);
        
                hasIntervalStarted = true;
            }
        });
    }
        
    document.addEventListener('mouseup', function(event) {
        window.clearInterval(movePieceInterval);

        if (curHeldPiece != null) {
            const boardElement = document.querySelector('.board');

            if ((event.clientX > boardElement.offsetLeft - window.scrollX && event.clientX < boardElement.offsetLeft + boardElement.offsetWidth - window.scrollX) &&
                (event.clientY > boardElement.offsetTop - window.scrollY && event.clientY < boardElement.offsetTop + boardElement.offsetHeight - window.scrollY)) {
                    const mousePositionOnBoardX = event.clientX - boardElement.offsetLeft + window.scrollX;
                    const mousePositionOnBoardY = event.clientY - boardElement.offsetTop + window.scrollY;

                    const boardBorderSize = parseInt(getComputedStyle(document.querySelector('.board'), null)
                                                .getPropertyValue('border-left-width')
                                                .split('px')[0]);

                    const xPosition = Math.floor((mousePositionOnBoardX - boardBorderSize) / document.getElementsByClassName('square')[0].offsetWidth);
                    const yPosition = Math.floor((mousePositionOnBoardY - boardBorderSize) / document.getElementsByClassName('square')[0].offsetHeight);

                    const pieceReleasePosition = [yPosition, xPosition];

                    if (!(pieceReleasePosition[0] == curHeldPieceStartingPosition[0] && pieceReleasePosition[1] == curHeldPieceStartingPosition[1])) {
                        if (validateMovement(curHeldPieceStartingPosition, pieceReleasePosition)) {
                            movePiece(curHeldPieceStartingPosition, pieceReleasePosition);
                        }
                    }
                }

            curHeldPiece.style.position = 'static';
            curHeldPiece = null;
            curHeldPieceStartingPosition = null;
        }
    
        hasIntervalStarted = false;
    });
}

function stateMovePiece(nextState, rawStartingPosition, rawEndingPosition, turnFinishing = true){
    const startingPosition = !boardFlipped ? rawStartingPosition :
        [7 - rawStartingPosition[0], 7 - rawStartingPosition[1]]
    const endingPosition = !boardFlipped ? rawEndingPosition :
        [7 - rawEndingPosition[0], 7 - rawEndingPosition[1]]

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

function movePiece(rawStartingPosition, rawEndingPosition, fullTurn = true) {
    const nextState = JSON.parse(JSON.stringify(currentState()))
    return stateMovePiece(nextState, rawStartingPosition, rawEndingPosition, fullTurn)
}

function toggleTurn(state){
    if (state.curPlayer === 'white') {
        state.curPlayer = 'black';
    } else {
        state.curPlayer = 'white';
    }
}

function resetBoard(){
    startGame()
}

function flipBoard(){
    boardFlipped = !boardFlipped
    refreshUI()
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

function validateKingMovement(pieceColor, startingPosition, endingPosition) {
    if ([-1, 0, 1].includes(endingPosition[0] - startingPosition[0]) && [-1, 0, 1].includes(endingPosition[1] - startingPosition[1])) {
        if (isFriendlyPieceOnEndingPosition(endingPosition)) {
            return false;
        }
        // validate if move puts own king in check
        // validate castling
        return true;
    } else {
        if(pieceColor === 'white' && currentState().curPlayer === 'white' && !currentState().whiteKinkMoved){
            if(startingPosition[0] === 7 && startingPosition[1] === 4){
                if(endingPosition[0] === 7 && endingPosition[1] === 6 && !currentState().whiteKingSideCastleMoved){
                    if(currentState().board[7][5] === '.' && currentState().board[7][6] === '.'){
                        castling(pieceColor, true)
                    }
                }
                else if(endingPosition[0] === 7 && endingPosition[1] === 2 && !currentState().whiteQueenSideCastleMoved){
                    if(currentState().board[7][1] === '.' && currentState().board[7][2] === '.'&& currentState().board[7][3] === '.') {
                        castling(pieceColor, false)
                    }
                }
            }
        }
        else if(pieceColor === 'black' && currentState().curPlayer === 'black' && !currentState().blackKinkMoved) {
            if(startingPosition[0] === 0 && startingPosition[1] === 4){
                if(endingPosition[0] === 0 && endingPosition[1] === 6 && !currentState().blackKingSideCastleMoved){
                    if(currentState().board[0][5] === '.' && currentState().board[0][6] === '.') {
                        castling(pieceColor, true)
                    }
                }
                else if(endingPosition[0] === 0 && endingPosition[1] === 2 && !currentState().blackQueenSideCastleMoved){
                    if(currentState().board[0][1] === '.' && currentState().board[0][2] === '.' && currentState().board[0][3] === '.') {
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
            if (isEnemyPieceOnEndingPosition(endingPosition)) {
                isCapture = true;
            }
        }

    // validate if is promotion
    let isFirstMove = (pawnColor === 'white' && startingPosition[0] === 6)
        || (pawnColor === 'black' && startingPosition[0] === 1)

    if (((endingPosition[0] == startingPosition[0] + direction || (endingPosition[0] == startingPosition[0] + direction * 2 && isFirstMove)) &&
         endingPosition[1] == startingPosition[1]) || isCapture) {
            if (isFriendlyPieceOnEndingPosition(endingPosition)) {
                return false;
            } else if (!isCapture && isEnemyPieceOnEndingPosition(endingPosition)) {
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
            if (isFriendlyPieceOnEndingPosition(endingPosition)) {
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
        const isSquareOccupied = document.getElementById(`${squareX + 1}${squareY + 1}`).children.length > 0;

        if (isSquareOccupied) {
            return false;
        }

        squareX += xDirection;
        squareY += yDirection;
    }
    
    if (isFriendlyPieceOnEndingPosition(endingPosition)) {
        return false;
    } else {
        // enemy piece has been captured
    }

    return true;
}

function isFriendlyPieceOnEndingPosition(endingPosition) {
    const destinationSquare = document.getElementById(`${endingPosition[0] + 1}${endingPosition[1] + 1}`);

    if (destinationSquare.children.length > 0) {
        const destinationPiece = destinationSquare.querySelector('.piece').id;
    
        if (destinationPiece == destinationPiece.toUpperCase() && currentState().curPlayer == 'black' ||
            destinationPiece == destinationPiece.toLowerCase() && currentState().curPlayer == 'white') {
                return true;
        } else {
            return false;
        }        
    } else {
        return false;
    }
}

function isEnemyPieceOnEndingPosition(endingPosition) {
    const destinationSquare = document.getElementById(`${endingPosition[0] + 1}${endingPosition[1] + 1}`);

    if (destinationSquare.children.length > 0) {
        const destinationPiece = destinationSquare.querySelector('.piece').id;
    
        if (destinationPiece == destinationPiece.toUpperCase() && currentState().curPlayer == 'white' ||
            destinationPiece == destinationPiece.toLowerCase() && currentState().curPlayer == 'black') {
                return true;
        } else {
            return false;
        }        
    } else {
        return false;
    }
}

startGame();
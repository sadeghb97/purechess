let curBoard;
let curPlayer;
let boardFlipped = false;

let curHeldPiece;
let curHeldPieceStartingPosition;
let moveStack;

let whiteKingSideCastleMoved = false
let whiteQueenSideCastleMoved = false
let whiteKinkMoved = false

let blackKingSideCastleMoved = false
let blackQueenSideCastleMoved = false
let blackKinkMoved = false

function startGame() {
    const starterPosition = [['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']];

    const starterPlayer = 'white';
    moveStack = {
        count: 0,
        moves: []
    }

    boardFlipped = false;
    let whiteKingSideCastleMoved = false
    let whiteQueenSideCastleMoved = false
    let whiteKinkMoved = false
    let blackKingSideCastleMoved = false
    let blackQueenSideCastleMoved = false
    let blackKinkMoved = false

    loadPosition(starterPosition, starterPlayer);
}

function loadPosition(position, playerToMove) {
    curBoard = position;
    curPlayer = playerToMove;

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            loadPiece(position[i][j], [i + 1, j + 1]);
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
                            movePiece(curHeldPiece, curHeldPieceStartingPosition, pieceReleasePosition);
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

function movePiece(piece, startingPosition, endingPosition, castleFlag = false) {
    const lastMove = {
        piece: null,
        pieceCode: null,
        endPiece: null,
        endPieceCode: null,
        startingPosition: null,
        endingPosition: null
    }

    lastMove.piece = piece;
    lastMove.startingPosition = startingPosition;
    lastMove.endingPosition = endingPosition;

    // move validations to validateMovement()
    const boardPiece = curBoard[startingPosition[0]][startingPosition[1]];
    lastMove.pieceCode = boardPiece;

    if (boardPiece != '.') {
        const isBlackTurn = boardPiece === boardPiece.toUpperCase() && curPlayer == 'black'
        const isWhiteTurn = boardPiece === boardPiece.toLowerCase() && curPlayer == 'white'

        if (isBlackTurn || isWhiteTurn) {
                if(boardPiece.toLowerCase() === 'k' || boardPiece.toLowerCase() === 'r'){
                    if(isWhiteTurn){
                        if(boardPiece.toLowerCase() === 'k'){
                            whiteKinkMoved = true
                        }
                        else if((!boardFlipped && startingPosition[0] === 7 && startingPosition[1] === 7) ||
                            (boardFlipped && startingPosition[0] === 0 && startingPosition[1] === 0)){
                            whiteKingSideCastleMoved = true
                        }
                        else if((!boardFlipped && startingPosition[0] === 7 && startingPosition[1] === 0) ||
                            (boardFlipped && startingPosition[0] === 0 && startingPosition[1] === 7)){
                            whiteQueenSideCastleMoved = true
                        }
                    }
                    else {
                        if(boardPiece.toLowerCase() === 'k'){
                            blackKinkMoved = true
                        }
                        else if((!boardFlipped && startingPosition[0] === 0 && startingPosition[1] === 7) ||
                            (boardFlipped && startingPosition[0] === 7 && startingPosition[1] === 0)){
                            blackKingSideCastleMoved = true
                        }
                        else if((!boardFlipped && startingPosition[0] === 0 && startingPosition[1] === 0) ||
                            (boardFlipped && startingPosition[0] === 7 && startingPosition[1] === 7)){
                            blackQueenSideCastleMoved = true
                        }
                    }
                }

                curBoard[startingPosition[0]][startingPosition[1]] = '.';
                lastMove.endPieceCode = curBoard[endingPosition[0]][endingPosition[1]];
                curBoard[endingPosition[0]][endingPosition[1]] = boardPiece;

                const destinationSquare = document.getElementById(`${endingPosition[0] + 1}${endingPosition[1] + 1}`);
                lastMove.endPiece = destinationSquare.children[0];
                destinationSquare.textContent = '';
                destinationSquare.appendChild(piece);

                lastMove.whiteKingSideCastleMoved = false
                lastMove.whiteQueenSideCastleMoved = false
                lastMove.whiteKinkMoved = false
                lastMove.blackKingSideCastleMoved = false
                lastMove.blackQueenSideCastleMoved = false
                lastMove.blackKinkMoved = false

                // check if is check/checkmate
                lastMove.castling = castleFlag
                toggleTurn()
        }
    }

    moveStack.moves[moveStack.count] = lastMove;
    moveStack.count++;
}

function toggleTurn(){
    if (curPlayer == 'white') {
        curPlayer = 'black';
    } else {
        curPlayer = 'white';
    }
}

function undo(){
    if(moveStack.count <= 0) return;

    moveStack.count--;
    const lastMove = moveStack.moves[moveStack.count]

    if(lastMove.piece != null){
        curBoard[lastMove.startingPosition[0]][lastMove.startingPosition[1]] = lastMove.pieceCode;
        curBoard[lastMove.endingPosition[0]][lastMove.endingPosition[1]] = lastMove.endPieceCode;

        const startSquare = document.getElementById(
            `${lastMove.startingPosition[0] + 1}${lastMove.startingPosition[1] + 1}`);
        startSquare.textContent = '';
        startSquare.appendChild(lastMove.piece);

        const endSquare = document.getElementById(
            `${lastMove.endingPosition[0] + 1}${lastMove.endingPosition[1] + 1}`);
        endSquare.textContent = '';

        if(lastMove.endPiece != null) {
            endSquare.appendChild(lastMove.endPiece);
        }

        whiteKingSideCastleMoved = lastMove.whiteKingSideCastleMoved
        whiteQueenSideCastleMoved = lastMove.whiteQueenSideCastleMoved
        whiteKinkMoved = lastMove.whiteKinkMoved
        blackKingSideCastleMoved = lastMove.blackKingSideCastleMoved
        blackQueenSideCastleMoved = lastMove.blackQueenSideCastleMoved
        blackKinkMoved = lastMove.blackKinkMoved
    }

    if(lastMove.castling) undo()
    else toggleTurn();
}

function resetBoard(){
    startGame()
}

function flipBoard(){
    const mirrorArray = [[], [], [], [], [], [], [], []]
    for(let i = 0; 8 > i; i++){
        for(let j = 0; 8>j; j++){
            mirrorArray[i][j] = curBoard[7-i][7-j]
        }
    }

    boardFlipped = !boardFlipped
    loadPosition(mirrorArray, curPlayer)

    const mirrorMoves = JSON.parse(JSON.stringify(moveStack.moves))
    for(let i = 0; mirrorMoves.length > i; i++){
        mirrorMoves[i].startingPosition = [
            7 - mirrorMoves[i].startingPosition[0], 7 - mirrorMoves[i].startingPosition[1]]
        mirrorMoves[i].endingPosition = [
            7 - mirrorMoves[i].endingPosition[0], 7 - mirrorMoves[i].endingPosition[1]]
    }
    for(let i = 0; mirrorMoves.length > i; i++){
        moveStack.moves[i].startingPosition = mirrorMoves[i].startingPosition
        moveStack.moves[i].endingPosition = mirrorMoves[i].endingPosition
    }
}

function castling(pieceColor, isKingSide){
    if(pieceColor === 'white'){
        if(isKingSide && !boardFlipped){
            const kingSquare = document.getElementById(`${7 + 1}${4 + 1}`).children[0];
            const rookSquare = document.getElementById(`${7 + 1}${7 + 1}`).children[0];
            movePiece(kingSquare, [7, 4], [7, 6])
            toggleTurn()
            movePiece(rookSquare, [7, 7], [7, 5], true)
        }
        else if(isKingSide && boardFlipped){
            const kingSquare = document.getElementById(`${0 + 1}${3 + 1}`).children[0];
            const rookSquare = document.getElementById(`${0 + 1}${0 + 1}`).children[0];
            movePiece(kingSquare, [0, 3], [0, 1])
            toggleTurn()
            movePiece(rookSquare, [0, 0], [0, 2], true)
        }
        else if(!isKingSide && !boardFlipped){
            const kingSquare = document.getElementById(`${7 + 1}${4 + 1}`).children[0];
            const rookSquare = document.getElementById(`${7 + 1}${0 + 1}`).children[0];
            movePiece(kingSquare, [7, 4], [7, 2])
            toggleTurn()
            movePiece(rookSquare, [7, 0], [7, 3], true)
        }
        else {
            const kingSquare = document.getElementById(`${0 + 1}${3 + 1}`).children[0];
            const rookSquare = document.getElementById(`${0 + 1}${7 + 1}`).children[0];
            movePiece(kingSquare, [0, 3], [0, 5])
            toggleTurn()
            movePiece(rookSquare, [0, 7], [0, 4], true)
        }
    }
    else {
        if(isKingSide && !boardFlipped){
            const kingSquare = document.getElementById(`${0 + 1}${4 + 1}`).children[0];
            const rookSquare = document.getElementById(`${0 + 1}${7 + 1}`).children[0];
            movePiece(kingSquare, [0, 4], [0, 6])
            toggleTurn()
            movePiece(rookSquare, [0, 7], [0, 5], true)
        }
        else if(isKingSide && boardFlipped){
            const kingSquare = document.getElementById(`${7 + 1}${3 + 1}`).children[0];
            const rookSquare = document.getElementById(`${7 + 1}${0 + 1}`).children[0];
            movePiece(kingSquare, [7, 3], [7, 1])
            toggleTurn()
            movePiece(rookSquare, [7, 0], [7, 2], true)
        }
        else if(!isKingSide && !boardFlipped){
            const kingSquare = document.getElementById(`${0 + 1}${4 + 1}`).children[0];
            const rookSquare = document.getElementById(`${0 + 1}${0 + 1}`).children[0];
            movePiece(kingSquare, [0, 4], [0, 2])
            toggleTurn()
            movePiece(rookSquare, [0, 0], [0, 3], true)
        }
        else {
            const kingSquare = document.getElementById(`${7 + 1}${3 + 1}`).children[0];
            const rookSquare = document.getElementById(`${7 + 1}${7 + 1}`).children[0];
            movePiece(kingSquare, [7, 3], [7, 5])
            toggleTurn()
            movePiece(rookSquare, [7, 7], [7, 4], true)
        }
    }
}

function validateMovement(startingPosition, endingPosition) {
    const boardPiece = curBoard[startingPosition[0]][startingPosition[1]];
    
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
        if(pieceColor === 'white' && curPlayer === 'white' && !whiteKinkMoved){
            if(!boardFlipped && startingPosition[0] === 7 && startingPosition[1] === 4){
                if(endingPosition[0] === 7 && endingPosition[1] === 6 && !whiteKingSideCastleMoved){
                    if(curBoard[7][5] === '.' && curBoard[7][6] === '.'){
                        castling(pieceColor, true)
                    }
                }
                else if(endingPosition[0] === 7 && endingPosition[1] === 2 && !whiteQueenSideCastleMoved){
                    if(curBoard[7][1] === '.' && curBoard[7][2] === '.'&& curBoard[7][3] === '.') {
                        castling(pieceColor, false)
                    }
                }
            }
            else if(boardFlipped && startingPosition[0] === 0 && startingPosition[1] === 3){
                if(endingPosition[0] === 0 && endingPosition[1] === 1 && !whiteKingSideCastleMoved){
                    if(curBoard[0][1] === '.' && curBoard[0][2] === '.') {
                        castling(pieceColor, true)
                    }
                }
                else if(endingPosition[0] === 0 && endingPosition[1] === 5 && !whiteQueenSideCastleMoved){
                    if(curBoard[0][4] === '.' && curBoard[0][5] === '.' && curBoard[0][6] === '.') {
                        castling(pieceColor, false)
                    }
                }
            }
        }
        else if(pieceColor === 'black' && curPlayer === 'black' && !blackKinkMoved) {
            if(!boardFlipped && startingPosition[0] === 0 && startingPosition[1] === 4){
                if(endingPosition[0] === 0 && endingPosition[1] === 6 && !blackKingSideCastleMoved){
                    if(curBoard[0][5] === '.' && curBoard[0][6] === '.') {
                        castling(pieceColor, true)
                    }
                }
                else if(endingPosition[0] === 0 && endingPosition[1] === 2 && !blackQueenSideCastleMoved){
                    if(curBoard[0][1] === '.' && curBoard[0][2] === '.' && curBoard[0][3] === '.') {
                        castling(pieceColor, false)
                    }
                }
            }
            else if(boardFlipped && startingPosition[0] === 7 && startingPosition[1] === 3){
                if(endingPosition[0] === 7 && endingPosition[1] === 1 && !blackKingSideCastleMoved){
                    if(curBoard[7][1] === '.' && curBoard[7][2] === '.') {
                        castling(pieceColor, true)
                    }
                }
                else if(endingPosition[0] === 7 && endingPosition[1] === 5 && !blackQueenSideCastleMoved){
                    if(curBoard[7][4] === '.' && curBoard[7][5] === '.' && curBoard[7][6] === '.') {
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
    const direction = (pawnColor == 'black' && !boardFlipped) || (pawnColor == 'white' && boardFlipped) ? 1 : -1;

    let isCapture = false;

    if (endingPosition[0] == startingPosition[0] + direction &&
        [startingPosition[1] - 1, startingPosition[1] + 1].includes(endingPosition[1])) {
            // validate if is en passant
            if (isEnemyPieceOnEndingPosition(endingPosition)) {
                isCapture = true;
            }
        }

    // validate if is promotion
    let isFirstMove = (!boardFlipped && pawnColor == 'white' && startingPosition[0] == 6)
        || (boardFlipped && pawnColor == 'white' && startingPosition[0] == 1)
        || (!boardFlipped && pawnColor == 'black' && startingPosition[0] == 1)
        || (boardFlipped && pawnColor == 'black' && startingPosition[0] == 6)

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
    
        if (destinationPiece == destinationPiece.toUpperCase() && curPlayer == 'black' ||
            destinationPiece == destinationPiece.toLowerCase() && curPlayer == 'white') {
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
    
        if (destinationPiece == destinationPiece.toUpperCase() && curPlayer == 'white' ||
            destinationPiece == destinationPiece.toLowerCase() && curPlayer == 'black') {
                return true;
        } else {
            return false;
        }        
    } else {
        return false;
    }
}

startGame();
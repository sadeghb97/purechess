function flipBoard(){
    boardFlipped = !boardFlipped
    refreshUI()
}

function refreshUI() {
    let curBoard = JSON.parse(JSON.stringify(currentState().board))
    let blackValue = 0
    let whiteValue = 0

    curBoard.forEach((row) => {
        row.forEach((p) => {
            if(p === p.toLowerCase()){
                whiteValue += getPieceValue(p)
            }
            else {
                blackValue += getPieceValue(p)
            }
        })
    })
    const whiteName = "white_name" in game ? game.white_name : "White"
    const blackName = "black_name" in game ? game.black_name : "Black"
    const whiteStatus = whiteValue - blackValue
    const blackStatus = blackValue - whiteValue
    const blackAvatar = "assets/black_avatar.png"
    const whiteAvatar = "assets/white_avatar.png"

    const topAvatar = !boardFlipped ? blackAvatar : whiteAvatar
    const bottomAvatar = !boardFlipped ? whiteAvatar : blackAvatar
    const topUsername = !boardFlipped ? blackName : whiteName
    const bottomUsername = !boardFlipped ? whiteName : blackName
    let topStatus = !boardFlipped ? blackStatus : whiteStatus
    let bottomStatus = !boardFlipped ? whiteStatus : blackStatus
    topStatus = topStatus > 0 ? "+" + topStatus : topStatus
    bottomStatus = bottomStatus > 0 ? "+" + bottomStatus : bottomStatus

    const topAvatarEl = document.getElementById("top_avatar")
    const bottomAvatarEl = document.getElementById("bottom_avatar")
    const topUsernameEl = document.getElementById("top_username")
    const bottomUsernameEl = document.getElementById("bottom_username")
    const topStatusEl = document.getElementById("top_status")
    const bottomStatusEl = document.getElementById("bottom_status")

    if(topAvatarEl != null){
        topAvatarEl.src = topAvatar
        topUsernameEl.innerText = topUsername
        bottomAvatarEl.src = bottomAvatar
        bottomUsernameEl.innerText = bottomUsername

        if(blackStatus !== 0){
            topStatusEl.innerText = topStatus
            bottomStatusEl.innerText = bottomStatus
        }
        else {
            topStatusEl.innerText = ""
            bottomStatusEl.innerText = ""
        }
    }

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

    if(currentState().startPosition != null && currentState().endPosition != null){
        const sp = !boardFlipped ? currentState().startPosition :
            [7 - currentState().startPosition[0], 7 - currentState().startPosition[1]]
        const ep = !boardFlipped ? currentState().endPosition :
            [7 - currentState().endPosition[0], 7 - currentState().endPosition[1]]

        const startSquare = document.getElementById(`${sp[0] + 1}${sp[1] + 1}`);
        const endSquare = document.getElementById(`${ep[0] + 1}${ep[1] + 1}`);

        let lmEffect = "last-move"
        if("lmrate" in currentState()){
            if(currentState().lmrate === "blunder") lmEffect = "blunder"
            else if(currentState().lmrate === "perfect") lmEffect = "perfect"
        }

        startSquare.classList.add(lmEffect);
        endSquare.classList.add(lmEffect);
    }
    if(!readOnly) setPieceHoldEvents();
}

function loadPiece(piece, position) {
    const squareElement = document.getElementById(`${position[0]}${position[1]}`);
    squareElement.classList.remove("last-move");
    squareElement.classList.remove("blunder");
    squareElement.classList.remove("perfect");
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

                const xPosition = Math.floor((mousePositionOnBoardX - boardBorderSize) /
                    document.getElementsByClassName('square')[0].offsetWidth);
                const yPosition = Math.floor((mousePositionOnBoardY - boardBorderSize) /
                    document.getElementsByClassName('square')[0].offsetHeight);

                const pieceReleasePosition = [yPosition, xPosition];

                if (!(pieceReleasePosition[0] === curHeldPieceStartingPosition[0] && pieceReleasePosition[1] === curHeldPieceStartingPosition[1])) {
                    const correctStartPosition = finalPosition(curHeldPieceStartingPosition)
                    const correctEndPosition = finalPosition(pieceReleasePosition)

                    if (validateMovement(correctStartPosition, correctEndPosition)) {
                        movePiece(correctStartPosition, correctEndPosition);
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
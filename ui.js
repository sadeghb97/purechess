function flipBoard(){
    boardFlipped = !boardFlipped
    refreshUI()
}

function refreshUI() {
    const currentStatePosition = game.statePosition
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
    const perfMoveButton = document.getElementById("do_best_move")
    const evalBarEl = document.getElementById("eval_bar")

    if(USE_ENGINE){
        perfMoveButton.style.display = 'inline'
        evalBarEl.style.display = 'inline'
    }
    else{
        perfMoveButton.style.display = 'none'
        evalBarEl.style.display = 'none'
    }

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
    refreshTimers()

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

    const pgnLogEl = document.getElementById("pgnlog")
    const epLogEl = document.getElementById("eplog")
    if(pgnLogEl) pgnLogEl.innerText = getCurrentStatePGNLog(currentStatePosition)
    if(epLogEl) epLogEl.innerText = getCurrentStateEnginePositionLog(currentStatePosition)

    if(!readOnly) setPieceHoldEvents();
    if(USE_ENGINE && !isLoading){
        if(currentState().eval !== null){
            updateBoardWithEngineResults(currentState().id)
        }
        else engineEval(currentState(), currentStatePosition)
    }

    if(!isLoading) {
        if (currentState().opening !== null) {
            updateBoardWithOpeningBrowseResults(currentState().id, currentStatePosition)
        }
        else stateBrowseOpenings(currentState(), currentStatePosition)
    }

    if(!isLoading) {
        if (currentState().history !== null) {
            updateBoardWithHistoryBrowseResults(currentState().id, currentStatePosition)
        }
        else stateBrowseHistory(currentState(), currentStatePosition)
    }
}

function stateBrowseHistory(state, stateIndex){
    const curPgnStr = getCurrentStatePGNLog(stateIndex, true)
    const matchedGames = []

    myCDCGames.forEach((cdGame) => {
        let pgn = cdGame.pgn.replaceAll("+", "")
        if(pgn.startsWith(curPgnStr)) matchedGames.push(cdGame)
    })

    const found = {}
    const foundMovesList = []
    const template = {
        count: 0,
        white: 0,
        black: 0,
        draw: 0
    }

    const det = JSON.parse(JSON.stringify(template))
    const wdet = JSON.parse(JSON.stringify(template))
    const bdet = JSON.parse(JSON.stringify(template))

    matchedGames.forEach((mg) => {
        let pgn = mg.pgn.replaceAll("+", "")
        const cpl = curPgnStr.length
        let rem = pgn.substring(cpl).trim()
        const pieces = rem.split(" ")

        let next = !pieces[0].includes(".") && !pieces[0].includes("-") ? pieces[0] : null
        if(next === null && pieces[0].includes(".") && pieces.length > 1 && !pieces[1].includes("-")){
            next = pieces[1]
        }

        if(!(next in found)){
            found[next] = {
                move: next,
                det: JSON.parse(JSON.stringify(template)),
                wdet: JSON.parse(JSON.stringify(template)),
                bdet: JSON.parse(JSON.stringify(template))
            }
            foundMovesList.push(next)
        }

        const isWhite = mg.White === "sadegh97b"
        found[next].det.count++
        if(isWhite) found[next].wdet.count++
        else found[next].bdet.count++

        det.count++
        if(isWhite) wdet.count++
        else bdet.count++

        if(mg.Result === "0-1"){
            found[next].det.black++
            if(isWhite) found[next].wdet.black++
            else found[next].bdet.black++

            det.black++
            if(isWhite) wdet.black++
            else bdet.black++
        }
        else if(mg.Result === "1-0"){
            found[next].det.white++
            if(isWhite) found[next].wdet.white++
            else found[next].bdet.white++

            det.white++
            if(isWhite) wdet.white++
            else bdet.white++
        }
        else {
            found[next].det.draw++
            if(isWhite) found[next].wdet.draw++
            else found[next].bdet.draw++

            det.draw++
            if(isWhite) wdet.draw++
            else bdet.draw++
        }
    })

    const resChildren = []
    foundMovesList.forEach((fm) => {
        resChildren.push(found[fm])
    })

    resChildren.sort((f, s) => {
        return s.det.count - f.det.count
    })

    state.history = {
        details: det,
        white_det: wdet,
        black_det: bdet,
        children: resChildren
    }
    updateBoardWithHistoryBrowseResults(state.id, stateIndex)
}

function updateBoardWithHistoryBrowseResults(stateId, stateIndex){
    const state = currentState()
    const historyBox = document.getElementById("history")
    const childrenBox = document.getElementById("hchildren")

    if(state.id !== stateId){
        return
    }

    const history = state.history

    historyBox.innerHTML = ''
    const od = document.createElement("div")
    const wod = document.createElement("div")
    const bod = document.createElement("div")
    od.innerHTML = '<span style="font-weight: bold">' + history.details.count +
        "</span> (" + history.details.white + " - " + history.details.black + ")"
    wod.innerHTML = "White: " + history.white_det.count + ' (<span style="font-weight: bold">' + history.white_det.white +
        "</span> - " + history.white_det.black + ")"
    bod.innerHTML = "Black: " + history.black_det.count + " (" + history.black_det.white +
        ' - <span style="font-weight: bold">' + history.black_det.black + "</span>)"

    historyBox.appendChild(od)
    historyBox.appendChild(wod)
    historyBox.appendChild(bod)
    const divider = document.createElement("div")
    divider.innerHTML = '<span style="font-weight: bold">--------------</span>'
    historyBox.appendChild(divider)
    historyBox.style.display = 'block'

    childrenBox.innerHTML = ''
    history.children.forEach((child) => {
        const childDiv = document.createElement("div")
        const childNameDiv = document.createElement("div")
        const whiteDiv = document.createElement("div")
        const blackDiv = document.createElement("div")

        childDiv.classList.add("opening-child")
        childNameDiv.innerHTML = '<span style="font-weight: bold">' + child.move + "</span> "
            + child.det.count +  " (" + child.det.white + " - " + child.det.black + ")"
        whiteDiv.innerHTML = "White: " + child.wdet.count + ' (<span style="font-weight: bold">' + child.wdet.white +
            "</span> - " + child.wdet.black + ")"
        blackDiv.innerHTML = "Black: " + child.bdet.count + " (" + child.bdet.white +
            ' - <span style="font-weight: bold">' + child.bdet.black + "</span>)"

        childDiv.appendChild(childNameDiv)
        childDiv.appendChild(whiteDiv)
        childDiv.appendChild(blackDiv)
        childrenBox.appendChild(childDiv)

        childDiv.onclick = function (){
            browserMoveClick(child.move)
        }
    })
}

function stateBrowseOpenings(state, stateIndex){
    const curPgnStr = getCurrentStatePGNLog(stateIndex, true)
    let curFoundOp = []

    const curChessGame = new Chess()
    curChessGame.load_pgn(curPgnStr)
    const curChessFen = simplifyFen(curChessGame)

    openings.forEach((op) => {
        if(curChessFen === op.epd) curFoundOp.push(op)
    })

    if(curFoundOp.length > 0){
        state.opening = curFoundOp[curFoundOp.length - 1]
        const childrenIndexes = []
        const childrenObject = {}

        curFoundOp.forEach((foundOp) => {
            openings.forEach((op) => {
                if(foundOp.uci.length < op.uci.length){
                    const startOpUci = op.uci.substring(0, foundOp.uci.length)
                    if(startOpUci === foundOp.uci){
                        const sPos = foundOp.uci.length > 0 ? foundOp.uci.length + 1 : 0
                        const remUci = op.uci.substring(sPos)
                        const pieces = remUci.split(" ")
                        const nextMove = pieces[0]
                        const cObj = {
                            nm: nextMove,
                            rem_moves: pieces,
                            length: pieces.length,
                            op: op
                        }

                        if(!(nextMove in childrenObject) || cObj.length < childrenObject[nextMove].length){
                            if(!(nextMove in childrenObject)) childrenIndexes.push(nextMove)
                            childrenObject[nextMove] = cObj
                        }
                    }
                }
            })
        })

        const childrenList = []
        childrenIndexes.forEach((ind) => {
            childrenList.push(childrenObject[ind])
        })

        childrenList.sort((x, y) => {
            return x.length - y.length
        })

        state.opening.children = childrenList
    }
    else state.opening = false

    updateBoardWithOpeningBrowseResults(state.id, stateIndex)
}

function updateBoardWithOpeningBrowseResults(stateId, stateIndex){
    const state = currentState()
    const openingBox = document.getElementById("opening")
    const childrenBox = document.getElementById("children")

    if(state.id !== stateId){
        return
    }

    const lastOpening = getLastKnownOpening(stateIndex)
    if(!lastOpening){
        openingBox.style.display = 'none'
        childrenBox.style.display = 'none'
        return
    }

    const partMoves = getPartUciMoves(lastOpening.index, stateIndex)
    const opening = lastOpening.op
    const children = []

    opening.children.forEach((child) => {
        if(partMoves.length < child.rem_moves.length){
            let qualified = true
            for(let i=0; partMoves.length > i; i++){
                if(partMoves[i] !== child.rem_moves[i]){
                    qualified = false
                    break
                }
            }

            if(qualified) children.push(child)
        }
    })

    openingBox.innerHTML = ''
    const od = document.createElement("div")
    od.innerText = opening.name
    openingBox.appendChild(od)
    const divider = document.createElement("div")
    divider.innerText = "--------------"
    openingBox.appendChild(divider)
    openingBox.style.display = 'block'

    childrenBox.innerHTML = ''
    children.forEach((child) => {
        const childDiv = document.createElement("div")
        const childNameDiv = document.createElement("div")
        const childReachDiv = document.createElement("div")
        const moveIndex = lastOpening.index + partMoves.length
        const childReachMoves = getPartPgn(child.op.pgn, moveIndex)

        childDiv.classList.add("opening-child")
        childNameDiv.innerText = child.op.name
        childReachDiv.innerText = childReachMoves

        childDiv.appendChild(childNameDiv)
        childDiv.appendChild(childReachDiv)
        childrenBox.appendChild(childDiv)

        childDiv.onclick = function (){
            const moves = getPGNMoves(child.op.pgn)
            browserMoveClick(moves[moveIndex])
        }
    })
    childrenBox.style.display = 'block'
}

function browserMoveClick(nextMove){
    pgnMove(currentState(), nextMove)
}

function simplifyFen(chess){
    const pieces = chess.fen().split(" ")
    let f = pieces[0] + " " + pieces[1] + " " + pieces[2] + " "
    const eps = pieces[3]

    if(eps !== '-') {
        const epRow = 8 - eps[1]
        let epCol = 0
        if (eps[0] === 'b') epCol = 1
        else if (eps[0] === 'c') epCol = 2
        else if (eps[0] === 'd') epCol = 3
        else if (eps[0] === 'e') epCol = 4
        else if (eps[0] === 'f') epCol = 5
        else if (eps[0] === 'g') epCol = 6
        else if (eps[0] === 'h') epCol = 7

        const color = chess.turn()
        const board = chess.board()

        let epNeed = false
        if (color === 'w') {
            const leftPiece = board[epRow + 1][epCol - 1]
            const rightPiece = board[epRow + 1][epCol + 1]
            if ((leftPiece != null && leftPiece.type === 'p' && leftPiece.color === 'w') ||
                (rightPiece != null && rightPiece.type === 'p' && rightPiece.color === 'w')) epNeed = true
        } else {
            const leftPiece = board[epRow - 1][epCol - 1]
            const rightPiece = board[epRow - 1][epCol + 1]
            if ((leftPiece != null && leftPiece.type === 'p' && leftPiece.color === 'b') ||
                (rightPiece != null && rightPiece.type === 'p' && rightPiece.color === 'b')) epNeed = true
        }

        if (epNeed) return f + eps
    }
    return f + "-"
}

function engineEval(state, stateIndex){
    const perfMoveButton = document.getElementById("do_best_move")
    if(state.eval !== null){
        updateBoardWithEngineResults(state.id)
        return
    }
    const engine = new Worker('lib/lozza.js');
    perfMoveButton.classList.remove("perfect")
    perfMoveButton.classList.add('perfect-disabled');

    engine.onmessage = (e) => {
        const data = e.data

        if(data.includes("bestmove")){
            if(state.eval === null) state.eval = {}
            const moveStr = data.substring(9).trim()
            state.eval.bm_from = moveStr.substring(0, 2)
            state.eval.bm_target = moveStr.substring(2)
            updateBoardWithEngineResults(state.id)
        }
        if(data.includes('score')){
            if(state.eval === null) state.eval = {}
            const sm = "score mate"
            const scp = "score cp"

            if(data.includes(sm)){
                const start = data.indexOf(sm) + sm.length + 1
                const end = data.indexOf(" ", start)
                state.eval.forceMate = true
                state.eval.mateNumber = data.substring(start, end)
                updateBoardWithEngineResults(state.id)
            }
            else if(data.includes(scp)){
                state.eval.forceMate = false
                const start = data.indexOf(scp) + scp.length + 1
                const end = data.indexOf(" ", start)
                state.eval.score = data.substring(start, end)
                updateBoardWithEngineResults(state.id)
            }
        }
    }

    engine.postMessage('ucinewgame')
    engine.postMessage('position startpos moves ' + getCurrentStateEnginePositionLog(stateIndex))
    engine.postMessage('eval')
    engine.postMessage('go depth ' + 10);
}

function updateBoardWithEngineResults(stateId){
    const bsElement = document.getElementById("black_strip_status")
    const state = currentState()
    if(state.id !== stateId || state.eval === null) return

    const perfMoveButton = document.getElementById("do_best_move")

    if(state.eval.forceMate){
        const isWhiteTurn = state.curPlayer === 'white'
        if((isWhiteTurn && state.eval.mateNumber >= 0) || (!isWhiteTurn && state.eval.mateNumber < 0)){
            bsElement.style.height = '0'
        }
        else {
            bsElement.style.height = '100%'
        }
    }
    else {
        const score = state.eval.score
        if(score == 0){
            bsElement.style.height = '50%'
            return
        }

        let pureSCP = score
        if(state.curPlayer === 'black'){
            pureSCP = score * -1
        }

        let ev = evalBarSize(Math.abs(pureSCP))
        if(ev >= 50) ev = 49.99

        let shPercent = pureSCP < 0 ? 50 + ev : 50 - ev
        bsElement.style.height = shPercent + '%'
    }

    if(state.eval.bm_from != null){
        perfMoveButton.classList.remove("perfect-disabled")
        perfMoveButton.classList.add('perfect');
    }
    else {
        perfMoveButton.classList.remove("perfect")
        perfMoveButton.classList.add('perfect-disabled');
    }
}

function evalBarSize(x){
    if (x <= 450) {
        return x / 10;
    }
    return 45 + x / 6400
}

function refreshTimers(){
    const whiteTime = game.white_time != null ? Math.ceil(game.white_time / 1000) : null
    const blackTime = game.black_time != null ? Math.ceil(game.black_time / 1000) : null
    const whiteTimeStr = Math.trunc(whiteTime / 60) + ":" + whiteTime % 60
    const blackTimeStr = Math.trunc(blackTime / 60) + ":" + blackTime % 60
    const topTimeEl = document.getElementById("top_time")
    const bottomTimeEl = document.getElementById("bottom_time")

    if(whiteTime != null && blackTime != null){
        topTimeEl.style.display = "block"
        bottomTimeEl.style.display = "block"
        topTimeEl.innerText = !boardFlipped ? blackTimeStr : whiteTimeStr
        bottomTimeEl.innerText = !boardFlipped ? whiteTimeStr : blackTimeStr

        if(whiteTime <= 0) {
            if(!boardFlipped) bottomTimeEl.style.borderColor = "red"
            else topTimeEl.style.borderColor = "red"
        }
        if(blackTime <= 0) {
            if(!boardFlipped) topTimeEl.style.borderColor = "red"
            else bottomTimeEl.style.borderColor = "red"
        }
    }
    else if(topTimeEl || bottomTimeEl) {
        if(topTimeEl) topTimeEl.style.display = "none"
        if(bottomTimeEl) bottomTimeEl.style.display = "none"
    }
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

function selectAndCopyContent(containerId){
    const container = document.getElementById(containerId)
    window.getSelection().selectAllChildren(container);
    document.execCommand("copy")
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

                    if(validateMovement(currentState(), correctStartPosition, correctEndPosition)){
                        if(isTraining){
                            if(isPracticing()){
                                const cloneState = getCurrentStateClone()
                                const checkingBoard = stateMovePiece(cloneState, correctStartPosition,
                                    correctEndPosition, false).board
                                const correctBoard = game.moveStack[game.statePosition + 1].board

                                if(isEqualBoards(checkingBoard, correctBoard)){
                                    nextState()
                                    refreshUI()
                                }
                            }
                        }
                        else movePiece(correctStartPosition, correctEndPosition);
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
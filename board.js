// NOTE: this example uses the chess.js library:
// https://github.com/jhlywa/chess.js

let chessBoard = null
const squareClass = 'square-55d63'
const $boardElement = $('#myBoard')
let lastMove = null
const $status = $('#statuslog')
const $fen = $('#fenlog')
const $pgn = $('#pgnlog')
const $uci = $('#ucilog')
let boardFlipped = false
let rejectedMove = false

function onDragStart (source, piece, position, orientation) {
    // do not pick up pieces if the game is over
    if (chessGame.game_over()) return false

    // only pick up pieces for the side to move
    if ((chessGame.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (chessGame.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false
    }

    rejectedMove = false
}

function onDrop (source, target) {
    movePiece(source, target)
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
    if(!rejectedMove) finishTurn()
    else {
        refreshBoard()
        rejectedMove = false
    }
}

function movePiece(source, target){
    // see if the move is legal
    const move = chessGame.move({
        from: source,
        to: target,
        promotion: 'q' // NOTE: always promote to a queen for example simplicity
    })

    // illegal move
    if (move === null) {
        rejectedMove = true
        return 'snapback'
    }
    lastMove = move
}

function makePgnMove(pgm){
    if(pgm[0] === 'x'){
        const ep = pgm.substring(1, 3)
        const pcp = pawnCapturePossible(chessGame, ep)
        const pcpPosStr = getPositionStr(pcp)
        pgm = pcpPosStr[0] + pgm
    }

    let lmr = "normal"
    if(pgm.substring(pgm.length - 1) === '!'){
        lmr = "perfect"
    }
    else if(pgm.substring(pgm.length - 1) === '?'){
        lmr = "blunder"
    }

    lastMove = chessGame.move(pgm)
    updateStatus()
    finishTurn()

    if(lmr === "perfect") rateMovePerfect()
    else if(lmr === "blunder") rateMoveBlunder()
}

function updateStatus () {
    let status = ''

    let moveColor = 'White'
    if (chessGame.turn() === 'b') {
        moveColor = 'Black'
    }

    // checkmate?
    if (chessGame.in_checkmate()) {
        status = 'Game over, ' + moveColor + ' is in checkmate.'
    }

    // draw?
    else if (chessGame.in_draw()) {
        status = 'Game over, drawn position'
    }

    // game still on
    else {
        status = moveColor + ' to move'

        // check?
        if (chessGame.in_check()) {
            status += ', ' + moveColor + ' is in check'
        }
    }

    const curPgn = getCurrentStatePGNLog(game.statePosition)
    const curUci = getCurrentStateEnginePositionLog(game.statePosition)

    $status.html(status)
    $fen.html(simplifyFen(chessGame))
    $pgn.html(curPgn)

    if(!defective){
        $uci.html(curUci)
        $uci.css("display", "block");
    }
    else $uci.css("display", "none");
}

function flipBoard(){
    setOrientation(!boardFlipped)
}

function refreshBoard(){
    chessBoard.position(chessGame.fen())
    updateStatus()
    setOrientation(boardFlipped)
    highlightLastMove()
}

function highlightLastMove(){
    $boardElement.find('.' + squareClass).removeClass('highlight-normal')
    $boardElement.find('.' + squareClass).removeClass('highlight-perfect')
    $boardElement.find('.' + squareClass).removeClass('highlight-blunder')

    const lm = currentState().move
    if(lm == null) return

    const lmRate = currentState().lmrate
    let hlClass = "highlight-normal"
    if(lmRate === 'perfect') hlClass = "highlight-perfect"
    else if(lmRate === 'blunder') hlClass = "highlight-blunder"

    $boardElement.find('.square-' + lm.from).addClass(hlClass)
    $boardElement.find('.square-' + lm.to).addClass(hlClass)
}

function setOrientation(or){
    boardFlipped = or
    if((boardFlipped && chessBoard.orientation() !== "black") || (!boardFlipped && chessBoard.orientation() !== "white")){
        chessBoard.flip()
    }

    let curBoard = chessGame.board()
    let blackValue = 0
    let whiteValue = 0

    curBoard.forEach((row) => {
        row.forEach((p) => {
            if(p !== null) {
                if (p.color === 'w') {
                    whiteValue += getPieceValue(p.type)
                } else {
                    blackValue += getPieceValue(p.type)
                }
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

    refreshTimers()
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

const config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
}

chessBoard  = Chessboard('myBoard', config)
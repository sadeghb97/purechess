function pgnMove(state, pgnMove){
    let mRate = "normal"
    if(pgnMove.endsWith("?") || pgnMove.endsWith("!")){
        if(pgnMove.endsWith("??") || pgnMove.endsWith("!!") ||
            pgnMove.endsWith("!?") || pgnMove.endsWith("?!")){

            if(pgnMove.endsWith("??")) mRate = "blunder"
            else if(pgnMove.endsWith("!!")) mRate = "perfect"
            else mRate = "tricky"
            pgnMove = pgnMove.substring(0, pgnMove.length - 2)
        }
        else {
            if(pgnMove.endsWith("?")) mRate = "blunder"
            else mRate = "perfect"
            pgnMove = pgnMove.substring(0, pgnMove.length - 1)
        }
    }

    if(pgnMove.endsWith("+")) pgnMove = pgnMove.substring(0, pgnMove.length - 1)

    if(pgnMove.toLowerCase() === 'o-o' || pgnMove.toLowerCase() === 'o-o-o'){
        const cloneState = JSON.parse(JSON.stringify(state))
        cloneState.lmrate = mRate

        if(pgnMove.toLowerCase() === 'o-o'){
            castling(cloneState, true)
        }
        else {
            castling(cloneState, false)
        }
        return
    }

    const epStr = pgnMove.substring(pgnMove.length - 2)
    const ep = getPositionArray(epStr)
    pgnMove = pgnMove.substring(0, pgnMove.length - 2)

    const isCapture = pgnMove.length > 0 && pgnMove.toLowerCase().endsWith("x")
    if(isCapture) pgnMove = pgnMove.substring(0, pgnMove.length - 1)

    let piece = ''
    const isRider = pgnMove.toLowerCase().startsWith("r") ||
        pgnMove.toLowerCase().startsWith("n") ||
        pgnMove.toLowerCase().startsWith("b") ||
        pgnMove.toLowerCase().startsWith("q") ||
        pgnMove.toLowerCase().startsWith("k")

    if(isRider){
        piece = pgnMove.toLowerCase().substring(0, 1)
        if(pgnMove.length > 0) pgnMove = pgnMove.substring(1)
    }

    let sp;
    if(pgnMove.length > 1) {
        sp = getPositionArray(pgnMove)
    }
    else sp = findAttackerPiecePosition(state, piece, ep, pgnMove, isCapture)

    const cloneState = JSON.parse(JSON.stringify(state))
    cloneState.lmrate = mRate

    if(!piece && state.board[ep[0]][ep[1]] === '.' && ep[1] !== sp[1]) {
        if(state.enPos && state.enPos[0] === ep[0] && state.enPos[1] === ep[1]){
            enPassant(sp)
        }
    }
    else stateMovePiece(cloneState, sp, ep, true)
}

function pgnMoves(moves){
    moves.forEach((move) => {
        pgnMove(currentState(), move)
    })
}

function getPGNString(state, attPiece, sp, ep, isCapture, mRate = "normal", forceExt = false){
    let pgn = (attPiece.toLowerCase() === 'p' ? "" : attPiece.toUpperCase())
    if(attPiece.toLowerCase() === 'p') pgn +=
        getSummaryPawnPGNPosition(state, sp, ep, attPiece, isCapture, forceExt)
    else pgn += getSummaryPGNPosition(state ,sp, ep, attPiece)

    if(isCapture) pgn += "x"
    pgn += getPGNPosition(ep)
    return pgn
}

function getPGNPosition(pos){
    const row = 8 - pos[0]
    if(pos[1] == 0) return "a" + row
    else if(pos[1] == 1) return "b" + row
    else if(pos[1] == 2) return "c" + row
    else if(pos[1] == 3) return "d" + row
    else if(pos[1] == 4) return "e" + row
    else if(pos[1] == 5) return "f" + row
    else if(pos[1] == 6) return "g" + row
    else return "h" + row
}

function getSummaryPawnPGNPosition(state, sp, ep, pawnPiece, isCapture, forceExt = false){
    if(!isCapture) return ""
    const possibleSP = ep[1] > sp[1] ? [sp[0], sp[1] + 2] : [sp[0], sp[1] - 2]
    if(sp[1] < 0 || sp[1] > 7){
        if(forceExt) return  getPGNPosition(sp)[0]
        return ""
    }
    if(state.board[possibleSP[0]][possibleSP[1]] !== pawnPiece){
        if(forceExt) return  getPGNPosition(sp)[0]
        return ""
    }
    return  getPGNPosition(sp)[0]
}

function getSummaryPGNPosition(state, sp, ep, piece){
    const attPiece = state.curPlayer === 'white' ? piece.toLowerCase() : piece.toUpperCase()
    const positions = getAllPossibleAttackers(state, attPiece, ep)
    if(positions.length === 1) return ""

    let isOK = true
    positions.forEach((pos) => {
        if(sp[0] === pos[0] && sp[1] === pos[1]) return
        if(sp[0] === pos[0]){
            isOK = false;
        }
    })
    if(isOK) return getPGNPosition(sp)[1]

    isOK = true
    positions.forEach((pos) => {
        if(sp[0] === pos[0] && sp[1] === pos[1]) return
        if(sp[1] === pos[1]){
            isOK = false;
        }
    })
    if(isOK) return getPGNPosition(sp)[0]

    return getPGNPosition(sp)
}

function getPositionRow(pc){
    return 8 - parseInt(pc)
}

function getPositionColumn(pc){
    if(pc === 'a') return 0
    else if(pc === 'b') return 1
    else if(pc === 'c') return 2
    else if(pc === 'd') return 3
    else if(pc === 'e') return 4
    else if(pc === 'f') return 5
    else if(pc === 'g') return 6
    else return 7
}

function getPositionArray(pStr){
    const rc = pStr[0].toLowerCase()
    const cc = pStr[1]
    const out = []

    out[0] = getPositionRow(cc)
    out[1] = getPositionColumn(rc)
    return out
}

function findPiecePositionFromChar(state, ch, piece){
    if(isNaN(ch)){
        const col = getPositionColumn(ch)
        for(let i=0; 8>i; i++){
            if(state.board[i][col] === piece) return [i, col]
        }
    }
    else {
        const row = getPositionRow(ch)
        for(let i=0; 8>i; i++) {
            if (state.board[row][i] === piece) return [row, i]
        }
    }

    return null
}

function findAttackerPiecePosition(state, piece, ep, spStr, isCapture){
    if(piece === "") return findPawnStartPosition(state, ep, spStr, isCapture)
    const attPiece = state.curPlayer === 'white' ? piece.toLowerCase() : piece.toUpperCase()

    const positions = getAllPossibleAttackers(state, attPiece, ep)
    if(positions.length === 1) return positions[0]
    if(spStr.length > 1) return getPositionArray(spStr)
    return findPiecePositionFromChar(state, spStr, attPiece)
}

function findPawnStartPosition(state, ep, spStr, isCapture){
    const piece = state.curPlayer === 'white' ? "p" : "P"
    const dir = piece === 'p' ? -1 : 1
    const row = ep[0] - dir

    if(isCapture) {
        if (spStr.length > 0) {
            const col = getPositionColumn(spStr)
            return [row, col]
        }

        const col = state.board[row][ep[1] - 1] === piece ? ep[1] - 1 : ep[1] + 1
        return [row, col]
    }

    if(state.board[row][ep[1]] === piece) return [row, ep[1]]
    if(state.board[row - dir][ep[1]] === piece) return [row - dir, ep[1]]
}

function getAllPossibleAttackers(state, piece, ep, validate = true){
    const positions = []
    for(let i=0; 8>i; i++){
        for(let j=0; 8>j; j++){
            if(state.board[i][j] === piece) positions.push([i, j])
        }
    }

    if(validate) {
        for (let i = 0; positions.length > i; i++) {
            if (!validateMovement(state, positions[i], ep)) {
                positions.splice(i, 1)
                i--
            }
        }
    }

    return positions
}

function getPGNMoves(pgnStr){
    let pgnMovesStr = pgnStr.replaceAll("\n", " ")
    pgnMovesStr = pgnMovesStr.replaceAll("  ", " ")
    pgnMovesStr = pgnMovesStr.substring(pgnMovesStr.lastIndexOf("]") + 1).trim()
    const moves = []
    const pieces = pgnMovesStr.split(" ")

    pieces.forEach((p) => {
        if(p.includes(".") || p.includes("*")) return
        moves.push(p)
    })

    return moves
}

function getPartPgn(pgnStr, start){
    const moves = getPGNMoves(pgnStr)
    let out = ""

    for(let i=start; moves.length > i; i++){
        if((i % 2) === 0){
            if(out.length > 0) out += " "
            const num = Math.floor(i / 2)
            out += (num + ". ")
        }
        else if(i === start) out += "... "
        else out += " "
        out += moves[i]
    }
    return out
}

function loadPGN(pgnStr){
    const moves = getPGNMoves(pgnStr)
    resetBoard()

    isLoading = true
    pgnMoves(moves)
    isLoading = false

    refreshUI()
}
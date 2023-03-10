
function pgnMoves(moves){
    moves.forEach((move) => {
        makePgnMove(move)
    })
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

function getPositionColumnStr(pc){
    if(pc === 0) return 'a'
    else if(pc === 1) return 'b'
    else if(pc === 2) return 'c'
    else if(pc === 3) return 'd'
    else if(pc === 4) return 'e'
    else if(pc === 5) return 'f'
    else if(pc === 6) return 'g'
    else return 'h'
}

function getPositionArray(pStr){
    const rc = pStr[0].toLowerCase()
    const cc = pStr[1]
    const out = []

    out[0] = getPositionRow(cc)
    out[1] = getPositionColumn(rc)
    return out
}

function getPositionStr(pos){
    const rc = getPositionRow(pos[0])
    const cc = getPositionColumnStr(pos[1])
    return cc + rc
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
        if(out.length > 0) out += " "
        const num = Math.floor(i / 2) + 1

        if((i % 2) === 0) out += (num + ". ")
        else if(i === start) out += (num + "... ")
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
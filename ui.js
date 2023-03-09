function refreshUI() {
    if(isLoading) return
    refreshBoard()

    const currentStatePosition = game.statePosition
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

    if(USE_ENGINE){
        if(currentState().eval !== null){
            updateBoardWithEngineResults(currentState().id)
        }
        else engineEval(currentState(), currentStatePosition)
    }

    if (currentState().opening !== null) {
        updateBoardWithOpeningBrowseResults(currentState().id, currentStatePosition)
    }
    else stateBrowseOpenings(currentState(), currentStatePosition)

    if (currentState().history !== null) {
        updateBoardWithHistoryBrowseResults(currentState().id, currentStatePosition)
    }
    else stateBrowseHistory(currentState(), currentStatePosition)

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

    state.history = {
        details: det,
        white_det: wdet,
        black_det: bdet,
        children: resChildren
    }
    updateBoardWithHistoryBrowseResults(state.id, stateIndex)
}

function updateBoardWithHistoryBrowseResults(stateId, stateIndex){
    const turn = chessGame.turn()
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

    if(turn === 'w') wod.classList.add("active-history")
    else bod.classList.add("active-history")

    historyBox.appendChild(od)
    historyBox.appendChild(wod)
    historyBox.appendChild(bod)
    const divider = document.createElement("div")
    divider.innerHTML = '<span style="font-weight: bold">--------------</span>'
    historyBox.appendChild(divider)
    historyBox.style.display = 'block'

    if(turn === 'w') {
        history.children.sort((f, s) => {
            return s.wdet.count - f.wdet.count
        })
    }
    else {
        history.children.sort((f, s) => {
            return s.bdet.count - f.bdet.count
        })
    }

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

        if(turn === 'w') whiteDiv.classList.add("active-history")
        else blackDiv.classList.add("active-history")

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
        const frequencyList = {}

        curFoundOp.forEach((foundOp) => {
            openings.forEach((op) => {
                if(foundOp.uci.length < op.uci.length){
                    const startOpUci = op.uci.substring(0, foundOp.uci.length)
                    if(startOpUci === foundOp.uci){
                        const sPos = foundOp.uci.length > 0 ? foundOp.uci.length + 1 : 0
                        const remUci = op.uci.substring(sPos)
                        const pieces = remUci.split(" ")
                        const nextMove = pieces[0]

                        if(!(nextMove in frequencyList)) frequencyList[nextMove] = 0
                        frequencyList[nextMove]++

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
            childrenObject[ind].frequency = frequencyList[ind]
            childrenList.push(childrenObject[ind])
        })

        childrenList.sort((x, y) => {
            if(x.length === y.length){
                return y.frequency - x.frequency
            }
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
    makePgnMove(nextMove)
}

function simplifyFen(chess){
    const pieces = chess.fen().split(" ")
    let f = pieces[0] + " " + pieces[1] + " " + pieces[2] + " "
    const eps = pieces[3]

    if(eps !== '-') {
        const epNeed = pawnCapturePossible(chess, eps)
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
        const isWhiteTurn = chessGame.turn() === 'w'
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
        if(chessGame.turn() === 'b'){
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

function selectAndCopyContent(containerId){
    const container = document.getElementById(containerId)
    window.getSelection().selectAllChildren(container);
    document.execCommand("copy")
}
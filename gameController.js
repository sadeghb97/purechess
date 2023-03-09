let readOnly = false
let isTraining = false
const USE_ENGINE = true
let isLoading = false

function resetBoard() {
    initState()
    refreshUI()

    const gameTitleEl = document.getElementById("game_title")
    gameTitleEl.style.display = "none"
}

function finishTurn(){
    /*if(!checkKingsSafety(nextState)) return
    toggleTurn(nextState)
    pushState(nextState)
    incrementTimer()
    refreshUI()*/

    pushState()
    incrementTimer()
    refreshUI()
}

function getPieceValue(piece){
    if(piece.toLowerCase() === 'p') return 1
    if(piece.toLowerCase() === 'r') return 5
    if(piece.toLowerCase() === 'n') return 3
    if(piece.toLowerCase() === 'b') return 3
    if(piece.toLowerCase() === 'q') return 9
    return 0
}

function loadFirstState(){
    goToFirstState()
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

function doBestMove(){
    if(currentState().eval !== null && currentState().eval.bm_from !== null){
        const sp = currentState().eval.bm_from
        const ep = currentState().eval.bm_target
        movePiece(sp, ep)
        finishTurn()
    }
}
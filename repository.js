function loadRepository(){
    const libraryDiv = document.getElementById("games_library");
    if(games.traps.length > 0){
        const trapsContainerDiv = document.createElement("div")
        const trapsTitle = document.createElement("span")
        trapsTitle.className = "title"
        trapsTitle.append("Traps")
        trapsContainerDiv.appendChild(trapsTitle)

        for(let opIndex = 0; games.traps.length > opIndex; opIndex++){
            const opening = games.traps[opIndex]
            const openingTitle = document.createElement("span")
            openingTitle.className = "category"
            openingTitle.append(opening.opening_name)
            openingTitle.style.marginTop = "12px"
            trapsContainerDiv.append(openingTitle)

            const openingDiv = document.createElement("div")
            openingDiv.className = "centcont"
            for(let trpIndex = 0; opening.trp_list.length > trpIndex; trpIndex++){
                const trap = opening.trp_list[trpIndex]
                const trSpan = document.createElement("span")
                trSpan.className = "game_name"
                trSpan.append(trap.title)
                openingDiv.appendChild(trSpan)

                trSpan.onclick = () => {
                    loadTrap(opIndex, trpIndex)
                }
            }
            trapsContainerDiv.appendChild(openingDiv)
        }

        libraryDiv.appendChild(trapsContainerDiv)
    }

    loadRandomTrap()
}

function loadTrap(opIndex, trpIndex){
    const op = games.traps[opIndex]
    const trap = op.trp_list[trpIndex]
    const gameTitleDiv = document.getElementById("game_title")
    gameTitleDiv.style.marginBottom = "12px"

    if(gameTitleDiv != null) {
        gameTitleDiv.innerHTML = ''
        const gtSpan = document.createElement("span")
        gtSpan.append(op.opening_name + ": " + trap.title)
        gameTitleDiv.appendChild(gtSpan)
    }

    fastLoadGame(trap, true)
}

function loadRandomTrap(){
    const opSize = games.traps.length
    const opIndex = getRandomInt(0, opSize)
    const trSize = games.traps[opIndex].trp_list.length
    const trIndex = getRandomInt(0, trSize)

    loadTrap(opIndex, trIndex)
}

games = {
    traps:[
        {
            opening_name: "Stafford Gambit",
            trp_list: [
                {"title":"Oh no my queen!", "flipped":true, "moves":["e2e4","e7e5","Ng1f3","Ng8f6","Nf3xe5","Nb8c6","Ne5xc6","d7xc6","d2d3","Bf8c5","Bc1g5?","Nf6xe4!","Bg5xd8","Bc5xf2","Ke1e2","Bc8g4"]}
            ]
        }
    ],
    full_games: [

    ]
}
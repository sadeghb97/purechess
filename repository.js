function loadRepository(){
    const libraryDiv = document.getElementById("games_library");
    if(traps.length > 0){
        const trapsContainerDiv = document.createElement("div")
        const trapsTitle = document.createElement("span")
        trapsTitle.className = "title"
        trapsTitle.append("Traps")
        trapsContainerDiv.appendChild(trapsTitle)

        for(let opIndex = 0; traps.length > opIndex; opIndex++){
            const opening = traps[opIndex]
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
}

function loadTrap(opIndex, trpIndex){
    const op = traps[opIndex]
    const trap = op.trp_list[trpIndex]
    const gameTitleDiv = document.getElementById("game_title")
    gameTitleDiv.style.marginBottom = "12px"

    fastLoadGame(trap, true)

    if(gameTitleDiv != null) {
        gameTitleDiv.innerHTML = ''
        const gtSpan = document.createElement("span")
        gtSpan.append(op.opening_name + ": " + trap.title)
        gameTitleDiv.appendChild(gtSpan)
        gameTitleDiv.style.display = 'block'
    }
}

function loadRandomTrap(){
    const opSize = traps.length
    const opIndex = getRandomInt(0, opSize)
    const trSize = traps[opIndex].trp_list.length
    const trIndex = getRandomInt(0, trSize)

    loadTrap(opIndex, trIndex)
}
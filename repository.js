function loadRepository(){
    const libraryDiv = document.getElementById("games_library");
    if(games.traps.length > 0){
        const trapsContainerDiv = document.createElement("div")
        const trapsTitle = document.createElement("span")
        trapsTitle.className = "title"
        trapsTitle.append("Traps")
        trapsContainerDiv.appendChild(trapsTitle)

        games.traps.forEach((opening) => {
            const openingTitle = document.createElement("span")
            openingTitle.className = "category"
            openingTitle.append(opening.opening_name)
            openingTitle.style.marginTop = "12px"
            trapsContainerDiv.append(openingTitle)

            const openingDiv = document.createElement("div")
            openingDiv.className = "centcont"
            opening.trp_list.forEach((trap) => {
                const trSpan = document.createElement("span")
                trSpan.className = "game_name"
                trSpan.append(trap.title)
                openingDiv.appendChild(trSpan)

                trSpan.onclick = () => {
                    loadTrap(opening, trap)
                }
            })
            trapsContainerDiv.appendChild(openingDiv)
        })

        libraryDiv.appendChild(trapsContainerDiv)
    }

    loadRandomTrap()
}

function loadRepoItem(gameFilename, gameTitle){
    studyGame(gameFilename)
    const gameTitleDiv = document.getElementById("game_title")

    if(gameTitleDiv != null && game.extra != null) {
        gameTitleDiv.innerHTML = ''
        const extra = game.extra

        if(extra.type === "trap") {
            const gtSpan = document.createElement("span")
            gtSpan.append(gameTitle)
            gameTitleDiv.appendChild(gtSpan)
        }
    }
}

function loadTrap(op, trap){
    loadRepoItem(trap.filename,
        op.opening_name + ": " + trap.title)
}

function loadRandomTrap(){
    const opSize = games.traps.length
    const opIndex = getRandomInt(0, opSize)

    const trSize = games.traps[opIndex].trp_list.length
    const trIndex = getRandomInt(0, trSize)

    loadTrap(games.traps[opIndex], games.traps[opIndex].trp_list[trIndex])
}

games = {
    traps:[
        {
            opening_name: "Stafford Gambit",
            trp_list: [
                {
                    title: "Oh No My Queen!",
                    filename: "tr-stafford_gambit-OhNoMyQueen"
                },
                {
                    title: "Oh No My Knight!",
                    filename: "tr-stafford_gambit-OhNoMyKnight"
                },
                {
                    title: "Take my knight, but I'll take your rook...",
                    filename: "tr-stafford_gambit-TakeMyKnight"
                },
                {
                    title: "Most common trap",
                    filename: "tr-stafford_gambit-MostCommonTraps"
                },
                {
                    title: "Punishing Natural Development",
                    filename: "tr-stafford_gambit-NaturalDevelopment"
                },
                {
                    title: "My Favorite Trap (Sometimes works against GMs!)",
                    filename: "tr-stafford_gambit-WorksAgainstGMs"
                },
                {
                    title: "Everyone falls for this trap 😁",
                    filename: "tr-stafford_gambit-EveryoneFallsForThisTrap"
                },
                {
                    title: "Miscellaneous Lines",
                    filename: "tr-stafford_gambit-MiscellaneousLines"
                },
            ]
        }
    ],
    full_games: [

    ]
}
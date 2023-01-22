const openings = [
    {
      title: "Stafford Gambit",
      moves: "1. e4 e5 2. Nf3 Nf6 3. Nxe5 Nc6 4. Nxc6 dxc6"
    },
    {
        title: "Danish Gambit",
        moves: "1. e4 e5 2. d4 xd4 3. c3 xc3 4. Bc4 xb2 5. Bxb2"
    }
]

function staffordGambit(){
    loadPGN(openings[0].moves)
}

function danishGambit(){
    loadPGN(openings[1].moves)
}
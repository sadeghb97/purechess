const traps = [
    {
        opening_name: "Stafford Gambit",
        trp_list: [
            {"title":"Oh no my queen!","flipped":true,"moves":["e4","e5","Nf3","Nf6","Nxe5","Nc6","Nxc6","dxc6","d3","Bc5","Bg5?","Nxe4!","Bxd8","Bxf2","Ke2","Bg4"]},
            {"title":"Oh no my knight!","flipped":true,"moves":["e4","e5","Nf3","Nf6","Nxe5","Nc6","Nxc6","dxc6","e5","Ne4","d3?","Bc5!","xe4","Bxf2","Kxf2","Qxd1"]},
            {"title":"Take my knight, but I'll take your rook...","flipped":true,"moves":["e4","e5","Nf3","Nf6","Nxe5","Nc6","Nxc6","dxc6","e5","Ne4","d4","Qh4","g3?","Nxg3!","fxg3","Qe4"]},
            {"title":"Most common trap","flipped":true,"moves":["e4","e5","Nf3","Nf6","Nxe5","Nc6","Nxc6","dxc6","Nc3","Bc5","d3?","Ng4!","Be3","Nxe3","xe3","Bxe3"]},
            {"title":"Punishing Natural Development","flipped":true,"moves":["e4","e5","Nf3","Nf6","Nxe5","Nc6","Nxc6","dxc6","Nc3","Bc5","Bc4?","Ng4!","o-o!","Qh4","h3","Nxf2","Qf3","Nxh3","Kh1","Nf2","Kg1","Qh1"]},
            {"title":"My Favorite Trap (Sometimes works against GMs!)","flipped":true,"moves":["e4","e5","Nf3","Nf6","Nxe5","Nc6","Nxc6","dxc6","Nc3","Bc5","Be2","h5","h3","Qd4!","o-o","Ng4!","xg4","xg4","g3","Qe5","Kg2","Bxf2!","Kxf2","Rh2","Ke3","Qxg3","Kd4","Be6"]},
            {"title":"Everyone falls for this trap 😁","flipped":true,"moves":["e4","e5","Nf3","Nf6","Nxe5","Nc6","Nxc6","dxc6","d3","Bc5","Be2","h5","o-o","Ng4","h3","Qd6","xg4","xg4"]},
            {"title":"Drag white's king to e4 (before move 10!)","flipped":true,"moves":["e4","e5","Nf3","Nf6","Nxe5","Nc6","Nxc6","dxc6","d3","Bc5","h3","Bxf2","Kxf2","Nxe4","Ke3","o-o","Kxe4"]}

        ]
    },
    {
        opening_name: "Danish Gambit",
        trp_list: [
            {"title":"5...Nf6 Trap","flipped":false,"moves":["e4","e5","d4","xd4","c3","xc3","Bc4","xb2","Bxb2","Nf6","e5","Ne4","Bxf7!","Kxf7","Qd5","Ke8","Qxe4"]},
            {"title":"5...d6 Trap","flipped":false,"moves":["e4","e5","d4","xd4","c3","xc3","Bc4","xb2","Bxb2","d6","e5","xe5?","Bxf7!","Ke7","Ba3!","Kxf7","Qxd8"]},
            {"title":"5...Qg4 Trap(s)","flipped":false,"moves":["e4","e5","d4","xd4","c3","xc3","Bc4","xb2","Bxb2","Qg5","Nf3","Qxg2?","Rg1","Qh3","Bxf7!","Kxf7?","Ng5!","Ke8","Nxh3"]},
            {"title":"Gorgeous Checkmate","flipped":false,"moves":["e4","e5","d4","xd4","c3","xc3","Bc4","xb2","Bxb2","Bb4","Nc3","Nf6","N1e2","Nxe4","o-o","Nxc3","Nxc3","Bxc3?","Bxc3","o-o?","Qg4!","g6","Qd4","Qf6","Qxf6","Nc6","Qh8"]},


        ]
    },
    {
        opening_name: "Italian Game",
        trp_list: [
            {"title":"Checkmate in 7","flipped":false,"moves":["e4","e5","Nf3","Nc6","Bc4","Nf6","Ng5","d5","xd5","Nxd5","Nxf7","Kxf7","Qf3","Kg8?","Bxd5","Qxd5","Qxd5"]},

        ]
    },
    {
        opening_name: "Greco Gambit",
        trp_list: [
            {"title":"Expose Black King","flipped":false,"moves":["e4","e5","Nf3","Nc6","Bc4","Bc5","c3","Nf6","d4","xd4","xd4","Bb4","Nc3","Nxe4","o-o","Nxc3","xc3","Bxc3","Ba3","Bxa1?","Re1","Ne7","Rxe7","Qxe7","Bxe7","Kxe7","Qxa1"]},
            {"title":"Checkmate in 18","flipped":false,"moves":["e4","e5","Nf3","Nc6","Bc4","Bc5","c3","Nf6","d4","xd4","xd4","Bb4","Nc3","Nxe4","o-o","Bxc3","d5","Bf6","Re1","Ne7","Rxe4","o-o","d6","xd6","Qxd6","Nf5","Qd5","d6","Ng5","Bxg5","Bxg5","Qxg5?","Qxf7!","Rxf7","Re8"]},


        ]
    },
    {
        opening_name: "Nakhmanson Gambit",
        trp_list: [
            {"title":"Example Of Opening","flipped":false,"moves":["e4","e5","Nf3","Nc6","Bc4","Nf6","d4","xd4","o-o","Nxe4","Nc3","xc3","Bxf7","Kxf7","Qd5","Ke8","Re1","Qf6","Bg5","Qf7","Qxe4","Be7","Bxe7","Nxe7","Ng5","Qf6","Nxh7"]},


        ]
    },
    {
        opening_name: "Philidor Defense",
        trp_list: [
            {"title":"Legal Trap","flipped":false,"moves":["e4","e5","Nf3","d6","Bc4","Bg4","Nc3","Nc6","h3","Bh5?","Nxe5!","Bxd1","Bxf7","Ke7","Nd5"]},
            {"title":"Legal Denied","flipped":false,"moves":["e4","e5","Nf3","d6","Bc4","Bg4","Nc3","Nc6","h3","Bh5?","Nxe5!","Nxe5","Qxh5","Nxc4","Qb5","c6","Qxc4"]},


        ]
    },
    {
        opening_name: "Ryder Gambit",
        trp_list: [
            {"title":"Halosar Trap","flipped":false,"moves":["d4","d5","e4","xe4","Nc3","Nf6","f3","xf3","Qxf3","Qxd4","Be3","Qb4","o-o-o","Bg4","Nb5","Bxf3?","Nxc7!"]},


        ]
    },
    {
        opening_name: "Blackburne-Kostić Gambit",
        trp_list: [
            {"title":"Blackburne Schilling Trap","flipped":true,"moves":["e4","e5","Nf3","Nc6","Bc4","Nd4","Nxe5","Qg5","Nxf7?","Qxg2","Rf1","Qxe4","Be2","Nf3!"]},


        ]
    },
    {
        opening_name: "Englund Gambit",
        trp_list: [
            {"title":"Checkmate in 8","flipped":true,"moves":["d4","e5","xe5","Nc6","Nf3","Qe7","Bf4","Qb4","Bd2","Qxb2","Bc3?","Bb4!","Qd2","Bxc3","Qxc3","Qc1"]},


        ]
    },
]
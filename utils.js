function readTextFile(file, callback) {
    const rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
        if(rawFile.readyState === 4) {
            if(rawFile.status === 200 || rawFile.status == 0) {
                const allText = rawFile.responseText;
                callback(allText)
            }
        }
    }
    rawFile.send(null);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    const rnd = Math.random()
    console.log("rnd", rnd, rnd * (max - min) + min)
    return Math.floor(rnd * (max - min) + min);
}

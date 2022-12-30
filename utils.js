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
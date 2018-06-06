

function getTotal (data, totalBoundingBox, term) {
    var boxes = searchClosestToTerm(data, totalBoundingBox, term)
    if (boxes && boxes.length > 0) {
        if (boxes.length == 1) {
            return boxes[0].text.replace(/[^\d.]/g, '');
        }
        else {
            var first = boxes[boxes.length - 2].text.replace(/[^\d]/g, '');
            var second = boxes[boxes.length - 1].text.replace(/[^\d]/g, '');
            var result = `${first}.${second}`;
            if (!second) {
                result = boxes[boxes.length - 2].text.replace(/[^\d\.]/g, '');
            }
            if (!first) {
                result = boxes[boxes.length - 1].text.replace(/[^\d\.]/g, '');
            }
            return result;
        }
    }

    return '-';
}


function searchClosestToTerm(data, boundingBox, term) {
    var result = [];
    for (i in data.regions) {
        var region = data.regions[i];
        var box = searchClosestToTermInBoundingBoxLines(region, boundingBox, data.orientation, data.textAngle, term);
        result = result.concat(box);
    }

    return result;
}


function searchClosestToTermInBoundingBoxLines(boundingBoxLines, boundingBox, orientation, angle, term) {
    var result = [];
    var backupPrices = [];
    var y = boundingBox.split(',');
    const top = parseInt(y[0]); const left = parseInt(y[1]); const height = parseInt(y[2]); const width = parseInt(y[3]);
    //const [top, left, height, width] = boundingBox.split(',');
    for (var i in boundingBoxLines.lines) {
        var line = boundingBoxLines.lines[i];
        for (var j in line.words) {
            var word = line.words[j];
            
            //let [btop, bleft, bheight, bwidth] = word.boundingBox.split(',');
            //let [btop, bleft, bheight, bwidth] = word.boundingBox.split(',');
            const z = word.boundingBox.split(',');
            const btop = parseInt(z[0]); const bleft = parseInt(z[1]); const bheight = parseInt(z[2]); const bwidth = parseInt(z[3]);
            if ((orientation.toLowerCase() == 'left' || orientation.toLowerCase() == 'right') && btop > top && (angle > 0 && left > bleft && left - bleft <= 20 || Math.abs(bleft - left) <= 10)) {
                if (word.text.toLowerCase().trim() != term.toLowerCase().trim()) {
                    result.push({ box: word.boundingBox, text: word.text});
                }
            }
            if ((orientation.toLowerCase() == 'left' || orientation.toLowerCase() == 'right') && (Math.abs(bleft - left) <= 20) && btop > top) {
                if (word.text.toLowerCase().trim() != term.toLowerCase().trim()) {
                    backupPrices.push({ box: word.boundingBox, text: word.text});
                }
            }
        }
    }

    return result.length ? result : backupPrices;
}

module.exports = getTotal;
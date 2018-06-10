

function getTotal (data, totalBoundingBox, term) {
    var boxes = searchClosestToTerm(data, totalBoundingBox, term)
    if (boxes && boxes.length > 0) {
        if (boxes.length == 1) {
            return boxes[0].text.replace(/[^\d.]/g, '');
        }
        else {
            var first = boxes[boxes.length - 2].text.replace(/[^\d\.]/g, '');
            var second = boxes[boxes.length - 1].text.replace(/[^\d\.]/g, '');
   
            if (!second || isNaN(second)) {
                return first;
            }
            if (!first || isNaN(first)) {
                return second;
            }
 
            if (first.indexOf('.') > -1 && second.indexOf('.') > -1) {
                const pos1 = boxes[boxes.length - 2].box.split(',')[1];
                const pos2 = boxes[boxes.length - 1].box.split(',')[1];
                const totalPos = totalBoundingBox.split(',')[1];
                return Math.abs(totalPos - pos1) <  Math.abs(totalPos - pos2) ? first : second; 
            }

            if (first.indexOf('.') > -1) {
                return first;
            }

            if (second.indexOf('.') > -1) {
                return second;
            }

            return `${first}.${second}`;
        }
    }

    return '-';
}


function searchClosestToTerm(data, boundingBox, term) {
    var result = [];
    for (let region of data.regions) {
        var box = searchClosestToTermInBoundingBoxLines(region, boundingBox, data.orientation, data.textAngle, term);
        result = result.concat(box);
    }

    return result;
}


function searchClosestToTermInBoundingBoxLines(boundingBoxLines, boundingBox, orientation, angle, term) {
    var result = [];
    var backupPrices = [];
    var y = boundingBox.split(',');
    const [top, left, height, width] = boundingBox.split(',').map(e => parseInt(e));
    for (let line of boundingBoxLines.lines) {
        // var line = boundingBoxLines.lines[i];
        for (let word of line.words) {
            // var word = line.words[j];
            
            let [btop, bleft, bheight, bwidth] = word.boundingBox.split(',').map(e => parseInt(e));
            // let [btop, bleft, bheight, bwidth] = word.boundingBox.split(',').map(e => parseInt(e));;
            // const z = word.boundingBox.split(',');
            // const btop = parseInt(z[0]); const bleft = parseInt(z[1]); const bheight = parseInt(z[2]); const bwidth = parseInt(z[3]);
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
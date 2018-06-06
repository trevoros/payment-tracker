var request = require('requestretry');
var getTotal = require('./totalCalculator');
var entityCreator = require('./entityCreator');

module.exports = function (context, receiptData) {

    if(context.bindingData.dequeueCount > 2) {
        context.bindings.poisonedMessage = receiptData;
        context.done();
    }

    if (receiptData && (receiptData.state == 'pending')) {

        var options = {
            uri: process.env["VisionApiUrl"] + '/ocr?language=unk&detectOrientation=true',
            method: 'POST',
            qs: {
                visualFeatures: 'Description'
            },
            headers: {
                'Ocp-Apim-Subscription-Key': process.env["VisionApiKey"],
                'Content-Type': 'application/json'
            },
            body :{ "url" : receiptData.image_url },
            json: true,
            fullResponse: false 
        };

        request(options)
        .then(function (parsedBody) {
            // var tags = parsedBody.description.tags;
            // receiptData.imageApproval = "complete";
            // if(tags.indexOf("car") > -1){
            //     receiptData.state = "approved";
            //     context.bindings.outputDocument = receiptData;
            // } else {
            //     receiptData.state = "rejected";
            //     context.bindings.outputDocument = receiptData;
            //     var rejectionEvent = {
            //         id: receiptData.id,
            //         company: receiptData.company,
            //         description: receiptData.description,
            //         image_url: receiptData.image_url,
            //         name: receiptData.name,
            //         state: receiptData.state,
            //         rejectionReason: "car is not on the image"
            //     };
            //     context.bindings.rejectedReviewEvent = rejectionEvent;
            // }
            context.log('********** ----');
            context.log(parsedBody);
            var result = searchTerm(parsedBody);
            var obj = {};
            if (result && result.term) {
                obj.total = getTotal(parsedBody, result.totalBoundingBox, result.term);
                var entity = entityCreator(result, obj.total);
                var resultData = Object.assign({}, receiptData, entity);
                resultData.state = 'complete';
                context.bindings.outputDocument = resultData;
            }
            
            context.done();
        })
        .catch(function (err) {
            context.log(err);
            context.done(err, {});
        });
    }
    // else {

    //     if(!receiptData.imageApproval ||  receiptData.imageApproval  != "complete") {
    //         throw "Please pass an image url for verification in the request body";
    //     }
    //     context.done();
    // }
};


function searchTerm(data) {
    
    var searchData = {
        totalBoundingBox: null,
        creditCardType: null,
        cardLast4: null,
        wordsInTitle: null,
        date: null
    };

    var currentLeft = Number.MAX_VALUE;
    var titleRegion = undefined;
    for (i in data.regions) {
        var region = data.regions[i];
        let [, left, ,] = region.boundingBox.split(',');
        if (parseInt(left) < currentLeft) {
            currentLeft = parseInt(left);
            titleRegion = region;
        }

        if (Object.keys(searchData).map(key => ({val: searchData[key]})).find(o => !o.val)) {
            searchInBoundingBoxLines(region, searchData);
        }
    }

    searchData.wordsInTitle = getStoreTitle(titleRegion);

    return searchData;
}

function getStoreTitle(region) {
    var words = []
    for (var i in region.lines) { 
        var line = region.lines[i];
        words = words.concat(line.words.map(w => w.text));
    }

    return { words, firstLine: region.lines.length > 0 &&  region.lines[0].words.map(w => w.text) };
}

var cards = ['MasterCard', 'Visa', 'Discover'];

function searchInBoundingBoxLines(boundingBoxLines, result) {
    for (var i in boundingBoxLines.lines) {
        var line = boundingBoxLines.lines[i];
        for (var j in line.words) {
            var word = line.words[j];
            var wordText = word.text.toLowerCase().trim();
            if (!result.totalBoundingBox) {
                if (wordText == 'amount:' || wordText == 'amount') {
                    result.totalBoundingBox = word.boundingBox;
                    result.term = word.text.toLowerCase().trim();
                } else if ((wordText == 'total:' || wordText == 'iotal:' || wordText == 'total' || wordText == 'iotal') && !result.term) {
                    result.totalBoundingBox = word.boundingBox;
                    result.term =  word.text.toLowerCase().trim();
                }

                if (wordText == 'amount' || wordText == 'total' || wordText == 'iotal') {
                    if (parseInt(j) + 1 < line.words.length && line.words[parseInt(j) + 1].text == ':'){
                        result.term += ':';
                    }
                }
            }

            if (!result.creditCardType) {
                var card = cards.find(card => wordText.indexOf(card.toLowerCase()) >= 0);
                if (card) {
                    result.creditCardType = card;
                }
            }

            if (!result.cardLast4) {
                if (wordText.indexOf('xxx') >= 0 || wordText.indexOf('***') >= 0) {
                    result.cardLast4 = word.text.substr(-4);
                }
            }

            if (!result.date) {
                const dateMatch = wordText.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
                result.date = dateMatch && dateMatch.input;
            }
            
        }

       if (!Object.keys(result).map(key => ({val: result[key]})).find(e => !e.val)){
           return result;
       }
    }

    return result;
}

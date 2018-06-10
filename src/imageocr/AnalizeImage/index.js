let request = require("requestretry");
let getTotal = require("./totalCalculator");
let entityCreator = require("./entityCreator");
let azure = require("azure-storage");

module.exports = function(context, receiptData) {
  context.log("------------- " + receiptData.image_url);
  context.log(context.bindingData.dequeueCount);
  console.log("----------------------");

  if (receiptData && receiptData.state == "pending") {
    var options = {
      uri: process.env["VisionApiUrl"] + "/ocr?language=unk&detectOrientation=true",
      method: "POST",
      qs: {
        visualFeatures: "Description"
      },
      headers: {
        "Ocp-Apim-Subscription-Key": process.env["VisionApiKey"],
        "Content-Type": "application/json"
      },
      body: { url: receiptData.image_url },
      json: true,
      fullResponse: false
    };

    request(options)
      .then(function(parsedBody) {
        context.log("********** ----");
        context.log(parsedBody);
        var result = searchTerm(parsedBody);
        var obj = {};
        if (result && result.term) {
          obj.total = getTotal(parsedBody, result.totalBoundingBox, result.term);
          var entity = entityCreator(result, obj.total);
          var resultData = Object.assign({}, receiptData, entity);
          resultData.state = "complete";
          context.bindings.outputDocument = resultData;

          let connectionString = process.env.AzureWebJobsStorage;
          let tableService = azure.createTableService(connectionString);
          tableService.replaceEntity("Payment", resultData, (error, result, response) => {
            let res = {
              statusCode: error ? 400 : 204,
              body: null
            };

            context.done(null, res);
          });
        }

        context.done();
      })
      .catch(function(err) {
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
  for (let region of data.regions) {
    let [, left, ,] = region.boundingBox.split(",");
    if (parseInt(left) < currentLeft) {
      currentLeft = parseInt(left);
      titleRegion = region;
    }

    if (
      Object.keys(searchData)
        .map(key => ({ val: searchData[key] }))
        .find(o => !o.val)
    ) {
      searchInBoundingBoxLines(region, searchData);
    }
  }

  searchData.wordsInTitle = getStoreTitle(titleRegion);

  return searchData;
}

function getStoreTitle(region) {
  var words = [];
  for (var i in region.lines) {
    var line = region.lines[i];
    words = words.concat(line.words.map(w => w.text));
  }

  return { words, firstLine: region.lines.length > 0 && region.lines[0].words.map(w => w.text) };
}

var cards = ["MasterCard", "Visa", "Discover"];

function searchInBoundingBoxLines(boundingBoxLines, result) {
  for (var i in boundingBoxLines.lines) {
    var line = boundingBoxLines.lines[i];
    for (var j in line.words) {
      var word = line.words[j];
      var wordText = word.text.toLowerCase().trim();
      if (wordText == "amount:" || wordText == "amount :" || wordText == "amount") {
        result.totalBoundingBox = word.boundingBox;
        result.term = word.text.toLowerCase().trim();
      }
      if (!result.totalBoundingBox) {
         if (
          (wordText == "total:" ||
            wordText == "total :" ||
            wordText == "iotal:" ||
            wordText == "total" ||
            wordText == "iotal") &&
          !result.term
        ) {
          result.totalBoundingBox = word.boundingBox;
          result.term = word.text.toLowerCase().trim();
        }

        if (wordText == "amount" || wordText == "total" || wordText == "iotal") {
          if (parseInt(j) + 1 < line.words.length && line.words[parseInt(j) + 1].text == ":") {
            result.term += ":";
          }
        }
      }

      if (!result.creditCardType || !result.cardLast4) {
        var card = cards.find(card => wordText.indexOf(card.toLowerCase()) >= 0);
        if (card && !result.creditCardType) {
          result.creditCardType = card;
        }

        if (card && !result.cardLast4) {
          if (parseInt(j) + 1 < line.words.length) {
            const afterCardText = line.words[parseInt(j) + 1].text;
            if (
              afterCardText.length == 4 &&  
              new RegExp('^\\d+$').test(afterCardText) &&
              parseInt(afterCardText) > 0
            ) {
              result.cardLast4 = afterCardText;
            }
          }

          if (!result.cardLast4  && parseInt(j) + 2 < line.words.length) {
            const afterCardText = line.words[parseInt(j) + 1].text.toLowerCase();
            const possibleNumber = line.words[parseInt(j) + 2].text;
            if (
              afterCardText.indexOf('credi') > -1 &&
              possibleNumber.length == 4 &&  
              new RegExp('^\\d+$').test(possibleNumber) &&
              parseInt(possibleNumber) > 0
            ) {
              result.cardLast4 = possibleNumber;
            }
          }
        }
      }

      if (!result.cardLast4) {
        if (wordText.indexOf("xxx") >= 0 || wordText.indexOf("***") >= 0) {
          result.cardLast4 = word.text.substr(-4);
        }
      }

      if (!result.date) {
        let dateMatch = wordText.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        
        if (dateMatch) {
          result.date = dateMatch.input;
        }
        else if(dateMatch =  wordText.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/)) {
          result.date = dateMatch.input;
        }
        else if (wordText == '2018'){
          if (j - 2 >= 0) {
            const time = Date.parse(line.words.map(w => w.text).slice(j - 2, j + 1).join(' '));
            if (isNaN(time)) {
              result.date = null;
            }

            const date = new Date(time);
            result.date =  ('0' + (date.getMonth() + 1)).slice(-2) + '/' + ('0' + date.getDate()).slice(-2)   + '/' + date.getFullYear();
          }
        }
        
      }
    }

    if (
      !Object.keys(result)
        .map(key => ({ val: result[key] }))
        .find(e => !e.val)
    ) {
      return result;
    }
  }

  return result;
}

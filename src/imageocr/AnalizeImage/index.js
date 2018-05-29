var request = require('requestretry');

module.exports = function (context, receiptData) {

    if(context.bindingData.dequeueCount > 2) {
        context.bindings.poisonedMessage = receiptData;
        context.done();
    }

    if (receiptData && (receiptData.status == 'pending')) {

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
            context.done();
        })
        .catch(function (err) {
            context.log(err);
            context.done(err, {});
        });
    }
    else {

        if(!receiptData.imageApproval ||  receiptData.imageApproval  != "complete") {
            throw "Please pass an image url for verification in the request body";
        }
        context.done();
    }
};
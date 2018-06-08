var uuidv4 = require("uuid/v4");

module.exports = function(context, req) {
  context.log("JavaScript HTTP trigger function processed a request.");

  if (req.body && req.body.name && req.body.image_name && req.body.state) {
    context.bindings.tableBinding = [];
    var obj = Object.assign(req.body, {
      PartitionKey: "Test",
      RowKey: req.body.image_name,
      state: "pending",
      image_url: req.body.image_url,
      name: req.body.name.trim()
    });

    context.bindings.tableBinding.push(obj);
   
    context.bindings.outputQueueItem = obj;

    context.res = {
      body: "Payment created"
    };

    // var outDoc = req.body;
    // outDoc.id = uuidv4();
    // outDoc.state = "pending";
    // outDoc.name = req.body.name.trim();
    // context.bindings.outputDocument = outDoc;
    // context.res = {
    //     // status: 200, /* Defaults to 200 */
    //     body: "Payment created"
    // };
  } else {
    context.res = {
      status: 400,
      body: "Please pass a valid payment in the request body"
    };
  }
  context.done();
};

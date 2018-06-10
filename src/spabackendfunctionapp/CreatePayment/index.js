
module.exports = function(context, req) {
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
  } else {
    context.res = {
      status: 400,
      body: "Please pass a valid payment in the request body"
    };
  }
  context.done();
};

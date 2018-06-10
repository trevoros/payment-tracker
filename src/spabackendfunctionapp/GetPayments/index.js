module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    context.log(`Http trigger state passed in: ${context.bindingData.state}`);
    console.log(context.bindings.tableBinding.length);
    if (context.bindings.tableBinding && context.bindings.tableBinding.length > 0) {
        context.res = {
            body: context.bindings.tableBinding
        };
    }
    else {
        context.res = {
            status: 404,
            body: "No payments found"
        };
    }
    context.done();
};
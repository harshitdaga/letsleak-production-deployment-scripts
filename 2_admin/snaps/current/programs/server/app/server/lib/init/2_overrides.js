(function(){// function to wrap methods with the provided preHooks / postHooks.
// Should correctly cascade the right value for `this`
App.wrapMethods = function (preHooks, postHooks, methods) {
    var wrappedMethods = {};
    // use `map` to loop, so that each iteration has a different context
    _.map(methods, function (method, methodName) {
        wrappedMethods[methodName] = makeFunction(method.length, function () {
            var i, j, returnValue;

            var len = preHooks.length;
            for (i = 0; i < len; i++) {
                preHooks[i].apply(this, arguments);
            }
            returnValue = method.apply(this, arguments);

            len = postHooks.length;
            for (i = 0; i < len; i++) {
                postHooks[i].apply(this, arguments);
            }

            return returnValue;
        });
    });
    return wrappedMethods;
};

// Meteor looks at each methods `.length` property (the number of arguments),
// no decent way to cheat it... so just generate a function with the required length
function makeFunction(length, fn) {
    switch (length) {
        case 0:
            return function () {
                return fn.apply(this, arguments);
            };
        case 1:
            return function (a) {
                return fn.apply(this, arguments);
            };
        case 2:
            return function (a, b) {
                return fn.apply(this, arguments);
            };
        case 3:
            return function (a, b, c) {
                return fn.apply(this, arguments);
            };
        default:
            throw new Error("Failed to make function with desired length: " + length)
    }
}

})();

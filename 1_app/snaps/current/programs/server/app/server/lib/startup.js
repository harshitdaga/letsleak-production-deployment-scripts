(function(){/**
 * Created by harshit on 03/08/14.
 */

Meteor.startup(function () {

    //logging at startup time
    var date = new Date();
    console.log("Server started up at " + date);
    if (App.extensions._isProduction()) {

        //browser policies

        /*
         Disallows inline Javascript.
         Calling this function results in an extra round-trip on page load to,
         retrieve Meteor runtime configuration that is usually part of an inline script tag.
         */
        //BrowserPolicy.content.disallowInlineScripts();

        //Your app will never render inside a frame or iframe.
        //BrowserPolicy.framing.disallow();

        //Disallows eval and related functions. The default policy already disallows eval.
        //BrowserPolicy.content.disallowEval();

        //causes the browser to disallow all <font> tags.
        //BrowserPolicy.content.disallowFont();

        //BrowserPolicy.content.allowOriginForAll("http://www.letsleak.com,http://letsleak.com,http://*.letsleak.com/*,http://*.googleapis.com/*,")
    }
    console.log(App.ProcessVariable);
});

})();

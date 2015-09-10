(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var WebApp = Package.webapp.WebApp;
var main = Package.webapp.main;
var WebAppInternals = Package.webapp.WebAppInternals;
var RoutePolicy = Package.routepolicy.RoutePolicy;
var _ = Package.underscore._;

(function () {

/////////////////////////////////////////////////////////////////////////////////////
//                                                                                 //
// packages/appcache/appcache-server.js                                            //
//                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////
                                                                                   //
var crypto = Npm.require('crypto');                                                // 1
var fs = Npm.require('fs');                                                        // 2
var path = Npm.require('path');                                                    // 3
                                                                                   // 4
Meteor.AppCache = {                                                                // 5
  config: function(options) {                                                      // 6
    _.each(options, function (value, option) {                                     // 7
      if (option === 'browsers') {                                                 // 8
        disabledBrowsers = {};                                                     // 9
        _.each(value, function (browser) {                                         // 10
          disabledBrowsers[browser] = false;                                       // 11
        });                                                                        // 12
      }                                                                            // 13
      else if (option === 'onlineOnly') {                                          // 14
        _.each(value, function (urlPrefix) {                                       // 15
          RoutePolicy.declare(urlPrefix, 'static-online');                         // 16
        });                                                                        // 17
      }                                                                            // 18
      else if (value === false) {                                                  // 19
        disabledBrowsers[option] = true;                                           // 20
      }                                                                            // 21
      else if (value === true) {                                                   // 22
        disabledBrowsers[option] = false;                                          // 23
      } else {                                                                     // 24
        throw new Error('Invalid AppCache config option: ' + option);              // 25
      }                                                                            // 26
    });                                                                            // 27
  }                                                                                // 28
};                                                                                 // 29
                                                                                   // 30
var disabledBrowsers = {};                                                         // 31
var browserDisabled = function(request) {                                          // 32
  return disabledBrowsers[request.browser.name];                                   // 33
};                                                                                 // 34
                                                                                   // 35
WebApp.addHtmlAttributeHook(function (request) {                                   // 36
  if (browserDisabled(request))                                                    // 37
    return null;                                                                   // 38
  else                                                                             // 39
    return { manifest: "/app.manifest" };                                          // 40
});                                                                                // 41
                                                                                   // 42
WebApp.connectHandlers.use(function(req, res, next) {                              // 43
  if (req.url !== '/app.manifest') {                                               // 44
    return next();                                                                 // 45
  }                                                                                // 46
                                                                                   // 47
  // Browsers will get confused if we unconditionally serve the                    // 48
  // manifest and then disable the app cache for that browser.  If                 // 49
  // the app cache had previously been enabled for a browser, it                   // 50
  // will continue to fetch the manifest as long as it's available,                // 51
  // even if we now are not including the manifest attribute in the                // 52
  // app HTML.  (Firefox for example will continue to display "this                // 53
  // website is asking to store data on your computer for offline                  // 54
  // use").  Returning a 404 gets the browser to really turn off the               // 55
  // app cache.                                                                    // 56
                                                                                   // 57
  if (browserDisabled(WebApp.categorizeRequest(req))) {                            // 58
    res.writeHead(404);                                                            // 59
    res.end();                                                                     // 60
    return;                                                                        // 61
  }                                                                                // 62
                                                                                   // 63
  var manifest = "CACHE MANIFEST\n\n";                                             // 64
                                                                                   // 65
  // After the browser has downloaded the app files from the server and            // 66
  // has populated the browser's application cache, the browser will               // 67
  // *only* connect to the server and reload the application if the                // 68
  // *contents* of the app manifest file has changed.                              // 69
  //                                                                               // 70
  // So to ensure that the client updates if client resources change,              // 71
  // include a hash of client resources in the manifest.                           // 72
                                                                                   // 73
  manifest += "# " + WebApp.clientHash + "\n";                                     // 74
                                                                                   // 75
  // When using the autoupdate package, also include                               // 76
  // AUTOUPDATE_VERSION.  Otherwise the client will get into an                    // 77
  // infinite loop of reloads when the browser doesn't fetch the new               // 78
  // app HTML which contains the new version, and autoupdate will                  // 79
  // reload again trying to get the new code.                                      // 80
                                                                                   // 81
  if (Package.autoupdate) {                                                        // 82
    var version = Package.autoupdate.Autoupdate.autoupdateVersion;                 // 83
    if (version !== WebApp.clientHash)                                             // 84
      manifest += "# " + version + "\n";                                           // 85
  }                                                                                // 86
                                                                                   // 87
  manifest += "\n";                                                                // 88
                                                                                   // 89
  manifest += "CACHE:" + "\n";                                                     // 90
  manifest += "/" + "\n";                                                          // 91
  _.each(WebApp.clientPrograms[WebApp.defaultArch].manifest, function (resource) { // 92
    if (resource.where === 'client' &&                                             // 93
        ! RoutePolicy.classify(resource.url)) {                                    // 94
      manifest += resource.url;                                                    // 95
      // If the resource is not already cacheable (has a query                     // 96
      // parameter, presumably with a hash or version of some sort),               // 97
      // put a version with a hash in the cache.                                   // 98
      //                                                                           // 99
      // Avoid putting a non-cacheable asset into the cache, otherwise             // 100
      // the user can't modify the asset until the cache headers                   // 101
      // expire.                                                                   // 102
      if (!resource.cacheable)                                                     // 103
        manifest += "?" + resource.hash;                                           // 104
                                                                                   // 105
      manifest += "\n";                                                            // 106
    }                                                                              // 107
  });                                                                              // 108
  manifest += "\n";                                                                // 109
                                                                                   // 110
  manifest += "FALLBACK:\n";                                                       // 111
  manifest += "/ /" + "\n";                                                        // 112
  // Add a fallback entry for each uncacheable asset we added above.               // 113
  //                                                                               // 114
  // This means requests for the bare url (/image.png instead of                   // 115
  // /image.png?hash) will work offline. Online, however, the browser              // 116
  // will send a request to the server. Users can remove this extra                // 117
  // request to the server and have the asset served from cache by                 // 118
  // specifying the full URL with hash in their code (manually, with               // 119
  // some sort of URL rewriting helper)                                            // 120
  _.each(WebApp.clientPrograms[WebApp.defaultArch].manifest, function (resource) { // 121
    if (resource.where === 'client' &&                                             // 122
        ! RoutePolicy.classify(resource.url) &&                                    // 123
        !resource.cacheable) {                                                     // 124
      manifest += resource.url + " " + resource.url +                              // 125
        "?" + resource.hash + "\n";                                                // 126
    }                                                                              // 127
  });                                                                              // 128
                                                                                   // 129
  manifest += "\n";                                                                // 130
                                                                                   // 131
  manifest += "NETWORK:\n";                                                        // 132
  // TODO adding the manifest file to NETWORK should be unnecessary?               // 133
  // Want more testing to be sure.                                                 // 134
  manifest += "/app.manifest" + "\n";                                              // 135
  _.each(                                                                          // 136
    [].concat(                                                                     // 137
      RoutePolicy.urlPrefixesFor('network'),                                       // 138
      RoutePolicy.urlPrefixesFor('static-online')                                  // 139
    ),                                                                             // 140
    function (urlPrefix) {                                                         // 141
      manifest += urlPrefix + "\n";                                                // 142
    }                                                                              // 143
  );                                                                               // 144
  manifest += "*" + "\n";                                                          // 145
                                                                                   // 146
  // content length needs to be based on bytes                                     // 147
  var body = new Buffer(manifest);                                                 // 148
                                                                                   // 149
  res.setHeader('Content-Type', 'text/cache-manifest');                            // 150
  res.setHeader('Content-Length', body.length);                                    // 151
  return res.end(body);                                                            // 152
});                                                                                // 153
                                                                                   // 154
var sizeCheck = function() {                                                       // 155
  var totalSize = 0;                                                               // 156
  _.each(WebApp.clientPrograms[WebApp.defaultArch].manifest, function (resource) { // 157
    if (resource.where === 'client' &&                                             // 158
        ! RoutePolicy.classify(resource.url)) {                                    // 159
      totalSize += resource.size;                                                  // 160
    }                                                                              // 161
  });                                                                              // 162
  if (totalSize > 5 * 1024 * 1024) {                                               // 163
    Meteor._debug(                                                                 // 164
      "** You are using the appcache package but the total size of the\n" +        // 165
      "** cached resources is " +                                                  // 166
      (totalSize / 1024 / 1024).toFixed(1) + "MB.\n" +                             // 167
      "**\n" +                                                                     // 168
      "** This is over the recommended maximum of 5 MB and may break your\n" +     // 169
      "** app in some browsers! See http://docs.meteor.com/#appcache\n" +          // 170
      "** for more information and fixes.\n"                                       // 171
    );                                                                             // 172
  }                                                                                // 173
};                                                                                 // 174
                                                                                   // 175
sizeCheck();                                                                       // 176
                                                                                   // 177
/////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.appcache = {};

})();

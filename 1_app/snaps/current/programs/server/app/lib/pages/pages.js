(function(){var Pages,
    __indexOf = [].indexOf || function (item) {
        for (var i = 0, l = this.length; i < l; i++) {
            if (i in this && this[i] === item)
                return i;
        }
        return -1;
    };

/*this.__Pages = */
Pages = (function () {
    Pages.prototype.availableSettings = {
        dataMargin: [Number, 3],
        divWrapper: [true, false],
        filters: [Object, {}],
        itemTemplate: [String, "_pagesItemDefault"],
        navShowEdges: [Boolean, false],
        navShowFirst: [Boolean, true],
        navShowLast: [Boolean, true],
        resetOnReload: [Boolean, false],
        paginationMargin: [Number, 3],
        perPage: [Number, 10],
        requestTimeout: [Number, 2],
        route: [String, "/page/"],
        router: [true, false],
        routerTemplate: [String, "pages"],
        sort: [Object, {}],
        fields: [Object, {}]
    };

    Pages.prototype.fastRender = false;

    Pages.prototype.infinite = false;

    Pages.prototype.infiniteItemsLimit = Infinity;

    Pages.prototype.infiniteTrigger = .8;

    Pages.prototype.infiniteRateLimit = 1;

    Pages.prototype.pageSizeLimit = 60;

    Pages.prototype.rateLimit = 1;

    Pages.prototype.homeRoute = "/";

    Pages.prototype.pageTemplate = "_pagesPageCont";

    Pages.prototype.navTemplate = "_pagesNavCont";

    Pages.prototype.table = false;

    Pages.prototype.tableItemTemplate = "_pagesTableItem";

    Pages.prototype.tableTemplate = "_pagesTable";

    Pages.prototype.templateName = false;

    Pages.prototype._ninstances = 0;

    Pages.prototype._currentPage = 1;

    Pages.prototype.collections = {};

    Pages.prototype.init = true;

    Pages.prototype.instances = {};

    Pages.prototype.subscriptions = [];

    Pages.prototype.currentSubscription = null;

    Pages.prototype.loadingTemplate = "_pagesLoading";

    Pages.prototype.methods = {
        "CountPages": function () {
            var _self = this;
            return Math.ceil(_self.Collection.find(_self.filters, {
                sort: _self.sort
            }).count() / _self.perPage);
        },
        "Set": function (k, v) {
            var _self = this;
            var changes, _k, _v;
            if (v == null) {
                v = void 0;
            }
            if (v != null) {
                changes = _self.set(k, v, false, true);
            } else {
                changes = 0;
                for (_k in k) {
                    _v = k[_k];
                    changes += _self.set(_k, _v, false, true);
                }
            }
            return changes;
        },
        "Unsubscribe": function () {
            var _self = this;
            var i, _results;
            _results = [];
            while (_self.subscriptions.length) {
                i = _self.subscriptions.shift();
                if (i == null) {
                    continue;
                }
                _results.push(i.stop());
            }
            return _results;
        }
    };

    function Pages(collection, settings) {
        var _self = this;
        if (!(_self instanceof Meteor.Pagination)) {
            throw "Please use the `new` constructor style " + (new Error).stack.split("\n")[2].trim();
        }
        _self.setCollection(collection);
        _self.setDefaults();
        _self.applySettings(settings);
        _self.setRouter();
        _self[(Meteor.isServer ? "server" : "client") + "Init"]();
        _self.registerInstance();
    }

    Pages.prototype.preloadData = function (key, value) {
        var _self = this;
        _self.PreloadedData.remove({
            _id: key
        });
        return _self.PreloadedData.insert({
            _id: key,
            v: value
        });
    };

    Pages.prototype.serverInit = function () {
        var self;
        this.setMethods();
        self = this;
        this.preloadData("totalPages", this.call("CountPages"));
        Meteor.publish(this.name, function (page) {
            return self.publish.call(self, page, this);
        });
        return Meteor.publish(this.name + "_data", function () {
            return self.PreloadedData.find();
        });
    };

    Pages.prototype.clientInit = function () {
        var _self = this;
        _self.requested = [];
        _self.received = [];
        _self.queue = [];
        _self.setTemplates();
        _self.countPages();
        if (_self.infinite) {
            _self.setInfiniteTrigger();
        }
        return _self.syncSettings((function (err, changes) {
            if (changes > 0) {
                return _self.reload();
            }
        }).bind(_self));
    };

    Pages.prototype.reload = function () {
        var _self = this;
        return _self.unsubscribe((function () {
            _self.requested = [];
            _self.received = [];
            _self.queue = [];
            return _self.call("CountPages", (function (e, total) {
                var p;
                _self.sess("totalPages", total);
                p = _self.currentPage();
                if ((p == null) || _self.resetOnReload || p > total) {
                    p = 1;
                }
                _self.sess("currentPage", false);
                return _self.sess("currentPage", p);
            }).bind(_self));
        }).bind(_self));
    };

    Pages.prototype.unsubscribe = function (cb) {
        var _self = this;
        return _self.call("Unsubscribe", (function () {
            if (cb != null) {
                return cb();
            }
        }).bind(_self));
    };

    Pages.prototype.setDefaults = function () {
        var k, v, _ref, _results;
        var _self = this;
        _ref = _self.availableSettings;
        _results = [];
        for (k in _ref) {
            v = _ref[k];
            if (v[1] != null) {
                _results.push(_self[k] = v[1]);
            } else {
                _results.push(void 0);
            }
        }
        return _results;
    };

    Pages.prototype.applySettings = function (settings) {
        var key, value, _results;
        var _self = this;
        _results = [];
        for (key in settings) {
            value = settings[key];
            _results.push(_self.set(key, value, false, true));
        }
        return _results;
    };

    Pages.prototype.syncSettings = function (cb) {
        var S, k;
        S = {};
        var _self = this;
        for (k in _self.availableSettings) {
            S[k] = _self[k];
        }
        return _self.set(S, void 0, true, false, cb.bind(_self));
    };

    Pages.prototype.setMethods = function () {
        var f, n, nm, _ref;
        nm = {};
        _ref = this.methods;
        for (n in _ref) {
            f = _ref[n];
            nm[this.id + n] = f.bind(this);
        }
        this.methods = nm;
        return Meteor.methods(this.methods);
    };

    Pages.prototype.getMethod = function (name) {
        return this.id + name;
    };

    Pages.prototype.call = function (method, cb) {
        var _self = this;
        cb = typeof cb === "function" ? cb.bind(_self) : null;
        return Meteor.call(_self.getMethod(method), cb);
    };

    Pages.prototype.sess = function (k, v) {
        var _self = this;
        k = "" + _self.id + "." + k;
        if (v != null) {
            return Session.set(k, v);
        } else {
            return Session.get(k);
        }
    };

    Pages.prototype.set = function (k, v, onServer, init, cb) {
        var _self = this;
        var changes, _k, _v;
        if (v == null) {
            v = void 0;
        }
        if (onServer == null) {
            onServer = true;
        }
        if (init == null) {
            init = false;
        }
        if (cb != null) {
            cb = cb.bind(_self);
        } else {
            cb = _self.reload.bind(_self);
        }
        if (Meteor.isClient && onServer) {
            _self.call("Set", k, v, cb);
        }
        if (v != null) {
            changes = _self._set(k, v, init);
        } else {
            changes = 0;
            for (_k in k) {
                _v = k[_k];
                changes += _self._set(_k, _v, init);
            }
        }
        return changes;
    };

    Pages.prototype._set = function (k, v, init) {
        var ch;
        var _self = this;
        if (init == null) {
            init = false;
        }
        ch = 0;
        if (init || k in _self.availableSettings) {
            if ((_self.availableSettings[k] != null) && _self.availableSettings[k][0] !== true) {
                check(v, _self.availableSettings[k][0]);
            }
            if (JSON.stringify(_self[k]) !== JSON.stringify(v)) {
                ch = 1;
            }
            _self[k] = v;
        } else {
            new Meteor.Error(400, "Setting not available.");
        }
        return ch;
    };

    Pages.prototype.setId = function (name) {
        var n;
        var _self = this;
        if (_self.templateName) {
            name = _self.templateName;
        }
        if (name in Pages.prototype.instances) {
            n = name.match(/[0-9]+$/);
            if (n != null) {
                name = name.slice(0, +n[0].length + 1 || 9e9) + parseInt(n) + 1;
            } else {
                name = name + "2";
            }
        }
        _self.id = "pages_" + name;
        return _self.name = name;
    };

    Pages.prototype.registerInstance = function () {
        var _self = this;
        Pages.prototype._ninstances++;
        return Pages.prototype.instances[_self.name] = _self;
    };

    Pages.prototype.setCollection = function (collection) {
        var e, isNew;
        var _self = this;
        if (typeof collection === 'object') {
            Pages.prototype.collections[collection._name] = collection;
            _self.Collection = collection;
        } else {
            isNew = true;
            try {
                _self.Collection = new Meteor.Collection(collection);
                Pages.prototype.collections[_self.name] = _self.Collection;
            } catch (_error) {
                e = _error;
                isNew = false;
                _self.Collection = Pages.prototype.collections[_self.name];
                _self.Collection instanceof Meteor.Collection || (function () {
                    throw "The '" + collection + "' collection was created outside of <Meteor.Pagination>. Pass the collection object instead of the collection's name to the <Meteor.Pagination> constructor.";
                })();
            }
        }
        _self.setId(_self.Collection._name);
        _self.PaginatedCollection = new Meteor.Collection(_self.id);
        return _self.PreloadedData = new Meteor.Collection(_self.id + "_data");
    };

    Pages.prototype.setRouter = function () {
        var init, pr, self, t;
        var _self = this;
        if (_self.router === "iron-router") {
            pr = "" + _self.route + ":n";
            t = _self.routerTemplate;
            self = _self;
            init = true;
            Router.map(function () {
                if (self.homeRoute) {
                    _self.route("home", {
                        path: self.homeRoute,
                        template: t,
                        onBeforeAction: function () {
                            self.sess("oldPage", 1);
                            return self.sess("currentPage", 1);
                        }
                    });
                }
                if (!self.infinite) {
                    return _self.route("page", {
                        path: pr,
                        template: t,
                        onBeforeAction: function () {
                            return self.onNavClick(parseInt(_self.params.n));
                        }
                    });
                }
            });
            if (Meteor.isServer && _self.fastRender) {
                self = _self;
                FastRender.route("" + _self.route + ":n", function (params) {
                    _self.subscribe(self.name + "_data");
                    return _self.subscribe(self.name, parseInt(params.n));
                });
                return FastRender.route(_self.homeRoute, function () {
                    _self.subscribe(self.name + "_data");
                    return _self.subscribe(self.name, 1);
                });
            }
        }
    };

    Pages.prototype.setPerPage = function () {
        var _self = this;
        return _self.perPage = _self.pageSizeLimit < _self.perPage ? _self.pageSizeLimit : _self.perPage;
    };

    Pages.prototype.setTemplates = function () {
        var i, name, _i, _len, _ref;
        var _self = this;
        name = _self.templateName || _self.name;
        if (_self.table && _self.itemTemplate === "_pagesItemDefault") {
            _self.itemTemplate = _self.tableItemTemplate;
        }
        _ref = [_self.navTemplate, _self.pageTemplate, _self.itemTemplate, _self.tableTemplate];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            i = _ref[_i];
            Template[i].pagesData = _self;
        }
        return _.extend(Template[name], {
            pagesData: _self,
            pagesNav: Template[_self.navTemplate],
            pages: Template[_self.pageTemplate]
        });
    };

    Pages.prototype.countPages = function () {
        var _self = this;
        return _self.call("CountPages", (function (e, r) {
            return _self.sess("totalPages", r);
        }).bind(_self));
    };

    Pages.prototype.publish = function (page, subscription) {
        var c, handle, init, n, self, skip;
        var _self = this;
        _self.setPerPage();
        skip = (page - 1) * _self.perPage;
        if (skip < 0) {
            skip = 0;
        }
        init = true;
        c = _self.Collection.find(_self.filters, {
            sort: _self.sort,
            fields: _self.fields,
            skip: skip,
            limit: _self.perPage
        });
        self = _self;
        handle = _self.Collection.find().observeChanges({
            changed: (function (subscription, id, fields) {
                var e;
                try {
                    return subscription.changed(_self.id, id, fields);
                } catch (_error) {
                    e = _error;
                }
            }).bind(_self, subscription),
            added: (function (subscription, id, fields) {
                var e;
                try {
                    if (!init) {
                        return subscription.added(_self.id, id, fields);
                    }
                } catch (_error) {
                    e = _error;
                }
            }).bind(_self, subscription),
            removed: (function (subscription, id) {
                var e;
                try {
                    return subscription.removed(_self.id, id);
                } catch (_error) {
                    e = _error;
                }
            }).bind(_self, subscription)
        });
        n = 0;
        c.forEach((function (doc, index, cursor) {
            n++;
            doc["_" + _self.id + "_p"] = page;
            doc["_" + _self.id + "_i"] = index;
            return subscription.added(_self.id, doc._id, doc);
        }).bind(_self));
        init = false;
        subscription.onStop(function () {
            return handle.stop();
        });
        _self.ready();
        _self.subscriptions.push(subscription);
        return c;
    };

    Pages.prototype.loading = function (p) {
        var _self = this;
        if (!_self.fastRender && p === _self.currentPage() && (typeof Session !== "undefined" && Session !== null)) {
            return _self.sess("ready", false);
        }
    };

    Pages.prototype.now = function () {
        return (new Date()).getTime();
    };

    Pages.prototype.log = function (msg) {
        var _self = this;
        return console.log("" + _self.name + " " + msg);
    };

    Pages.prototype.logRequest = function (p) {
        var _self = this;
        _self.timeLastRequest = _self.now();
        _self.loading(p);
        if (__indexOf.call(_self.requested, p) < 0) {
            return _self.requested.push(p);
        }
    };

    Pages.prototype.logResponse = function (p) {
        var _self = this;
        if (__indexOf.call(_self.received, p) < 0) {
            return _self.received.push(p);
        }
    };

    Pages.prototype.clearQueue = function () {
        var _self = this;
        return _self.queue = [];
    };

    Pages.prototype.neighbors = function (page) {
        var d, np, pp, _i, _ref;
        var _self = this;
        _self.n = [page];
        if (_self.dataMargin === 0) {
            return _self.n;
        }
        for (d = _i = 1, _ref = _self.dataMargin; 1 <= _ref ? _i <= _ref : _i >= _ref; d = 1 <= _ref ? ++_i : --_i) {
            np = page + d;
            if (np <= _self.sess("totalPages")) {
                _self.n.push(np);
            }
            pp = page - d;
            if (pp > 0) {
                _self.n.push(pp);
            }
        }
        return _self.n;
    };

    Pages.prototype.paginationNavItem = function (label, page, disabled, active) {
        if (active == null) {
            active = false;
        }
        return {
            p: label,
            n: page,
            active: active ? "active" : "",
            disabled: disabled ? "disabled" : ""
        };
    };

    Pages.prototype.paginationNeighbors = function () {
        var from, i, k, n, p, page, to, total, _i, _j, _len;
        var _self = this;
        page = _self.currentPage();
        total = _self.sess("totalPages");
        from = page - _self.paginationMargin;
        to = page + _self.paginationMargin;
        if (from < 1) {
            to += 1 - from;
            from = 1;
        }
        if (to > total) {
            from -= to - total;
            to = total;
        }
        if (from < 1) {
            from = 1;
        }
        if (to > total) {
            to = total;
        }
        n = [];
        if (_self.navShowFirst || _self.navShowEdges) {
            n.push(_self.paginationNavItem("«", 1, page === 1));
        }
        n.push(_self.paginationNavItem("<", page - 1, page === 1));
        for (p = _i = from; from <= to ? _i <= to : _i >= to; p = from <= to ? ++_i : --_i) {
            n.push(_self.paginationNavItem(p, p, page > total, p === page));
        }
        n.push(_self.paginationNavItem(">", page + 1, page >= total));
        if (_self.navShowLast || _self.navShowEdges) {
            n.push(_self.paginationNavItem("»", total, page >= total));
        }
        for (k = _j = 0, _len = n.length; _j < _len; k = ++_j) {
            i = n[k];
            n[k]['_p'] = _self;
        }
        return n;
    };

    Pages.prototype.onNavClick = function (n) {
        var _self = this;
        if (n <= _self.sess("totalPages") && n > 0) {
            Deps.nonreactive((function () {
                return _self.sess("oldPage", _self.sess("currentPage"));
            }).bind(_self));
            return _self.sess("currentPage", n);
        }
    };

    Pages.prototype.setInfiniteTrigger = function () {
        var _self = this;
        return window.onscroll = (_.throttle(function () {
            var self = this;

            var liObj = $("#pageCont li");
            var len = liObj.length;
            var elem = liObj[len - 1];

            if (verge.inViewport(elem, 500)) {
                //console.log("inViewPort");
                var currentCollection = undefined;
                _.each(Meteor.Pagination.prototype.instances, function (item) {
                    //console.log(item.homeRoute + " : " + Router.current().path);
                    if (_.isEqual(item.homeRoute, Router.current().path)) {
                        //console.log(item.homeRoute + " === " + Router.current().path);
                        currentCollection = item;
                    }

                });
                if (currentCollection) {
                    if (currentCollection.lastPage < currentCollection.sess("totalPages")) {
                        return currentCollection.sess("currentPage", currentCollection.lastPage + 1);
                    }
                }
            } else {
                return;
            }

            /*var l, oh, t;
             t = self.infiniteTrigger;
             oh = document.body.offsetHeight;
             if (t > 1) {
             l = oh - t;
             } else if (t > 0) {
             l = oh * t;
             } else {
             return;
             }
             if ((window.innerHeight + window.scrollY) >= l) {
             var currentCollection = undefined;
             _.each(Meteor.Pagination.prototype.instances,function(item) {
             //console.log(item.homeRoute + " : " + Router.current().path);
             if( _.isEqual(item.homeRoute,Router.current().path ) ){
             //console.log(item.homeRoute + " === " + Router.current().path);
             currentCollection =  item;
             }

             });
             if (currentCollection) {
             if(currentCollection.lastPage < currentCollection.sess("totalPages")) {
             return currentCollection.sess("currentPage", currentCollection.lastPage + 1);
             }
             }
             }*/
        }, _self.infiniteRateLimit * 1000)).bind(_self);
    };

    Pages.prototype.checkQueue = function () {
        var i;
        var _self = this;
        if (_self.queue.length) {
            while (!(__indexOf.call(_self.neighbors(_self.currentPage()), i) >= 0 || !_self.queue.length)) {
                i = _self.queue.shift();
            }
            if (__indexOf.call(_self.neighbors(_self.currentPage()), i) >= 0) {
                return _self.requestPage(i);
            }
        }
    };

    Pages.prototype.currentPage = function () {
        var _self = this;
        if (Meteor.isClient && (_self.sess("currentPage") != null)) {
            return _self.sess("currentPage");
        } else {
            return _self._currentPage;
        }
    };

    Pages.prototype.isReady = function () {
        var _self = this;
        return _self.sess("ready");
    };

    Pages.prototype.ready = function (p) {
        var _self = this;
        if (p === true || p === _self.currentPage() && (typeof Session !== "undefined" && Session !== null)) {
            return _self.sess("ready", true);
        }
    };

    Pages.prototype.checkInitPage = function () {
        var _self = this;
        var m, p;
        _self.init = false;
        m = location.pathname.match(new RegExp("" + _self.route + "([0-9]+)"));
        if (m) {
            p = parseInt(m[1]);
        } else if (location.pathname === _self.homeRoute) {
            p = 1;
        } else {
            return;
        }
        _self.sess("oldPage", p);
        return _self.sess("currentPage", p);
    };

    Pages.prototype.getPage = function (page) {
        var c, n, p, total, _i, _len, _ref;
        var _self = this;
        if (Meteor.isClient) {
            if (page == null) {
                page = _self.currentPage();
            }
            page = parseInt(page);
            if (page === NaN) {
                return;
            }
            total = _self.sess("totalPages");
            if (total === 0) {
                return _self.ready(true);
            }
            if (page <= total) {
                _ref = _self.neighbors(page);
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    p = _ref[_i];
                    if (__indexOf.call(_self.received, p) < 0) {
                        _self.requestPage(p);
                    }
                }
            }
            if (_self.infinite) {
                n = _self.PaginatedCollection.find({}, {
                    fields: _self.fields,
                    sort: _self.sort
                }).count();
                c = _self.PaginatedCollection.find({}, {
                    fields: _self.fields,
                    sort: _self.sort,
                    skip: _self.infiniteItemsLimit !== Infinity && n > _self.infiniteItemsLimit ? n - _self.infiniteItemsLimit : 0,
                    limit: _self.infiniteItemsLimit
                }).fetch();
            } else {
                c = _self.PaginatedCollection.find(_.object([
                    ["_" + _self.id + "_p", page]
                ]), {
                    fields: _self.fields
                }).fetch();
            }
            return c;
        }
    };

    Pages.prototype.requestPage = function (page) {
        var _self = this;
        if (__indexOf.call(_self.requested, page) >= 0) {
            return;
        }
        if (page === _self.currentPage()) {
            _self.clearQueue();
        }
        _self.queue.push(page);
        _self.logRequest(page);
        return Meteor.defer((function (page) {
            return _self.subscriptions[page] = Meteor.subscribe(_self.name, page, {
                onReady: (function (page) {
                    return _self.onPage(page);
                }).bind(_self, page),
                onError: (function (e) {
                    return new Meteor.Error(e.message);
                }).bind(_self)
            });
        }).bind(_self, page));
    };

    Pages.prototype.onPage = function (page) {
        var _self = this;
        _self.logResponse(page);
        _self.ready(page);
        if (_self.infinite) {
            _self.lastPage = page;
        }
        return _self.checkQueue();
    };

    return Pages;

})();

Meteor.Pagination = Pages;

})();

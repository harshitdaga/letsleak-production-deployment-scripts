(function(){/*****************************************************************************/
/* Client and Server Routes */
/*****************************************************************************/
Router.configure({
    layoutTemplate: 'MasterLayout',
    loadingTemplate: 'Loading',
    notFoundTemplate: 'NotFound',
    templateNameConverter: 'upperCamelCase',
    routeControllerNameConverter: 'upperCamelCase'
});

Router.map(function () {
    this.route('index', {
        path: '/',
        title : 'Admin'
    });

    this.route('home', {
        path: '/home',
        title: "Admin Home",
        headerId: "home"
    });

    this.route('account.invitation', {
        path: '/home/invitation/account',
        title: 'Pending Account Invitation',
        headerId: "pendingAccountInvitation"
    });

    this.route('promo', {
        path: '/home/promo',
        title: 'Admin Promo Mails',
        headerId: "promo"
    });
    this.route('report.abuse', {
        path: '/home/reportAbuse',
        title : "Report Abuse",
        headerId : "reportAbuse"
    });
    this.route('filter', {
        path: '/home/filter',
        title : 'Filter',
        headerId : 'filter'
    });
    this.route('mail', {
        path: '/home/mail',
        title : "Mails",
        headerId : "mail"
    });
    this.route('account.stats', {
        path: '/home/stats/account',
        title : "Account Stats",
        headerId: "statsAccount"
    });
    this.route('message.stats', {
        path: '/home/stats/message',
        title : "Message Stats"
    });
});

Router.onBeforeAction(function () {
    var self = this;
    App.extensions._addTitle(self.route.options.title);
});

Router.onBeforeAction(function () {
    if (!App.extensions._isLoggedIn()) {
        App.extensions._logout();
    }
}, {except: ['index']});


Router.onAfterAction(function () {
    var self = this;
    App.extensions._addActiveHeader(self.route.options.headerId);
});

})();

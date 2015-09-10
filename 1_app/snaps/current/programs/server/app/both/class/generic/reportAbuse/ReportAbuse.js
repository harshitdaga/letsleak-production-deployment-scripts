(function(){function ReportAbuse() {
}

ReportAbuse.prototype = {
    constructor: ReportAbuse,
    reports: {
        "R_1": {
            code: 'R_1',
            message: "Someones name is explicity mentioned."
        },
        "R_2": {
            code: 'R_2',
            message: "Sexually explicit content."
        },
        "R_3": {
            code: 'R_3',
            message: "Violence or harmful behaviour or hate speech."
        },
        "R_4" : {
            code : "R_4",
            message: "It is bullying a person."
        },
        "R_5" : {
            code : "R_5",
            message: "This is spam."
        },
//        "R_OTHER" : {
//            code : "R_OTHER",
//            message: "Please mention your reason for reporting this post."
//        }
    },

    getReportOptions: function () {
        var tmpArray = [] , index = 0;
        _.each(AppClass.ReportAbuse.reports, function (item) {
            tmpArray[index] = item;
            index++;
        });
        return tmpArray;
    },

    getMessage: function (abuseCode) {
        var message = this.reports[abuseCode];
        return _.isUndefined(message) ? message : message.message;
    }
};

_.extend(AppClass, {
    ReportAbuse: new ReportAbuse()
});

})();

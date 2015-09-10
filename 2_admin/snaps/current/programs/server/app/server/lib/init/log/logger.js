(function(){var winston = Npm.require('winston');
var config = {
    levels: {
        info: 1,
        warn : 2,
        debug: 3,
        error: 4
    },
    colors: {
        info: 'green',
        warn: 'yellow',
        debug: 'blue',
        error: 'red'
    }
};
var path = process.env.PWD + "/logs/";
console.log("logPath:" + path);

winston.setLevels(config.levels);
winston.addColors(config.colors);
//winston.remove(winston.transports.Console);


winston.add(winston.transports.File, {
    filename: path + 'exceptions.log',
    handleExceptions: true
});

function createLoggerCategory(name, fileName) {
    winston.loggers.add(name, {
        file: {
            filename: path + fileName,
            //json:false,
            colorize: true,
            timestamp: function () {
                var date = new Date;
                var month = date.getMonth() + 1;
                //dd/mm-h:m:s
                return date.getDate() + "/" + month + "-" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
            }
        },
        console: {
            level: config.levels.error,
            colorize: true
        }
    }).setLevels(config.levels);
}

createLoggerCategory('exception_logger', 'exception.log');
createLoggerCategory('account_invitation_logger', 'account_invitation.log');
createLoggerCategory('promo_logger', 'promo_logger.log');
createLoggerCategory('email_logger', 'email.log');
createLoggerCategory('filter_logger', 'filter.log');
createLoggerCategory('stats_logger', 'stats.log');

function Log() {
    this.exception_logger = winston.loggers.get("exception_logger");
}

Log.prototype = {
    constructor: Log,
    getLogger: function (loggerName) {
        if (loggerName != undefined && loggerName.length > 0) {
            return new CustomeWinstonLogger(loggerName);
        }
        return undefined;

    },

    loggerName: {
        ACCOUNT_INVITE: "account_invitation_logger",
        PROMO : "promo_logger",
        EMAIL : "email_logger",
        FILTER : "filter_logger",
        STATS : "stats_logger"
    }
};

function CustomeWinstonLogger (loggerName){
    this.loggerName = loggerName.toLowerCase();
    this.winstonLogger = winston.loggers.get(this.loggerName);
}

CustomeWinstonLogger.prototype = {
    constructor: CustomeWinstonLogger,
    info: function (p1, p2) {
        this.winstonLogger.info(p1, p2);
    },
    debug: function (p1, p2) {
        if (!App.extensions._isProduction()) {
         this.winstonLogger.debug(p1, p2);
        }
    },
    error: function (p1, p2) {
        this.winstonLogger.error(p1, p2);
    }
};

AppLogger = new Log();

})();

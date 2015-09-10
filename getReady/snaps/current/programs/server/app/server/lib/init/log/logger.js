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

createLoggerCategory('default_logger', 'default.log');
createLoggerCategory('db_exception_logger', 'db_exception.log');
createLoggerCategory('exception_logger', 'exception.log');
createLoggerCategory('interceptor_logger', 'interceptor.log');

createLoggerCategory('index_logger', 'index.log');
createLoggerCategory('account_logger', 'account.log');
createLoggerCategory('forgot_password_logger', 'forgot_password.log');
createLoggerCategory('home_logger', 'home.log');
createLoggerCategory('status_logger', 'status.log');
createLoggerCategory('bucket_logger', 'bucket.log');
createLoggerCategory('report_abuse_logger', 'report_abuse.log');
createLoggerCategory('notification_logger', 'notification.log');

createLoggerCategory('index_dao_logger', 'index_dao.log');
createLoggerCategory('account_dao_logger', 'account_dao.log');
createLoggerCategory('status_dao_logger', 'status_dao.log');
createLoggerCategory('bucket_dao_logger', 'bucket_dao.log');
createLoggerCategory('notification_dao_logger', 'notification_dao.log');
createLoggerCategory('report_abuse_dao_logger', 'report_abuse_dao.log');

createLoggerCategory('report_problem_logger', 'report_problem.log');
createLoggerCategory('report_problem_dao_logger', 'report_problem_dao.log');

function Log() {
    this.default_logger = winston.loggers.get("default_logger");
    this.db_exception_logger = winston.loggers.get("db_exception_logger");
    this.exception_logger = winston.loggers.get("exception_logger");
    this.interceptor_logger = winston.loggers.get("interceptor_logger");
}

Log.prototype = {
    constructor: Log,
    getLogger: function (loggerName) {
        /*if (loggerName != undefined && loggerName.length > 0) {
         var logger = loggerName.toLowerCase();
         return winston.loggers.get(logger);
         }
         return undefined;*/
        if (loggerName != undefined && loggerName.length > 0) {
            return new CustomeWinstonLogger(loggerName);
        }
        return undefined;

    },

    loggerName: {
        INDEX_LOGGER: "index_logger",
        ACCOUNT_LOGGER: "account_logger",
        LOGIN_LOGGER: "login_logger",
        FORGOT_PASSWORD_LOGGER: "forgot_password_logger",
        HOME_LOGGER: "home_logger",
        STATUS_LOGGER: "status_logger",
        BUCKET_LOGGER: "bucket_logger",
        REPORT_ABUSE_LOGGER: "report_abuse_logger",
        NOTIFICATION_LOGGER: "notification_logger",

        INDEX_DAO_LOGGER: "index_dao_logger",
        ACCOUNT_DAO_LOGGER: "account_dao_logger",
        STATUS_DAO_LOGGER: "status_dao_logger",
        BUCKET_DAO_LOGGER: "bucket_dao_logger",
        NOTIFICATION_DAO_LOGGER : "notification_dao_logger",
        REPORT_ABUSE_DAO_LOGGER: "report_abuse_dao_logger",

        REPORT_PROBLEM_LOGGER : "report_problem_logger",
        REPORT_PROBLEM_DAO_LOGGER : "report_problem_dao_logger"
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

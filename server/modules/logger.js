var fs = require("node:fs");
class Logger {
    static #OUTPUT_FILE_LOCATION = "./output.log";

    static VERBOSE = "VERBOSE";
    static STANDARD = "STANDARD";
    static NONE = "NONE";

    static #LEVELS = [ "NONE", Logger.STANDARD, Logger.VERBOSE ];
    static #OUTPUT_LEVEL = Logger.STANDARD;

    /**
     * Output something
     * @param {String} text The text you want to log
     * @param {String} location The location from which this is called
     * @param {String} level The output level needed to view this output
     */
    static log(text, location, level = Logger.STANDARD) {
        if (text == undefined) throw "[Logger::log] Logger must have text input";
        if (Logger.#LEVELS.indexOf(level) <= Logger.#LEVELS.indexOf(Logger.#OUTPUT_LEVEL)) {
            if (location != undefined) {
                console.log("[%s] %s", location, text);
            } else {
                console.log(text);
            }
        }

        fs.appendFileSync(Logger.#OUTPUT_FILE_LOCATION, (location == undefined ? "" : `[${location}] `) + `${text}\n`);
    }

    static setOutputLocation(location) {
        if (!fs.existsSync(location)) throw `[Logger::setOutputLocation] Location (${location}) doesn't exist`;
        Logger.#OUTPUT_FILE_LOCATION = location;
    }

    static setOutputLevel(level) {
        Logger.#OUTPUT_LEVEL = level;
    }
}

module.exports = {
    Logger
}
const {DebugOn} = require("../config/ServerConfig");

const TAG='ServerUtils.js';

function log(...text) {
    printLog(TAG, ...text);
}

function logErr(...text) {
    printError(TAG, ...text);
}

function printLog(...logs) {
    if (DebugOn) console.log(...logs);
}

function printError(...logs) {
    if (DebugOn) console.error(...logs);
}

module.exports = {
    printLog,
    printError,

}

const {
    DebugOn, IsProd,
} = require("../config/ServerConfig");
const fs = require("fs");
const path = require("path");

const TAG = "ServerUtils";
const PUBLIC_DIR = getDir(__dirname, '..') + "/public";


//====================================Node function start============================================
function getDir(currDir = __dirname, dirName) {
    return path.join(currDir, dirName);

}

function storeJsonDataInTempFile(jsonData) {
    if (!IsProd) {
        writeFile({
            file: `${PUBLIC_DIR}/test/temp.json`, data: jsonToStr(jsonData, 4),
        });
    }
}

function sendResponse({
                          res, msg, success = undefined, errorMsg = null, data = null, print = true, printCharLimit = 1000, code = null, ...rest
                      }) {
    let resData = {}
    if (checkNull(res, "")) {
        resData = {message: !isStr(msg) ? jsonToStr(msg) : msg};
        if (isBoolTrue(success) || !isBoolTrue(success)) {
            resData.success = success;
        }
        if (checkNullStr(code)) {
            resData.code = code;
        }
        if (checkNull(data)) {
            resData.data = data;
        }
        if (checkNullStr(errorMsg)) {
            resData.error = errorMsg;
        }
        resData = {
            ...resData, ...rest,
        };
        res.send(resData);


        if (isBoolTrue(print)) {
            if (checkNull(errorMsg)) {
                // printError("sendResponse().errorMsg", errorMsg);
            }
            // printError("sendResponse()", resData);
            // printError("sendResponse()", limitStringWords(jsonToStr(resData), printCharLimit, ''));
            printLog("sendResponse: Respond sent successfully",);
        }
    } else {
        printError("sendResponse: 'res' is empty!",);
    }
}


function writeFile({file, data, append = false, newLine = true, options = "utf8", create = true, sync = false}) {
    if (create === true) {
        createFile({file: file})
    }

    if (append === true || append === "true") {
        fs.readFile(file, options, (err, readData) => {
            if (err) throw err;
            writeSimpleStringInFile({file: file, data: readData + ((newLine === true || newLine === "true") ? "\n" : "") + data, sync: sync})
        });
    } else {
        writeSimpleStringInFile({file: file, data: data, sync: sync})
    }

}

function createFile({file, mode = 'w'}) {
    fs.open(file, mode, (err, file) => {
        if (err) {
            return err;
        } else {
            printLog('Saved!');
            return file
        }
    });
}

function writeSimpleStringInFile({file, data = '', sync = false}) {
    if (isBoolTrue(sync)) {
        fs.writeFileSync(file, data, err => {
            if (err) {
                printError(err)
                return err
            } else {
                return true
            }
        })
    } else {
        fs.writeFile(file, data, err => {
            if (err) {
                printError(err)
                return err
            } else {
                return true
            }
        })
    }
}

/**
 * Checks if a file exists and is a regular file (not a directory).
 * @param {string} filePath - The path to the file to check.
 * @returns {boolean} True if the file exists and is a regular file, otherwise false.
 *
 * @example
 * const exists = isFile('/path/to/file.txt');
 * console.log(exists); // Output: true or false
 */
function isFile(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return stats.isFile();
    } catch (error) {
        return false;
    }
}


//====================================Node function end============================================
function dateToTimestamp(date = new Date(), defValue = 0) {
    try {
        let timestamp;
        if (typeof date === 'string') {
            // Parse the input string to create a Date object
            const parsedDate = new Date(date);
            // Check if the parsedDate is valid
            if (isNaN(parsedDate)) {
                // throw new Error('Invalid date string');
                return null;
            }
            // Calculate the timestamp
            timestamp = Math.floor(parsedDate.getTime() / 1000);
        } else if (date instanceof Date) {
            // If the input is a Date object, calculate the timestamp
            timestamp = Math.floor(date.getTime() / 1000);
        } else {
            // Throw an error for invalid input
            // throw new Error('Invalid date');
            return defValue;
        }
        return Number.isNaN(timestamp) ? defValue : timestamp;
    } catch (error) {
        console.error(error);
        return defValue;
    }
}

/**
 * Returns true if the object is not null and not undefined.
 */
function checkNull(obj, checkExtra = null) {
    return obj !== undefined && obj + "" !== 'undefined' && obj !== null && obj + "" !== 'null' && (obj + "").toLowerCase() !== 'nan' && obj !== checkExtra
}


/**
 * Returns true if the json-object is not null and not undefined and size is also not empty.
 */

function checkNullJson(obj, dropEmpty = false) {
    try {
        if (isBoolTrue(dropEmpty)) {
            obj = dropJsonNullValues(obj);
        }
        return Object.keys(obj).length > 0;
        // let objX = obj;
        // if (isBoolTrue(dropEmpty)) {
        //     objX = dropJsonNullValues(objX);
        // }
        // return Object.keys(objX).length > 0;
    } catch (e) {
        return false;
    }
}


/**
 * Returns true if the object is not null and not undefined.
 */
function checkNullStr(obj, trim = true) {
    return checkNull(trim ? (obj + "").trim() : obj, '')
}

function checkNullArr(obj = [], dropEmpty = false) {
    if (isBoolTrue(dropEmpty)) {
        return ((checkNull(obj) && isArr(obj)) && obj.length > 0) && dropListEmptyElements(obj).length > 0;
    } else {
        return (checkNull(obj) && isArr(obj)) && obj.length > 0
    }
}


function dropListEmptyElements(list = [], valuesToCheckToRemove = []) {
    try {
        return list.filter((item) => {
            if (!checkNullStr(item)) return false;
            return !(checkNullArr(valuesToCheckToRemove) && valuesToCheckToRemove.includes(item));
        });
    } catch (e) {
        printError(e);
        return list;
    }
}

/**
 * Returns the array length if the object is array otherwise -1;
 */
function getArrLen(obj = [], defValue = -1) {
    var len = 0;
    try {
        // len = checkNullArr(arr) ? arr.length : 0;
        // if (checkNullArr(arr)) {
        if (checkNull(obj) && obj.length > 0) {
            len = obj.length;
        }
    } catch (e) {
        len = defValue;
        // printLog(e);
    }
    return len;
}

function isArr(obj) {
    return Array.isArray(obj);
}


function jsonToStr(src, indent = 4, replacer = null) {
    try {
        // data = data.replaceAll("\"", "").replaceAll('"', "");
        return !isStr(src) ? JSON.stringify(src, replacer, indent) : src;
    } catch (e) {
        // printError("jsonToStr:", e);
        return src;
    }
}


function jsonHasKey(src, key) {
    try {
        return src.hasOwnProperty(key);
    } catch (error) {
        return false;
    }
}

function compareJsonItems(sortKey) {
    return function (a, b) {
        if (a[sortKey] > b[sortKey]) {
            return 1;
        } else if (a[sortKey] < b[sortKey]) {
            return -1;
        }
        return 0;
    }
}

function sortJsonList(jsonList, sortKey) {
    try {
        jsonList.sort(compareJsonItems(sortKey));
        return jsonList;
    } catch (e) {
        printError(TAG, e);
        return jsonList;
    }
}


function getDefJsonValue(src, key, defValue = "") {
    try {
        if (jsonHasKey(src, key)) return src[key];
        if (!checkNullStr((src[key]))) return defValue;
    } catch (error) {
    }
    return defValue;
}


function isBoolTrue(boolValue, checkBinary = false, checkYN = false) {
    let value = boolValue === true || boolValue === 'true';
    if (!value && checkBinary) {
        value = isBinaryTrue(boolValue);
    }
    if (!value && checkYN) {
        const boolStr = (boolValue + "").toLowerCase().trim();
        value = boolStr === 'y' || boolStr === 'yes';
    }
    return value;
}

function isValueBool(value) {
    return checkNullStr(value, '') && (value === true || value === 'true' || value === false || value === 'false');
}


function isBinaryTrue(value) {
    return value === 1 || value === '1';
}

/**
 * Drop duplicate element from the array
 */
function dropArrDuplicates(arr) {
    return (checkNull(arr) && isArr(arr)) ? arr.filter((elem, index) => arr.indexOf(elem) === index) : arr;
}

function isJsonValueTrue(obj, key, checkBinary = false, checkYn = false) {
    return isBoolTrue(getDefJsonValue(obj, key), checkBinary, checkYn);
}

function getArrIndexValue(arr = [], index, defValue = 0) {
    try {
        return checkNullArr(arr) ? arr[index] : defValue;
        // return arr[index]
    } catch (e) {
        return defValue;
    }
}


function dropJsonNullValues(obj) {
    for (let key in obj) {
        if (!checkNullStr(obj[key])) {
            delete obj[key];
        }
    }
    return obj;
}


function dropArrEmptyValues(arr) {
    return arr.filter((value) => checkNullStr(value, true));
}


function parseInteger(value, defValue = 0) {
    return checkNullStr(value) && !isNaN(value) ? parseInt(value) : defValue;
}

function trim(str) {
    return (str + '').trim();
}

/**
 * Generates a random string that is unique & different from any of the element of string-list.
 *
 * @param {Array<String>} compareStrings An array of strings to be used when generating the random string so the new string could be unique & different.
 * @param {number} length The length of the string that will be generated. Default is 20.
 * @param {boolean} alphanumeric Whether string should contain characters & numbers alike. Default is true.
 *
 * @example
 * // Example usage:
 * const compareStrings = ['abc', 'def', 'xyz'];
 * const uniqueString = generateUniqueString(compareStrings);
 * console.log('Unique String:', uniqueString);
 */
function generateUniqueString(compareStrings, length = 20, alphanumeric = true) {
    const characters = `abcdefghijklmnopqrstuvwxyz${alphanumeric ? '0123456789' : ''}`;
    let randomString = '';
    let isUnique = false;
    compareStrings = checkNullArr(compareStrings) ? dropArrDuplicates(compareStrings) : [];
    compareStrings = compareStrings.map(item => trim(item).toLowerCase());
    while (!isUnique) {
        randomString = '';
        for (let i = 0; i < length; i++) {
            randomString += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        isUnique = !compareStrings.includes(randomString);
    }
    return randomString;
}

function isStr(obj) {
    try {
        return typeof obj === 'string';
    } catch (e) {
        return false;
    }
}

/**
 * Format dates with customizable date-format.
 *
 * @param date The date to format
 * @param div Separator between date elements
 * @param day Type of day format: numeric | 2-digit | undefined
 * @param month Type of month format: numeric | 2-digit | long | short | narrow | undefined
 * @param year Type of year format: numeric | 2-digit | undefined
 * @param hour Type of hour format: numeric | 2-digit | undefined
 * @param minute Type of minute format: numeric | 2-digit | undefined
 * @param second Type of second format: numeric | 2-digit | undefined
 * @param locales Timezone locale.
 * @param hour12 12 hour time or 24 hour time.
 * @param time Add time or not in the end.
 *
 */
const formatDateAdvance = ({
                               date = new Date(),
                               div = '-',
                               day = '2-digit',
                               month = 'short',
                               hour = '2-digit',
                               minute = '2-digit',
                               second = undefined,
                               year = 'numeric',
                               locales = 'en-IN',
                               hour12 = true,
                               time = false
                           }) => {
    try {
        //OPTIONS:
        // localeMatcher?: "best fit" | "lookup" | undefined;
        //         weekday?: "long" | "short" | "narrow" | undefined;
        //         era?: "long" | "short" | "narrow" | undefined;
        //         year?: "numeric" | "2-digit" | undefined;
        //         month?: "numeric" | "2-digit" | "long" | "short" | "narrow" | undefined;
        //         day?: "numeric" | "2-digit" | undefined;
        //         hour?: "numeric" | "2-digit" | undefined;
        //         minute?: "numeric" | "2-digit" | undefined;
        //         second?: "numeric" | "2-digit" | undefined;
        //         timeZoneName?: "short" | "long" | "shortOffset" | "longOffset" | "shortGeneric" | "longGeneric" | undefined;
        //         formatMatcher?: "best fit" | "basic" | undefined;
        //         hour12?: boolean | undefined;
        //         timeZone?: string | undefined;
        const dateData = new Date(date);
        const options = {day: day, month: month, year: year};
        if (time === true) {
            options['hour'] = hour;
            options['minute'] = minute;
            options['second'] = second;
            options['hour12'] = hour12;
        }
        const formattedDate = dateData.toLocaleDateString(locales, options).replaceAll(/\//g, div);
        // Output: "25/02/2023"
        return formattedDate;
    } catch (e) {
        printError(TAG, e);
        return date;
    }
}


function printLog(...logs) {
    if (DebugOn) console.log(...logs);
}

function printError(...logs) {
    if (DebugOn) console.error(...logs);
}

module.exports = {
    DebugOn,
    printLog,
    printError,
    getArrLen,
    parseInteger,
    sendResponse,
    formatDateAdvance,
    checkNullJson,
    checkNull,
    checkNullStr,
    trim,
    checkNullArr,
    jsonToStr,
    sortJsonList,
    isBoolTrue,
    isValueBool,
    getDefJsonValue,
    getArrIndexValue,
    dropArrEmptyValues,
    isJsonValueTrue,
    generateUniqueString,
    storeJsonDataInTempFile,
};


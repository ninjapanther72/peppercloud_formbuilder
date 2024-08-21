const {
    DebugOn, Constants,
} = require("../config/ServerConfig");
const fs = require("fs");
const moment = require("moment");
const path = require("path");

const TAG = "ServerUtils";
const PUBLIC_DIR = getDir(__dirname, '..') + "/public";


//====================================Node function start============================================
function getDir(currDir = __dirname, dirName) {
    return path.join(currDir, dirName);

}

function storeJsonDataInTempFile(jsonData) {
    writeFile({
        file: `${PUBLIC_DIR}/test/temp.json`, data: jsonToStr(jsonData, 4),
    });
}

function formatDateValue(dateValue, dateFormat = Constants.YYYY_MM_DD_DASH) {
    let date = checkNullStr(dateValue, true) ? formatDate(dateValue, dateFormat) : "";
    return (date + '' === '1970-01-01') ? '' : date;
}

function sendResponse({
                          res, msg, success = undefined,
                          errorMsg = null,
                          data = null,
                          print = true,
                          printCharLimit = 1000,
                          code = null,
                          ...rest
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


function fileExistsSync(filePath) {
    return fs.existsSync(filePath) && isFile(filePath);
}

function dirExistsSync(dirPath) {
    return fs.existsSync(dirPath) && isDirectory(dirPath);
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

async function writeFileAsync({file, data}) {
    try {
        await fs.writeFile(file, data, err => {
            if (err) {
                printError(err);
                return err
            } else {
                return true
            }
        })
    } catch (e) {
        printError(TAG, 'Error writing file:', file, 'error:', e);
    }
}

/**
 * Checks if a directory-path exists and is a directory.
 * @param {string} dirPath - The path to the directory to check.
 * @returns {boolean} True if the file exists and is a directory, otherwise false.
 *
 * @example
 * const exists = isDirectory('/path/to/files');
 * console.log(exists); // Output: true or false
 */
function isDirectory(dirPath) {
    try {
        const stats = fs.statSync(dirPath);
        return stats.isFile();
    } catch (error) {
        return false;
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


function formatJson(value, indent = 4, withTab = false) {
    return JSON.stringify(value, null, withTab ? "\t" : indent);
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

function isJson(obj) {
    try {
        const parsed = JSON.parse(obj);
        return true;
    } catch (e) {
        return false;
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

/**
 * Creates a timeout that executes the provided callback function after the specified duration.
 * Optionally, clears the timeout immediately after the callback execution based on the clearImmediately parameter.
 *
 * @param {number} duration - The duration in milliseconds after which the callback will be executed.
 * @param {Function} callback - The function to be executed after the specified duration.
 * @param {boolean} [clearImmediately=true] - Determines whether to clear the timeout immediately after callback execution. Defaults to <code>true</code>.
 *
 * @example
 * // Case 1: Clears the timeout immediately after callback execution
 * createTimeout(3000, () => {
 *   console.log("Timeout executed after 3 seconds.");
 * });
 *
 * // Case 2: Does not clear the timeout immediately after callback execution
 * createTimeout(5000, () => {
 *   console.log("Timeout executed after 5 seconds.");
 * }, false);
 */
function createTimeout(callback, duration, clearImmediately = true) {
    const timeoutId = setTimeout(() => {
        if (checkNull(callback)) callback();
        if (isBoolTrue(clearImmediately)) clearTimeout(timeoutId);
    }, duration);
    if (!isBoolTrue(clearImmediately)) clearTimeout(timeoutId);
}


/**
 * Description
 *
 * @example
 * // Example usage:
 * const list = [
 *     {selected: true, name: 'AA'},
 *     {selected: false, name: 'BB'},
 *     {selected: false, name: 'CC'},
 *     {selected: false, name: 'LL'},
 *     {selected: false, name: 'XX'},
 *     {selected: true, name: 'DD'},
 * ];
 *
 * // Move items with 'selected' set to true up in the list
 * const updatedList = moveJsonListItems(list, 'selected', true, true);
 * console.log(updatedList);
 * //Output:
 * [
 *   { selected: true, name: 'AA' },
 *   { selected: true, name: 'DD' },
 *   { selected: false, name: 'BB' },
 *   { selected: false, name: 'CC' },
 *   { selected: false, name: 'LL' },
 *   { selected: false, name: 'XX' }
 * ]
 *
 * @param {array} list - List of Object/JSON-element to be modified.
 * @param {string} targetKey - Key to target.
 * @param {Any} commonKeyValue - Condition-value.
 * @param {Boolean} moveUp - Whether to move up or down the true-condition elements.
 *
 *
 */
function moveJsonListItems(list, targetKey, commonKeyValue, moveUp = true) {
    if (!checkNullArr(list) || !checkNullStr(targetKey) || !checkNullStr(commonKeyValue)) return list;
    try {
        const matchingItems = list.filter(item => item[targetKey] === commonKeyValue);
        const nonMatchingItems = list.filter(item => item[targetKey] !== commonKeyValue);
        if (moveUp) {
            return [...matchingItems, ...nonMatchingItems];
        } else {
            return [...nonMatchingItems, ...matchingItems];
        }
    } catch (e) {
        printError(e)
        return list;
    }
}

function getElement(src, selector = "id" || "class" || "tag" || "name") {
    switch (selector) {
        case "class":
            return document.getElementsByClassName(src);
        case "id":
            return document.getElementById(src);
        case "name":
            return document.getElementsByName(src);
        default:
            return document.getElementsByTagName(src);
    }
}

function getElementByClass(src) {
    return getElement(src, 'class');
}

function getElementById(src) {
    return getElement(src, 'id');
}

function getElementByTag(src) {
    return getElement(src, 'tag');
}

function getElementByName(src) {
    return getElement(src, 'name');
}

/**
 * Returns true if the object is equal to "[object Object]".
 */
function checkObjEqual(obj, check = "[object Object]") {
    return obj !== check
}

function isArrEmpty(obj = []) {
    // return (checkNull(obj)) && obj.length === 0
    return checkNullArr(obj) && obj.length === 0
}

function checkNullArr(obj = [], dropEmpty = false) {
    if (isBoolTrue(dropEmpty)) {
        return ((checkNull(obj) && isArr(obj)) && obj.length > 0) && dropListEmptyElements(obj).length > 0;
    } else {
        return (checkNull(obj) && isArr(obj)) && obj.length > 0
    }
}

function checkNullArrWithDropEmpty(obj = []) {
    return ((checkNull(obj) && isArr(obj)) && obj.length > 0) && checkNullArr(dropListEmptyElements(obj));
}

function dropListElement(list = [], element) {
    try {
        return list.filter((item) => item !== element);
    } catch (e) {
        printError(list, e);
        return list;
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

function strToPlainStr(str) {
    let outKey = str;
    try {
        outKey = (outKey + "")
            .replaceAll(" ", '_')
            .replaceAll("  ", '_')
            .replaceAll("'", '')
            .replaceAll("''", '')
            .replaceAll("\"", '')
            .replaceAll("\'", '')
            .replaceAll("`", '')
            .replaceAll("`", '')
    } catch (e) {
        printError(TAG, e);
    }
    // log( "str-after:", outKey);
    return outKey;
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

function getStrLen(str, defValue = 0) {
    return checkNullStr(str) ? (str + "").length : defValue;
}

/**
 * Returns the json-data size if the object is json otherwise -1;
 */
function getJsonLen(obj = []) {
    var len = 0;
    try {
        if (checkNull(obj)) {
            len = Object.keys(obj).length;
        }
    } catch (e) {
        len = -1;
        printError(e);
    }
    return len;
}

function convertDateIntoTimestamp(date) {
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
        return null;
    }
    return timestamp;
}

function isArr(obj) {
    return Array.isArray(obj);
}

function isArrLenEqual(obj, checkLen) {
    return getArrLen(obj) === checkLen;
}

function isArrLenGreater(obj, checkLen) {
    return getArrLen(obj) >= checkLen;
}

function isArrLenLess(obj, checkLen) {
    return getArrLen(obj) <= checkLen;
}

function toJsonStr(src, indent = 4, replacer = undefined) {
    return JSON.stringify(JSON.parse(src.replaceAll(/&quot;/ig, '"')), replacer, indent)
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

function strToJson(src, defValue) {
    try {
        return JSON.parse(src);
    } catch (error) {
        // return checkNull(defValue)?defValue: src;
        return src;
        // return defValue;
    }
}

function deleteJsonKey(src, key) {
    try {
        if (jsonHasKey(src, key)) {
            delete src[key];
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
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

function deleteJsonValue(src, key) {
    let outData = src;
    try {
        if (outData.hasOwnProperty(key)) {
            delete outData[key];
        }
        return outData;
    } catch (e) {
        return src;
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

function getJsonValueFromNestedKeys(obj, keys = [], defValue = {}, dropEmpty = false) {
    try {
        if (!checkNullJson(obj) || !checkNullArr(keys)) return defValue;
        let value = obj;
        for (let key of keys) {
            try {
                if (checkNullStr(key, true)) {
                    value = value[key];
                } else {
                    return value;
                }
            } catch (error) {
                return defValue;
            }
        }
        return value || defValue;
    } catch (error) {
        return defValue;
    }
}

function isNestedJsonValueTrue(obj, keys = [], defValue, checkBinary = false, checkYN = false) {
    return isBoolTrue(getJsonValueFromNestedKeys(obj, keys, defValue), checkBinary, checkYN)
}

function jsonHasNestedKey(obj, keysToCheck = []) {
    try {
        if (!obj || typeof obj !== 'object' || keysToCheck.length === 0) {
            return false;
        }
        let currentObj = obj;
        for (const key of keysToCheck) {
            if (!currentObj.hasOwnProperty(key)) {
                return false;
            }
            currentObj = currentObj[key];
        }
        return true;
    } catch (e) {
        printError(TAG, e);
    }
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

function getBoolValue(value, checkBinary = false) {
    return isValueBool(value) ? value : isBoolTrue(checkBinary) ? isBinaryTrue(value) : false;
}

function boolToBinary(value) {
    return isBoolTrue(value) ? 1 : 0;
}


function concatStrings(srcList = [], connector = "", defValue = "", defNullValue = "", skipValues = ['']) {
    let outValue = "";
    if (!checkNullArr(srcList)) return defValue;
    if (!checkNullArrWithDropEmpty(skipValues)) skipValues = [''];
    for (let i = 0; i < srcList.length; i++) {
        const element = trim(checkNullStr(srcList[i]) ? srcList[i] : '');
        if (!checkNullStr(element)) {
            if (checkNullArr(skipValues) && !skipValues.includes(defNullValue)) {
                outValue += defNullValue;
                if (i < srcList.length - 1 && (!skipValues.includes(srcList[i + 1]))) {
                    outValue += connector;
                }
            }
        } else if (!skipValues.includes(element)) {
            outValue += element;
            if (i < srcList.length - 1 && (!skipValues.includes(srcList[i + 1]))) {
                outValue += connector;
            }
        }
    }
    if ((outValue + "").trim() === (connector + "").trim()) {
        outValue = "";
    }
    if ((trim(outValue)[trim(outValue).length - 1]) === trim(connector)) {
        outValue = outValue.substring(0, trim(outValue).length - 1);
    }
    return trim(checkNullStr(outValue) ? outValue : defValue);
}

function binaryToBool(value) {
    return isBinaryTrue(value);
}

function isBinaryTrue(value) {
    return value === 1 || value === '1';
}

function isBinaryFalse(value) {
    return value === 0 || value === '0';
}

function binaryToYN(value, yes = "Yes", no = "No") {
    return binaryToBool(value) ? yes : no;
}

function boolToYN(value, yes = "Yes", no = "No") {
    return isBoolTrue(value) ? yes : no;
}

function ynToBool(value, yes = "Yes") {
    return (value + "").toLowerCase() === (yes + "").toLowerCase();
}

function ynToBinary(value, yes = "Yes") {
    return (value + "").toLowerCase() === (yes + "").toLowerCase() ? 1 : 0;
}

function findStrInArr(str, arr, matchCase = true) {
    let found = false;
    if (checkNullStr(str) && checkNullArr(arr) && isArr(arr)) {
        found = arr.includes(isBoolTrue(matchCase) ? str : (str + "").toLowerCase());
    }
    return found;
}

function mergeJsons(o1, o2) {
    for (var key in o2) {
        o1[key] = o2[key];
    }
    return o1;
}

/**
 * Drop duplicate keys from the json-object
 */
function dropJsonDuplicateKeys(obj) {
    let seenKeys = {};
    for (let key in obj) {
        if (!seenKeys.hasOwnProperty(key)) {
            seenKeys[key] = true;
        } else {
            delete obj[key];
        }
    }
    return obj;
}

/**
 * Convert timestamp to readable date-format.
 * @param {Number} timestamp Timestamp to convert into readable date-format.
 * @example:
 * const timestamp = 1619236800; // Unix timestamp in seconds
 * const readableTime = timestampToReadableTime(timestamp);
 * console.log(readableTime); // Output: 4/24/2021, 12:00:00 AM
 */
function timestampToReadableTime(timestamp) {
    try {
        // Convert timestamp to milliseconds
        const milliseconds = timestamp * 1000;

        // Create a new Date object with the milliseconds
        const date = new Date(milliseconds);

        // Convert the date to a readable string using the toLocaleString method
        return date.toLocaleString();
    } catch (error) {
        // console.error(error);
        return '';
    }
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

function getNestedArrIndexValue(nestedList, indices, defValue = '') {
    if (!checkNullArr(indices) || !checkNullArr(nestedList)) return nestedList;
    try {
        const index = indices[0];
        const remainingIndices = indices.slice(1);
        if (checkNull(nestedList[index])) {
            return getNestedArrIndexValue(nestedList[index], remainingIndices);
        } else {
            return defValue;
        }
    } catch (e) {
        // printError(TAG,e);
        return defValue;
    }
}

function getStrSplitArrIndexValue(src, index, delimiter = "", defValue = "") {
    try {
        return getArrIndexValue((src + "").split(delimiter), index, defValue)
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

function jsonValueIncludes(src, key, checkValue) {
    return (getDefJsonValue(src, key) + '').includes(checkValue);
}

function getDefJsonValueByCompare({src, key, keyAlt, defValue = "", prefix = "", postfix = ""}) {
    try {
        const oldValue = getDefJsonValue(src, key, defValue);
        const newValue = getDefJsonValue(src, keyAlt, defValue);
        let outValue = checkNullStr(oldValue) ? oldValue : newValue;
        outValue = concatStrings([prefix, outValue, postfix], defValue);
        return outValue;
    } catch (e) {
        printError(TAG, e);
    }
}

function dropArrEmptyValues(arr) {
    return arr.filter((value) => checkNullStr(value, true));
}


function geStrArrIndexValue(src, index, delimiter = "", defValue = "") {
    try {
        return (src + "").charAt(index);
    } catch (e) {
        return defValue;
    }
}

function parseInteger(value, defValue = 0) {
    return checkNullStr(value) && !isNaN(value) ? parseInt(value) : defValue;
}

function trim(str) {
    return (str + '').trim();
}

/**
 * Delete multiple keys from an object.
 */
function deleteJsonKeys(obj = {}, keysToDelete = []) {
    if (!checkNullJson(obj) || !checkNullArr(keysToDelete)) {
        return obj;
    }
    keysToDelete.forEach((key) => {
        try {
            if (obj.hasOwnProperty(key)) {
                delete obj[key];
            }
        } catch (e) {
            return obj;
        }
    });
}

/**
 * Reorder the keys of an object using a list of keys to use against.
 *
 * @param {object} obj - Object whose keys are to be re-ordered.
 * @param {array} orderKeys - Keys to use when re-ordering the keys of the object (default to <code>false</code>).
 * @param {Boolean} dropUnmatched - The path to an icon image.
 *
 * @example
 * const obj = {name: 'Roger', data: 'Unavailable', label: 'College', mark: 'N/A', field: 'Chemistry'};
 * const orderKeys = ['label', 'data', 'name', 'mark'];
 *
 * const reorderedObj = reorderJsonObjKeys(obj, orderKeys, dropUnmatched: true);
 * console.log(reorderedObj);
 * //output (dropUnmatched: true): {label: 'College', data: 'Unavailable', name: 'Roger', mark: 'N/A'}
 * //output (dropUnmatched: false): {label: 'College', data: 'Unavailable', name: 'Roger', mark: 'N/A', field: 'Chemistry'}
 */
function reorderJsonObjKeys(obj, orderKeys = [], dropUnmatched = false) {
    if (!checkNullJson(obj) || !checkNullArr(orderKeys)) return obj;
    const orderedObj = {};
    for (const key of orderKeys) {
        if (obj.hasOwnProperty(key)) {
            orderedObj[key] = obj[key];
        }
    }
    if (!isBoolTrue(dropUnmatched)) {
        for (const key in obj) {
            if (!orderedObj.hasOwnProperty(key)) {
                orderedObj[key] = obj[key];
            }
        }
    }

    return orderedObj;
}

/**
 * Reorder objects containing list using a set of keys.
 *
 * @example
 * // Usage example:
 * const jsonList = [{name: 'bd', data: ''}, {name: 'immo'}, {name: 'edu'}, {name: 'asso'}];
 * const orderKeys = ['edu', 'bd', 'asso'];
 * const reorderedList = reorderJsonList(jsonList, orderKeys, 'name', true);
 * console.log(reorderedList);
 * // Output: [ { name: 'edu' }, { name: 'bd', data: '' }, { name: 'asso' } ]//dropUnmatched: true
 * // Output: [ { name: 'edu' }, { name: 'bd', data: '' }, { name: 'asso' }, {name: 'immo'} ]//dropUnmatched: false
 *
 * @param {array} jsonList - Json objects containing list that is to be re-ordered.
 * @param {array} orderKeys - List of keys for re-ordering json-list.
 * @param {string} targetKey - Name of the key whose value will be used.
 * @param {boolean} dropUnmatched - Whether to drop unmatched items or add them at the end.
 * @returns {array} - Reordered list.
 */
function reorderJsonList(jsonList = [], orderKeys = [], targetKey, dropUnmatched = false) {
    if (!checkNullArr(jsonList) || !checkNullArr(orderKeys) || !checkNullStr(targetKey)) return jsonList;
    try {
        let outList = jsonList.filter(item => orderKeys.includes(item[targetKey]));
        if (isBoolTrue(dropUnmatched)) {
            outList.sort((a, b) => orderKeys.indexOf(a[targetKey]) - orderKeys.indexOf(b[targetKey]));
        } else {
            const unmatchedItems = jsonList.filter(item => !orderKeys.includes(item[targetKey]));
            outList = outList.concat(unmatchedItems);
        }
        return outList;
    } catch (e) {
        printError(TAG, e);
        return jsonList;
    }
}

/**
 * Reorder keys in an object based on a specified order.
 *
 * @param {object} srcObj - The input object to reorder.
 * @param {string[]} orderKeys - An array specifying the desired order of keys.
 * @param {boolean} dropUnmatched - If true, remove keys that are not in orderKeys.
 * @returns {object} - The reordered object.
 *
 * @example
 * const obj = { '/asso': {}, '/aw': {} };
 * const orderNames = ['/aw', '/asso'];
 * const reorderedObj = reorderJsonObjKeys(obj, orderNames, false);
 * console.log(reorderedObj);
 * // Output: { '/aw': {}, '/asso': {} }
 */
function reorderJsonObjKeysAdvance(srcObj, orderKeys, dropUnmatched = false) {
    if (!checkNullJson(srcObj) || !checkNullArr(orderKeys)) return srcObj;
    const reorderedObj = {};
    // Copy existing keys not in orderKeys
    const unmatchedKeys = {};
    for (const key in srcObj) {
        if (srcObj.hasOwnProperty(key) && !orderKeys.includes(key)) {
            unmatchedKeys[key] = srcObj[key];
        }
    }
    // Copy keys in specified order
    orderKeys.forEach((key) => {
        if (srcObj.hasOwnProperty(key)) {
            reorderedObj[key] = srcObj[key];
        }
    });
    // Append unmatched keys at the end
    if (!isBoolTrue(dropUnmatched)) {
        for (const key in unmatchedKeys) {
            if (unmatchedKeys.hasOwnProperty(key)) {
                reorderedObj[key] = unmatchedKeys[key];
            }
        }
    }
    return reorderedObj;
}

function dropJsonNullValues(obj) {
    for (let key in obj) {
        if (!checkNullStr(obj[key])) {
            delete obj[key];
        }
    }
    return obj;
}

function dropArrItem(arr = [], value) {
    if (!checkNullArr(arr) || !checkNullStr(value)) return arr;
    const index = arr.indexOf(value);
    if (index !== -1) {
        arr.splice(index, 1);
    }
}

function dropArrItems(arr = [], valuesToRemove = []) {
    if (!checkNullArr(arr) || !checkNullArr(valuesToRemove)) return arr;
    valuesToRemove.forEach((value) => {
        const index = arr.indexOf(value);
        if (index !== -1) {
            arr.splice(index, 1);
        }
    });
}

function combineJsonValues(obj = {}, keys = [], connector = ',', defValue = '') {
    if (!checkNullJson(obj) || !checkNullArr(keys)) return defValue;
    let outValue = '';
    keys.forEach((key) => {
        if (checkNullStr(key) && checkNullStr(obj[key])) {
            outValue += connector + obj[key];
        }
    });
    return outValue;
}

function dropJsonListDuplicates(jsonList = [], targetKey) {
    if (!checkNullArr(jsonList) || !checkNullStr(targetKey)) return jsonList;
    const uniqueMap = new Map();
    const uniqueList = [];
    jsonList.forEach((item) => {
        const keyValue = item[targetKey];
        if (!uniqueMap.has(keyValue)) {
            uniqueMap.set(keyValue, true);
            uniqueList.push(item);
        }
    });
    return uniqueList;
}

/**
 * Sort json-objects containing list;
 *
 * @example
 * // Example Usage:
 * const jsonList = [
 *    {name: 'b item name 1'},
 *     {name: 'a item name 3'},
 *     {name: 'c item name 2'},
 * ];
 *
 * const sortedDataAscending = sortJsonListAdvance(jsonList, 'name', true);
 * console.log(sortedDataAscending);
 * const sortedDataDescending = sortJsonListAdvance(jsonList, 'name', false);
 * console.log(sortedDataDescending);
 *
 * //Output:
 * //sortedDataAscending
 * [
 *   { name: 'a item name 3' },
 *   { name: 'b item name 1' },
 *   { name: 'c item name 2' }
 * ]
 *
 * //sortedDataDescending
 * [
 *   { name: 'c item name 2' },
 *   { name: 'b item name 1' },
 *   { name: 'a item name 3' }
 * ]
 */
function sortJsonListAdvance(jsonArray, key, ascending = true) {
    try {
        const sortOrder = ascending ? 1 : -1;
        jsonArray.sort((a, b) => {
            const keyA = a[key];
            const keyB = b[key];

            if (keyA < keyB) return -1 * sortOrder;
            if (keyA > keyB) return 1 * sortOrder;
            return 0;
        });
        return jsonArray;
    } catch (e) {
        return jsonArray;
    }
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

/**
 * Check if a specific value exists within an object's values.
 * @param {object} obj - The object to search.
 * @param {*} value - The value to search for.
 * @param {Boolean} exact - Whether match should be exact or not. Default is <code>true</code>.
 * @returns {boolean} - True if the value exists, otherwise false.
 * @example
 * const Data = {
 *    key1: 'value1',
 *    key2: 'value2',
 * };
 * const valueExists = objectHasValue(Data, 'value1', true);
 * console.log(valueExists); // Output: true
 *
 * const valueExists = objectHasValue(Data, 'value1 ', false);
 * console.log(valueExists); // Output: true
 *
 * const valueExists = objectHasValue(Data, 'value1 ', true);
 * console.log(valueExists); // Output: false
 */
function objectHasValue(obj, value, exact = true) {
    return Object.values(obj).map(item => isBoolTrue(exact) ? item : (item + '').toLowerCase().trim()).includes(isBoolTrue(exact) ? value : (value + '').toLowerCase().trim());
}

/**
 * Compares two objects deeply to determine if they have identical keys and values.
 *
 * @param {Object} obj1 - The first object to compare.
 * @param {Object} obj2 - The second object to compare.
 * @returns {boolean} - Returns true if both objects are deeply equal, otherwise false.
 *
 * @example
 * // Example usage:
 * const object1 = { x: 1, y: { a: 2, b: 3 } };
 * const object2 = { x: 1, y: { a: 2, b: 3 } };
 * console.log(deepObjectComparison(object1, object2)); // true
 */
function deepObjectComparison(obj1, obj2) {
    if (obj1 === obj2) {
        return true;
    }

    if (obj1 == null || typeof obj1 !== "object" || obj2 == null || typeof obj2 !== "object") {
        return false;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (const key of keys1) {
        if (!keys2.includes(key) || !deepObjectComparison(obj1[key], obj2[key])) {
            return false;
        }
    }

    return true;
}

function sliceArr(arr, start, end) {
    try {
        return arr.slice(start, end);
    } catch (e) {
        printError(TAG, e);
        return []
    }
}

function spliceArr(arr, start, end) {
    try {
        return arr.splice(start, end);
    } catch (e) {
        printError(TAG, e);
        return []
    }
}

/**
 * Break a string into its constituent parts.
 *
 * Example:
 * <pre>
 *     const longString = 'Here is the agenda for our upcoming meeting';
 *     const maxWordLimit = 10;
 *
 *     const formattedString = breakStringWithEllipsis(longString, maxWordLimit);
 *     console.log(formattedString);
 *     //Output: Here is the agenda for our upcoming meeting ...
 * </pre>
 *
 * @param {string} inputString - The input string to be formatted.
 * @param {Number} maxWords - The maximum number of characters/words allowed in the output string (default to:10).
 * @param {Boolean} useWords - Whether to use the words or characters to break/split the input string (default to: <code>true</code>).
 * @param {string} postfix - The postfix to added to the output string (default to: ...).
 * @param {string} delimiter - The delimiter to add to the output string (default to: ' '). Its only used when {@link useWords} is <code>true</code>
 * @return {string} - Returns the formatted string.
 */
function limitStrWithEllipsis(inputString, maxWords = 10, useWords = true, postfix = '...', delimiter = ' ') {
    const words = (inputString + '').split(isBoolTrue(useWords) ? delimiter : '');
    if (words.length <= maxWords) {
        // If the string has fewer words than the maximum, return it as is
        return inputString;
    } else {
        // If the string has more words than the maximum, truncate and add ellipsis
        const truncatedWords = words.slice(0, maxWords);
        return `${truncatedWords.join(isBoolTrue(useWords) ? delimiter : '')}${postfix}`;
    }
}

function isStr(obj) {
    try {
        return typeof obj === 'string';
    } catch (e) {
        return false;
    }
}

function getDefValue(src, defValue = "", checkExtra = null) {
    return checkNull(src, checkExtra) ? src : checkNull(defValue) ? defValue : "";
}

function getDefValueStr(src, defValue = "", trim = true) {
    return checkNullStr(src, trim) ? src : (checkNullStr(defValue, true) ? defValue : "");
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

/**Returns date in the specified format.
 *
 * @hide It uses 'moment.js' library (npm install moment --save).
 *
 * @param date Custom date. Default is current date.
 * @param format Date format for date to be formatted in.
 *               Default is "yyyy-MM-DD" (2022-05-25).
 */
function formatDate(date = new Date(), format = "yyyy-MM-DD") {
    try {
        return (moment(date).format(format) + "").replaceAll("Invalid date", '').replaceAll("invalid date", '')
    } catch (e) {
        console.error(e);
        return '';
    }
}


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
    DebugOn,
    printLog,
    printError,
    getArrLen,
    sliceArr,
    writeFile,
    getDir,
    parseInteger,
    fileExistsSync,
    sendResponse,
    formatDate,
    formatDateAdvance,
    dateToTimestamp,
    formatJson,
    isJson,
    getDefValue,
    getDefValueStr,
    isArr,
    checkNullJson,
    checkNull,
    checkNullStr,
    trim,
    checkObjEqual,
    deleteJsonKey,
    isStr,
    strToJson,
    jsonHasKey,
    isArrEmpty,
    toJsonStr,
    checkNullArr,
    jsonToStr,
    deleteJsonValue,
    sortJsonList,
    isBoolTrue,
    boolToBinary,
    isValueBool,
    isBinaryTrue,
    getBoolValue,
    binaryToBool,
    binaryToYN,
    boolToYN,
    mergeJsons,
    getDefJsonValue,
    concatStrings,
    getArrIndexValue,
    getNestedArrIndexValue,
    geStrArrIndexValue,
    jsonHasNestedKey,
    getStrSplitArrIndexValue,
    getJsonValueFromNestedKeys,
    isNestedJsonValueTrue,
    dropArrEmptyValues,
    dropArrDuplicates,
    dropListEmptyElements,
    checkNullArrWithDropEmpty,
    reorderJsonObjKeys,
    reorderJsonList,
    combineJsonValues,
    jsonValueIncludes,
    getDefJsonValueByCompare,
    dropJsonNullValues,
    isJsonValueTrue,
    createTimeout,
    moveJsonListItems,
    dropJsonListDuplicates,
    sortJsonListAdvance,
    deepObjectComparison,
    isDirectory,
    isFile,
    generateUniqueString,
    objectHasValue,
    dropJsonDuplicateKeys,
    timestampToReadableTime,
    convertDateIntoTimestamp,
    storeJsonDataInTempFile,
};


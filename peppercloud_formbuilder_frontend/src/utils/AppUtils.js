import {AppDateFormat, BaseReqUrl, Constants, DebugOn, THEME} from "../config/AppConfig";
import moment from "moment";

const TAG = "AppUtils";

/**
 * Sends an HTTP request using the fetch API.
 *
 * @param {Object} options - The options for the request.
 * @param {string} options.reqUrl - The request URL (relative to BaseReqUrl).
 * @param {Object} [options.reqOptions={}] - Additional options for the fetch request, such as body, headers, etc.
 * @param {string} [options.type='post'] - The HTTP method (e.g., 'get', 'post').
 * @param {Function} [options.setState] - A function to update the state with the fetched data.
 * @param {Array} [options.nestedKeys=[]] - An array of keys to extract a nested value from the fetched data.
 * @param {string} [options.tag=TAG] - A tag for logging purposes.
 * @param {Function} [options.onFetchBegin] - A callback function executed before the fetch request begins.
 * @param {Function} [options.onFetched] - A callback function executed after the fetch request is successful.
 * @param {Function} [options.onError] - A callback function executed if the fetch request fails.
 * @param {string} [options.fun='sendRequest:'] - The name of the function for logging purposes.
 * @returns {Promise<any>} - A promise that resolves with the fetched data or rejects with an error.
 *
 * @example
 * // Example usage of sendRequest function:
 * sendRequest({
 *     reqUrl: '/api/data',
 *     type: 'post',
 *     setState: (fetchedData) => {
 *         console.log('Fetched data:', data);
 *     },
 *     onFetchBegin: () => {
 *         console.log('Fetch started...');
 *     },
 *     onFetched: (fetchedData) => {
 *         console.log('Fetch successful:', data);
 *     },
 *     onError: (error) => {
 *         console.error('Fetch failed:', error);
 *     }
 * })
 * .then((fetchedData) => {//Optional, equivalent to "onFetched" callback
 *     console.log('Data received:', data);
 * })
 * .catch((error) => {//Optional, equivalent to "onError" callback
 *     console.error('Error occurred:', error);
 * });
 */
export async function sendRequest({
                                      reqUrl,
                                      reqOptions = {},
                                      type = 'post',
                                      setState,
                                      nestedKeys = [],
                                      tag = TAG,
                                      onFetchBegin,
                                      onFetched,
                                      onError,
                                      fun = 'sendRequest:'
                                  }) {
    return new Promise((resolve, reject) => {
        if (checkNull(onFetchBegin)) onFetchBegin();

        const FETCH_CONFIG = {
            method: (type + '').toUpperCase(),
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                // Authorization: `Bearer ${getSessionToken()}`
            },
            body: JSON.stringify({
                ...checkNullJson(reqOptions) ? reqOptions : {}
            })
        };

        // Adjust URL for GET requests
        const FULL_URL = `${BaseReqUrl}${reqUrl}`;

        fetch(FULL_URL, FETCH_CONFIG)
            .then(async (res) => {
                if (!res.ok) {
                    const resData = {status: res.status, message: res.statusText};
                    printError(tag, fun, resData);
                    if (onError) onError(resData);
                    return reject(resData);
                }
                const fetchedData = await res.json();

                const data = getJsonValueFromNestedKeys(fetchedData, nestedKeys, fetchedData);
                if (setState) setState(data);
                if (onFetched) onFetched(fetchedData);

                return resolve(data);
            })
            .catch((err) => {
                printError(tag, fun, err);
                if (onError) onError(err);
                return reject(err);
            });
    });
}

/**
 * Extract form-id from browser-url.
 *
 * @example
 * const urls = [
 *     "http://localhost:3000/form/5678ijhgr5/main", //output: 5678ijhgr5
 *     "http://localhost:5000/form/kdjhfty56748ei", //output: kdjhfty56748ei
 *     "http://localhost:5000/form/kdjhfty56748ei?id=455", //output: kdjhfty56748ei
 *     "http://localhost:5000/form/sdft54e3wdfg/?id=455" //output: sdft54e3wdfg
 * ];
 *
 * urls.forEach(url => {
 *     console.log(extractFormId(url));
 * });
 */
export function getFormIdFromBrowserUrl(url = window.location.href, defValue = '') {
    const regex = /\/form\/([^\/?]+)/;
    const match = url.match(regex);
    return match ? match[1] : defValue;
}

export function focusFormIdElement(id, onlyFocus = false, inputFocusDuration = 3000) {
    try {
        if (checkNullStr(id)) {
            const element = getElement(id, 'id');
            // logTest("focusIdField.element:", element);
            createTimeout(() => {
                try {
                    element.focus();
                } catch (e) {
                    printError(TAG, e);
                }
                if (!isBoolTrue(onlyFocus)) {
                    try {
                        element.classList.remove(THEME);
                        element.classList.add("danger");
                        createTimeout(() => {
                            element.classList.remove("danger");
                            element.classList.add(THEME);
                        }, inputFocusDuration);
                    } catch (e) {
                        printError(TAG, e);
                    }
                }
            }, isBoolTrue(onlyFocus) ? 0 : parseInteger(inputFocusDuration) / 4);
        }
    } catch (e) {
        printError(TAG, e);
    }
}

export function formatDateValue(dateValue, defValue = '', dateFormat = AppDateFormat) {
    let date = (checkNullStr(dateValue)) ? formatDate(dateValue, dateFormat) : defValue;
    return (date == '1970-01-01') ? defValue : date;
}


export function isJson(obj) {
    try {
        const parsed = JSON.parse(obj);
        return true;
    } catch (e) {
        return false;
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
export function formatDate(date = new Date(), format = Constants.YYYY_MM_DD_DASH) {
    return moment(date).format(format)
}

/**
 * Returns true if the object is not null and not undefined.
 */
export function checkNull(obj, checkExtra = null) {
    return obj !== undefined && obj + "" !== 'undefined' && obj !== null && obj + "" !== 'null' && (obj + "").toLowerCase() !== 'nan' && obj !== checkExtra
}

export function randomInt(min = 5, max = 20) {
    return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Returns true if the json-object is not null and not undefined and size is also not empty.
 */

export function checkNullJson(obj, dropEmpty = false) {
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
export function checkNullStr(obj, trim = true) {
    return checkNull(trim ? (obj + "").trim() : obj, '')
    // return checkNull(trim ? (obj + "").trim() : obj, null) !== ''
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
export function createTimeout(callback, duration, clearImmediately = true) {
    const timeoutId = setTimeout(() => {
        if (checkNull(callback)) callback();
        if (isBoolTrue(clearImmediately)) clearTimeout(timeoutId);
    }, duration);
    if (!isBoolTrue(clearImmediately)) clearTimeout(timeoutId);
}


export function getElement(src, selector = "id" || "class" || "tag" || "name") {
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

export function getElementByClass(src) {
    return getElement(src, 'class');
}

export function getElementById(src) {
    return getElement(src, 'id');
}

export function getElementByTag(src) {
    return getElement(src, 'tag');
}

export function getElementByName(src) {
    return getElement(src, 'name');
}

/**
 * Returns true if the object is equal to "[object Object]".
 */
export function checkObjEqual(obj, check = "[object Object]") {
    return obj !== check
}

export function isArrEmpty(obj = []) {
    // return (checkNull(obj)) && obj.length === 0
    return checkNullArr(obj) && obj.length === 0
}

export function checkNullArr(obj = [], dropEmpty = false) {
    if (isBoolTrue(dropEmpty)) {
        return ((checkNull(obj) && isArr(obj)) && obj.length > 0) && dropListEmptyElements(obj).length > 0;
    } else {
        return (checkNull(obj) && isArr(obj)) && obj.length > 0
    }
}

export function checkNullArrWithDropEmpty(obj = []) {
    return ((checkNull(obj) && isArr(obj)) && obj.length > 0) && checkNullArr(dropListEmptyElements(obj));
}

export function dropListElement(list = [], element) {
    try {
        return list.filter((item) => item !== element);
    } catch (e) {
        printError(list, e);
        return list;
    }
}

export function dropListEmptyElements(list = [], valuesToCheckToRemove = []) {
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

export function strToPlainStr(str) {
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
export function getArrLen(obj = [], defValue = -1) {
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

export function getStrLen(str, defValue = 0) {
    return checkNullStr(str) ? (str + "").length : defValue;
}

/**
 * Returns the json-data size if the object is json otherwise -1;
 */
export function getJsonLen(obj = []) {
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

export function isArr(obj) {
    return Array.isArray(obj);
}

export function isArrLenEqual(obj, checkLen) {
    return getArrLen(obj) === checkLen;
}

export function isArrLenGreater(obj, checkLen) {
    return getArrLen(obj) >= checkLen;
}

export function isArrLenLess(obj, checkLen) {
    return getArrLen(obj) <= checkLen;
}

export function toJsonStr(src, indent = 4, replacer = undefined) {
    return JSON.stringify(JSON.parse(src.replaceAll(/&quot;/ig, '"')), replacer, indent)
}

export function jsonToStr(src, indent = 4, replacer = null) {
    try {
        // data = data.replaceAll("\"", "").replaceAll('"', "");
        return !isStr(src) ? JSON.stringify(src, replacer, indent) : src;
    } catch (e) {
        // printError("jsonToStr:", e);
        return src;
    }
}

export function strToJson(src, defValue) {
    try {
        return JSON.parse(src);
    } catch (error) {
        // return checkNull(defValue)?defValue: src;
        return src;
        // return defValue;
    }
}

export function deleteJsonKey(src, key) {
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

export function jsonHasKey(src, key) {
    try {
        return src.hasOwnProperty(key);
    } catch (error) {
        return false;
    }
}

export function deleteJsonValue(src, key) {
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

export function getDefJsonValue(src, key, defValue = "") {
    try {
        if (jsonHasKey(src, key)) return src[key];
        if (!checkNullStr((src[key]))) return defValue;
    } catch (error) {
    }
    return defValue;
}

export function getJsonValueFromNestedKeys(obj, keys = [], defValue = {}, dropEmpty = false) {
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

export function isNestedJsonValueTrue(obj, keys = [], defValue, checkBinary = false, checkYN = false) {
    return isBoolTrue(getJsonValueFromNestedKeys(obj, keys, defValue), checkBinary, checkYN)
}

export function jsonHasNestedKey(obj, keysToCheck = []) {
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

export function isBoolTrue(boolValue, checkBinary = false, checkYN = false) {
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

export function isValueBool(value) {
    return checkNullStr(value, '') && (value === true || value === 'true' || value === false || value === 'false');
}

export function getBoolValue(value, checkBinary = false) {
    return isValueBool(value) ? value : isBoolTrue(checkBinary) ? isBinaryTrue(value) : false;
}

export function boolToBinary(value) {
    return isBoolTrue(value) ? 1 : 0;
}


export function concatStrings(srcList = [], connector = "", defValue = "", defNullValue = "", skipValues = ['']) {
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

export function binaryToBool(value) {
    return isBinaryTrue(value);
}

export function isBinaryTrue(value) {
    return value === 1 || value === '1';
}

export function isBinaryFalse(value) {
    return value === 0 || value === '0';
}

export function binaryToYN(value, yes = "Yes", no = "No") {
    return binaryToBool(value) ? yes : no;
}

export function boolToYN(value, yes = "Yes", no = "No") {
    return isBoolTrue(value) ? yes : no;
}

export function ynToBool(value, yes = "Yes") {
    return (value + "").toLowerCase() === (yes + "").toLowerCase();
}

export function ynToBinary(value, yes = "Yes") {
    return (value + "").toLowerCase() === (yes + "").toLowerCase() ? 1 : 0;
}

export function findStrInArr(str, arr, matchCase = true) {
    let found = false;
    if (checkNullStr(str) && checkNullArr(arr) && isArr(arr)) {
        found = arr.includes(isBoolTrue(matchCase) ? str : (str + "").toLowerCase());
    }
    return found;
}

/**
 * Drop duplicate keys from the json-object
 */
export function dropJsonDuplicateKeys(obj) {
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
 * Drop duplicate element from the array
 */
export function dropArrDuplicates(arr) {
    return (checkNull(arr) && isArr(arr)) ? arr.filter((elem, index) => arr.indexOf(elem) === index) : arr;
}

export function isJsonValueTrue(obj, key, checkBinary = false, checkYn = false) {
    return isBoolTrue(getDefJsonValue(obj, key), checkBinary, checkYn);
}

export function getArrIndexValue(arr = [], index, defValue = 0) {
    try {
        return checkNullArr(arr) ? arr[index] : defValue;
        // return arr[index]
    } catch (e) {
        return defValue;
    }
}

export function getNestedArrIndexValue(nestedList, indices, defValue = '') {
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

export function getStrSplitArrIndexValue(src, index, delimiter = "", defValue = "") {
    try {
        return getArrIndexValue((src + "").split(delimiter), index, defValue)
    } catch (e) {
        return defValue;
    }
}

export function parseInteger(value, defValue = 0) {
    return checkNullStr(value) && !isNaN(value) ? parseInt(value) : defValue;
}

export function trim(str) {
    return (str + '').trim();
}

/**
 * Delete multiple keys from an object.
 */
export function deleteJsonKeys(obj = {}, keysToDelete = []) {
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
export function reorderJsonObjKeys(obj, orderKeys = [], dropUnmatched = false) {
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
export function reorderJsonList(jsonList = [], orderKeys = [], targetKey, dropUnmatched = false) {
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
export function reorderJsonObjKeysAdvance(srcObj, orderKeys, dropUnmatched = false) {
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

export function dropJsonNullValues(obj) {
    for (let key in obj) {
        if (!checkNullStr(obj[key])) {
            delete obj[key];
        }
    }
    return obj;
}

export function dropArrItem(arr = [], value) {
    if (!checkNullArr(arr) || !checkNullStr(value)) return arr;
    const index = arr.indexOf(value);
    if (index !== -1) {
        arr.splice(index, 1);
    }
}

export function dropArrItems(arr = [], valuesToRemove = []) {
    if (!checkNullArr(arr) || !checkNullArr(valuesToRemove)) return arr;
    valuesToRemove.forEach((value) => {
        const index = arr.indexOf(value);
        if (index !== -1) {
            arr.splice(index, 1);
        }
    });
}

export function combineJsonValues(obj = {}, keys = [], connector = ',', defValue = '') {
    if (!checkNullJson(obj) || !checkNullArr(keys)) return defValue;
    let outValue = '';
    keys.forEach((key) => {
        if (checkNullStr(key) && checkNullStr(obj[key])) {
            outValue += connector + obj[key];
        }
    });
    return outValue;
}

export function dropJsonListDuplicates(jsonList = [], targetKey) {
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

export function sliceArr(arr, start, end) {
    try {
        return arr.slice(start, end);
    } catch (e) {
        printError(TAG, e);
        return []
    }
}

export function spliceArr(arr, start, end) {
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
export function limitStrWithEllipsis(inputString, maxWords = 10, useWords = true, postfix = '...', delimiter = ' ') {
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

export function isStr(obj) {
    try {
        return typeof obj === 'string';
    } catch (e) {
        return false;
    }
}

export function getDefValue(src, defValue = "", checkExtra = null) {
    return checkNull(src, checkExtra) ? src : checkNull(defValue) ? defValue : "";
}

export function getDefValueStr(src, defValue = "", trim = true) {
    return checkNullStr(src, trim) ? src : (checkNullStr(defValue, true) ? defValue : "");
}


export function setTabTitle(title) {
    try {
        document.title = title;
    } catch (e) {
        printLog(e)
    }
}

export function getTabTitle() {
    return document.title;
}

export function getDimensionUnit(size) {
    const unit = size.match(/[a-z]+$/i);
    if (unit && getDimensionUnits().includes(unit[0])) {
        return unit[0];
    } else {
        return "";
    }
}

export function getDimensionUnits() {
    return ["px", "rem", "vh", "vw", "em", "ex", "cm", "mm", "in", "pt", "pc", "vmin", "vmax", "ch"];
}

export function getSizeValue(size) {
    try {
        const match = size.match(/([\d.]+)(px|rem|em|vw|vh|vmin|vmax|ex|ch|mm|pt|in|%)/);
        if (match) {
            const value = parseFloat(match[1]);
            return isNaN(value) ? 0 : value;
        } else {
            return 0;
        }
    } catch (error) {
        return size;
    }
}

export function addSize(value1 = "", value2 = "") {
    if (checkNullStr(value1) && checkNullStr(value2)) {
        return (getSizeValue(value1) + getSizeValue(value2)) + getDimensionUnit(value1);
    } else {
        return value1
    }
}

export function subtractSize(value1 = "", value2 = "", addUnit = true) {
    if (checkNull(value1, "") && checkNull(value2, "")) {
        // return (parseInt(value1.split(unit)[0]) - parseInt(value2.split(unit)[0]))  + getDimensionUnit(value1);
        return (getSizeValue(value1) - getSizeValue(value2)) + (isBoolTrue(addUnit) ? getDimensionUnit(value1) : '');
    } else {
        return value1
    }
}

export function multSize(value1 = "", value2 = "") {
    if (checkNull(value1, "") && checkNull(value2, "")) {
        // return (parseInt(value1.split(unit)[0]) * parseInt(value2.split(unit)[0]))  + getDimensionUnit(value1);;
        return (getSizeValue(value1) * getSizeValue(value2)) + getDimensionUnit(value1);
    } else {
        return value1
    }
}

export function divSize(value1 = "", value2 = "") {
    if (checkNull(value1, "") && checkNull(value2, "")) {
        // return (parseInt(value1.split(unit)[0]) / value2) + getDimensionUnit(value1);
        return (getSizeValue(value1) / getSizeValue(value2)) + getDimensionUnit(value1);
    } else {
        return value1
    }
}

export function isNumOdd(number) {
    return parseInteger(number) % 2 !== 0;
}

export function limitStringWords(str, limit = -1, delimiter = ' ', postfix = "") {
    const words = (str + "").split(delimiter);
    if (words.length <= limit) return str;
    if (limit >= 0 && words.length >= limit) {
        return words.slice(0, limit).join(delimiter) + postfix;
    }
    return str;
}

export function addSpaceBeforeStringUppercaseLetters(str) {
    return str.replace(/([A-Z])/g, ' $1');
}

/**
 * Change string case.
 *
 * Example usage:
 *
 * printLog(convertCase("hello world", "uppercase")); // HELLO WORLD
 * printLog(convertCase("HELLO WORLD", "lowercase")); // hello world
 * printLog(convertCase("hello world", "camelcase")); // helloWorld
 * printLog(convertCase("hello world", "capitalize")); // Hello World
 * printLog(convertCase("hello world. goodbye world.", "sentencecase")); // Hello world. Goodbye world.
 */
export function changeStringCase(src, type = "upper" || "lower" || "camel" || "capitalize" || "sentence" || "variable", spaceCapitals = false) {
    let data = src + "";
    if (isBoolTrue(spaceCapitals)) data = addSpaceBeforeStringUppercaseLetters(data);
    // else {
    switch (type) {
        case "upper":
            data = data.toUpperCase();
            break;
        case "lower":
            data = data.toLowerCase();
            break;
        case "camel":
            data = data.replaceAll(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
                return index === 0 ? word.toLowerCase() : word.toUpperCase();
            }).replaceAll(/\s+/g, '');
            break;
        case "capitalize":
            data = data.toLowerCase().replaceAll(/(?:^|\s)\S/g, function (a) {
                return a.toUpperCase();
            });
            break;
        case "sentence":
            data = data.toLowerCase().replaceAll(/(^\s*\w|[\.\?!]\s*\w)/g, function (c) {
                return c.toUpperCase();
            });
            break;
        case "variable": {
            // Remove leading and trailing spaces
            data = data.trim();

            // Replace non-alphanumeric characters with spaces
            data = data.replace(/[^a-zA-Z0-9]/g, ' ');

            // Split the string into words
            const words = data.split(' ');

            // Convert each word to lowercase and capitalize the first letter
            const formattedWords = words.map((word, index) => {
                if (index === 0) {
                    return word.toLowerCase();
                } else {
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                }
            });

            // Join the words and remove spaces
            data = formattedWords.join('');
        }
            break;
        default:
            data = src;
            break;
    }
    // }
    return data;
}


export function scrollToTop() {
    window.scrollTo(0, 0);
}

export function printLog(...logs) {
    if (DebugOn) console.log(...logs);
}

export function printError(...logs) {
    if (DebugOn) console.error(...logs);
}

export function printWarn(...logs) {
    if (DebugOn) console.warn(...logs);
}

export function printInfo(...logs) {
    if (DebugOn) console.info(...logs);
}

export function printDebug(...logs) {
    if (DebugOn) console.debug(...logs);
}

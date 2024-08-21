import moment from "moment/moment";
import RGBColor from "rgbcolor";
import $ from 'jquery'
import chroma from "chroma-js";
import JsPDF from 'jspdf';
import html2canvas from "html2canvas";
import * as XLSX from 'xlsx';
import React from "react";
import {Constants, DurationUnits, HonorificsPrefixes, Patterns} from "../config/FusionConfig";
import he from 'he';
import {fromByteArray, toByteArray} from 'base64-js';
import {TextDecoder, TextEncoder} from 'text-encoding';


const TAG = "ReactUtils.js"

// =================================UI functions start================================
export function getHighlightedMatchedText(srcStr, matchStr, highlightVariant = 'warning') {
    if (checkNullStr(matchStr)) {
        try {
            const searchTerm = (matchStr + '').toLowerCase();
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            return (srcStr + '').split(regex).map((part, index) => (regex.test((part + '').toLowerCase()) ?
                <span key={index} className={`bg-${highlightVariant}`}>{part}</span> : part));
        } catch (error) {
            // console.error(error);
            return srcStr;
        }
    } else {
        return srcStr;
    }
}

/**
 * Call the function with the ID of the div you want to open in a new window
 *
 * @param {any} divId - Id of the div you want to open in a new window.
 *
 * <p>EXPERIMENTAL</p>
 *
 * @example
 * // Usage example:
 * openDivInNewWindow('divId');
 */
export function openDivInNewWindow(divId) {
    // Get the element with the specified divId
    const divElement = document.getElementById(divId);

    if (!divElement) {
        console.error(`Element with ID "${divId}" not found.`);
        return;
    }

    // Create a new window
    const newWindow = window.open('', '', 'width=600,height=400');

    // Write the content of the div to the new window
    newWindow.document.write('<html><head><title>New Window</title></head><body>');
    newWindow.document.write('<div id="content"></div>');
    newWindow.document.write('<script>window.onload = function() {');
    newWindow.document.write(`document.getElementById('content').innerHTML = ${JSON.stringify(divElement.innerHTML)};`);
    newWindow.document.write('}</script>');
    newWindow.document.write('</body></html>');
    newWindow.document.close();
}

/**
 * Call the function with the ID of the div you want to open in a
 * new window and automatically trigger print
 *
 * <p>EXPERIMENTAL</p>
 *
 * @param {any} divId - Id of the div you want to open in a new window.
 *
 * @example
 * // Usage example:
 * openDivInNewWindowAndAutoPrint('myDivId');
 */
export function openDivInNewWindowAndAutoPrint(divId) {
    // Get the element with the specified divId
    const divElement = document.getElementById(divId);
    if (!divElement) {
        console.error(`Element with ID "${divId}" not found.`);
        return;
    }
    // Create a new window and open the HTML file
    const newWindow = window.open('newWindowContent.html', '', 'width=600,height=400');
}


export async function printElement(element, filename = "PdfFile.pdf", orientation = 'portrait', unit = 'pt', format = 'a4', compression = "NONE" | "FAST" | "MEDIUM" | "SLOW") {
    new Promise(async (resolve, reject) => {
        try {
            // const outFile = new JsPDF(orientation, unit, format);//best
            // outFile.html(element)
            //     .then(() => {
            //         outFile.save(filename);
            //     });
            const pdf = new JsPDF("portrait", "mm", "a4");
            const printElement = await html2canvas(element);
            const img = printElement.toDataURL("image/png");
            const imgProperties = pdf.getImageProperties(img);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;
            // const pdfHeight = getElementHeight(element);
            // pdf.addImage(img, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.addImage(img, "PNG", 0, 0, pdfWidth, 1500);
            pdf.save(filename);

            // const pdf = new JsPDF("portrait", "pt", "a4");
            // const data = await html2canvas(document.querySelector("#report"));
            // const img = data.toDataURL("image/png");
            // const imgProperties = pdf.getImageProperties(img);
            // const pdfWidth = pdf.internal.pageSize.getWidth();
            // const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;
            // pdf.addImage(img, "JPEG", 10, 10, pdfWidth-20, pdfHeight);
            // pdf.save("report.pdf");

            return resolve(true);
        } catch (e) {
            printError(e);
            return reject(e);
        }
    });
}

export function checkUrlExists(url, callback) {
    const img = new Image();
    img.onload = function () {
        // Image loaded successfully
        callback(true);
    };
    img.onerror = function () {
        // Image failed to load
        callback(false);
    };
    img.src = url;
}

export function checkUrlsExist(urls, callback) {
    let count = 0;

    function checkUrl(url) {
        const img = new Image();
        img.onload = function () {
            // Image loaded successfully
            count++;
            if (count === urls.length) {
                // All URLs have been checked
                callback(true);
            }
        };
        img.onerror = function () {
            // Image failed to load
            count++;
            if (count === urls.length) {
                // All URLs have been checked
                callback(false);
            }
        };
        img.src = url;
    }

    urls.forEach((url) => {
        checkUrl(url);
    });
}

export function refreshCurrPage() {
    window.location.reload();
}

/**
 * Downloads an Excel file with specified columns and rows.
 * @param {Object} options - Options for generating the Excel file.
 * @param {string} options.fileName - The name of the Excel file to be downloaded.
 * @param {Array<string>} options.columns - The column headers for the Excel file.
 * @param {Array<Array<any>>} options.rows - The data rows for the Excel file.
 * @param {string} options.sheetName - Name of the sheet. Default: "Sheet1".
 * @param {boolean} options.designHeader - Add designs to header-row like bg, bold cells etc. Default: false.
 * @param {string} options.headerBg - Header-row bg-color. Default: "808080".
 * @param {Object} options.headerDesigns - Custom styles for header.
 * @example
 * // Example usage:
 * downloadExcelFile({
 *   fileName: 'example.xlsx',
 *   columns: ['Name', 'Age', 'Email'],
 *   rows: [
 *     ['John Doe', 30, 'john@example.com'],
 *     ['Jane Smith', 25, 'jane@example.com']
 *   ]
 * });
 */
export function downloadExcelFile({
                                      fileName, columns = [], rows = [], sheetName = 'Sheet1', headerBg = '808080', designHeader = false, headerDesigns = {},
                                  }) {
    // Add styles for header row
    const headerStyle = {
        fill: {fgColor: {rgb: headerBg}}, // gray background color
        font: {bold: true},// bold font
        ...headerDesigns
    };

    // Convert columns and rows to Excel worksheet format
    const worksheet = XLSX.utils.aoa_to_sheet([columns], {cellStyles: isBoolTrue(designHeader)});
    XLSX.utils.sheet_add_aoa(worksheet, rows, {origin: -1});

    // Apply header styles
    for (let col = 0; col < columns.length; col++) {
        const headerCell = XLSX.utils.encode_cell({r: 0, c: col});
        if (isBoolTrue(designHeader)) worksheet[headerCell].s = headerStyle;
    }

    // Create a new Excel workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Download the Excel file with the specified fileName
    XLSX.writeFile(workbook, fileName);
}


/**
 * Downloads an Excel file with specified rows using advanced method.
 * @param {Object} options - Options for generating the Excel file.
 * @param {string} options.fileName - The name of the Excel file to be downloaded.
 * @param {Array<Object>} options.rows - The data rows for the Excel file in JSON format.
 * @example
 * downloadExcelFileAdvance({
 *   fileName: 'advanced-example',
 *   rows: [
 *     { Name: 'John Doe', Age: 30, Email: 'john@example.com' },
 *     { Name: 'Jane Smith', Age: 25, Email: 'jane@example.com' }
 *   ]
 * });
 */
export function downloadExcelFileAdvance({fileName, rows = []}) {
    try {
        import('xlsx').then((xlsx) => {
            // Convert JSON data to Excel worksheet
            const worksheet = xlsx.utils.json_to_sheet(rows);

            // Create a workbook object
            const workbook = {Sheets: {data: worksheet}, SheetNames: ['data']};

            // Convert workbook to array buffer
            const excelBuffer = xlsx.write(workbook, {
                bookType: 'xlsx', type: 'array'
            });

            import('file-saver').then((module) => {
                if (module && module.default) {
                    // Specify Excel file type
                    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

                    // Create a Blob containing the Excel data
                    const data = new Blob([excelBuffer], {type: EXCEL_TYPE});

                    // Save the Blob as a file
                    module.default.saveAs(data, fileName + '.xlsx');
                }
            });
        });
    } catch (e) {
        // Handle any errors
        printError(e);
    }
}


export const getHistoryLastUrl = (defUrl) => {
    const {length} = window.history;
    if (length >= 2) {
        // Access the last URL in the history using the history API
        let lastUrl = window.history[length - 2];
        lastUrl = checkNullStr(lastUrl) ? lastUrl : document.referrer;
        printLog("window.history:", window.history);
        printLog("lastUrl:", lastUrl);
        return checkNullStr(lastUrl) ? lastUrl : defUrl;
    }
};

export function detectPageRefresh(onRefresh = null) {
    let isRefresh = false;
    window.addEventListener('beforeunload', (e) => {
        if (checkNull(onRefresh)) onRefresh(e, true);
        isRefresh = true;
    });
    return isRefresh;
}

export function getElementHeight(element, unit = '') {
    try {
        const height = element.getBoundingClientRect().height;
        return checkNullStr(unit) && checkNullStr(height) ? `${height}${unit}` : element;
    } catch (error) {
        // console.error(error);
        return null;
    }
}

/**
 * Switch focus between elements of a list on tab press:
 */
export function handleTabFocus(elements = [], onTabClick) {
    let index = 0;
    const lastIndex = elements.length - 1;
    // elements[0].focus();
    $(elements[0]).focus();

    document.addEventListener('keydown', event => {
        if (event.key === 'Tab') {
            event.preventDefault();
            if (checkNull(onTabClick)) onTabClick(event);
            if (index === lastIndex) {
                index = 0;
            } else {
                index++;
            }
            $(elements[index]).focus();
            // elements[index].focus();
        }
    });
}

/**
 * Focus the element using element.focus(). If this throws an error,
 * we catch it with a try-catch block and use element.scrollIntoView() to scroll to the element instead.
 *
 * The scrollIntoView() method has an optional parameter behavior which controls the scrolling animation,
 * and block and inline which control the alignment of the element within the scrollable area.
 */
export function focusOrScrollToElement(element) {
    try {
        element.focus();
    } catch (error) {
        try {
            element.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
        } catch (e) {
            scrollToElement(element);
        }
    }
}

/**
 * Detect swipe gestures (left, right, up, down) on the given element.
 *
 * @param element Element to detect gestures on.
 * @param swipeCallback A callback function to be called when a gestures are detected.
 * @param touchCallback A callback function to be called when a touch is detected.
 *
 *
 *
 * Example:
 * <pre>
 *      detectSwipeDirection(element, (e, direction) => {
                printLog(TAG, "Swipe direction: " + direction);
                switch (direction) {
                    case "left":
                        //TODO
                        break;
                    case "top":
                        //TODO
                        break;
                    case "right":
                        //TODO
                        break;
                    case "down":
                        //TODO
                        break;
                    default:
                        //TODO
                        break;
                }
            });
 * </pre>
 *
 * @return If any gesture is detected returns one of the following values
 *                      depending on the gesture: left, right, up or down.
 */
export function detectSwipeDirection(element, swipeCallback = null, touchCallback = null) {
    let touchstartX = 0;
    let touchstartY = 0;
    let touchendX = 0;
    let touchendY = 0;

    element.addEventListener('touchstart', function (event) {
        touchstartX = event.changedTouches[0].screenX;
        touchstartY = event.changedTouches[0].screenY;
        if (checkNull(touchCallback)) touchCallback(event);
    }, false);

    let swipeDir = "";
    element.addEventListener('touchend', function (event) {
        touchendX = event.changedTouches[0].screenX;

        touchendY = event.changedTouches[0].screenY;
        const xDiff = touchendX - touchstartX;

        const yDiff = touchendY - touchstartY;
        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            if (xDiff > 0) {
                swipeDir = "right";
            } else {
                swipeDir = "left";
            }
        } else {
            if (yDiff > 0) {
                swipeDir = "down";
            } else {
                swipeDir = "up";
            }
        }
        if (checkNull(swipeCallback)) swipeCallback(event, swipeDir);
    }, false);
    return swipeDir;
}

/**
 * Detect click event on a particular side of an element on it's specific part (like 30% or 50% part).
 *
 * @param element Element to detect gestures on.
 * @param clickEvent Callback event from when element is clicked.
 * @param threshold Threshold dimension where you want to limit it's click detection like .3 (30%) or .5 (50%)% etc..
 *
 * Example:
 * <pre>
 *      const side=detectClickSide(element, clickEvent, 0.3);
 switch (side) {
                    case "top":
                        //TODO
                        break;
                    case "bottom":
                        //TODO
                        break;
                    case "left":
                        //TODO
                        break;
                    case "right":
                        //TODO
                        break;
                    default:
                        //TODO
                        break;
                }
 * </pre>
 *
 * @return If any gesture is detected returns one of the following values
 *                      depending on the gesture: left, right, up or down.
 */
export function detectClickSide(element, clickEvent, threshold = 0.3) {
    const rect = element.getBoundingClientRect();
    const {clientX, clientY} = clickEvent;

    const topThreshold = rect.top + (rect.height * threshold);
    const bottomThreshold = rect.bottom - (rect.height * threshold);
    const leftThreshold = rect.left + (rect.width * threshold);
    const rightThreshold = rect.right - (rect.width * threshold);

    if (clientY < topThreshold) {
        return "top";
    } else if (clientY > bottomThreshold) {
        return "bottom";
    } else if (clientX < leftThreshold) {
        return "left";
    } else if (clientX > rightThreshold) {
        return "right";
    } else {
        return null;
    }
}

/**
 * Detect swipe gestures (left, right, up, down) on the given element.
 *
 * @param element Element to detect gestures on.
 * @param swipeCallback A callback function to be called when a gestures are detected.
 * @param touchCallback A callback function to be called when a touch is detected.
 * @param touchMoveCallback A callback function to be called when a touch-move is detected.
 *
 * Example:
 * <pre>
 *      addHorizontalSwipeListener(element, (e, direction) => {
                printLog(TAG, "Swipe direction: " + direction);
                switch (direction) {
                    case "left":
                        //TODO
                        break;
                    case "right":
                        //TODO
                        break;
                    default:
                        //TODO
                        break;
                }
            });
 * </pre>
 *
 * @return If any gesture is detected returns one of the following values
 *                      depending on the gesture: left, right, up or down.
 */
export function addHorizontalSwipeListener(element, swipeCallback = null, touchCallback = null, touchMoveCallback = null) {
    let startCoordX, endCoordX;
    let isSwiping = false;
    let threshold = 50; // Minimum swipe distance to trigger swipe

    // Handle touch start event
    element.addEventListener('touchstart', function (e) {
        isSwiping = true;
        startCoordX = e.touches[0].clientX;
        if (checkNull(touchCallback)) touchCallback(e)
    });

    // Handle touch move event
    element.addEventListener('touchmove', function (e) {
        if (isSwiping) {
            endCoordX = e.touches[0].clientX;
            let deltaX = endCoordX - startCoordX;
            element.style.transform = `translateX(${deltaX}px)`;
            if (checkNull(touchMoveCallback)) touchMoveCallback(e)
        }
    });

    // Handle touch end event
    element.addEventListener('touchend', function (e) {
        if (isSwiping) {
            isSwiping = false;
            let deltaX = endCoordX - startCoordX;
            element.style.transform = "";

            // Check swipe direction and invoke callback
            if (deltaX > threshold) {
                if (checkNull(swipeCallback)) swipeCallback(e, "right");
            } else if (deltaX < -threshold) {
                if (checkNull(swipeCallback)) swipeCallback(e, "left");
            }
        }
    });
}

/**
 * Calculate element max height depending on its data available in it.
 */
export function calElementMaxHeight(element, setHeight = true) {
    // Reset field height
    if (isBoolTrue(setHeight)) element.style.height = "inherit";
    // Get the computed styles for the element
    const computed = window.getComputedStyle(element);

    // Calculate the height
    const height = parseInt(computed.getPropertyValue("border-top-width"), 10) + element.scrollHeight + parseInt(computed.getPropertyValue("padding-bottom"), 10) + parseInt(computed.getPropertyValue("border-bottom-width"), 10);

    if (isBoolTrue(setHeight)) element.style.height = height + "px";
    return height;
}


export function getParentHeight(child, unit = "") {
    try {
        let height = null;
        if (child) {
            const parent = child.parentNode;
            if (parent) {
                return parent.offsetHeight;
            }
        }
        return checkNullStr(unit) ? height + unit : height;
    } catch (error) {
        // console.error(error);
        return null;
    }
}

export function getHeight(element, unit = "") {
    try {
        const height = element.clientHeight;
        return checkNullStr(unit) ? height + unit : height;
    } catch (error) {
        // console.error(error);
        return null;
    }
}

export function getParentHeight2(child, unit = "") {
    const parentH = child.parentNode.clientHeight;
    return checkNullStr(unit) ? parentH + unit : parentH;
}

export function determineLogColor(text) {
    const DEF_COLOR = "rgba(255, 255, 255, .75)"
    let logColor = DEF_COLOR;
    if (checkNull(text, "")) {
        const logText = text + "".toLowerCase()

        if (logText.includes("trying")) logColor = "#fff8a7";
        if (logText.includes("error") || logText.includes("500")) logColor = "#ff7979";
        if (logText.includes("warning") || logText.includes("issue") || logText.includes("invalid") || logText.includes("no response") || logText.includes("couldn't") || logText.includes("could not") || logText.includes("cannot be empty") || logText.includes("cannot be")) logColor = "#dd9800";
        if (logText.includes("info")) logColor = "#67caff";
        if (logText.includes("success") || logText.includes("successful") || logText.includes("fetched") || logText.includes("done") || logText.includes("completed") || logText.includes("finished") || logText.includes("established") || logText.includes("successfully")) logColor = "#b7ff8a";
        // if (logText.includes("message")) logColor = "#d2d2d2";
        // if (logText.includes("simple")) logColor = DEF_COLOR;
    }
    return logColor;
}

export function space(count = 3) {
    const items = []
    for (let i = 0; i < 3; i++) {
        items.push(`&nbsp;`)
    }
    return items;
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

export function focusElement(elementValue, selector = "id" || "class" || "tag" || "name") {
    try {
        getElement(elementValue, selector).focus();
        // if (element) element.focus();
    } catch (error) {
        // console.error(error);
        // $(getElement(elementValue, selector)).focus();
    }
}

export function selectAllCheckboxes(className, select = true, reverse = false) {
    const cbs = getElement(className, "class");
    if (getArrLen(cbs) > 0) for (const cb of cbs) cb.checked = reverse ? !cb.checked : select;
}

export function setElementText(src, text, type = "id" || "class" || "tag" || "name") {
    var element = getElement(src, type);
    if (checkNull(element)) {
        element.innerText = text;
        element.innerHTML = text;
        element.value = text;
        element.text = text;
    }
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

/**Sets the specified icon to your website when it appears on the browser.
 * Pass icon url like this:'https://stackoverflow.com/web_icon.ico'
 * and pass icon path like this: '../pkg/images/icons/web_icon.png'*/
export function webIcon(iconUrl) {
    if (iconUrl != null) {
        let head = document.getElementsByTagName("head")[0]
        if (head != null) {
            try {
                let link = document.createElement("link")
                link.rel = "shortcut icon"
                link.href = iconUrl
                head.appendChild(link)
            } catch (e) {
                printLog(e)
            }
        }
    }
}

/**Sets the specified icon to your website when it appears on the browser.
 * Pass icon url like this:'https://stackoverflow.com/web_icon.ico'
 * and pass icon path like this: '../pkg/images/icons/web_icon.png'*/
export function webIconWithQuery(iconUrl) {
    if (iconUrl != null) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            link.href = iconUrl;
            document.getElementsByTagName('head')[0].appendChild(link);
        }
    }
}

/**Loads CSS file in the head tag.*/
export function loadCSS(cssFile, tagToAppendCSS = "head") {
    try {
        let head = document.getElementsByTagName(tagToAppendCSS)[0]//Get only first head tag in-case there are more than one

        //Create link tag
        let link = document.createElement("link")

        //Add type to link tag
        link.type = "text/css"

        //Add relation to link tag
        link.rel = "stylesheet"

        //Add css source file to link
        link.href = cssFile

        //Finally append head tag
        head.appendChild(link)
    } catch (e) {
        printLog(e)
    }
}

/**Append a link tag with the specified properties
 * in the specified tag (default is "head" tag with 0 index).*/
export function loadLinkTag(type, relation, fileToLoad = "", tagToBeAppended = "head", tagIndex = 0) {
    let head = document.getElementsByTagName(tagToBeAppended)[tagIndex]
    let link = document.createElement("link")
    link.rel = relation
    link.type = type
    if (fileToLoad != null && fileToLoad !== "") {
        link.href = fileToLoad
    }
    head.appendChild(link)
}

export function printItem(itemToPrint, newLineOPage = true, printOnConsoleToo = false) {
    if (printOnConsoleToo) {
        printLog(itemToPrint)
    }
    document.write((newLineOPage) ? itemToPrint + "<br>" : itemToPrint)
}

export function styles(elementName, styles, elementType = ElementType.ID) {
    let element
    switch (elementType) {
        case ElementType.TAG:
            element = document.getElementsByTagName(elementName)
            element.setAttribute('style', styles)
            break
        case ElementType.CLASS:
            element = document.getElementsByClassName(elementName)
            element.setAttribute('style', styles)
            break
        case ElementType.ID:
            element = document.getElementById(elementName)
            element.setAttribute('style', styles)
            break
        case ElementType.NAME:
            element = document.getElementsByName(elementName)
            element.setAttribute('style', styles)
            break
        default:
            element = document.getElementsByTagName(elementName)
            element.setAttribute('style', styles)
            break
    }
}


export function tagFontColor(string, color, tag, elementType = ElementType.ID) {
    string = string.toString()
    let resultStr = string.fontcolor(color)

    switch (elementType) {
        case ElementType.ID:
            document.getElementById(tag).innerHTML = resultStr;
            break;
        case ElementType.TAG:
            document.getElementsByTagName(tag).innerHTML = resultStr;
            break;
        case ElementType.NAME:
            document.getElementsByName(tag).innerHTML = resultStr;
            break;
        case ElementType.CLASS:
            document.getElementsByClassName(tag).innerHTML = resultStr;
            break;
        default:
            document.getElementById(tag).innerHTML = resultStr;
            break;
    }
    return resultStr
}

export function fontColor(string, color) {
    return string.toString().fontcolor(color)
}

export function fontColors(string, colors) {
    string = string.toString()
    let newStr = []
    let strArr = string.split(` `)
    // let singleStr=stringArr.map(String)
    if (strArr != null && strArr.length > 0 && colors != null && colors.length >= strArr.length) {
        for (let i = 0; i < strArr.length; i++) {
            newStr[i] = strArr[i].toString().fontcolor(colors[i])
            // newStr[i] = strArr[i]
            // document.write(strArr[i] + "<br>")
        }
    }
    return newStr
}

export function appendChildren(tag, children) {
    if (tag && children != null && children.length > 0) {
        for (let child of children) {
            tag.appendChild(child)
        }
    }
}

/**Creates table in webpage based on the given arguments*/
export function createTable(columns, multDimArr, tableClass = "table", tableID = "table", borderWidth = "1px", cellSpacing = "0px", cellPadding = "2px") {
    let arr = multDimArr
    if (arr != null && arr.length > 0) {
        document.write("<table class='" + tableClass + "' id='" + tableID + "' cellspacing='" + cellSpacing + "' cellpadding='" + cellPadding + "' border='" + borderWidth + "'>")
        document.write("<tbody>")
        document.write("<thead>")
        //Column Headings
        if (columns != null && columns.length > 0) {
            document.write("<tr>")
            for (let i = 0; i < columns.length; i++) {
                document.write("<th scope='col'>" + columns[i] + "</th>")
            }
            document.write("</tr>")
        }
        document.write("</thead>")

        for (let i = 0; i < arr.length; i++) {
            document.write("<tr>")
            for (let j = 0; j < arr[i].length; j++) {
                document.write("<td>" + arr[i][j] + "</td>")
            }
            document.write("</tr>")
        }
        document.write("</tbody>")
        document.write("</table>")
    }
}


export function updateDivWithURL(divName) {
    $('#' + divName).load(document.URL + ' #' + divName);
}

export function updateDiv(divName) {
    // $("#" + divName).load(window.location.href + " #" + divName);
}

/** $.import_js() is a jquery based helper function (for JavaScript importing within JavaScript code).
 * Implement:   $.import_js('/path_to_project/scripts/somefunctions.js');
 * function hello()
 {
    alert("Hello world!");
}
 */
// (function ($) {
//
//     let import_js_imported = [];
//
//     $.extend(true,
//         {
//             import_js: function (script) {
//                 let found = false;
//                 for (let i = 0; i < import_js_imported.length; i++)
//                     if (import_js_imported[i] === script) {
//                         found = true;
//                         break;
//                     }
//
//                 if (found === false) {
//                     $("head").append($('<script></script>').attr('src', script));
//                     import_js_imported.push(script);
//                 }
//             }
//         });
//
// })(jQuery);

/** Makes a synchronous Ajax request instead of using a <script> tag. Which is also how Node.js handles includes.
 * Implementation: require("/scripts/subscript.js");
 And be able to call a function from the required script in the next line:subscript.doSomethingCool();*/
export function importJS(script) {
    $.ajax({
        url: script, dataType: "script", async: false,           // <-- This is the key
        success: function () {
            // all good...
        }, error: function () {
            throw new Error("Could not load script " + script);
        }
    });
}

/**Includes js file in any js file by creating new element tag.
 * Implementation: includeJs("/path/to/some/file.js");*/
export function includeJs(jsFilePath) {
    let js = document.createElement("script");

    js.type = "text/javascript";
    js.src = jsFilePath;

    document.body.appendChild(js);
}

export function codeAreaStyles(tag, background = "#e3e3e3", cornerRadius = "3px", color = 'black', border = '#5088be 4px solid', padding = "12px 6px 12px 20px") {
    tag.setAttribute('style', "background-color:" + background + " ;\n" + "    border-radius: " + cornerRadius + ";\n" + "    color: " + color + ";\n" + "    border-left: " + border + ";\n" + "    padding: " + padding + ";")
    // document.write("asdfsddddddddddddddddddddddd")
}

const ElementType = {
    ID: "ID", NAME: "NAME", TAG: "TAG", CLASS: "CLASS", NONE: "NONE"
}
// //Prevent Enum values from being modified
// Object.freeze(ElementType)


export function prevPage() {
    return window.history.back()
}

export function nextPage() {
    return window.history.forward()
}

export function currentPageLink() {
    return window.location.href
}

export function openUrl(url) {
    if (url != null) {
        window.location.assign(url)
        // window.location.replace("https://www.tutorialrepublic.com/");
        // window.location.href = "https://www.tutorialrepublic.com/";
        // createTimeout("pageRedirect()", 10000);
    }
}

/**
 * Copies specified text to OS clipboard.
 */
export function copyTextToClipboard(text, logging = true) {
    if (!navigator.clipboard) {
        var textArea = document.createElement("textarea");
        textArea.value = text;

        // Avoid scrolling to bottom
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            if (logging === true) printLog('Fallback: Copying text command was ' + msg);
        } catch (err) {
            if (logging === true) printError('Fallback: Oops, unable to copy', err);
        }

        document.body.removeChild(textArea);

        return;
    }
    navigator.clipboard.writeText(text).then(() => {
        // printLog('Async: Copying to clipboard was successful!');
    }, (err) => {
        if (logging === true) printError('Async: Could not copy text: ', err);
    });
}

function fallbackCopyTextToClipboard(text, logging = false) {

}


/**
 * Apply ripple effect on the component.
 *
 * This component should have an element in
 * it's starting tag to identify it the DOM.
 *
 * @param element: The element that will be used to identify
 * your component in the DOM structure so the ripple could add
 * ripple effect on it.
 *
 * Example:
 * <pre>
 *     <div data-ripple>//data-ripple element to identify
 *     ...
 *     </div>
 *
 *     //Call this method to apply ripple-effect
 *
 *      useEffect(() => {
 *         if (ripple) applyRipple("data-ripple")
 *     }, [])
 * </pre>
 *
 * Requirement: install jquery if not working and
 * place the following CSS code in your style.css and import
 * it in your component:=>
 *
 * <pre>
 *
 * .ripple {
 *     position: absolute;
 *     top: 0;
 *     left: 0;
 *     bottom: 0;
 *     right: 0;
 *     overflow: hidden;
 *     -webkit-transform: translateZ(0);
 *     transform: translateZ(0);
 *     border-radius: inherit;
 *     pointer-events: none;
 * }
 *
 * .rippleWave {
 *     backface-visibility: hidden;
 *     position: absolute;
 *     border-radius: 50%;
 *     transform: scale(0.7);
 *     -webkit-transform: scale(0.7);
 *     background: rgba(255, 255, 255, .1);
 *     opacity: 0.45;
 *     animation: ripple 2s forwards;
 *     -webkit-animation: ripple 2s forwards;
 * }
 * @keyframes ripple {
 *     to {
 *         transform: scale(24);
 *         opacity: 0;
 *     }
 * }
 *
 * @-webkit-keyframes ripple {
 *     to {
 *         -webkit-transform: scale(24);
 *         opacity: 0;
 *     }
 * }
 * </pre>
 */
export function applyRipple(element, primary = false, rippleClass = "rippleWave") {
    if (checkNull(element)) {
        $(function ($) {
            $(document).on("mousedown", "[" + element + "]", function (e) {
                var $self = $(this);

                if ($self.is(".btn-disabled")) {
                    return;
                }
                if ($self.closest("[" + element + "]")) {
                    e.stopPropagation();
                }

                var initPos = $self.css("position"), offs = $self.offset(), x = e.pageX - offs.left, y = e.pageY - offs.top,
                    dia = Math.min(this.offsetHeight, this.offsetWidth, 100), // start diameter
                    $ripple = $('<div/>', {class: "ripple", appendTo: $self});

                if (!initPos || initPos === "static") {
                    $self.css({position: "relative"});
                }

                $('<div/>', {
                    class: primary ? "rippleWavePrimary" : rippleClass, css: {
                        background: $self.data("ripple"), width: dia, height: dia, left: x - (dia / 2), top: y - (dia / 2),
                    }, appendTo: $ripple, one: {
                        animationend: function () {
                            $ripple.remove();
                        }
                    }
                });
            });

        });
    }
}

/**
 * Createa  dicent ripple for the specified element.
 *
 * Implementation:
 * <pre>
 *     <button class="ripple" style="--ripple-color: #00FF00; --ripple-alpha:.5"
 * </pre>
 */
export function createGoodRipple(element, rippleClass = "ripple", rippleSpreadDuration = 1000) {
    element.addEventListener('mousedown', function (e) {
        const ripple = this.querySelector(`.${rippleClass}::before}`);
        const buttonRect = this.getBoundingClientRect();
        const x = e.clientX - buttonRect.left;
        const y = e.clientY - buttonRect.top;
        const size = Math.max(buttonRect.width, buttonRect.height) * 2;

        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.opacity = '0.6';
        ripple.style.transition = `transform ${rippleSpreadDuration}s, opacity ${rippleSpreadDuration}s`;
        ripple.style.transform = 'translate(-50%, -50%) scale(1)';
    });

    element.addEventListener('mouseup', function (e) {
        const ripple = this.querySelector(`.${rippleClass}::before}`);

        ripple.style.opacity = '0';
        ripple.style.transition = `transform ${rippleSpreadDuration}s, opacity ${rippleSpreadDuration}s`;
        ripple.style.transform = 'translate(-50%, -50%) scale(2.5)';
    });
}

/**Show/hide something.
 *
 * Use-> <div style={{"display":showToggle()}}><div/>
 */

export function show(component, show) {
    let display = "inline-block"
    if (show !== "true") {
        display = "none"
    } else {
        display = "inline-block"
    }
    return display
}

export function visible(ref, show) {
    if (ref != null) {
        const view = ref.current
        if (view != null) {
            if (show !== "true") {
                view.codeStyle.display = "none"
            } else {
                view.codeStyle.display = "inline"
            }
        }
    }
}

export function justChecking() {

}

export function scrollToTop() {
    // window.scrollTo({
    //     top: 0,
    //     left: 0,
    //     behavior: isBoolTrue(smooth) ? 'smooth' : "no"
    // });
    window.scrollTo(0, 0);
    // document.documentElement.scrollTop = 0;
    // document.scrollingElement.scrollTop = 0;
}

export function scrollToElement(element, extraX = 0, extraY = -100) {
    // document.body.scrollTo("0, " + String(getElementY(element)));
    // window.scroll(0, findElementPos(element));
    window.scroll(extraX, findElementPos(element)[0] + extraY);
}

export function scrollToElementInScroller(element) {
    // printLog('scrollToElementInScroller.element:', element);
    try {
        // const offset = element.offsetTop - 100; // Adjust the offset as needed
        // window.scrollTo({top: offset, behavior: 'smooth'});

        element.scrollIntoView({behavior: 'smooth', block: 'nearest'});
    } catch (error) {
        // printError('scrollToElementInScroller:', error);
    }
}

export function scrollToElementSimple(element) {
    element.scrollIntoView();
}

export function getElementXPos(element) {
    const rect = element.getBoundingClientRect();
    return rect.left + window.scrollX;
}


export function getElementYPos(element) {
    const rect = element.getBoundingClientRect();
    return rect.top + window.scrollY;
}

/**
 * Returns elements x-y coordinates in the following format:
 *
 * <pre>
 *     {x: elementX, y: elementY}
 * </pre>
 */
export function getElementPos(element) {
    const rect = element.getBoundingClientRect();
    return {
        x: rect.left + window.scrollX, y: rect.top + window.scrollY
    };
}

export function disableRef(ref, disable = true) {
    if (checkNull(ref) && ref.current != null) {
        disableItem(ref.current, disable);
    }
}

export function disableRefChildren(ref, disable = true) {
    if (checkNull(ref) && ref.current != null) {
        for (let child of ref.current.children) {
            disableItem(child, disable);
        }
    }
}

export function disableItem(item, disable = true) {
    if (checkNull(item)) {
        if (disable) {
            $(item).addClass("disable-item");
        } else {
            $(item).removeClass("disable-item");
        }
    }
}

export function disableItemChildren(item, disable = true) {
    if (checkNull(item)) {
        for (let child of item.children) {
            disableItem(child, disable);
        }
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

export async function readCSVData(csvFile, removeHead = true, removeFooter = true) {
    // try {
    //     let csvRows = []
    //     const reader = new FileReader();
    //     reader.onload = async ({ target }) => {
    //         const csv = Papa.parse(target.result, { header: false });

    //         csvRows = csv?.data;//has data in nested-arrays: [["col1", "col2", "col3"], ["col1", "col2", "col3"]]

    //         //Pop header from rows
    //         if (removeHead === true) csvRows.pop();
    //         if (removeFooter === true) csvRows.shift();
    //     };
    //     reader.readAsText(csvFile);
    //     return csvRows
    // } catch (e) {
    //     printError(e)
    // }
}


export function launchUrl(url) {
    window.open(url, "_blank");
}

export function scrollYToElement(element, extra = 0) {
    if (checkNull(element)) {
        const elementY = element.getBoundingClientRect().top + extra;
        window.scroll({top: elementY, behavior: 'smooth'});
    }
}

export function selectCurrentItemWithIndex(currIndex, targetClassName = "", selectedClassName = "selected") {
    if (checkNull(targetClassName = "", "")) {
        const items = document.getElementsByClassName(targetClassName)
        for (let i = 0; i < items.length; i++) {
            const item = items[i]
            if (i !== currIndex) {
                item.classList.remove(selectedClassName)
            } else {
                item.classList.add(selectedClassName)
            }
        }
    }
}


export function focusNextListItem(currIndex, targetClassName = "") {
    if (checkNull(targetClassName = "", "")) {
        const items = document.getElementsByClassName(targetClassName)
        const nextItem = items[currIndex + 1]
        $(nextItem).focus()
    }
}

export function clickNextListItem(currIndex, targetClassName = "") {
    if (checkNull(targetClassName = "", "")) {
        const items = document.getElementsByClassName(targetClassName)
        const nextItem = items[currIndex + 1]
        // nextItem.click()
        $(nextItem).click()
    }
}

export function hideOnNull(data) {
    return {opacity: (data === null || data === undefined) ? 0 : 1}
}

export function hideOnNeg(data) {
    return {opacity: (data < 0) ? 0 : 1}
}

export function hideOnEmpty(data) {
    return {opacity: (data === "") ? 0 : 1}
}

export function downloadFile(fileName, dataToWrite, purifyName = false) {
    if (purifyName === true) fileName = purifyFilename(fileName)

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(dataToWrite)}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = fileName;
    link.click();
}

export function downloadZip(zipName, dataToWrite, purifyName = false) {
    if (purifyName === true) zipName = purifyFilename(zipName)

    const jsonString = `data:text/json;charset=utf-8`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = zipName;
    link.click();
}

/**
 * Returns true if event key is equal to the keyCode.
 */
export function checkEventKeyCode(event, keyCode) {
    if (checkNull(event) && checkNull(keyCode, "")) {
        return event.keyCode === keyCode
    } else {
        return false
    }
}

/**
 * Returns true if event key is equal to the targetKey.
 */
export function checkEventKey(event, targetKey) {
    if (checkNull(event) && checkNull(targetKey, "")) {
        // return ((event.key + "").toLowerCase() === (targetKey + "").toLowerCase())
        return ((event.key + "").toLowerCase() === (targetKey + "").toLowerCase())
    } else {
        return false
    }
}

/**
 * Returns true if eventKey is equal to 'escape'.
 */
export function checkEscapeEventKey(event) {
    return checkEventKey(event, 'escape')
}

/**
 * Returns true if eventKey is equal to 'tab'.
 */
export function checkTabEventKey(event) {
    return checkEventKey(event, 'tab')
}

/**
 * Returns true if eventKey is equal to 'Enter'.
 */
export function checkEnterEventKey(event) {
    return checkEventKey(event, 'Enter')
}

/**
 * Returns true if eventKey is equal to 'backspace'.
 */
export function checkBackspaceEventKey(event) {
    return checkEventKey(event, 'backspace')
}

/**
 * Returns true if eventKey is equal to 'Delete'.
 */
export function checkDeleteEventKey(event) {
    return checkEventKey(event, 'Delete')
}

/**
 * Returns true if eventKey is equal to 'ArrowUp'.
 */
export function checkArrowUpEventKey(event) {
    return checkEventKey(event, 'ArrowUp')
}

/**
 * Returns true if eventKey is equal to 'ArrowDown'.
 */
export function checkArrowDownEventKey(event) {
    return checkEventKey(event, 'ArrowDown')
}

/**
 * Returns true if eventKey is equal to 'ArrowLeft'.
 */
export function checkArrowLeftEventKey(event) {
    return checkEventKey(event, 'ArrowLeft')
}

/**
 * Returns true if eventKey is equal to 'ArrowRight'.
 */
export function checkArrowRightEventKey(event) {
    return checkEventKey(event, 'ArrowRight')
}

/**
 * Returns true if eventKey is equal to 'capslock'.
 */
export function checkCapsEventKey(event) {
    return checkEventKey(event, 'capslock')
}

/**
 * Returns true if KeyCombination is equal to 'CTRL+targetKey'.
 */
export function checkCtrlKeyCombination(event, targetKey) {
    return ((event.ctrlKey || event.metaKey) && checkEventKey(event, targetKey));
}

/**
 * Returns true if KeyCombination is equal to 'SHIFT+targetKey'.
 */
export function checkShiftKeyCombination(event, targetKey) {
    return ((event.shiftKey || event.metaKey) && checkEventKey(event, targetKey));
}

/**
 * Returns true if KeyCombination is equal to 'CTRL+SHIFT+targetKey'.
 */
export function checkCtrlShiftKeyCombination(event, targetKey) {
    return ((event.ctrlKey && event.shiftKey) && checkEventKey(event, targetKey));
}

/**
 * Returns true if KeyCombination is equal to 'ALT+targetKey'.
 */
export function checkAltKeyCombination(event, targetKey) {
    return ((event.altKey || event.metaKey) && checkEventKey(event, targetKey));
}

/**
 * Returns true if KeyCombination is equal to 'ALT+SHIFT+targetKey'.
 */
export function checkAltShiftKeyCombination(event, targetKey) {
    return ((event.altKey && event.shiftKey) && checkEventKey(event, targetKey));
}

/**
 * Returns true if KeyCombination is equal to 'ALT+CTRL+targetKey'.
 */
export function checkAltCtrlKeyCombination(event, targetKey) {
    return ((event.altKey && event.ctrlKey) && checkEventKey(event, targetKey));
}

/**
 * Returns true if KeyCombination is equal to 'CTRL+ALT+SHIFT+targetKey'.
 */
export function checkCtrlAltShiftKeyCombination(event, targetKey) {
    return ((event.ctrlKey && event.altKey && event.shiftKey) && checkEventKey(event, targetKey));
}

export function createAndDownloadZip(zipName, fileNames = [], filesData = []) {
    try {
        if (checkNull(zipName, "") && checkNull(fileNames, []) && checkNull(filesData, [])) {
            // if (filesData.length >= fileNames.length) {
            //     zipName = zipName + ""
            //     if (zipName.endsWith(".zip")) zipName = zipName + ".zip"
            //     if (zipName.endsWith("zip")) zipName = zipName + "zip"

            //     const zip = new JSZip();

            //     //Create fileNames
            //     for (let i = 0; i < fileNames.length; i++) {
            //         const fileName = fileNames[i];
            //         const fileData = filesData[i];
            //         if (checkNull(fileName, "")) {
            //             zip.file(fileName, fileData);
            //         }
            //     }
            //     // const img = zip.folder("images");
            //     // img.file("smile.gif", imgData, {base64: true});

            //     zip.generateAsync({ type: "blob" }).then((content) => {
            //         // saveAs(content, zipName);//saveAs in FileSaver library
            //     });
            //     return { "Message": `Successfully created and downloaded ${zipName} file.` }
            // } else {
            //     return { "Error": "Length of file-data array is not equal to length of files" }
            // }
        } else {
            return {"Error": "Either zip-name or file-names or file-data or all are null."}
        }
    } catch (e) {
        printLog(e)
        return e
    }
}


export function selectDeselectElementWithIndex(className = "", selectClass, index) {
    if (checkNull(className)) {
        const items = document.getElementsByClassName(className);
        for (let i = 0; i < items.length; i++) {
            const serviceName = items[i];
            if (i === index) {
                serviceName.classList.add(selectClass);
            } else {
                serviceName.classList.remove(selectClass);
            }
        }
    }
}

export function findElementPos(element) {
    let currentTop = 0;
    if (checkNull(element)) {
        if (element.offsetParent) {
            do {
                currentTop += element.offsetTop;
            } while ((element = element.offsetParent));
            return [currentTop];
        }
    }
    return [currentTop];
}


/**
 * Update browser url and title without reloading or refreshing the page.
 */
export function updateUrlOnly(title = "Page title", url = "/url", replace = false) {
    // import {useHistory} from "react-router-dom";
    // const history = useHistory()

    // if (replace) history.replaceState({page: 2}, title, url);
    // else history.pushState({page: 2}, title, url);
}

export function toggleClass(element, className) {
    if (checkNull(element)) {
        element.classList.toggle(className)
    }
}

export function addClass(element, className, add = true, check = true) {
    if (checkNull(element)) {
        if (isBoolTrue(add)) {
            if (isBoolTrue(check)) {
                if (!element.classList.contains(className)) element.classList.add(className)
            } else {
                element.classList.add(className)
            }
        } else {
            if (isBoolTrue(check)) {
                if (element.classList.contains(className)) element.classList.remove(className)
            } else {
                element.classList.remove(className)
            }
        }
    }
}

export function addClassInElements(elements = [], className, add = true, check = true) {
    if (checkNullArr(elements)) {
        for (let item of elements) addClass(item, className, add, check)
    }
}

function getWindowSize() {
    window.addEventListener('resize', (e) => {
        printLog('window resized to: ', window.innerWidth, 'x', window.innerHeight)
    })
}

export function getPageScrollYPos(easyWay = true) {
    return easyWay ? document.documentElement.scrollTop : document.body.scrollTop;
}

export function setStyle(element, style) {
    // if (checkNull(element)) element.setAttribute('style', style)
    element.setAttribute('style', style)
}

export function rupeesSymbol() {
    return "₹"
}

/**
 * Download data in csv format:
 *
 * Data format:
 * <pre>
 * const data = {
 *       header: ["Column 1", "Column 2", "Column 3", "Column 4", "Column 5"],
 *       item: [
 *           ["Row 1 Col-1", "Row 1 Col-2", "Row 1 Col-3", "Row 1 Col-4", "Row 1 Col-5"],
 *           ["Row 2 Col-1", "Row 2 Col-2", "Row 2 Col-3", "Row 2 Col-4", "Row 2 Col-5"],
 *           ["Row 3 Col-1", "Row 3 Col-2", "Row 3 Col-3", "Row 3 Col-4", "Row 3 Col-5"],
 *           ["Row 4 Col-1", "Row 4 Col-2", "Row 4 Col-3", "Row 4 Col-4", "Row 4 Col-5"]
 *       ]
 *   };
 * </pre>
 */
export function downloadCSV(data) {
    const filename = 'data.csv';
    const rows = [];
    rows.push(data.header.join(','));
    data.items.forEach(row => {
        rows.push(row.join(','));
    });
    const csvData = rows.join('\n');
    const blob = new Blob([csvData], {type: 'text/csv;charset=utf-8;'});
    if (navigator.msSaveBlob) { // For IE
        navigator.msSaveBlob(blob, filename);
    } else {
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

/**
 * Download data in JSON format:
 *
 * Data format:
 * <pre>
 * const data = {
 *       header: ["Column 1", "Column 2", "Column 3", "Column 4", "Column 5"],
 *       item: [
 *           ["Row 1 Col-1", "Row 1 Col-2", "Row 1 Col-3", "Row 1 Col-4", "Row 1 Col-5"],
 *           ["Row 2 Col-1", "Row 2 Col-2", "Row 2 Col-3", "Row 2 Col-4", "Row 2 Col-5"],
 *           ["Row 3 Col-1", "Row 3 Col-2", "Row 3 Col-3", "Row 3 Col-4", "Row 3 Col-5"],
 *           ["Row 4 Col-1", "Row 4 Col-2", "Row 4 Col-3", "Row 4 Col-4", "Row 4 Col-5"]
 *       ]
 *   };
 * </pre>
 */
export function downloadJSON(data) {
    const filename = 'data.json';
    const blob = new Blob([JSON.stringify(data)], {type: 'text/json;charset=utf-8;'});
    if (navigator.msSaveBlob) { // For IE
        navigator.msSaveBlob(blob, filename);
    } else {
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

export function remToPx(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

export function pxToRem2(px) {
    return px / parseFloat(getComputedStyle(document.documentElement).fontSize);
}

export function toggleAllCheckboxes(element, isChecked) {
    const checkboxes = element.querySelectorAll(`input[type="checkbox"]`);
    checkboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
}


/**
 * Sets cookies in the browser.
 * @param {(Object|string|string[])} cookies - The cookies to set. Can be an object, string, or array of strings.
 * @param {boolean} scramble=true - Whether to scramble cookie-data for security or not. Default is true. It uses {@link scrambleData} function to encode cookies.
 * @example
 * // Setting cookies with a JSON object
 * setCookieInBrowser({
 *   user: "john_doe",
 *   session: "abc123"
 * });
 *
 * @example
 * // Setting cookies with a string
 * setCookieInBrowser("user=john_doe; session=abc123", true);
 *
 * @example
 * // Setting cookies with an array of strings
 * setCookieInBrowser(["user=john_doe", "session=abc123"], false);
 */
export function setCookieInBrowser(cookies, scramble = true) {
    if (typeof cookies === 'object' && !Array.isArray(cookies)) {
        // JSON format
        Object.entries(cookies).forEach(([key, value]) => {
            // const cValue = (isBoolTrue(scramble) && !(value + '').toLowerCase().startsWith('http')) ? encodeURIComponent(value) : value;
            // document.cookie = `${encodeURIComponent(key)}=${isBoolTrue(scramble) ? scrambleData(cValue) : cValue}; path=/`;
            const cValue = value;
            // const cValue = encodeURIComponent(value);
            document.cookie = `${encodeURIComponent(key)}=${cValue}; path=/`;
        });
    } else if (typeof cookies === 'string') {
        // String format
        cookies.split(';').forEach(cookie => {
            const value = (cookie + '').trim();
            // document.cookie = `${isBoolTrue(scramble) ? scrambleData(value) : value}; path=/`;
            document.cookie = `${value}; path=/`;
        });
    } else if (Array.isArray(cookies)) {
        // Array of strings format
        cookies.forEach(cookie => {
            document.cookie = `${cookie}; path=/`;
            // document.cookie = `${isBoolTrue(scramble) ? scrambleData(cookie) : cookie}; path=/`;
        });
    } else {
        console.error('Invalid cookie format!');
        // throw new Error('Invalid cookies format');
    }
}

/**
 * Retrieves the value(s) of specified cookie(s).
 * @param {(string|string[])} keys - The key(s) of the cookie(s) to retrieve.
 * @param {any} defValue - Default-value to return if the key or it's value is null. Default is empty string.
 * @param {boolean} unscramble=true - Whether to unscramble cookie-data or not. Default is true. It uses {@link unscrambleData} function to decode cookies using {@link scrambleData} method.
 * @returns {(string|Object|null)} The value of the cookie if a single key is provided, a JSON object if an array of keys is provided, otherwise null.
 * @example
 * // Get the value of the "user" cookie
 * const user = getBrowserCookie("user");
 * console.log(user); // Output: "john_doe"
 *
 * @example
 * // Get the values of multiple cookies
 * const cookies = getBrowserCookie(["user", "session"]);
 * console.log(cookies); // Output: { user: "john_doe", session: "abc123" }
 */
export function getBrowserCookie(keys, defValue = '', unscramble = true) {
    // if (!checkNullStr(keys) || !checkNullArr(keys)) return defValue;

    const decodedCookies = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookies.split(';');

    const getSingleCookieValue = (key) => {
        const name = encodeURIComponent(key) + "=";
        try {
            for (let cookie of cookieArray) {
                cookie = cookie.trim();
                if (cookie.indexOf(name) === 0) {
                    const value = cookie.substring(name.length, cookie.length);
                    // return getDefValueStr((isBoolTrue(unscramble) && !(value + '').toLowerCase().startsWith('http')) ? unscrambleData(value) : value, defValue);
                    return getDefValueStr(value, defValue);
                }
            }
        } catch (error) {
            console.error(error);
        }
        return defValue;
    }
    try {
        if (typeof keys === 'string') {
            return getSingleCookieValue(keys);
        } else if (Array.isArray(keys)) {
            const cookies = {};
            keys.forEach(key => {
                cookies[key] = getSingleCookieValue(key);
            });
            return cookies;
        } else {
            console.error('Invalid keys format');
        }
    } catch (error) {
        console.error(error);
    }
    return defValue;
}


/**
 * Clears specific cookies from the browser. If the key is null or an empty string, all cookies will be cleared.
 * @param {(string|string[])} keys - The key(s) of the cookie(s) to clear.
 * @param {boolean} clearAll - Whether to clear all cookies or not.
 * @example
 * // Clear the "user" cookie
 * clearBrowserCookie("user");
 *
 * @example
 * // Clear multiple cookies
 * clearBrowserCookie(["user", "session"]);
 *
 * @example
 * // Clear all cookies
 * clearBrowserCookie(null);
 */
export function clearBrowserCookie(keys, clearAll = false) {
    if (isBoolTrue(clearAll)) {
        document.cookie = ``;
    } else {
        const clearSingleCookie = (key) => {
            document.cookie = `${encodeURIComponent(key)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        };

        try {
            if (checkNullArr(keys) || checkNullStr(keys)) {
                // Clear all cookies
                const decodedCookies = decodeURIComponent(document.cookie);
                const cookieArray = decodedCookies.split(';');
                cookieArray.forEach(cookie => {
                    const key = cookie.split('=')[0].trim();
                    clearSingleCookie(key);
                });
            } else if (typeof keys === 'string') {
                // Clear single cookie
                clearSingleCookie(keys);
            } else if (Array.isArray(keys)) {
                // Clear multiple cookies
                keys.forEach(key => {
                    clearSingleCookie(key);
                });
            } else {
                console.log('Invalid keys format');
            }
        } catch (error) {
            console.error(error);
        }
    }
}


/**
 * Function to parse the query string and decode parameters.
 *
 * @example
 * const url = `http://example.com/page?user=test%40example.com&pw=dummypassword(*%26%5E%25tyj`;
 * const params = getDecodedParamsFromUl(url);
 * console.log('url:', url);
 * console.log('params:', params);
 * // Output:
 *  const{
 *          user: 'test@example.com',
 *          pw: 'dummypassword(*&^%tyj'
 *       }
 *
 * @param {string} url The URL to decode parameters from.
 * @return {object} Object containing url-params & their values.
 */
export function getDecodedParamsFromUl(url) {
    const fun = 'getDecodedParamsFromUl:';
    const params = {};
    // Extract the query string from the URL
    try {
        const queryString = url.split('?')[1];
        if (queryString) {
            // Split the query string into individual key-value pairs
            queryString.split('&').forEach(param => {
                try {
                    // Split each pair into a key and a value
                    const [key, value] = (param + '').split('=');
                    // Decode both key and value, and add them to the params object
                    params[decodeURIComponent(key)] = decodeURIComponent(value);
                } catch (error) {
                    printError(fun, 'url:', url, `forEach.param=${param}`, 'error:', error);
                }
            });
        }
    } catch (error) {
        printError(fun, 'url:', url, 'error:', error);
    }
    return params;
}

/**
 * Encode parameters in the URL.
 *
 * @example
 * const urlToEncode = "http://example.com/page";
 * const paramsToEncode = {
 *     user: 'test@example.com',
 *     pw: 'dummypassword(*&^%tyj'
 * };
 *
 * const encodedUrl = getEncodedUrl(urlToEncode, paramsToEncode);
 * console.log('encodedUrl:', encodedUrl);
 * //output
 * encodedUrl: http://example.com/page?user=test%40example.com&pw=dummypassword(*%26%5E%25tyj
 *
 * @param {string} url The URL to encode parameters into.
 * @param {object} params Params object that contains keys & values for encoding.
 * @param {string} defValue Default value to return if any error occur. Default is url itself.
 * @return {string} Url-string containing params & their values in an encoded format.
 */
export function getEncodedUrl(url, params, defValue = '') {
    const fun = 'getEncodedUrl:';
    try {
        const encodedParams = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join('&');
        return `${url}?${encodedParams}`;
    } catch (error) {
        printError(fun, 'url:', url, 'params:', params, 'error:', error);
        return getDefValueStr(defValue, url);
    }
}

/**
 * Encode parameters in the URL.
 *
 * @example
 * const urlToEncode = "http://example.com/page";
 * const encodedUrl = getEncodedUrlWithParam(urlToEncode);
 * console.log('encodedUrl:', encodedUrl);
 * //output
 * encodedUrl: http://example.com/page?user=test%40example.com&pw=dummypassword(*%26%5E%25tyj
 *
 * @param {string} url The URL to encode parameters into.
 * @return {string} Url-string containing params & their values in an encoded format.
 */
export function getEncodedUrlWithParam(url) {
    const fun = 'getEncodedUrl:';
    try {
        const urlParams = getDecodedParamsFromUl(url);
        return checkNullJson(urlParams) ? getEncodedUrl(url, urlParams) : url;
    } catch (error) {
        printError(fun, 'url:', url, 'error:', error);
        return url;
    }
}

/**
 * Get value of a specific parameters from the URL.
 *
 * @example
 * const browserUrl = "http://example.com/page?user=test%40example.com&pw=dummypassword(*%26%5E%25tyj";
 * const paramName = 'user';
 *
 * const paramValue = getUrlParamValue(browserUrl, paramName);
 * console.log('paramName:',paramName, '\nparamValue:', paramValue);
 * //output
 * paramName: user
 * paramValue: test@example.com
 *
 * @param {string} url The URL to extract value of the parameters from.
 * @param {string} paramName Name of parameter whose value is to be extracted.
 * @param {string} defValue Default value to return if any error occur. Default is empty string.
 * @return {string} Value of the specified parameter from url.
 */
export function getUrlParamValue(url, paramName, defValue = '') {
    return getDefJsonValue(getDecodedParamsFromUl(url), paramName, defValue);
}

/**
 * Get value of a specific parameters from the URL.
 *
 * @example
 * //browserUrl: "http://example.com/page?user=test%40example.com&pw=dummypassword(*%26%5E%25tyj";
 * const paramName = 'user';
 *
 * const paramValue = getCurrUrlParamValue(paramName);
 * console.log('paramName:',paramName, '\nparamValue:', paramValue);
 * //output
 * paramName: user
 * paramValue: test@example.com
 *
 * @param {string} paramName Name of parameter whose value is to be extracted.
 * @param {string} defValue Default value to return if any error occur. Default is empty string.
 * @param {string} urlOptional Optional URL, if empty the browser url (window.location.href) will be used. Default is empty string.
 * @return {string} Value of the specified parameter from browser-url.
 */
export function getCurrUrlParamValue(paramName, defValue = '', urlOptional = '') {
    return getUrlParamValue(getDefValueStr(urlOptional, window.location.href + ''), paramName, defValue);
}

/**
 * Check if url has a specific parameters.
 * @param {string} url The URL to check the parameters in.
 * @param {string} paramToCheck Name of parameter to check if it's available in url or not.
 * @return {boolean} Returns true/false depending on parameter is available in url or not.
 * @example
 * const browserUrl = "http://example.com/page?user=test";
 *
 * //example 1 (valid parameter)
 * const paramFound = checkUrlHasParam(browserUrl, 'user');
 * console.log(`Url has param(${'user'}):`,paramFound); //output: true
 *
 * //example 2 (invalid parameter)
 * const paramFound = checkUrlHasParam(browserUrl, 'token');
 * console.log(`Url has param(${'token'}):`,paramFound); //output: false
 */
export function checkUrlHasParam(url, paramToCheck) {
    return jsonHasKey(getDecodedParamsFromUl(url), paramToCheck);
}

/**
 * Check if current-url has a specific parameters.
 * @param {string} paramToCheck Name of parameter to check if it's available in url or not.
 * @return {boolean} Returns true/false depending on parameter is available in url or not.
 * @example
 * //http://example.com/page?user=test;
 *
 * //example 1 (valid parameter)
 * const paramFound = checkCurrUrlHasParam(browserUrl, 'user');
 * console.log(`Url has param(${'user'}):`,paramFound); //output: true
 *
 * //example 2 (invalid parameter)
 * const paramFound = checkCurrUrlHasParam(browserUrl, 'token');
 * console.log(`Url has param(${'token'}):`,paramFound); //output: false
 */
export function checkCurrUrlHasParam(paramToCheck) {
    return jsonHasKey(getDecodedParamsFromUl(window.location.href + ''), paramToCheck);
}

/**
 * Extracts the main domain from a given URL.
 * @param {string} defValue - Default value to return if no domain is found. Default is "".
 * @returns {string} - The main domain of the URL.
 *
 * @example
 * // Example usage:
 * const urls = [
 *     "http://localhost:3000/page-1",
 *     "http://localhost:3000?id=34",
 *     "https://www.xhp.com?mpid=24d3w3e",
 *     "https://www.orielly.org/secret-files",
 *     "https://www.lightfeature.in/misfresh?lpi=4r&hit=dt543wd"
 * ];
 *
 * urls.forEach(url => {
 *     console.log(getUrlMainDomain(url));
 * });
 * //output:
 * http://localhost:3000
 * http://localhost:3000
 * https://www.xhp.com
 * https://www.orielly.org
 * https://www.lightfeature.in
 */
export function getCurrUrlMainDomain(defValue = '') {
    return getUrlMainDomain(window.location.href, defValue);
}

/**
 * Check whether a value/object is react-element or not.
 *
 * @example
 * const reactElement = <div>Hello, React!</div>;
 * console.log(isReactElement(reactElement)); // Output: true
 *
 * const notReactElement = 'Hello';
 * console.log(isReactElement(notReactElement)); // Output: false
 */
export function isReactElement(value) {
    return typeof value === 'object' && checkNull(value) && value.hasOwnProperty('$$typeof');
}

/**
 * Check whether a value/object is an html-element or not.
 *
 * @example
 * const divElement = document.createElement('div');
 * console.log(isHtmlElement(divElement)); // Output: true
 *
 * const notHtmlElement = 'Hello';
 * console.log(isHtmlElement(notHtmlElement)); // Output: false
 */
export function isHtmlElement(value) {
    return value instanceof HTMLElement;
}

export function focusFormIdElement(id, onlyFocus = false, inputFocusDuration = 3000, themeClass = 'primary') {
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
                        element.classList.remove(themeClass);
                        element.classList.add("danger");
                        createTimeout(() => {
                            element.classList.remove("danger");
                            element.classList.add(themeClass);
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

export function sanitizeMobileText(text, maxLen = 14, regex = Patterns.mobStandard, defValue = '') {
    try {
        text = text + '';
        if (maxLen < 0 || (maxLen > 0 && maxLen != -1)) {
            return text
                .replace(regex, '')
                .replaceAll("++", "+").replaceAll("--", "-")
                .replaceAll("-+", "-").replaceAll("+-", "+")
                .replaceAll("  ", " ");
        }
    } catch (error) {
        // console.error(error);
    }
    return defValue;
}

/**
 * Checks if a JSX element or React element has children.
 *
 * @param {React.Element||JSX.Element} element - The React element to check.
 * @returns {boolean} True if the element has children, false otherwise.
 */
export function elementHasChildren(element) {
    try {
        let has = false;
        if (React.isValidElement(element)) {
            has = React.isValidElement(element) && React.Children.count(element.props.children) > 0;
        }
        if (!has) has = element && element.props && element.props.children;
        if (!has) has = checkNullArr(React.Children.toArray(element));
        return has;
    } catch (error) {
        // console.error(error);
        return false;
    }
}

// =================================UI functions end================================


// =================================Common functions start================================

export function getDefValue(src, defValue = "", checkExtra = null) {
    return checkNull(src, checkExtra) ? src : checkNull(defValue) ? defValue : "";
}

export function getDefValueStr(src, defValue = "", trim = true) {
    return checkNullStr(src, trim) ? src : (checkNullStr(defValue, true) ? defValue : "");
}

export function getDefValueNum(src, defValue = 0, trim = true) {
    return checkNullStr(src, trim) ? src : defValue;
}

export function getDefValueBool(src, defValue = false, trim = true) {
    return checkNullStr(src, trim) ? src : defValue;
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

export function colorToHEX(color) {
    if (checkNull(color)) {
        const rgbColor = new RGBColor(color);
        if (rgbColor.ok) {
            return rgbColor.toHex()
        }
    }
    return color
}

export function colorToRGB(color) {
    if (checkNull(color)) {
        const rgbColor = new RGBColor(color);
        if (rgbColor.ok) {
            return rgbColor.toRGB()
        }
    }
    return color
}

export function colorR(color) {
    if (checkNull(color)) {
        const rgbColor = new RGBColor(color);
        if (rgbColor.ok) {
            return rgbColor.r
        }
    }
    return "0"
}

export function colorG(color) {
    if (checkNull(color)) {
        const rgbColor = new RGBColor(color);
        if (rgbColor.ok) {
            return rgbColor.g
        }
    }
    return "0"
}

export function colorB(color) {
    if (checkNull(color)) {
        const rgbColor = new RGBColor(color);
        if (rgbColor.ok) {
            return rgbColor.b
        }
    }
    return "0"
}

export function changeColorAlpha(color, alpha = 1.0) {
    let outColor = color
    if (checkNull(color)) {
        const r = colorR(color)
        const g = colorG(color)
        const b = colorB(color)

        outColor = r + g + b + alpha
        printLog("colorR: ", r);
        printLog("colorG: ", g);
        printLog("colorB: ", b);
        printLog("outColor: ", outColor);
    }
    return outColor
}


export function pxToRem(number, baseNumber = 16) {
    return `${number / baseNumber}rem`;
}

export function pxToVh(valueInPx) {
    return (valueInPx / window.innerHeight) * 100;
    return ((parseInteger((valueInPx + '').replace('px', ''))) / window.innerHeight) * 100;
}

// export function vhToPx(vh) {
//     return (vh / 100) * window.innerHeight;
// }
export function vhToPx(valueInVh) {
    return ((parseInteger((valueInVh + '').replace('vh', ''))) * window.innerHeight) / 100;
}

export function pxToVw(px) {
    return (px / window.innerWidth) * 100;
}

export function vwToPx(vw) {
    return (vw / 100) * window.innerWidth;
}

export function isInt(src) {
    try {
        return Number.isInteger(parseInt(src))
    } catch (e) {
        return false;
    }
}


/**
 * Create a combination of two random suitable colors for gradient effect.
 */
export function generateColorPalette(limit = 2, asStr = false, delimiter = ",") {
    const colors = ["#5b32a8", "#4a148c", "#9c27b0", "#651fff", "#e91e63", "#ff1744", "#f44336", "#b71c1c", "#9c27b0", "#4a148c", "#3f51b5", "#1a237e", "#03a9f4", "#00e5ff", "#009688", "#1de9b6", "#4caf50", "#33691e", "#8bc34a", "#76ff03", "#ffc107", "#ff9800", "#ff6d00", "#f57c00", "#795548", "#3e2723", "#607d8b", "#455a64", "#1b5e20", "#004d40", "#ffeb3b", "#fbc02d", "#e65100", "#bf360c", "#9e9e9e", "#424242", "#78909c", "#263238", "#006064", "#00bcd4", "#304ffe", "#3d5afe", "#01579b", "#039be5", "#0091ea", "#00b8d4", "#00bfa5", "#00c853", "#1b5e20", "#64dd17", "#aeea00", "#ffab00", "#ff6d00", "#ff3d00", "#455a64", "#546e7a", "#424242", "#37474f", "#d500f9", "#c51162", "#4caf50", "#03a9f4", "#00bcd4", "#009688", "#ffc107", "#ff9800", "#ff5722", "#795548", "#9e9e9e", "#607d8b", "#1b5e20", "#00e676", "#f44336", "#ff1744", "#7c4dff", "#651fff", "#00bfa5", "#00c853", "#ffeb3b", "#ff6f00", "#e65100", "#b71c1c", "#9c27b0", "#1a237e", "#03a9f4", "#009688", "#4caf50", "#ffc107", "#ff5722", "#795548", "#BFD7EA", "#61A5C2", "#FCEEB5", "#F07818", "#E8D1C2", "#D4377E", "#F9B5AC", "#E85F7D", "#C5E3BF", "#5E9E59", "#E6B4D6", "#C04FC4", "#FFA07A", "#EE1289", "#F0E68C", "#2E8B57", "#B0C4DE", "#191970", "#FFEBCD", "#CD853F", "#AFEEEE", "#00BFFF", "#F0FFF0", "#32CD32", "#FFF5EE", "#FFD700", "#FFE4C4", "#8B0000", "#D3D3D3", "#696969", "#B0E0E6", "#1E90FF", "#FFC0CB", "#FF1493", "#DDA0DD", "#9400D3", "#F5DEB3", "#A0522D", "#E0FFFF", "#00CED1",];
    colors.concat(getColorPalette());
    const colorPalette = [colors[randomInt(0, colors.length - 1)], colors[randomInt(20, colors.length - 20)]];

    // for (let i = 0; i < limit; i++) {
    //     const firstColor = colors[Math.floor(Math.random() * colors.length)];
    //     const secondColor = colors[Math.floor(Math.random() * colors.length)];
    //     colorPalette.push([firstColor, secondColor]);
    // }

    return isBoolTrue(asStr) ? colorPalette.join(delimiter) : colorPalette;
}

export function getColorPalette() {
    return ["#FF7F50", "#6495ED", "#DC143C", "#00FFFF", "#8A2BE2", "#A52A2A", "#7FFF00", "#FFD700", "#9932CC", "#00BFFF", "#4B0082", "#2E8B57", "#FF00FF", "#FF4500", "#008080", "#FF1493", "#000080", "#008000", "#FF69B4", "#FF8C00", "#00CED1", "#9400D3", "#ADD8E6", "#800080", "#FFA07A", "#20B2AA", "#87CEFA", "#6B8E23", "#FFB6C1", "#7B68EE", "#4169E1", "#FA8072", "#FAEBD7", "#F0E68C", "#DB7093", "#EEE8AA", "#DA70D6", "#BDB76B", "#8B008B", "#FFA500", "#E6E6FA", "#0000FF", "#D8BFD8", "#F4A460", "#F0FFF0", "#FFFF00", "#FFC0CB", "#40E0D0", "#6A5ACD", "#FF00FF", "#008B8B", "#FFFFF0", "#FFFACD", "#DAF7A6", "#A9A9A9", "#00FA9A", "#FFEFD5", "#CD5C5C", "#7CFC00", "#00FF7F", "#F5DEB3", "#FFE4E1", "#1E90FF", "#BC8F8F", "#66CDAA", "#8FBC8F", "#9400D3", "#7FFFD4", "#FFDAB9", "#00FF00", "#00FFFF", "#FF00FF", "#FAFAD2", "#D2691E", "#FFEBCD", "#FFC0CB", "#D2B48C", "#FF6347", "#B0C4DE", "#C71585", "#FFFFE0", "#00CED1", "#A0522D", "#FFFAF0", "#EEE9E9", "#FFFAFA", "#FFE4B5", "#ADFF2F", "#DB7093", "#E0FFFF", "#F5F5DC", "#FFDAB9", "#FFE4C4", "#DEB887", "#90EE90", "#F08080", "#20B2AA", "#F5DEB3", "#E6E6FA", "#3CB371", '#8B6DDE', '#C44536', '#78B7BB', '#ECA400', '#3B3A3C', '#E85F5C', '#2A9D8F', '#F8EDEB', '#F38181', '#3B3B3B', '#70C1B3', '#F7CAC9', '#E8AEB7', '#547980', '#2F4858', '#33658A', '#86BBD8', '#F7DAD9', '#0F0A3C', '#FDD2B5', '#F2D7EE', '#FF7F11', '#B33951', '#4D4F52', '#BEEB9F', '#6B5B95', '#88B04B', '#D1603D', '#5C5B5A', '#E6B8B7', '#669BBC', '#A2B9BC', '#F8C1C1', '#5F9EA0', '#E58E73', '#CE5A57', '#7FB3D5', '#83AF9B', '#EC9B3B', '#A8A7A7', '#C5DCA0', '#69D2E7', '#F38630', '#C7F464', '#556270', '#EDC9AF', '#CF000F', '#002B36', '#BFBFBF', '#373F51', '#D72638', '#263238', '#F7C59F', '#FF9966', '#EA526F', '#FFB88C', '#A2A2A2', '#00A6ED', '#6F9FD8', '#E6E6E6', '#7366BD', '#FF8C42', '#C4E538', '#4F4F4F', '#F18D9E', '#FFB6C1', '#FA8072', '#FFEFD5', '#EB984E', '#85C7F2', '#F7DC6F', '#E5E5E5', '#C5E1A5', '#F6DDCC', '#3C3C3C', '#00818A', '#DD614A', '#A6ACEC', '#A1C181', '#C5D5EA', '#EB974E', '#A8A8A8', '#BFBFBF', '#FFAE03', '#C1D5E0', '#FCD0A1', '#5C5D5B', '#55ACEE', '#9B59B6', '#6F1E51', '#FFA07A', '#CFCFCF', '#84888B', '#F9D5E5', '#BEBEBE', '#1B1B1B', '#1C1C1C', '#4F4F4F', '#343434', '#2F2F2F',]
}

export function getRandomColor() {
    const colors = getColorPalette();
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}

/**
 * Compensate the elements to of nested-array by adding elements to them
 * to equalize the count of each nested-list by a specific number.
 *
 * Example:
 * <pre>
 *     const nestedJsonList=[
 *            [5,6,7,3],
 *            [5,7,"4"],
 *            [7,"234"],
 *            [5,6,"safs"],
 *            ...rest
 *      ];
 *
 *      //Call this method
 *      const updatedNestedList = compensateNestedLists(nestedJsonList=nestedJsonList, compensateNumber=6, valueToFill=NaN);
 *      printLog(updatedNestedList);
 *
 *      //Output:
 *      [
 *            [5, 6, 7, 3, NaN, NaN],
 *            [5, 7, "4", NaN, NaN, NaN],
 *            [7, "234", NaN, NaN, NaN, NaN],
 *            [5, 6, "safs", NaN, NaN, NaN],
 *            ...rest
 *      ]
 *
 *      //Now each nested list has equal number of elements.
 * </pre>
 */
export function compensateNestedLists(nestedList, compensateNumber, fillValue) {
    const updatedList = nestedList.map(nestedArray => {
        const newArray = [...nestedArray]; // Create a copy of the nested array
        while (newArray.length < compensateNumber) { // Loop until the new array has the specified number of elements
            newArray.push(fillValue); // Add the fill value to the end of the array
        }
        return newArray;
    });
    return updatedList;
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

export function isJsonValueTrue(obj, key, checkBinary = false, checkYn = false) {
    return isBoolTrue(getDefJsonValue(obj, key), checkBinary, checkYn);
}

export function isJsonValueFalse(obj, key) {
    return isBoolFalse(getDefJsonValue(obj, key));
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

export function isBoolFalse(boolValue, checkBinary = false, checkYN = false) {
    let value = boolValue === false || boolValue === 'false';
    if (!value && checkBinary) {
        value = isBinaryFalse(boolValue);
    }
    if (!value && checkYN) {
        const boolStr = (boolValue + "").toLowerCase().trim();
        value = boolStr === 'y' || boolStr === 'yes';
    }
    return value;
}

/**
 * Description
 *
 * @param {string} value1 - Value-1 compare differential with value-2.
 * @param {string} value2 - Value-2 compare differential with value-1.
 * @param {string} digLimit - Output digits limit.
 *
 * @example
 * // Usage example:
 * const value1 = 55;
 * const value2 = 28;
 * const result = calculateMultiple(value1, value2);
 * printLog(`The multiple is approximately ${result} times.`);
 */
export function calculateMultipleDiff(value1, value2, digLimit = 2) {
    try {
        // Ensure that both values are numbers
        if (typeof value1 !== 'number' || typeof value2 !== 'number') {
            return 1;
        }
        // Determine the larger and smaller values
        const largerValue = Math.max(value1, value2);
        const smallerValue = Math.min(value1, value2);
        return (largerValue / smallerValue).toFixed(digLimit);
    } catch (e) {
        console.error(e);
        return 1;
    }
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

export function getMatchingStrFromArr(strToFind, strList, containing = true, matchCase = false) {
    if (isBoolTrue(containing)) {
        return strList.find((item) => isBoolTrue(matchCase) ? (item === strToFind) : ((item + '').toLowerCase().includes((strToFind + '').toLowerCase())));
    } else {
        return strList.find((item) => isBoolTrue(matchCase) ? (item === strToFind) : ((item + '').toLowerCase() === (strToFind + '').toLowerCase()));
    }
}

/**
 * Update values of the object 1st from the values of the
 * object-2nd wherever the keys in both objects are similar
 */
export function updateJsonData(objToUpdate, objToUpdateFrom) {
    for (const key in objToUpdate) {
        if (objToUpdateFrom.hasOwnProperty(key)) {
            objToUpdate[key] = objToUpdateFrom[key];
        }
    }
    return objToUpdate;
}

export function limitStringWords(str, limit = -1, delimiter = ' ', postfix = "") {
    const words = (str + "").split(delimiter);
    if (words.length <= limit) return str;
    if (limit >= 0 && words.length >= limit) {
        return words.slice(0, limit).join(delimiter) + postfix;
    }
    return str;
}

export function randomPersonNames() {
    return ['Aria Stone', 'Levi Pierce', 'Sage Riley', 'Ezra Woods', 'Arden Knight', 'Nova Chase', 'Phoenix Hayes', 'Raven Quinn', 'Dante Grey', 'Emery Collins', 'Kai Wolfe', 'Jade Hudson', 'Landon Steele', 'Luna Blake', 'Orion Hunter', 'Zane Knight', 'Cameron Reed', 'Lola Stone', 'Ashton Brooks', 'Finn Sawyer', 'Ivy James', 'Silas Cole', 'Skyler West', 'Nico Vega', 'Rowan Fox', 'August Flynn', 'Willow Banks', 'Jaxon Knight', 'Avery Lane', 'Phoenix Grey', 'River Wolfe', 'Carter Blake', 'Hazel James', 'Hunter Steele', 'Rory Hudson', 'Reese Sawyer', 'Logan Hayes', 'Jordan Knight', 'Taylor Stone', 'Sawyer Brooks', 'Sasha Reed', 'Saylor West', 'Parker Fox', 'Charlie Vega', 'Harlow Banks', 'Hayden Flynn', 'Emerson Lane', 'Remy Grey', 'Ryder Cole', 'Riley Hudson',];

}

export function getRandomName() {
    const names = randomPersonNames();
    const randomIndex = Math.floor(Math.random() * names.length);
    return names[randomIndex];
}

export function invertColor(color) {
    // Parse color string to a 6-digit hexadecimal number
    let hex = color.replace(/[^0-9a-f]/gi, '');

    // Invert the color by taking the complement of the color code
    let invertedHex = (Number(`0x${hex}`) ^ 0xFFFFFF).toString(16).padStart(6, '0');

    // Return the inverted color as a hexadecimal string
    return `#${invertedHex}`;
}

/**
 * Merges 1st level json-fields.
 *
 * Example:
 *
 * <pre>
 *     const data: personal: {
 *       Name: 'John',
 *       Age: 30,
 *       Email: 'john@example.com',
 *       City: 'New York',
 *      },
 *      other: {
 *       light: 'run',
 *       adobe: 'xd',
 *       apple: 'final-cut',
 *   }
 *
 *   printLog("jsonData.merged:", mergeInnerJsonLevelFields(data))
 *   //Output:
 *     {
 *          Name: 'John',
 *          Age: 30,
 *          Email: 'john@example.com',
 *          City: 'New York',
 *          light: 'run',
 *          adobe: 'xd',
 *          apple: 'final-cut'}
 * </pre>
 */
export function mergeJsonFields(data) {
    const mergedData = {};
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const innerData = data[key];
            for (const innerKey in innerData) {
                if (innerData.hasOwnProperty(innerKey)) {
                    mergedData[innerKey] = innerData[innerKey];
                }
            }
        }
    }
    return mergedData;
}

export function shuffleString(str) {
    if (checkNullStr(str)) {
        let arr = str.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.join('');
    } else {
        return str;
    }
}

/**
 * Populate an array to n numbers.
 */
export function populateArr(arr = [], value = undefined, iter = 0) {
    for (let i = 0; i < iter; i++) {
        arr.push(value);
    }
    return arr;
}

/**
 * Returns an array containing specified values to the n number.
 */
export function getPopulatedArr(value = undefined, iter = 0) {
    const arr = [];
    for (let i = 0; i < iter; i++) {
        arr.push(value);
    }
    return arr;
}

export function trim(str) {
    return (str + '').trim();
}

export function loremIpsumText(short = false) {
    const text1 = "Lorem ipsum dolor sit amet, sea an possit urbanitas. Cu quis rebum aliquip nec. Ad mundi putent disputationi eos. Eum ullum nobis consequat ad. Nam an liber solet legendos, nam aperiri inermis praesent ea";
    const text2 = "\n" + "Quo ea minim novum gloriatur. Vim ad sonet sanctus, accommodare comprehensam eu mei. Ex mea justo solet aeterno, pri te dico enim ullum." + " Mei atqui laoreet commune et, ei reque accommodare ius.\n" + "\n" + "Malorum quaeque ex quo, vis ne alii perpetua, invenire eloquentiam pri no. Pertinacia omittantur nam ea, has at tota mentitum pertinax. Ne regione democritum omittantur eam. At luptatum mediocritatem his, ei vis legimus laoreet facilisis, pro habeo latine no.\n";
    return isBoolTrue(short) ? text1 : text1 + text2;
}

export function sonnetText() {
    return "Shall I compare thee to a summer’s day? Thou art more lovely and more temperate. Rough winds do shake the darling buds of May, And summer’s lease hath all too short a date.Then let not winter''s ragged hand deface, In thee thy summer, ere thou be distill'd: Make sweet some vial; treasure thou some place With beauty's treasure ere it be self-kill'd.That use is not forbidden usury, Which happies those that pay the willing loan; That's for thy self to breed another thee, Or ten times happier, be it ten for one; Ten times thy self were happier than thou art, If ten of thine ten times refigur''d thee: When my love swears that she is made of truth. I do believe her though I know she lies"
}

export function poemText() {
    return "What is our life? A play of passion;\n" + "Our mirth the music of division;\n" + "Our mothers’ wombs the tiring-houses be,\n" + "Where we are dressed for this short comedy.\n" + "Heaven the judicious sharp spectator is,\n" + "That sits and marks still who doth act amiss;\n" + "Our graves that hide us from the searching sun\n" + "Are like drawn curtains when the play is done.\n" + "Thus march we, playing, to our latest rest,\n" + "Only we die in earnest – that’s no jest."
}

export function story() {
    return "There once was a young girl named Emma who lived in a small town nestled between the mountains. Emma had always been fascinated by the world beyond her town, but she had never left. Her parents couldn't afford to take her on trips, and the idea of venturing out on her own seemed daunting. But Emma never let her dreams die.She filled her room with maps and books about far - off places and spent hours daydreaming about the adventures she might have one day.She longed to see the ocean, to explore foreign cities, and to meet people from all over the world. One day, Emma decided she couldn't wait any longer. She saved up every penny she could find and bought a one-way ticket to the coast. Her heart raced as she boarded the plane, wondering what she would find on the other side. When she arrived, she was overwhelmed by the sights and sounds of the city.She spent her days exploring, getting lost on purpose, and trying new things.She met people from all over the world, and each conversation left her feeling more inspired than the last. As the weeks turned into months, Emma began to realize that she had found something she never knew she was missing: a sense of purpose.She had always felt like something was missing in her life, but now she knew what it was.She wanted to help people.She wanted to make a difference in the world. Emma returned to her small town, filled with a newfound energy and determination.She started volunteering at the local food bank and organizing charity events.She took classes to become a certified nurse's assistant and began working at the hospital. Every day, she woke up with a sense of purpose and a drive to make a positive impact on the world. As she worked, Emma couldn't help but feel grateful for the experiences that had led her here. She realized that without taking a chance and venturing out into the unknown, she would never have discovered her true calling. She felt a deep sense of joy and fulfillment in helping others, and she knew that she had found her place in the world. Years later, as Emma looked back on her journey, she realized that the emotions she had felt during that time had been a crucial part of her growth.She had experienced fear and uncertainty when she first left her small town, but she had also felt a sense of wonder and excitement at the prospect of discovering new things.She had felt loneliness and homesickness, but she had also found a sense of community and belonging in the people she met along the way.Most of all, she had felt a deep sense of happiness and fulfillment in finding her purpose and making a positive impact on the world. Emma''s story serves as a reminder that even when we feel lost and uncertain, there is always a path forward. By following our passions and taking chances, we can discover new parts of ourselves and find true happiness and fulfillment."
}

export function story2() {
    return "Alex and Lily had been best friends since they were kids. They grew up next door to each other, and everyone in their small town knew that they were inseparable. As they got older, Alex began to realize that he had feelings for Lily that went beyond friendship. He loved the way she laughed, the way she talked, and the way she made him feel. But Alex was afraid to tell Lily how he felt.He didn't want to ruin their friendship or risk losing her altogether. So he kept his feelings to himself, and he watched as Lily dated other guys, always hoping that one day she would realize that the person she was looking for was right in front of her. Years went by, and Alex and Lily both went off to college.They stayed in touch, but they weren't as close as they used to be. Alex dated other girls, but he never felt the same connection he felt with Lily. Meanwhile, Lily was struggling with her own feelings. She had always thought of Alex as a friend, but she couldn't shake the feeling that there was something more between them. One day, Lily called Alex and asked if he wanted to come visit her at college.Alex was nervous but excited at the same time.He packed his bags and set off to see her, hoping that maybe this was his chance to tell her how he felt. When he arrived, Lily took him on a tour of the campus, showing him all of her favorite spots.They talked and laughed, just like old times.As the sun began to set, they sat on a bench overlooking the campus, watching as the sky turned orange and pink. Suddenly, Lily turned to Alex and said, There's something I need to tell you. Alex's heart skipped a beat as he waited for her to continue: I think I'm in love with you, Lily said softly.Alex's heart swelled with happiness and relief.He couldn't believe that the person he had been in love with for so long felt the same way.They leaned in and kissed, and it was like fireworks were going off inside of them.From that moment on, Alex and Lily were inseparable once again.They graduated from college together, and they moved back to their small town.They got jobs, bought a house, and started building a life together.They faced challenges along the way, but they always found a way to make it through.When Alex's father passed away, Lily was there to hold him as he cried.When Lily lost her job, Alex was there to encourage her to follow her dreams.They grew old together, but they never lost the spark that had ignited between them so many years ago.They held hands as they watched the sunset, went on walks through the woods, and laughed until their sides hurt.As they sat on their front porch, looking out at the world they had built together, Lily turned to Alex and said, I love you more every day..Alex smiled and replied, I love you more than words can say..And they sat there, watching the world go by, feeling grateful for the love they had found and the life they had built together.They knew that no matter what challenges lay ahead, they would face them together, side by side, for the rest of their lives."
}

export function isEven(number) {
    try {
        const result = parseInt(number)
        return result % 2 === 0;
    } catch (e) {
        return false;
    }
}

export function isNumOdd(number) {
    return parseInteger(number) % 2 !== 0;
}

export function formatJson(value, indent = 4, withTab = false) {
    let indentValue = withTab ? "\t" : 4;
    return JSON.stringify(value, null, indentValue);
}

export function makeJsonDataUploadable(src) {
    if (checkNull(src)) {
        let jStr = isJson(src) ? JSON.stringify(src) : src + ""
        jStr = JSON.parse(jStr.replaceAll(/&quot;/ig, '"'))
        jStr = jStr
            .replaceAll("'", "")
            .replaceAll("''", "")
            .replaceAll("\"", "")
            .replaceAll("\u2019", "")
        jStr = removeApostrophes(jStr)
        return jStr
        // return src
    } else {
        return src
    }
}

export function sanitizeJsonStr(src = {}) {
    let outData = src;
    if (checkNull(src)) {
        let jStr = (isJson(src) ? JSON.stringify(src) : src) + ""

        //Remove head inverted commas
        if (jStr.charAt(0) === "\"") jStr = jStr.slice(1)
        if (jStr.charAt(0) === "\"" && jStr.charAt(1) === "\"") jStr = jStr.slice(2)
        if (jStr.charAt(0) === "\"" && jStr.charAt(1) === "\"" && jStr.charAt(2) === "\"") jStr = jStr.slice(3)
        if (jStr.charAt(0) === "\"" && jStr.charAt(1) === "\"" && jStr.charAt(2) === "\"" && jStr.charAt(3) === "\"") jStr = jStr.slice(4)

        //Remove trailing inverted commas
        if (jStr.charAt(jStr.length - 1) === "\"") jStr = jStr.slice(0, -1)
        if (jStr.charAt(jStr.length - 1) === "\"" && jStr.charAt(jStr.length - 2) === "\"") jStr = jStr.slice(0, -2)
        if (jStr.charAt(jStr.length - 1) === "\"" && jStr.charAt(jStr.length - 2) === "\"" && jStr.charAt(jStr.length - 3) === "\"") jStr = jStr.slice(0, -3)

        outData = jStr
    }
    return outData;
}

export function isStr(obj) {
    try {
        return typeof obj === 'string';
    } catch (e) {
        return false;
    }
}

export function isJson(obj) {
    try {
        const parsed = JSON.parse(obj);
        return true;
    } catch (e) {
        return false;
        // try {
        //     const parsed = JSON.stringify(obj);
        //     return true;
        // } catch (e) {
        //     return false;
        // }
    }
}

export function isCharAtEnd(str, at = 0, check = "") {
    return str.charAt(str.length - at) === check
}

export function isCharAtStart(str, at = 0, check = "") {
    return str.charAt(at) === check
}

/**
 * Returns true if the object is not null and not undefined.
 */
export function checkNull(obj, checkExtra = null) {
    return obj !== undefined && obj + "" !== 'undefined' && obj !== null && obj + "" !== 'null' && (obj + "").toLowerCase() !== 'nan' && obj !== checkExtra
}

export function checkNullReverse(obj, checkExtra = null) {
    return obj === undefined || obj + "" === 'undefined' || obj === null || obj + "" === 'null' || obj === checkExtra
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

export function arrayHasStr(checkStr, strList, matchCase = false) {
    for (const listItem of strList) {
        if (matchCase ? (listItem + '').includes(checkStr) : (listItem + '').toLowerCase().includes((checkStr + '').toLowerCase())) {
            return true;
        }
    }
    return false;
}

/**
 * Returns true if all the input-values are not null otherwise false.
 */
export function checkNullInputValues(values = []) {
    let allGood = false;
    if (checkNullArr(values)) {
        for (let value of values) {
            if (checkNull(value, "")) {
                allGood = true;
            } else {
                allGood = false;
                break;
            }
        }
    }
    return allGood;
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


export function removeApostrophes(src, replacement = "") {
    return src.replaceAll(/'/g, replacement);
}

/**
 * Removes symbols (e.g. #, /, :, @, +) that are invalid for file naming from file name
 *
 * NOTE: pass only name of the file, NOT it's complete path
 */
export function purifyFilename(fileName, replacement = "_", symbols = ["#", "%", "&", "{", "}", "\\", "/", "//", "<", ">", "?", "/", "$", "!", "'", ":", "@", "+", "`", "|", "=", "*"]) {
    let outName = fileName + ""
    if (checkNull(outName)) {
        for (let symbol of symbols) {
            // if (outName.includes(symbol)) {
            outName = outName.replaceAll(symbol, replacement)
            // }
        }
    }
    return outName
}

/**Returns the factorial of the specified number*/
export function factorial(number) {
    if (number >= 0) {
        if (number === 0) {
            return 0
        } else {
            let factorial = 1;
            for (let i = number; i >= 1; i--) {
                factorial = factorial * i
            }
            printItem(factorial)
            return factorial
        }
    } else {
        return false
    }
}

/**Returns true if the number is prime or false on the vice-versa.
 * PrimeNumber= A number (only natural number, greater than 0 or equal to 0(num>=0)) that is divided by only itself or 1, known as prime number.*/
export function isPrime(number) {
    let is = false
    if (number >= 0) {
        number = parseInt(number)

        if (number === 0 || number === 1) {
            is = false
        } else {
            for (let i = 2; i < number; i++) {
                is = i % 2 === 0;
            }
        }
    }
    return is
}

/**Returns true if the number is armstrong or false on the vice-versa.
 * Armstrong number: If the number is equal to its sum of the digits cube, also called narcissistic number. Example: 371=(3*3*3)+(7*7*7)+(1*1*1)*/
export function isArmstrong(number, showMessage = false) {
    number = parseInt(number)
    let is = false
    let cubeSum = 0;
    if (number === 0) {
        is = false

        if (showMessage) alert(`${number} is not armstrong because its zero.`)
    } else {
        let digits = number.toString().split(``)
        let singleDigit = digits.map(Number)
        for (let i = 0; i < singleDigit.length; i++) {
            cubeSum += (singleDigit[i] * singleDigit[i] * singleDigit[i])
        }
        if (number === cubeSum) {
            is = true

            if (showMessage) alert(`${number} is an armstrong number.`)
        } else {
            is = false

            if (showMessage) alert(`${number} is not an armstrong number.`)
        }
    }
    return is
}

export function splitAnything(item) {
    return item.toString().split(``)
}

/**Splits and returns a string. If start index is 1 it will return the string after the index value and if 0 it will return the string from 0 index till the
 *  split character*/
export function extractString(string, splitChar, before = true) {
    return string.split(splitChar)[(before) ? 0 : 1]
    // return string.split(splitChar).pop()
}

export function getRandomArrItem(arr) {
    return checkNullArr(arr) ? arr[randomInt(0, arr.length - 1)] : null
}

/* Randomize array in-place using Durstenfeld shuffle algorithm */
export function shuffleArray(arr) {
    if (checkNullArr(arr)) {
        for (let i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }
}

export function randomStr(length = 10, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    var result = '';
    var charLen = chars.length;
    let newLength = parseInt(length)
    newLength = newLength > charLen ? charLen : newLength
    // Math.random().toString(36).substr(2, 5),
    for (let i = 0; i < newLength; i++) {
        result += chars.charAt(Math.floor(Math.random() * charLen));
    }
    return result;
}

export function randomInt(min = 5, max = 20) {
    return Math.floor(Math.random() * (max - min)) + min;
}

export function removeArrItem(arr, index) {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i] === index) {
            arr.splice(i, 1);
        }
    }
    return arr
}

export function getStrInitials(str, delimiter = ' ', limit = 2, dropHonorifics = true, middle = '', charAt = 0) {
    if (checkNullStr(str)) {
        // let strArr = ((isBoolTrue(dropHonorifics) ? removeNameHonorific(str, delimiter) : str) + '').split(delimiter);
        // let strArr = removeNameHonorific(str, delimiter).replaceAll('And', '').replaceAll('and', '').trim().split(delimiter);
        let strArr = removeNameHonorific(str, delimiter).trim().split(delimiter);
        if (strArr.length === 0) {
            strArr = str.split();
        }
        let initials = '';
        for (let i = 0; i < strArr.length; i++) {
            if (i < limit) {
                initials += middle + strArr[i].charAt(charAt).toUpperCase();
            }
        }
        return initials;
    } else {
        return str;
    }
}

/**
 * Remove honorific prefixes from a name string.
 *
 * @example
 * console.log(removeNameHonorific("Mr. John Doe")); // Output: "John Doe"
 * console.log(removeNameHonorific("Mrs Jane Smith")); // Output: "Jane Smith"
 * console.log(removeNameHonorific("Dr James Brown")); // Output: "James Brown"
 * console.log(removeNameHonorific("Miss. Emma Johnson")); // Output: "Emma Johnson"
 * console.log(removeNameHonorific("Sir Anthony Hopkins")); // Output: "Anthony Hopkins"
 * console.log(removeNameHonorific("sir anthony hopkins")); // Output: "anthony hopkins"
 */
export function removeNameHonorific(name, delimiter = ' ') {
    const nameL = (name + '').toLowerCase().trim().split(delimiter)[0];
    const honorific = HonorificsPrefixes.find(h => nameL.startsWith(h.toLowerCase()));
    if (honorific) {
        return (name + '').substring(honorific.length).trim();
    }
    return trim(name);
    // let outName = name + '';
    // for (const honorific of HonorificsPrefixes) {
    //     console.log('removeNameHonorific.outName:', outName, 'honorific:', honorific);
    //     outName = outName.replaceAll(honorific, '');
    // }
    // console.log('removeNameHonorific.outName:', outName);
    // return trim(outName);
}

export function sortJsonList(jsonList, sortKey) {
    try {
        jsonList.sort(compareJsonItems(sortKey));
        return jsonList;
    } catch (e) {
        printError(TAG, e);
        return jsonList;
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
}

export function formatRupeesCurrency(num, symbol = "₹") {
    let convertedValue;

    if (num >= 1000000000) {
        convertedValue = (num / 1000000000).toFixed(1) + "B";
    } else if (num >= 100000000) {
        convertedValue = (num / 10000000).toFixed(0) + "Cr";
    } else if (num >= 10000000) {
        convertedValue = (num / 10000000).toFixed(1) + "Cr";
    } else if (num >= 1000000) {
        convertedValue = (num / 1000000).toFixed(1) + "L";
    } else if (num >= 100000) {
        convertedValue = (num / 1000000).toFixed(0) + "L";
    } else if (num >= 1000) {
        convertedValue = (num / 1000).toFixed(1) + "K";
    } else {
        convertedValue = num.toString();
    }
    return symbol + convertedValue;
}

export function formatRupeesCurrencyShort(num, symbol = "₹", currencyValues = [{4: "K"}, {5: "10K"}, {6: "1L"}, {7: "10L"}, {8: "1Cr"}, {8: "10Cr"}, {9: "1B"}, {10: "100B"}, {11: "1T"}, {12: "100T"},]) {
    const numString = num.toString();
    const numLength = numString.length;

    for (let i = currencyValues.length - 1; i >= 0; i--) {
        const digitCount = parseInt(Object.keys(currencyValues[i])[0]);
        if (numLength >= digitCount) {
            const divisor = Math.pow(10, digitCount - 1);
            const shortNum = Math.round(num / divisor);
            return "₹" + shortNum.toString() + currencyValues[i][digitCount];
        }
    }

    return symbol + numString;
}

export function mergeJsons(o1, o2) {
    for (const key in o2) {
        o1[key] = o2[key];
    }
    return o1;
}


export function getGoodString(str) {
    let newStr = "";
    for (let i = 0; i < str.length; i++) {
        if (str[i] === str[i].toUpperCase() && i !== 0) {
            newStr += " " + str[i].toLowerCase();
        } else {
            newStr += str[i];
        }
    }
    return newStr;
}

export function mapJsonKeys(r) {
    return r.keys().map(r);
}

export function filterArrWithStart(arr, char) {
    return arr.filter(str => (str + "").startsWith(char));
}

export function filterArrWithContain(arr, char) {
    // printLog("\nfilterArrWithContain.arr: " + arr)
    // printLog("\nfilterArrWithContain.arr.len: " + arr.length, ", char: " + char)
    // return arr.filter(str => (str + "").includes(char));
    const filteredArr = [];
    for (let i = 0; i < arr.length; i++) {
        if ((arr[i] + "").includes(char)) {
            // printLog("filterArrWithContain.arr.contains(" + char + "): " + arr[i])
            filteredArr.push(arr[i]);
        }
    }
    // printLog("filterArrWithContain.filteredArr.len: " + filteredArr.length)
    return filteredArr;
}

export function filterArrWithEnd(arr, char) {
    return arr.filter(str => (str + "").endsWith(char));
}

export function getJsonListKeys(jsonList, key) {
    return jsonList.map(item => item[key]);
}

export function mergeJsonObjects(...dicts) {
    return dicts.reduce((acc, curr) => {
        return {...acc, ...curr};
    }, {});
}


export function hexToRgb(color) {
    return chroma(color).rgb().join(", ");
}

export function removeSpecialChars(str) {
    return (str + "").replaceAll(/[^\w\d]/gi, '');
}

export function extractDateFormatFromString(src) {
    // Define regular expressions for common date format components
    const regexes = {
        'YYYY': /\bYYYY\b/, 'YY': /\bYY\b/, 'MM': /\bMM\b/, 'M': /\bM\b/, 'DD': /\bDD\b/, 'D': /\bD\b/,
    };

    // Initialize an empty array to store the matched date format components
    const dateComponents = [];

    // Iterate over the regexes and check for matches in the input string
    Object.entries(regexes).forEach(([component, regex]) => {
        if (regex.test(src)) {
            dateComponents.push(component);
        }
    });

    // Join the matched date format components into a string and return it
    return dateComponents.join('-');
}

export function validateStr(str, regex) {
    try {
        return regex.test(str);
    } catch (e) {
        return false;
    }
}

export function dropArrEmptyValues(arr) {
    return arr.filter((value) => checkNullStr(value, true));
}

export function makeArrUnique(arr) {
    return [...new Set(arr)];
}

export function trimJsonValues(obj) {
    if (!checkNullJson(obj)) return obj;
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'string') {
                obj[key] = obj[key].trim();
            } else if (typeof obj[key] === 'object') {
                obj[key] = trimJsonValues(obj[key]);
            }
        }
    }
    return obj;
}

export function trimJsonArrValues(jsonArr = []) {
    let outArr = [];
    jsonArr.map((obj) => outArr.push(trimJsonValues(obj)));
    return outArr;
}

export function checkJsonNotNullValues(obj, count = 1) {
    if (!checkNullJson(obj)) return obj;
    let notNullCount = 0;
    for (const key in obj) {
        if (obj.hasOwnProperty(key) && checkNullStr(obj[key])) {
            notNullCount++;
        }
    }
    return notNullCount === count;
}

export function checkEmptyFields(jsonObj, checkLimit = 1) {
    let emptyCount = 0;
    for (let key in jsonObj) {
        if (jsonObj.hasOwnProperty(key) && !jsonObj[key]) {
            emptyCount++;
            if (emptyCount >= checkLimit) {
                return true;
            }
        }
    }
    return false;
}

export function removeSideCommas(str) {
    return (str + "").replace(/^,|,$/g, "");
}

export function removeCommasAndSpacesFromJsonValues(obj) {
    let outObj = obj;
    for (const key in outObj) {
        if (typeof outObj[key] === 'object') {
            // Recursive call for nested objects or arrays
            removeCommasAndSpacesFromJsonValues(outObj[key]);
        } else if (typeof outObj[key] === 'string') {
            // Remove leading and trailing commas and spaces
            outObj[key] = outObj[key].replace(/^[\s,]+|[\s,]+$/g, '');
        }
    }
    return obj;
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
 * Remove a substring from the source string that contains any of the specific  substrings.
 *
 * const inputString = "email (P), email2 (W), email3 (O), email4, email5";
 * const substringsToRemove = ['(P)', '(W)', '(O)'];
 * const result = removeElementsContaining(inputString, substringsToRemove);
 *
 * Output:  email4, email5
 */
export function removeContainingElementsFromStr(str, substringsToCheck = [], delimiter = ",", exact = true) {
    try {
        const elements = str.split(delimiter); // Convert the string into an array of elements
        const filteredElements = elements.filter((element) => {
            let trimmedElement = (element + "").trim(); // Remove leading/trailing whitespaces
            if (exact) trimmedElement = trimmedElement.toLowerCase(); // Remove leading/trailing whitespaces
            return !substringsToCheck.some((substring) => trimmedElement.includes(exact ? (substring + "").trim().toLowerCase() : substring));
        });
        // Join the filtered elements back into a string
        return filteredElements.join(delimiter);
    } catch (e) {
        printError(TAG, e);
        return str;
    }
}

export function getStrListElementsInitials(strList = []) {
    try {
        const elements = strList.split(',').map((element) => element.trim()); // Split the string into elements and remove leading/trailing whitespaces
        const initials = elements.map((element) => element.charAt(0).toUpperCase()); // Get the first character of each element and convert it to uppercase
        return initials.join(', '); // Join the initials back into a string with comma and space separator
    } catch (e) {
        printError(TAG, e);
        return strList;
    }
};

export function replaceStrElements(string, replaceList = [], replacement = "") {
    try {
        let result = string + "";
        replaceList.forEach((item, index) => {
            result = (result + "").replace(item, replacement);
        });
        return result;
    } catch (e) {
        printError(TAG, e);
        return string;
    }
}

export function updateJsonListValue(list = [], index, keyToUpdate, value) {
    try {
        if (index >= 0 && index < list.length) {
            const item = list[index];
            if (keyToUpdate in item) {
                item[keyToUpdate] = value;
            }
        }
        return list;
    } catch (e) {
        printError(TAG, e);
        return list;
    }
}

export function updateJsonValue(object = {}, keyToUpdate, value) {
    try {
        if (keyToUpdate in object) {
            object[keyToUpdate] = value;
        }
        return object;
    } catch (e) {
        return object;
    }
}

export function emptyJsonValues(object = {}, valueToSet = '', keysToEscape = []) {
    try {
        for (let key in object) {
            if (object.hasOwnProperty(key) && !keysToEscape.includes(key)) {
                object[key] = valueToSet;
            }
        }
        return object;
    } catch (e) {
        return object;
    }
}

export function dropListIndexElement(array = [], index) {
    try {
        if (index < 0 || index >= array.length) {
            // Index is out of bounds
            return array;
        }
        return array.filter((_, i) => i !== index);
    } catch (e) {
        printError(TAG, e);
        return array;
    }
}

export function getColorAlphaVariant(colorCode, alpha = 0.25) {
    // Remove any spaces and convert to lowercase
    colorCode = colorCode.replace(/\s/g, '').toLowerCase();

    // Check if the input color code is valid (6 or 8 characters)
    if (!/^#([0-9a-f]{6}|[0-9a-f]{8})$/.test(colorCode)) {
        throw new Error('Invalid color code format. Please provide a valid hexadecimal color code.');
    }

    // Extract the alpha channel (opacity) from the color code
    let alphaValue = colorCode.length === 8 ? parseInt(colorCode.substr(7, 2), 16) : 255;

    // Calculate the new alpha value based on the input alpha parameter
    alphaValue = Math.round(alphaValue * alpha);

    // Convert the alpha value back to hexadecimal and pad with leading zeros if necessary
    const newAlphaHex = alphaValue.toString(16).padStart(2, '0');

    // Replace the alpha channel in the color code and return the new color code
    return colorCode.replace(/([0-9a-f]{2})$/, newAlphaHex);
}

export function getColorLightVariant(colorCode) {
    // Remove any spaces and convert to lowercase
    colorCode = colorCode.replace(/\s/g, '').toLowerCase();

    // Check if the input color code is valid (6 or 8 characters)
    if (!/^#([0-9a-f]{6}|[0-9a-f]{8})$/.test(colorCode)) {
        throw new Error('Invalid color code format. Please provide a valid hexadecimal color code.');
    }

    // Extract the RGB channels from the color code
    const r = parseInt(colorCode.substr(1, 2), 16);
    const g = parseInt(colorCode.substr(3, 2), 16);
    const b = parseInt(colorCode.substr(5, 2), 16);

    // Calculate the new RGB values by increasing the original values
    const newR = Math.min(Math.round(r * 1.5), 255); // Increase by 50%, ensure it doesn't exceed 255
    const newG = Math.min(Math.round(g * 1.5), 255);
    const newB = Math.min(Math.round(b * 1.5), 255);

    // Convert the new RGB values back to hexadecimal and pad with leading zeros if necessary
    const newColorHex = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;

    // If the original color code had an alpha channel, include it in the new color code
    if (colorCode.length === 9) {
        const alphaHex = colorCode.substr(7, 2);
        return `${newColorHex}${alphaHex}`;
    }

    return newColorHex;
}

/**
 * Convert a string containing 'k' (1000) to a number in JavaScript.
 * If it doesn't contain 'k', the data will not be converted and
 * will be returned as it is.
 *
 * Example:
 * const value = kToInt("54.6k");
 * // output: 54600
 *
 * @param {string} data - The data to be converted.
 * @param {string} k - The key to be converted (default: 'k').
 * @param {number} kEqv - The value equivalent to 'k' (default: 1000).
 * @returns {number|string} The converted number or the original string if not convertible.
 */
export function kToInt(data, k = 'k', kEqv = 1000) {
    try {
        let outData = String(data).toLowerCase();
        if (outData.includes(k)) {
            outData = outData.replace(k, '');
            outData = parseFloat(outData) * kEqv;
            return parseInt(outData);
        }
        return parseFloat(outData);
    } catch (error) {
        return data;
    }
}

/**
 * Convert a number to a string with 'k' notation (e.g., 1000 to "1k").
 *
 * Example:
 * const value = intToK(54600);
 * // output: "54.6k"
 *
 * @param {number} num - The number to be converted.
 * @param {string} k - The key to represent 'k' notation (default: 'k').
 * @param {number} kEqv - The value equivalent to 'k' (default: 1000).
 * @returns {string} The converted string with 'k' notation.
 */
export function intToK(num, k = 'k', kEqv = 1000) {
    // if (num >= kEqv) {
    //     const dividedNum = num / kEqv;
    //     return dividedNum % 1 === 0 ? `${dividedNum}${k}` : `${dividedNum.toFixed(1)}${k}`;
    // }
    // return num.toString();
    if (num >= kEqv) {
        const dividedNum = num / kEqv;
        if (Number.isInteger(dividedNum)) {
            return `${Math.floor(dividedNum)}${k}`;
        }
        return `${dividedNum.toFixed(1)}${k}`;
    }
    return num + '';
}

export function makeJsonListUnique(arr, uniqueKey) {
    const uniqueMap = new Map();
    const uniqueArray = [];
    for (const item of arr) {
        if (!uniqueMap.has(item[uniqueKey])) {
            uniqueMap.set(item[uniqueKey], true);
            uniqueArray.push(item);
        }
    }
    return uniqueArray;
}

/**
 * Converts a large number into a readable string.
 *
 * @example
 * console.log('100000:', convertNumberToHumanReadableString(100000));//100k
 * console.log('1500:', convertNumberToHumanReadableString(1500));//1.5k
 * console.log('1920000:', convertNumberToHumanReadableString(1920000));//1.9m
 * console.log('54500000:', convertNumberToHumanReadableString(54500000));//54.5.m
 * console.log('138005000:', convertNumberToHumanReadableString(138505000));//138.5m
 *
 * @param {number} number The number to convert.
 * @return {string} The converted number in a readable format.
 */
export function convertNumberToHumanReadableString(number) {
    // const abbreviations = ["k", "m", "b", "t"];
    // if (number < 1000) return number.toString();
    // const tier = Math.log10(number) / 3 | 0; // Determine the tier (thousand, million, billion, etc.)
    // const suffix = abbreviations[tier - 1]; // Get the appropriate suffix
    // const formattedNumber = (number / Math.pow(1000, tier)).toFixed(1);
    // return `${formattedNumber}${suffix}`;
    const abbreviations = ["k", "m", "b", "t"];
    if (number < 1000) return number.toString();
    const tier = Math.log10(number) / 3 | 0; // Determine the tier (thousand, million, billion, etc.)
    const suffix = abbreviations[tier - 1]; // Get the appropriate suffix
    const formattedNumber = (number / Math.pow(1000, tier)).toFixed(1).replace(/\.0$/, ''); // Remove decimal and trailing zeros
    return `${formattedNumber}${suffix}`;
}

export function jsonListToCsvFormat(data, prefix = '', postfix = '', delimiter = '\n') {
    if (data.length === 0) {
        return '';
    }
    const headers = Object.keys(data[0]);
    const csvHeader = headers.join(', ');
    const csvRows = data.map((obj) => {
        return headers.map((header) => {
            return obj[header];
        }).join(', ');
    });
    let csvStr = [csvHeader, ...csvRows].join(delimiter).replaceAll("\"", "");
    csvStr = `${checkNullStr(prefix) ? prefix + delimiter : prefix}${csvStr}${checkNullStr(postfix) ? delimiter + postfix : postfix}`;
    return csvStr;
}

export function convertJsonObjectsListToPlainFormat(srcList) {
    if (!srcList || srcList.length === 0) {
        return [];
    }
    const columns = Object.keys(srcList[0]);
    const plainRows = [columns];
    srcList.forEach((row) => {
        const plainRow = columns.map((column) => {
            return row[column];
        });
        plainRows.push(plainRow);
    });
    return plainRows;
}

export function replaceInString(inputString, replaceStrings = [], replacement = '', all = true) {
    let outStr = inputString + '';
    if (!checkNullStr(outStr) || !checkNullArr(replaceStrings)) {
        return outStr;
    }
    for (const replaceStr of replaceStrings) {
        outStr = isBoolTrue(all) ? outStr.replace(new RegExp(replaceStr, 'g'), replacement) : outStr.replaceAll(new RegExp(replaceStr, 'g'), replacement);
    }
    return outStr;
}

export function removeTrailingComma(src) {
    let outStr = src + '';
    if (outStr.endsWith(',')) {
        return outStr.slice(0, -1);
    }
    return outStr.trim();
}

/**
 * Returns the largest string value from in the given array of strings.
 */
export function findExtremeString(strings = [], largest = true, defValue = '') {
    if (!checkNullArrWithDropEmpty(strings)) {
        return defValue;
    }
    let extremeString = strings[0];
    for (let i = 1; i < strings.length; i++) {
        if (checkNullStr(strings[i])) {
            if (isBoolTrue(largest)) {
                if ((strings[i] + '').length > (extremeString + '').length) {
                    extremeString = strings[i];
                }
            } else {
                if ((strings[i] + '').length < (extremeString + '').length) {
                    extremeString = strings[i];
                }
            }
        }
    }
    return extremeString;
}

/**
 * Returns the highest numbers value from in the given array of numbers.
 */
export function findExtremeNumber(numbers = [], highest = true, defValue = 0) {
    if (!checkNullArrWithDropEmpty(numbers)) {
        return defValue;
    }
    let extremeNumber = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
        if (checkNullStr(numbers[i])) {
            if (highest) {
                if (numbers[i] > extremeNumber) {
                    extremeNumber = numbers[i];
                }
            } else {
                if (numbers[i] < extremeNumber) {
                    extremeNumber = numbers[i];
                }
            }
        }
    }
    return extremeNumber;
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

export function sumInts(values = [], defValue = 0) {
    if (!checkNullArr(values, true)) return defValue;
    return values.reduce((acc, currValue) => {
        if (checkNullStr(currValue) && !isNaN(currValue)) {
            return acc + currValue;
        }
    });
}

export function parseInteger(value, defValue = 0) {
    return checkNullStr(value) && !isNaN(value) ? parseInt(value) : defValue;
}


export function printLog(...logs) {
    console.log(...logs);
}

export function printError(...logs) {
    console.error(...logs);
}

export function printWarn(...logs) {
    console.warn(...logs);
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
export function moveJsonListItems(list, targetKey, commonKeyValue, moveUp = true) {
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

/**
 * Sorts an array of number in either ascending or descending order.
 *
 * @param {any[]} arr - The array of numbers to be sorted.
 * @param {boolean} [ascending=true] - If true, sorts in ascending order; if false, sorts in descending order.
 * @returns {number[]} - The sorted array.
 *
 * @example
 * const numbers = [5, 2, 8, 1, 4];
 * const ascendingOrder = sortNumberList(numbers); // Sorts in ascending order
 * const descendingOrder = sortNumberList(numbers, false); // Sorts in descending order
 * console.log(ascendingOrder); // Output: [1, 2, 4, 5, 8]
 * console.log(descendingOrder); // Output: [8, 5, 4, 2, 1]
 */
export function sortNumberList(arr, ascending = true) {
    const comparator = (a, b) => (ascending ? a - b : b - a);
    return arr.slice().sort(comparator);
}

/**
 * Sorts an array of numbers or strings in either ascending or descending order.
 *
 * @param {Array<number|string>} arr - The array of numbers or strings to be sorted.
 * @param {boolean} [ascending=true] - If true, sorts in ascending order; if false, sorts in descending order.
 * @returns {Array<number|string>} - The sorted array.
 *
 * @example
 * const data = [5, 'apple', 2, 'orange', 8, 'banana', 1, 'grape', 4];
 * const ascendingOrder = sortList(data); // Sorts in ascending order
 * const descendingOrder = sortList(data, false); // Sorts in descending order
 * console.log(ascendingOrder); // Output: [1, 2, 4, 5, 8, 'apple', 'banana', 'grape', 'orange']
 * console.log(descendingOrder); // Output: ['orange', 'grape', 'banana', 'apple', 8, 5, 4, 2, 1]
 */
export function sortList(arr, ascending = true) {
    let sortedList = [];
    try {
        const comparator = (a, b) => {
            if (typeof a === 'number' && typeof b === 'number') {
                sortedList = ascending ? a - b : b - a;
            } else if (typeof a === 'string' && typeof b === 'string') {
                sortedList = ascending ? a.localeCompare(b) : b.localeCompare(a);
            }
            // If types are different, maintain the order
            return 0;
        };
        sortedList = arr.slice().sort(comparator);
    } catch (e) {
        // printError(e)
    }
    return sortedList;
}

/**
 * @example
 *     const srcData = [
 *         "Agree|Agree////Not agree////Strongly disagree////Neutral////Option 4",
 *         "Satisfaction|Agree////Not agree////Strongly disagree////Neutral////Option 4",
 *     ];
 *     const srcAnswers = [
 *         "Agree|Very",
 *         "Satisfaction|Not Much",
 *     ];
 *
 *     const likertFormattedData = formatLikertData({
 *         srcData: likertSrcData,
 *         stmtKey: 'statements',
 *         optionColumnsKey: 'optionColumns',
 *         stmtDelimiter: '|',
 *         optionDelimiter: '////',
 *     });
 *     console.log(likertFormattedData);
 *
 *     //Output:
 *     {
 *          statements: [
 *              { id: 1, statement: 'Agree' },
 *              { id: 2, statement: 'Satisfaction' }
 *          ],
 *          optionColumns: [ 'Agree', 'Not agree', 'Strongly disagree', 'Neutral', 'Option 4' ]
 *          answers: [ { "Agree": "Very" }, { "Satisfaction": "Not Much" } ]
 *      }
 */
export function formatLikertData({
                                     srcData = [],
                                     srcAnswers = [],
                                     stmtKey = 'statements',
                                     optionColumnsKey = 'optionColumns',
                                     ansKey = 'answers',
                                     stmtDelimiter = '|',
                                     optionDelimiter = '////',
                                 }) {
    try {
        const statements = [];
        const optionColumns = [];
        const answers = [];

        if (checkNullArr(srcData)) {
            srcData.forEach((item, index) => {
                const [statement, optionsString] = (item + '').split(stmtDelimiter);
                const stmtObj = {id: index + 1, statement};
                statements.push(stmtObj);

                const options = (optionsString + '').split(optionDelimiter);
                optionColumns.push(...options);

                //answers //['Agree|Very']
                const currAns = getArrIndexValue(srcAnswers, index, '');
                const ansStmt = getStrSplitArrIndexValue(currAns, 0, '|');
                const ansValue = getStrSplitArrIndexValue(currAns, 1, '|');
                const selectedAnsValue = ansStmt == statement ? ansValue : '';
                answers.push({[statement]: selectedAnsValue});//[ { "Agree": "Very" },  ]
            });
        }
        const uniqueOptionColumns = [...new Set(optionColumns)]; // Remove duplicates

        return {
            [stmtKey]: statements, [optionColumnsKey]: uniqueOptionColumns, [ansKey]: answers,
        };
    } catch (e) {
        return {};
    }
}


/**
 * Sort json-objects containing list;
 *
 * @example
 * // Example Usage:
 * const jsonList = [
 *    {name: 'b item name 1'},
 *    {name: 'a item name 3'},
 *    {name: 'c item name 2'},
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
export function sortJsonListAdvance(jsonArray, key, ascending = true) {
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
 * Shuffle elements of any elements or json/object-array.
 *
 * @example
 * const jsonList = [
 *    {name: 'a: item name 1'},
 *    {name: 'b: item name 2'},
 *    {name: 'c: item name 3'},
 *    {name: 'd: item name 4'},
 * ];
 * const shuffledList = shuffleList(jsonList, 'name');
 * console.log(shuffledList);
 * //output:
 *  [
 *    {name: 'b: item name 2'},
 *    {name: 'c: item name 3'},
 *    {name: 'a: item name 1'},
 *    {name: 'd: item name 4'},
 * ];
 *
 * @param {Array<Object>} jsonList An array of elements or json/objects to be sorted.
 * @param {string} jsonSortKey A target-jsonSortKey to sort the list with if the list is json-list (OPTIONAL).
 */
export function shuffleList(jsonList, jsonSortKey = null) {
    try {
        // Copy the original jsonList to avoid mutating it
        const shuffledList = [...jsonList].reverse();

        // Shuffle the jsonList using the Fisher-Yates algorithm
        for (let i = shuffledList.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledList[i], shuffledList[j]] = [shuffledList[j], shuffledList[i]];
        }

        // If a jsonSortKey is specified, sort the shuffled jsonList based on the jsonSortKey's value
        if (checkNullStr(jsonSortKey)) {
            shuffledList.sort((a, b) => (a[jsonSortKey] > b[jsonSortKey]) ? 1 : -1);
        }
        return shuffledList;
    } catch (error) {
        console.error(error);
        return jsonList;
    }
}

/**
 * Extract website name from the URL.
 *
 * @param {string} url - Url to extract name from.
 *
 * @example
 *
 * // Test the function with your URLs
 * const urls = [
 *     "https://www.facebook.com/some-name/",
 *     "https://www.linkedin.com/in/some-name/",
 *     "https://www.instagram.com/some-name/",
 *     "https://www.docplexus.com/some-name/",
 *     "https://www.website.com/some-name/"
 * ];
 *
 * const extractedNames = urls.map(extractWebsiteName);
 * console.log(extractedNames);
 * Output: [ 'Facebook', 'Linkedin', 'Instagram', 'Docplexus', 'Website' ]
 */
export function extractWebsiteName(url) {
    // // Remove the protocol (http/https)
    // let withoutProtocol = (url + '').replace(/^https?:\/\//, '');
    //
    // // Remove www
    // withoutProtocol = withoutProtocol.replace(/^www\./, '');
    //
    // // Extract the string before .com
    // const regExpMatchArray = withoutProtocol.match(/([^\/]+)\.(com|org|net|io|co|in|edu|gov|biz|info|me|name)/i);
    // if (regExpMatchArray) {
    //     return changeStringCase(regExpMatchArray[1], 'capitalize');
    // }
    //
    // // Remove common domain extensions
    // withoutProtocol = withoutProtocol.replace(/\.(com|org|net|io|co|in|edu|gov|biz|info|me|name)$/i, '');
    //
    // // Extract the remaining part
    // const parts = withoutProtocol.split('/');
    // const domain = parts[0];
    //
    // return changeStringCase((domain + '').split('.')[0], 'capitalize');

    // Remove the protocol (http/https)
    let withoutProtocol = (url + '').replace(/^https?:\/\//, '');

    // Remove www
    withoutProtocol = withoutProtocol.replace(/^www\./, '');

    // Special handling for LinkedIn URLs
    if (withoutProtocol.toLowerCase().includes('linkedin')) return 'LinkedIn';
    if (withoutProtocol.toLowerCase().includes('facebook')) return 'Facebook';
    if (withoutProtocol.toLowerCase().includes('instagram')) return 'Instagram';
    if (withoutProtocol.toLowerCase().includes('twitter')) return 'Twitter';

    // Extract the string before common domain extensions (com|org|net|io|co|in|edu|gov|biz|info|me|name)
    const match = withoutProtocol.match(/([^\/]+)\.(com|org|net|io|co|in|edu|gov|biz|info|me|name)/i);
    if (match) {
        return changeStringCase(match[1], 'capitalize');
    }

    // Remove remaining domain extensions
    withoutProtocol = withoutProtocol.replace(/\.(com|org|net|io|co|in|edu|gov|biz|info|me|name)$/i, '');

    // Extract the remaining part
    const parts = withoutProtocol.split('/');
    const domain = parts[0];

    return changeStringCase((domain + '').split('.')[0], 'capitalize');
}

export function calcDuration(startTime) {
    try {
        return formatTimeMS(performance.now() - startTime);
    } catch (e) {
        printError(TAG, 'calcDuration:', e);
        return -1;
    }
}

export function formatTimeMS(ms) {
    try {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        const remainingSeconds = seconds % 60;
        const remainingMinutes = minutes % 60;

        const formattedTime = [];
        if (hours > 0) {
            formattedTime.push(`${hours}h`);
        }
        if (remainingMinutes > 0) {
            formattedTime.push(`${remainingMinutes}m`);
        }
        if (remainingSeconds > 0) {
            formattedTime.push(`${remainingSeconds}s`);
        }
        return formattedTime.join(' ');
    } catch (e) {
        printError(TAG, 'formatTimeMS:', e);
        return '';
    }
}

/**
 * Format elements of an array into json-Object with its repeat-count.
 *
 * @example
 * const inputCategories = [
 *         "Pandemic", "Radiology", "Mammogram", "Radiology", "Health", "Radiologist", "Ultrasound", "Healthcare", "Pandemic",
 * ];
 *
 * const formattedResult = formatArrElementsToJsonWithRepeatCount(inputCategories,'category', 'value');
 * console.log(formattedResult);
 * //Outout:
 * [
 *   { category: 'Pandemic', value: 2 },
 *   { category: 'Radiology', value: 2 },
 *   { category: 'Mammogram', value: 1 },
 *   { category: 'Health', value: 1 },
 *   { category: 'Radiologist', value: 1 },
 *   { category: 'Ultrasound', value: 1 },
 *   { category: 'Healthcare', value: 1 }
 * ]
 */
export function formatArrElementsToJsonWithRepeatCount(srcList, key = 'category', repeatKey = 'value') {
    if (!checkNullArr(srcList)) return [];
    const categoryCounts = {};
    srcList.forEach(category => {
        if (categoryCounts[category]) {
            categoryCounts[category]++;
        } else {
            categoryCounts[category] = 1;
        }
    });
    return Object.keys(categoryCounts).map(category => ({
        [key]: category, [repeatKey]: categoryCounts[category],
    }));
}

/**
 * Reorders a list of JSON objects based on the specified order of keys.
 *
 * @example
 * // Example usage:
 * const orderKeys = ['item 1', 'item 2', 'item 3', 'item 4x'];
 * const jsonList = [{"item 3": "data"}, {"item 1x": "data"}, {"item 4x": "data"}, {"item 2x": "data"}];
 *
 * // Example 1: Drop unmatched items
 * const desiredList1 = reorderJsonListAdvance(orderKeys, jsonList, true);
 * console.log(desiredList1);
 *
 * // Example 2: Add unmatched items at the end
 * const desiredList2 = reorderJsonListAdvance(orderKeys, jsonList, false);
 * console.log(desiredList2);
 *
 * @param {string[]} orderKeys - The order in which keys should appear.
 * @param {Object[]} jsonList - The list of JSON objects to be reordered.
 * @param {boolean} dropUnmatched - Whether to drop unmatched keys (true) or add them at the end (false).
 * @returns {Object[]} - The reordered list of JSON objects.
 */
export function reorderJsonListAdvance(orderKeys, jsonList, dropUnmatched = true) {
    if (!checkNullArr(orderKeys) || !checkNullArr(jsonList)) return jsonList;
    const reorderedList = orderKeys
        .map(key => jsonList.find(obj => obj && obj.hasOwnProperty(key)))
        .filter(obj => obj !== undefined || !dropUnmatched)
        .filter(obj => checkNullJson(obj));

    const unmatchedItems = jsonList
        .filter(obj => !orderKeys.some(key => obj && obj.hasOwnProperty(key)))
        .map(obj => Object.fromEntries(Object.entries(obj).filter(([key]) => orderKeys.includes(key))))
        .filter(obj => checkNullJson(obj));

    return [...reorderedList, ...unmatchedItems];
}

/**
 * Reorders a list of strings based on the specified order of keys.
 *
 * @example
 * // Example usage:
 * const stringList = ['item 3', 'item 1', 'item 2', 'item 4x'];
 * const orderKeys = ['item 1', 'item 2', 'item 3', 'item 4'];
 *
 * // Example 1: Drop unmatched items
 * const desiredList1 = reorderStringList(orderKeys, stringList, true);
 * console.log(desiredList1);
 * //Output:
 * [ 'item 1', 'item 2', 'item 3' ]
 *
 * // Example 2: Add unmatched items at the end
 * const desiredList2 = reorderStringList(orderKeys, stringList, false);
 * console.log(desiredList2);
 * //Output:
 * [ 'item 1', 'item 2', 'item 3', 'item 4x' ]
 *
 * @param {string[]} orderKeys - The order in which keys should appear.
 * @param {string[]} stringList - The list of strings to be reordered.
 * @param {boolean} dropUnmatched - Whether to drop unmatched keys (true) or add them at the end (false).
 * @returns {string[]} - The reordered list of strings.
 */
export function reorderStringList(stringList, orderKeys, dropUnmatched = false) {
    if (!checkNullArr(stringList) || !checkNullArr(orderKeys)) return stringList;
    return orderKeys
        .filter(key => stringList.includes(key))
        .concat(isBoolTrue(dropUnmatched) ? [] : stringList.filter(str => !orderKeys.includes(str)));
}

/**
 * Re-arrange json-Object keys by comparing them against another object-keys.
 * The missing keys will be moved to the end of the Object.
 *
 * @example:
 * const srcData = {c: 1, d: 2, a: 3, b: 4};
 * const orderKeysData = {a: 3, c: 1, d: 2};
 *
 * const rearrangedData = rearrangeJsonKeysWithComparison(srcData, orderKeysData);
 * console.log(rearrangedData);
 * //output
 * { a: 3, c: 1, d: 2, b: 4 }
 */
export function rearrangeJsonKeysWithComparison(srcData = {}, orderKeysData = {}) {
    try {
        const reorderedData = {};

        // Iterate through orderKeysData keys
        Object.keys(orderKeysData).forEach((key) => {
            // Check if the key exists in srcData
            if (srcData.hasOwnProperty(key)) {
                // Add the key-value pair to reorderedData
                reorderedData[key] = srcData[key];
            }
        });

        // Iterate through srcData keys to add any remaining keys
        Object.keys(srcData).forEach((key) => {
            // Add the key-value pair to reorderedData if not added already
            if (!reorderedData.hasOwnProperty(key)) {
                reorderedData[key] = srcData[key];
            }
        });

        return reorderedData;
    } catch (error) {
        return srcData;
    }
}

/**
 * Group object-elements of a json-list based on a target-key.
 *
 * @example
 * const jsonList=[
 *   { item: "Item 1", moduleName: 'Module X' },
 *   { item: "Item 2", moduleName: 'Module Y' },
 *   { item: "Item 3", moduleName: 'Module Z' },
 *   { item: "Item 4", moduleName: 'Module Y' },
 *   { item: "Item 5", moduleName: 'Module X' },
 * ];
 *
 * //with asPlainList = true
 * const groupedListPlain = groupJsonListElementsByKey(jsonList, 'moduleName', true);
 * //output: [
 *   { item: "Item 1", moduleName: 'Module X' },
 *   { item: "Item 5", moduleName: 'Module X' },
 *   { item: "Item 2", moduleName: 'Module Y' },
 *   { item: "Item 4", moduleName: 'Module Y' },
 *   { item: "Item 3", moduleName: 'Module Z' },
 * ]
 *
 * //with asPlainList = false
 * const groupedListGrouped = groupJsonListElementsByKey(jsonList, 'moduleName', false);
 * //output: [
 *   { 'Module X': [item: "Item 1", moduleName: 'Module X', "Item 5", moduleName: 'Module X' ] },
 *   { 'Module Y': [item: "Item 2", moduleName: 'Module Y', "Item 4", moduleName: 'Module Y' ] },
 *   { 'Module Z': [item: "Item 3", moduleName: 'Module Z' ] },
 *
 * @param {array} jsonList: The list of objects.
 * @param {string} targetKey: Target-key for grouping.
 * @param {Boolean} asPlainList: If set <code>true</code> it returns a plain-list otherwise grouped-list (check the example).
 */
export function groupJsonListElementsByKey(jsonList, targetKey, asPlainList = true) {
    if (!checkNullArr(jsonList) || !checkNullStr(targetKey)) return jsonList;
    try {
        const outLists = jsonList.reduce((result, item) => {
            const targetValue = getDefJsonValue(item, targetKey);

            // Create an array for the targetValue if it doesn't exist
            result[targetValue] = result[targetValue] || [];

            // Push the item to the array
            result[targetValue].push(item);

            return result;
        }, {});
        return isBoolTrue(asPlainList) ? Object.values(outLists).reduce((acc, curr) => [...acc, ...curr]) : outLists;
        // return isBoolTrue(asPlainList) ? Object.values(outLists).reduce((acc, curr) => [...acc, ...curr]) : Object.values(outLists);
        // return outLists;
    } catch (exception) {
        printError('groupJsonListElementsByKey:', exception)
        return jsonList;
    }
}

/**
 * @example
 * const obj = {
 *     Object1: { "Key 1": [], "Key 2": 2, "Key 3": {} },
 *     Object2: { "Key 4": [], "Key 5": 2, "Key 6": {} },
 * };
 *
 * const mergedKeys = mergeJsonNestedKeys(obj);
 * console.log(mergedKeys);
 * //output:
 * { "Key 1": [], "Key 2": 2, "Key 3": {}, "Key 4": [], "Key 5": 2, "Key 6": {} }
 */
export function mergeJsonNestedKeys(obj = {}) {
    return Object.values(obj).reduce((acc, year) => {
        for (const key in year) {
            acc[key] = year[key];
        }
        return acc;
    }, {});
}

/**
 * Sort integer/string json-object keys based on their values.
 *
 * @example
 * // Example usage with integer values:
 * const intData = { "Key 1": 1, "Key 2": 5, "Key 3": 20, "Key 4": 2 };
 * const sortedIntData = sortJsonKeysByValues(intData, true);//ascending order
 * //output
 * { "Key 3": 20, "Key 2": 5, "Key 4": 2, "Key 1": 1 }
 *
 * // Example usage with string values:
 * const strData = { "Key 1": "a", "Key 2": "abc", "Key 3": "abcd", "Key 4": "mm" };
 * const sortedStrData = sortJsonKeysByValues(strData, true);//ascending order
 * //output
 * { "Key 3": "abcd", "Key 2": "abc", "Key 4": "mm", "Key 1": "a" }
 */
export function sortJsonKeysByValues(obj = {}, ascending = true) {
    try {
        const sortedKeys = Object.keys(obj).sort((a, b) => {
            const valueA = obj[a];
            const valueB = obj[b];
            const isIntA = Number.isInteger(valueA);
            const isIntB = Number.isInteger(valueB);

            if (isIntA && isIntB) {
                return ascending ? valueA - valueB : valueB - valueA;
            } else if (!isIntA && !isIntB) {
                return ascending ? valueA.length - valueB.length : valueB.length - valueA.length;
            } else {
                return isIntA ? -1 : 1;
            }
        });

        const sortedObj = {};
        sortedKeys.forEach(key => {
            sortedObj[key] = obj[key];
        });

        return sortedObj;
    } catch (error) {
        return obj;
    }
}

/**
 * Sort json-object keys based on their alphabetical order.
 *
 * @example
 * // Example usage with integer values:
 * const intData = { "A": 1, "C": 5, "X": 20, "M": 2 };
 * const sortedIntData = sortJsonKeysByValues(intData, true);//ascending order
 * //output
 * { "A": 1, "C": 5, "M": 2, "X": 20 }
 *
 * @param {object} obj - The JSON object to be sorted.
 * @param {boolean} ascending - Whether to sort in ascending order (true) or descending order (false).
 * @returns {object} - The sorted JSON object.
 */
export function sortJsonKeysAlphabetically(obj = {}, ascending = true) {
    try {
        const sortedKeys = Object.keys(obj).sort((a, b) => {
            // Compare keys alphabetically
            return ascending ? a.localeCompare(b) : b.localeCompare(a);
        });

        // Create a new object with sorted keys
        const sortedObj = {};
        sortedKeys.forEach(key => {
            sortedObj[key] = obj[key];
        });

        return sortedObj;
    } catch (error) {
        return obj;
    }
}

export function encodeString(message) {
    // let encodedMessage = btoa(message + '');
    // encodedMessage = encodedMessage.split('').reverse().join('');
    // return encodedMessage;
    try {
        // Attempt to encode directly using btoa
        // return btoa(message + '').split('').reverse().join('');
        return encodeURI(message + '').replace(/%/g, '%25').split('').reverse().join('');
    } catch (error) {
        printError('encodeString.error:', error);
        // If btoa fails, convert to UTF-8 data URL before encoding
        return encodeURI(message + '').replace(/%/g, '%25').split('').reverse().join('');
    }
}

export function decodeString(encodedMessage) {
    // let decodedMessage = (encodedMessage + '').split('').reverse().join('');
    // decodedMessage = atob(decodedMessage);
    // return decodedMessage;
    try {
        // Attempt to decode directly using atob
        // return atob((encodedMessage + '').split('').reverse().join(''));
        return decodeURI((encodedMessage + '').replace(/%25/g, '%'));
    } catch (error) {
        printError('decodeString.error:', error);
        // If atob fails, assume data URL encoding and decode accordingly
        return decodeURI((encodedMessage + '').replace(/%25/g, '%'));
    }
}

export function checkIsNumber(value) {
    return /^\d+$/.test(value);
};

/**
 * Convert a date into IO String.
 *
 * @example
 * const srcData = '2024-04-10T11:47:00.000Z';
 * const formattedDate = formatDateToIoString(srcData);
 * console.log(formattedDate); // Output: 2024-04-10T11:47
 */
export function formatDateToIoString(date, startIndex = 0, endIndex = 16) {
    if (checkNullStr(date)) {
        try {
            return new Date(date).toISOString().slice(startIndex, endIndex);
        } catch (error) {
            // console.error(error);
        }
    }
    return date;
}

/**
 * Convert readable size into bytes.
 *
 * @example
 * console.log(convertReadableSizeToBytes('10mb')); // 10485760
 * console.log(convertReadableSizeToBytes('5kb')); // 5120
 * console.log(convertReadableSizeToBytes('1.5gb')); // 1610612736
 * console.log(convertReadableSizeToBytes('100')); // 100
 */
export function convertReadableSizeToBytes(sizeString, defValue = 0) {
    try {
        const units = {
            'b': 1, 'kb': 1024, 'mb': 1024 * 1024, 'gb': 1024 * 1024 * 1024, 'tb': 1024 * 1024 * 1024 * 1024
        };

        const regex = /^(\d*\.?\d+)\s*(\w+)?$/;
        const match = (sizeString + '').match(regex);

        // if (!match) {
        //     throw new Error('Invalid size string');
        // }

        const value = parseFloat(match[1]);
        const unit = match[2] || 'b';

        // if (!units[unit.toLowerCase()]) {
        //     throw new Error('Invalid unit');
        // }

        return value * units[unit.toLowerCase()];
    } catch (error) {
        // console.error(error);
        return defValue;
    }
}

/**
 * Extracts the inner text from an HTML tag string.
 *
 * @param {string} tagString - The HTML tag string.
 * @param {any} defValue - Default-value to return if any error occur.
 * @returns {string} The inner text extracted from the tag string.
 *
 * @example
 * const text1 = extractHtmlInnerText('<p>This is a paragraph.</p>');
 * console.log(text1); // Output: "This is a paragraph."
 *
 * const text2 = extractHtmlInnerText('<div>Hello, world!</div>');
 * console.log(text2); // Output: "Hello, world!"
 *
 * const text3 = extractHtmlInnerText('<span class="highlight">Important text</span>');
 * console.log(text3); // Output: "Important text"
 *
 * const text4 = extractHtmlInnerText('<img src="image.jpg" alt="Sample Image">');
 * console.log(text4); // Output: ""
 *
 * const text5 = extractHtmlInnerText('<p>This is <strong>bold</strong> text.</p>');
 * console.log(text5); // Output: "This is bold text."
 *
 * const text6 = extractHtmlInnerText('<p>This is special-strings &nbsp; text.</p>');
 * console.log(text6); // Output: "This is special-strings text."
 */
export function extractHtmlInnerText(tagString, defValue = '') {
    try {
        // const regex = /<[^>]*>([^<]*)<\/[^>]*>/g;
        // const matches = tagString.match(regex);
        // if (matches) {
        //     return matches.map(match => match.replace(/<\/?[^>]+(>|$)/g, '')).join(' ');
        // }
        // Decode HTML entities
        tagString = he.decode(tagString);

        // Extract inner text from the tag string
        const regex = /<[^>]*>([^<]*)<\/[^>]*>/g;
        const matches = tagString.match(regex);
        if (matches) {
            return matches.map(match => match.replace(/<\/?[^>]+(>|$)/g, '')).join('');
        }
    } catch (error) {
        // console.error(error);
    }
    return getDefValueStr(defValue, tagString);

}

/**
 * Create a delay for asynchronous operations.
 *
 * @param {number} ms The delay to apply to the operation.
 *
 * @example
 * async function runAsyncLoop() {
 *     return new Promise(async (resolve, reject) => {
 *         const state = {lastIndex: -1};
 *         const array = [1, 2, 3, 4, 5];
 *
 *         for (let i = 0; i < array.length; i++) {
 *             await createAsyncDelay(1000); // Wait for 1 second before continuing
 *             state.lastIndex = i; // Update the last index indirectly through the object
 *             console.log('Current index:', state.lastIndex);
 *         }
 *         resolve(state.lastIndex);
 *     });
 * }
 *
 * findLastIndexWithTimeout().then(lastIndex => console.log('Last index:', lastIndex));
 *
 * //output
 * Current index: 0 //after 1 second
 * Current index: 1 //after 1 second
 * Current index: 2 //after 1 second
 * Current index: 3 //after 1 second
 * Current index: 4 //after 1 second
 * Last index: 4 //after 1 second
 */
export async function createAsyncDelay(ms) {
    return await new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Convert timestamp to readable date-format.
 * @param {Number} timestamp Timestamp to convert into readable date-format.
 * @param {string} format Date-time format. Default null: DD-MMM-YYYY M:H:S:AM/PM
 * @example:
 * const timestamp = 1619236800; // Unix timestamp in seconds
 * const readableTime = timestampToReadableTime(timestamp);
 * console.log(readableTime); // Output: 4/24/2021, 12:00:00 AM
 */
export function timestampToReadableTime(timestamp, format = Constants.DD_MMM_YYYY_DASH_HMSA) {
    try {
        // Convert timestamp to milliseconds
        const milliseconds = timestamp * 1000;

        // Create a new Date object with the milliseconds
        const date = new Date(milliseconds);

        // Convert the date to a readable string using the toLocaleString method
        return checkNullStr(format) ? formatDate(date.toLocaleString(), format) : date.toLocaleString();
    } catch (error) {
        // console.error(error);
        return '';
    }
}

/**
 * Convert a duration-String to a readable duration.
 *
 * @example
 * console.log(formatTime("01:00")); // Output: 1 hr
 * console.log(formatTime("00:45")); // Output: 45 minutes
 * console.log(formatTime("04:22")); // Output: 4:22 hrs
 * console.log(formatTime("00:01")); // Output: 1 minute
 * console.log(formatTime("00:00")); // Output: 00:00 hr
 */
export function formatDurationToReadable(timeString, defValue) {
    if (!checkNullStr(timeString)) return defValue;

    const [hours, minutes] = timeString.split(':').map(Number);

    if (hours === 0 && minutes === 0) {
        return '00:00 hr';
    } else if (hours === 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (minutes === 0) {
        return `0${hours}:00 hr`;
    } else {
        return `${hours <= 1 ? '0' + hours : hours}:${minutes <= 1 ? '0' + minutes : minutes} hrs`;
    }
}

/**
 * Generates a random string that is unique & different from any of the element of string-list.
 *
 * @param {Array<String>} stringList The string-list to be used when generating the random string so the new string could be unique & different.
 * @param {number} length The length of the string that will be generated.
 *
 * @example
 * // Example usage:
 * const stringList = ['abc', 'def', 'xyz'];
 * const uniqueString = generateUniqueString(stringList);
 * console.log('Unique String:', uniqueString);
 */
export function generateUniqueString(stringList, length = 20) {
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    let randomString = '';
    let isUnique = false;
    stringList = checkNullArr(stringList) ? dropArrDuplicates(stringList) : [];
    while (!isUnique) {
        randomString = '';
        for (let i = 0; i < length; i++) {
            randomString += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        isUnique = !stringList.includes(randomString);
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
export function objectHasValue(obj, value, exact = true) {
    return Object.values(obj).map(item => isBoolTrue(exact) ? item : (item + '').toLowerCase().trim()).includes(isBoolTrue(exact) ? value : (value + '').toLowerCase().trim());
}

/**
 * Get the value from object if it matches the provided search value.
 * @param {object} obj - The object to search value in.
 * @param {*} searchValue - The value to search for in object.
 * @param {*} defValue - Default value to return if no value is matched.
 * @param {Boolean} exact - Whether match should be exact or not. Default is <code>true</code>.
 * @returns {*} - The matched value from object, or undefined if not found.
 *
 * @example
 * const Data = { key1: 'Value 1', key2: 'Value 2' };
 * const matchedValue = getMatchedValueFromObj(Data, 'Value 1 ', -1, true);
 * console.log(`Matched value from object: ${matchedValue}`);//output: Value 1
 *
 * //match value: true
 * const matchedValue = getMatchedValueFromObj(Data, 'value 1 ', -1, true);
 * console.log(`Matched value from object: ${matchedValue}`);//output: -1
 *
 * //match value: false
 * const matchedValue = getMatchedValueFromObj(Data, 'value 1 ', -1, false);
 * console.log(`Matched value from object: ${matchedValue}`);//output: Value 1
 */
export function getMatchedValueFromObj(obj, searchValue, defValue, exact = true) {
    const foundKey = Object.keys(obj).find(key => {
        return objectHasValue(obj, searchValue, exact) && (isBoolTrue(exact) ? obj[key] == searchValue : trim(obj[key]).toLowerCase() == trim(searchValue).toLowerCase());
    });
    return checkNullJson(foundKey) ? getDefJsonValue(obj, foundKey, defValue) : defValue;
}

/**
 * Merge objects of object-list.
 *
 * @param {Array<Object>} objArr - Array of object to be converted into a single plain object.
 * @param {object} defValue - Default value to return if any error occur. Default is an empty object.
 * @return {Object} Returns the merged object, or the defValue if any error occur.
 *
 * @example
 * const objArr = [{key1: 'Value 1'}, {key2: 'Value 2'}];
 * const mergedObj = mergeListObjects(objArr);
 * //output
 * {key1: 'Value 1', key2: 'Value 2'}
 */
export function mergeListObjects(objArr, defValue = {}) {
    try {
        return objArr.reduce((acc, obj) => {
            return {...acc, ...obj};
        }, {});
    } catch (error) {
        // console.error(error);
        return defValue;
    }
}

/**
 * Generate variants from a search string with a specific coverage-ratio/matching-threshold.
 * @param {string} searchString - The search string.
 * @param {number} matchingThreshold - The minimum coverage ratio (between 0 and 1) for each variant. Default: 0.50.
 * @param {number} minCharLimit - The minimum character limit for each word & It can be -1 or greater. Default: -1.
 * @returns {Array<string>} - An array containing variants of the search string.
 * @example
 * const searchString = "the main artery that runs from a";
 * const matchingThreshold = 0.50;
 *
 * //example with min char-limit: 3
 * const minCharLimit = 3;
 * const variants = generateStringVariants(searchString, matchingThreshold, minCharLimit);
 * console.log(variants);
 * // Output: [ 'main', 'artery', 'arte', 'rter', 'tery', 'that', 'runs', 'from' ]
 *
 * //example with min char-limit: 0 or -1
 * const minCharLimit = 0;
 * const variants = generateStringVariants(searchString, matchingThreshold, minCharLimit);
 * console.log(variants);
 * // Output: [
 *   'the main artery that', 'the main artery that runs', 'the main artery that runs from', 'the main artery that runs from a', 'main artery that', 'main artery that runs', 'main artery that runs from', 'main artery that runs from a', 'artery that runs', 'artery that runs from', 'artery that runs from a', 'that runs from a'
 * ]
 */
export function generateStringVariants(searchString, matchingThreshold = 0.50, minCharLimit = -1) {
    if (!checkNullStr(searchString)) return [];

    searchString = (searchString + '').toLowerCase().trim();
    if (parseInteger(matchingThreshold) > 1) matchingThreshold = 0.50;

    const words = searchString.split(/\s+/);
    const n = words.length;

    const variants = [];

    // Generate variants
    if (minCharLimit > 0) {
        words.forEach(word => {
            word = word + '';
            if (word.length >= minCharLimit) {
                // Add the whole word
                variants.push(word);

                // Generate variants based on the matching threshold
                const thresholdLength = Math.max(Math.ceil(word.length * matchingThreshold), minCharLimit);
                for (let i = 0; i <= word.length - thresholdLength; i++) {
                    variants.push(word.substring(i, i + thresholdLength));
                }
            } else {
                // If the word has less than minCharLimit characters, add the word as is
                // variants.push(word);
            }
        });
    } else {
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j <= n; j++) {
                const variant = words.slice(i, j).join(' ');
                if (variant.length >= matchingThreshold * searchString.length) {
                    variants.push(variant);
                }
            }
        }
    }
    return dropArrEmptyValues(dropArrDuplicates(variants));
}

/**
 * Sort json-objects based on date-values in ascending/descending order.
 * @example
 * const dateList = [
 *                    {date: "2022-08-15T11:20:18.000Z"}
 *                    {date: "2024-02-15T11"},
 *                    {date: "2023-05-07"},
 *                 ];
 * console.log(sortJsonListWithDate(dateList, 'date', false));//ascending: false
 * //output:
 * [
 *   { date: '2024-02-15T11' },
 *   { date: '2023-05-07' },
 *   { date: '2022-08-15T11:20:18.000Z' }
 * ]
 */
export function sortJsonListWithDate(jsonList, sortKey = 'date', ascending = true) {
    try {
        jsonList.sort((a, b) => {
            const dateA = new Date(a[sortKey]).getTime();
            const dateB = new Date(b[sortKey]).getTime();
            return isBoolTrue(ascending) ? dateA - dateB : dateB - dateA;
        });
    } catch (error) {
    }
    return jsonList;
}

/**
 * Generates the ordinal indicator for a given number.
 * @param {number} number - The number for which to generate the ordinal indicator.
 * @param {boolean} includeNumber - Whether to include the number in returning indicator. Default: false.
 * @param {any} defValue - Default indicator to return if number is malformed or any error occur. Default: "".
 * @returns {string} The ordinal indicator ('st', 'nd', 'rd', or 'th').
 * @example
 * // Example usage:
 * const ordinal1 = generateOrdinalIndicator(1); // ordinal1 = 'st'
 * const ordinal2 = generateOrdinalIndicator(2); // ordinal2 = 'nd'
 * const ordinal3 = generateOrdinalIndicator(3); // ordinal3 = 'rd'
 * const ordinal11 = generateOrdinalIndicator(11); // ordinal11 = 'th'
 * const ordinal23 = generateOrdinalIndicator(23); // ordinal23 = 'rd'
 */
export function generateOrdinalIndicator(number, includeNumber, defValue = '') {
    if (!checkNullStr(number)) return defValue;
    number = parseInteger(number);
    const lastDigit = number % 10;
    const secondLastDigit = Math.floor(number / 10) % 10;

    let indicator = '';
    if (secondLastDigit === 1) {
        indicator = 'th';
    } else {
        switch (lastDigit) {
            case 1:
                indicator = 'st';
                break;
            case 2:
                indicator = 'nd';
                break;
            case 3:
                indicator = 'rd';
                break;
            default:
                indicator = 'th';
                break;
        }
    }
    return isBoolTrue(includeNumber) ? `${number}${indicator}` : indicator;
}

/**
 * Calculates a future date and time based on a given duration.
 *
 * @param {object} params
 * @param {Date | string} params.currDate - Current-date, i.e.: new Date() or '2024-05-31T07:32:56.070Z'.
 * @param {number} params.value - The numeric duration-value representing the duration.
 * @param {string} params.unit - The duration-unit {@link DurationUnits} of time for the duration.
 * @param {string} params.format - (Optional) Date-time format for the future-Date (Date will be formatted if it's not empty). Default is: YYYY-MM-DD HH:mm:ss
 * @param {boolean} params.toISO - Whether to convert to ISO format or not. Default is false.
 * @param {any} params.defValue - Def-value to return if dur-unit doesn't match or error occurs.
 * @returns {string} The future date and time in the format .
 *
 * @example
 * // 5 minute from now
 * const futureDate = getFutureDate({currDate: new Date(), value: 5, unit: DurationUnits.mn.unit}); //5 minutes from now
 * console.log('Current date:', new Date().toISOString(), `Duration: 5 minute,`, 'futureDate:', futureDate);
 * //output: Current date: 2024-05-22T09:55:42.827Z Duration: 5 Minute, futureDate: 2024-05-22 10:00:42
 *
 * // 7 days from now
 * const futureDate = getFutureDate({value: 5, unit: DurationUnits.hr.unit}); //7 days from now
 * console.log('Current date:', new Date().toISOString(), `Duration: 7 days,`, 'futureDate:', futureDate);
 * //output: CCurrent date: 2024-05-22T09:57:47.431Z Duration: 7 Day, futureDate: 2024-05-29 09:57:47
 *
 * // 3 years from now
 * const futureDate = getFutureDate({value: 5, unit: DurationUnits.hr.unit}); //3 years from now
 * console.log('Current date:', new Date().toISOString(), `Duration: 3 years,`, 'futureDate:', futureDate);
 * //output: Current date: 2024-05-22T09:59:31.549Z Duration: 3 Year, futureDate: 2027-05-22 09:59:31
 */
export function getFutureDate({currDate = new Date(), value, unit, format = 'YYYY-MM-DD HH:mm:ss', toISO = false, defValue = ''}) {
    const date = new Date(currDate); // Use the actual current date and time
    value = Number(value);
    if (!checkNullStr(value) || !checkNullStr(value)) return defValue;
    switch (unit) {
        case DurationUnits.mn.unit:
            date.setMinutes(date.getMinutes() + value);
            break;
        case DurationUnits.hr.unit:
            date.setHours(date.getHours() + value);
            break;
        case DurationUnits.dy.unit:
            date.setDate(date.getDate() + value);
            break;
        case DurationUnits.wk.unit:
            date.setDate(date.getDate() + value * 7);
            break;
        case DurationUnits.mnth.unit:
            date.setMonth(date.getMonth() + value);
            break;
        case DurationUnits.yr.unit:
            date.setFullYear(date.getFullYear() + value);
            break;
        default:
            return defValue;
    }

    // Format the date to 'YYYY-MM-DD HH:mm:ss'
    const futureDate = isBoolTrue(toISO) ? date.toISOString().slice(0, 19).replace('T', ' ') : date;
    return checkNullStr(format) ? formatDate(futureDate, format) : futureDate;
    // return date;
}


/**
 * Extracts the main domain from a given URL.
 * @param {string} url - The URL to extract the domain from.
 * @param {string} defValue - Default value to return if no domain is found. Default is "".
 * @returns {string} - The main domain of the URL.
 *
 * @example
 * // Example usage:
 * const urls = [
 *     "http://localhost:3000/page-1",
 *     "http://localhost:3000?id=34",
 *     "https://www.xhp.com?mpid=24d3w3e",
 *     "https://www.orielly.org/secret-files",
 *     "https://www.lightfeature.in/misfresh?lpi=4r&hit=dt543wd"
 * ];
 *
 * urls.forEach(url => {
 *     console.log(getUrlMainDomain(url));
 * });
 * //output:
 * http://localhost:3000
 * http://localhost:3000
 * https://www.xhp.com
 * https://www.orielly.org
 * https://www.lightfeature.in
 */
export function getUrlMainDomain(url, defValue = '') {
    try {
        const urlObject = new URL(url);
        return `${urlObject.protocol}//${urlObject.hostname}${urlObject.port ? ':' + urlObject.port : ''}`;
    } catch (error) {
        console.error('Invalid URL:', url);
        return defValue;
    }
}

/**
 * Extracts the base URL segment from a given URL.
 * @param {string} url - The full URL from which to extract the base segment.
 * @returns {string|null} The extracted base URL segment or null if not found.
 *
 * @example
 * // Example usage:
 * const urls = [
 *     "http://localhost:3000/admin/login",//output: /admin
 *     "http://localhost:3000/main-admin?xp=34rd",//output: /main-admin
 *     "http://localhost:3000/domain.subdomain/sub-admin/page1/data",//output: /domain.subdomain
 *     "http://localhost:3000/port-domain/domain-admin",//output: //port-domain
 *     "http://subdomain.domain.com/sd-admin/?xp=sf2d"//output: /sd-admin
 * ];
 *
 * urls.forEach(url => {
 *     const baseUrlSegment = extractBaseUrlSegment(url);
 *     console.log(`Base URL segment for ${url}: ${baseUrlSegment}`);
 * });
 */
export function extractBaseUrlSegment(url) {
    try {
        const parsedUrl = new URL(url);
        const pathname = parsedUrl.pathname;
        const baseSegment = pathname.match(/\/[^\/]+/);
        return baseSegment ? baseSegment[0] : null;
    } catch (error) {
        console.error('Invalid URL:', error);
        return null;
    }
}

/**
 * Groups elements of json-array the provided list of grouping keys.
 *
 * This function iterates through an array of event objects and groups them into nested lists
 * based on the values in the provided `groupingKeys` list. Events with matching values for
 * all keys in the `groupingKeys` list will be placed in a nested list within the returned array.
 * Events that don't match any existing group are placed in separate nested lists at the end
 * of the returned array.
 *
 * @param {Array<Object>} jsonArr - An array of event objects.
 * @param {Array<String>} groupingKeys - A list of keys to use for grouping events.
 * @returns {Array<Array<Object>>} - An array of nested arrays containing the grouped events.
 *
 * @example
 * const jsonArr = [
 *     {userId: 200, email: "xyz@example.com", eventId: 53, eventType: "Online Meeting"},
 *     {userId: 202, email: "abc@example.com", eventId: 60, eventType: "Express Meeting"},
 *     {userId: 205, email: "asd@example.com", eventId: 53, eventType: "Online Meeting"},
 *     {userId: 210, email: "fgh@example.com", eventId: 60, eventType: "Express Meeting"},
 *     {userId: 230, email: "vbf@example.com", eventId: 75, eventType: "Eureka Meeting"},
 *     {userId: 233, email: "uyf@example.com", eventId: 80, eventType: "Lodge Meeting"}
 * ];
 * const groupedList = groupJsonListByKeys(jsonArr);
 * console.log(groupedList);
 * //Output:
 * [
 *   [
 *     { userId: 200, email: 'xyz@example.com', eventId: 53, eventType: 'Online Meeting'  },
 *     { userId: 205, email: 'asd@example.com', eventId: 53, eventType: 'Online Meeting' }
 *   ],
 *   [
 *     { userId: 202, email: 'abc@example.com', eventId: 60, eventType: 'Express Meeting' },
 *     { userId: 210, email: 'fgh@example.com', eventId: 60, eventType: 'Express Meeting' }
 *   ],
 *   [
 *     { userId: 230, email: 'vbf@example.com', eventId: 75, eventType: 'Eureka Meeting' }
 *   ],
 *   [
 *     { userId: 233, email: 'uyf@example.com', eventId: 80, eventType: 'Lodge Meeting' }
 *   ]
 * ]
 */
export function groupJsonListByKeys(jsonArr, groupingKeys) {
    const groupedData = {}; // Object to store grouped events

    for (const event of jsonArr) {
        // Create a key by joining event values for each grouping key
        const key = groupingKeys.map((key) => event[key]).join("-");

        if (!groupedData[key]) {
            groupedData[key] = []; // Create a new array for this key if it doesn't exist
        }

        groupedData[key].push(event); // Push the current event to the corresponding array
    }

    const finalGroups = []; // Array to store the final grouped events

    // Iterate through the groupedData object and create nested arrays
    for (const key in groupedData) {
        finalGroups.push(groupedData[key]);
    }

    // Add remaining unmatched events (if any)
    const unmatchedEvents = jsonArr.filter((event) => !finalGroups.some((group) => group.every((item) => {
        for (const key of groupingKeys) {
            if (item[key] !== event[key]) {
                return false;
            }
        }
        return true;
    })));

    if (unmatchedEvents.length > 0) {
        finalGroups.push(unmatchedEvents);
    }

    return finalGroups;
}

export function dateToTimestamp(date = new Date(), defValue = randomStr(10, '1234567890')) {
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
 * Check whether a date is expired or not.
 *
 * @param {string | Date} date- Date to check.
 * @return {boolean} Returns true if the date is expired otherwise false.
 *
 * @example
 * const dateExpired = isDateExpired('2020-02-20 15:55:00');
 * console.log(dateExpired); //output: true
 *
 * const dateExpired = isDateExpired('2025-06-25');
 * console.log(dateExpired); //output: false
 */
export function isDateExpired(date) {
    return dateToTimestamp(date) < dateToTimestamp();
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
export function deepObjectComparison(obj1, obj2) {
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

/**
 * Transforms any data type into unreadable data while maintaining the same character length.
 * The transformation is reversible and ensures the encoding is universally readable.
 *
 * @param {any} data - The input data to be transformed.
 * @returns {string} The transformed, unreadable data.
 *
 * @example
 * // Transforming a string
 * const originalString = "Hello, World!";
 * const scrambledString = scrambleData(originalString);
 * console.log(scrambledString);
 *
 * @example
 * // Transforming a number
 * const originalNumber = 12345;
 * const scrambledNumber = scrambleData(originalNumber);
 * console.log(scrambledNumber);
 *
 * @example
 * // Transforming an object
 * const originalObject = { name: "Alice", age: 30 };
 * const scrambledObject = scrambleData(originalObject);
 * console.log(scrambledObject);
 *
 * @example
 * // Transforming an array
 * const originalArray = [1, 2, 3, 4, 5];
 * const scrambledArray = scrambleData(originalArray);
 * console.log(scrambledArray);
 *
 * @example
 * // Transforming null
 * const scrambledNull = scrambleData(null);
 * console.log(scrambledNull);
 *
 * @example
 * // Transforming undefined
 * const scrambledUndefined = scrambleData(undefined);
 * console.log(scrambledUndefined);
 */
export function scrambleData(data) {
    try {
        if (data == undefined) return data;

        // Convert data to a JSON string
        const jsonString = JSON.stringify(data);

        // Encode the JSON string to UTF-8 bytes
        const utf8Bytes = new TextEncoder().encode(jsonString);

        // Encode the UTF-8 bytes to Base64
        const base64String = fromByteArray(utf8Bytes);

        // Scramble the Base64 string by shifting each character's char code
        let scrambledString = '';
        for (let i = 0; i < base64String.length; i++) {
            const charCode = base64String.charCodeAt(i);
            scrambledString += String.fromCharCode(charCode + 1); // Shift char code by 1
        }

        return scrambledString;
    } catch (error) {
        console.error(error);
        return data;
    }
}

/**
 * Reverts the scrambled data back to its original form.
 *
 * @param {string} scrambledData - The scrambled data to be reverted.
 * @returns {any} The original data.
 *
 * @example
 * // Usage examples
 * const originalString = "Hello, World!";
 * const scrambledString = scrambleData(originalString);
 * console.log('Scrambled String:', scrambledString);
 * console.log('Unscrambled String:', unscrambleData(scrambledString));
 *
 * const originalNumber = 12345;
 * const scrambledNumber = scrambleData(originalNumber);
 * console.log('Scrambled Number:', scrambledNumber);
 * console.log('Unscrambled Number:', unscrambleData(scrambledNumber));
 *
 * const originalObject = { name: "Alice", age: 30 };
 * const scrambledObject = scrambleData(originalObject);
 * console.log('Scrambled Object:', scrambledObject);
 * console.log('Unscrambled Object:', unscrambleData(scrambledObject));
 *
 * const originalArray = [1, 2, 3, 4, 5];
 * const scrambledArray = scrambleData(originalArray);
 * console.log('Scrambled Array:', scrambledArray);
 * console.log('Unscrambled Array:', unscrambleData(scrambledArray));
 *
 * const scrambledNull = scrambleData(null);
 * console.log('Scrambled Null:', scrambledNull);
 * console.log('Unscrambled Null:', unscrambleData(scrambledNull));
 *
 * const scrambledUndefined = scrambleData(undefined);
 * console.log('Scrambled Undefined:', scrambledUndefined);
 * console.log('Unscrambled Undefined:', unscrambleData(scrambledUndefined));
 */
export function unscrambleData(scrambledData) {
    try {
        if (scrambledData == undefined) return scrambledData;

        // Unscramble the Base64 string by shifting each character's char code back
        let base64String = '';
        for (let i = 0; i < scrambledData.length; i++) {
            const charCode = scrambledData.charCodeAt(i);
            base64String += String.fromCharCode(charCode - 1); // Shift char code back by 1
        }

        // Decode the Base64 string to UTF-8 bytes
        const utf8Bytes = toByteArray(base64String);

        // Decode the UTF-8 bytes to JSON string
        const jsonString = new TextDecoder('utf-8').decode(utf8Bytes);

        // Convert the JSON string back to the original data
        return JSON.parse(jsonString);
    } catch (error) {
        console.error(error);
        return scrambledData;
    }
}

/**
 * Checks if the current date and time are between the given start and end date-time.
 *
 * @param {Date|string} startDate - The start date-time. Can be a Date object or a valid date string.
 * @param {Date|string} endDate - The end date-time. Can be a Date object or a valid date string.
 * @returns {boolean} - Returns true if the current date-time is between startDate and endDate, otherwise false.
 *
 * @example
 * const start = new Date('2024-08-10T10:00:00');
 * const end = new Date('2024-08-12T18:00:00');
 * const result = isCurrentDateTimeInRange(start, end);
 * console.log(result); // Output will depend on the current date and time
 */
export function isCurrentDateTimeInRange(startDate, endDate) {
    try {
        const currentDateTime = new Date();

        // Convert to Date objects if they are not already
        const start = (startDate instanceof Date) ? startDate : new Date(startDate);
        const end = (endDate instanceof Date) ? endDate : new Date(endDate);

        return currentDateTime >= start && currentDateTime <= end;
    } catch (error) {
        console.error(error);
        return false;
    }
}


/**
 * Checks if a given date falls within the current second, minute, hour, day, week, month, or year.
 *
 * @param {Date|string} dateToCheck - The date to check against the current time.
 * @param {string} period - The time period to check. Valid values are:
 *                           'second', 'minute', 'hour', 'day', 'week', 'month', 'year'.
 * @returns {boolean} - Returns true if the date falls within the specified period; otherwise, false.
 *
 * @example
 * // Use-case examples:
 * const checkDate = new Date('2024-08-11T14:30:00');
 * console.log('checkDate::', checkDate);//checkDate:: 2024-08-11T09:00:00.000Z
 *
 * @example
 * // Check if a date is in the current second
 * const isCurrentSecond = isDateInCurrentPeriod(new Date(), 'second');
 * console.log('check-second:- date:', new Date(), 'isCurrentSecond:', isCurrentSecond);// check-second:- date: 2024-08-13T05:09:44.302Z isCurrentSecond: true
 *
 * @example
 * // Check if a date is in the current minute
 * const isCurrentMinute = isDateInCurrentPeriod(checkDate, 'minute');
 * console.log('check-minute:', 'isCurrentMinute:', isCurrentMinute);// check-minute: isCurrentMinute: false
 *
 * @example
 * // Check if a date is in the current hour
 * const isCurrentHour = isDateInCurrentPeriod(checkDate, 'hour');
 * console.log('check-hour:', 'isCurrentHour:', isCurrentHour);// check-hour: isCurrentHour: false
 *
 * @example
 * // Check if a date is in the current day
 * const isCurrentDay = isDateInCurrentPeriod(checkDate, 'day');
 * console.log('check-day:', 'isCurrentDay:', isCurrentDay);// check-day: isCurrentDay: false
 *
 * @example
 * // Check if a date is in the current week
 * const isCurrentWeek = isDateInCurrentPeriod(checkDate, 'week');
 * console.log('check-week:', 'isCurrentWeek:', isCurrentWeek);// check-week: isCurrentWeek: true
 *
 * @example
 * // Check if a date is in the current month
 * const isCurrentMonth = isDateInCurrentPeriod(checkDate, 'month');
 * console.log('check-month:', 'isCurrentMonth:', isCurrentMonth);// check-month: isCurrentMonth: true
 *
 * @example
 * // Check if a date is in the current year
 * const isCurrentYear = isDateInCurrentPeriod(checkDate, 'year');
 * console.log('check-year:', 'isCurrentYear:', isCurrentYear);// check-year: isCurrentYear: true
 */
export function isDateInCurrentPeriod(dateToCheck, period) {
    try {
        const now = new Date();
        const checkDate = (dateToCheck instanceof Date) ? dateToCheck : new Date(dateToCheck);

        switch ((period + '').toLowerCase().trim()) {
            case 'second':
                return (
                    checkDate.getFullYear() === now.getFullYear() &&
                    checkDate.getMonth() === now.getMonth() &&
                    checkDate.getDate() === now.getDate() &&
                    checkDate.getHours() === now.getHours() &&
                    checkDate.getMinutes() === now.getMinutes() &&
                    checkDate.getSeconds() === now.getSeconds()
                );
            case 'minute':
                return (
                    checkDate.getFullYear() === now.getFullYear() &&
                    checkDate.getMonth() === now.getMonth() &&
                    checkDate.getDate() === now.getDate() &&
                    checkDate.getHours() === now.getHours() &&
                    checkDate.getMinutes() === now.getMinutes()
                );
            case 'hour':
                return (
                    checkDate.getFullYear() === now.getFullYear() &&
                    checkDate.getMonth() === now.getMonth() &&
                    checkDate.getDate() === now.getDate() &&
                    checkDate.getHours() === now.getHours()
                );
            case 'day':
                return (
                    checkDate.getFullYear() === now.getFullYear() &&
                    checkDate.getMonth() === now.getMonth() &&
                    checkDate.getDate() === now.getDate()
                );
            case 'week': {
                const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
                startOfWeek.setHours(0, 0, 0, 0);
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(endOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);
                return checkDate >= startOfWeek && checkDate <= endOfWeek;
            }
            case 'month':
                return (
                    checkDate.getFullYear() === now.getFullYear() &&
                    checkDate.getMonth() === now.getMonth()
                );
            case 'year':
                return checkDate.getFullYear() === now.getFullYear();
            default:
                // throw new Error('Invalid period specified. Use: second, minute, hour, day, week, month, or year.');
                console.error('Invalid period specified. Use: second, minute, hour, day, week, month, or year.');
                return false;
        }
    } catch (error) {
        console.error(error);
        return false;
    }
}

/**
 * Checks if the given date is tomorrow.
 *
 * @param {Date|string} dateToCheck - The date to check.
 * @returns {boolean} - Returns true if the date is tomorrow; otherwise, false.
 *
 * @example
 * // Check if a date is tomorrow
 * const isTomorrow = isDateTomorrow(new Date('2024-08-13')); // true if today is 2024-08-12
 *
 * @example
 * // Check if a date is tomorrow
 * const isTomorrow2 = isDateTomorrow(new Date('2024-08-14')); // false if today is 2024-08-12
 */
export function isDateTomorrow(dateToCheck) {
    try {
        const checkDate = (dateToCheck instanceof Date) ? dateToCheck : new Date(dateToCheck);

        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        return (
            checkDate.getFullYear() === tomorrow.getFullYear() &&
            checkDate.getMonth() === tomorrow.getMonth() &&
            checkDate.getDate() === tomorrow.getDate()
        );
    } catch (error) {
        console.error(error);
        return false;
    }
}

// =================================Common functions end================================

/**
 * Convert file-size to human readable size.
 * Example: 5000.50 to 4.89 KB.
 *
 * It support the following sizes in order:
 *  Bytes, KB, MB, GB, TB, PB (ParaBytes), EB (ExaByte), ZB (ZettaByte), YB (YottaByte).
 */
export function formatFileSize(size) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Calculate the size of a text.
 */
export function getTextSize(text, readable = true) {
    let size = new Blob([text]).size;
    const match = size.match(/^([\d.]+)\s*(\w+)$/);
    if (!match) {
        return NaN;
    }

    const units = {
        B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4, PB: 1024 ** 5, EB: 1024 ** 6, ZB: 1024 ** 7, YT: 1024 ** 8,
    };

    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();

    if (!(unit in units)) {
        return NaN;
    }

    let outSize = value * units[unit];
    if (isBoolTrue(readable)) {
        outSize = formatFileSize(outSize);
    }
    return outSize;
}

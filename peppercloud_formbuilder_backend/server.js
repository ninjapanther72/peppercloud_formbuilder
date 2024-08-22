const process = require('node:process');
require("dotenv").config({path: ".env"});

const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const {
    ReqUrls, Messages, AllowedFrontendUrls,
} = require("./config/ServerConfig");
const {
    printLog, printError, sendResponse, isValueBool,
} = require("./utils/ServerUtils");
const {DbHandler} = require("./DbHandler");

const server = express();

// Enable CORS for specific routes
// server.use(cors({
//     // origin: true
//     origin: AllowedFrontendUrls,
//     // credentials: true,
// }));
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || AllowedFrontendUrls.filter(item => !isValueBool(item)).includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};
server.use(cors(corsOptions));


// Parse request of content-type-application/x-www-form-urlencoded
server.use(bodyParser.json({limit: "50mb"}));
server.use(bodyParser.urlencoded({
    limit: "50mb", extended: true, parameterLimit: 50000, //limit: To avoid PayloadTooLargeError
}));

server.use(cookieParser());

const TAG = "Server.js";
const SERVER_PORT = process.env.SERVER_PORT;
const INTERNAL_SERVER_ERR_MSG = Messages.serverErrorMsg;
const FETCH_SUCCESS_MSG = Messages.fetchSuccessMsg;
const FETCH_ERROR_MSG = Messages.fetchErrMsg;
const UPLOAD_SUCCESS_MSG = Messages.uploadSuccessMsg;
const UPLOAD_ERROR_MSG = Messages.uploadErrMsg;


// Add url-watcher middleware for all routes
server.use((req, res, next) => {
    printLog('\n', TAG, `UrlWatcherMiddleware: Requested URL: ${req.url}`);
    next();
});

// Add a middleware to handle 431 status code
server.use((err, req, res, next) => {
    if (err.status === 431) {
        res.status(431).json({error: 'Request header fields too large'});
    } else {
        next(err);
    }
});
// Increase the maximum allowed size of request headers
server.maxHttpHeaderSize = 200 * 1024; // Example: set to 200 KB

//Fetch all forms
server.post(ReqUrls.home__fetchForms, async (req, res) => {
    const fun = 'home__fetchForms:';
    try {
        const {recordList, success, message} = await DbHandler.home__fetchForms();
        sendResponse({res: res, data: recordList, success: success, msg: message});
    } catch (e) {
        logErr(fun, e);
        sendResponse({res: res, msg: INTERNAL_SERVER_ERR_MSG, errorMsg: e});
    }
});

//Form-view page: Fetch form-data & questions
server.post(ReqUrls.form__EditPage_fetchEditData, async (req, res) => {
    const fun = 'form__EditPage_fetchEditData:';
    try {
        const {formData, success, message} = await DbHandler.form__EditPage_fetchEditData(req.body);
        sendResponse({res: res, data: formData, success: success, msg: message});
    } catch (e) {
        logErr(fun, e);
        sendResponse({res: res, msg: INTERNAL_SERVER_ERR_MSG, errorMsg: e});
    }
});
//Form-view page: delete form
server.post(ReqUrls.form__viewPage_DeleteForm, async (req, res) => {
    const fun = 'form__viewPage_DeleteForm:';
    try {
        await DbHandler.form__viewPage_DeleteForm(req.body, res);
    } catch (e) {
        logErr(fun, e);
        sendResponse({res: res, msg: INTERNAL_SERVER_ERR_MSG, errorMsg: e});
    }
});
//View page: submit answers-data
server.post(ReqUrls.form__viewPage_submitFormQsAnswers, async (req, res) => {
    const fun = 'form__viewPage_submitFormQsAnswers:';
    try {
        await DbHandler.form__viewPage_submitFormQsAnswers(req.body, res);
    } catch (e) {
        logErr(fun, e);
        sendResponse({res: res, msg: INTERNAL_SERVER_ERR_MSG, errorMsg: e});
    }
});


//Add/edit page: Fetch form-data
server.post(ReqUrls.form__EditPage_fetchEditData, async (req, res) => {
    const fun = 'form__EditPage_fetchEditData:';
    try {
        const {formData, success, message} = await DbHandler.form__EditPage_fetchEditData(req.body);
        sendResponse({res: res, data: formData, success: success, msg: message});
    } catch (e) {
        logErr(fun, e);
        sendResponse({res: res, msg: INTERNAL_SERVER_ERR_MSG, errorMsg: e});
    }
});
//Add/edit page: submit form-data
server.post(ReqUrls.form__EditPage_submitData, async (req, res) => {
    const fun = 'form__EditPage_submitData:';
    try {
        await DbHandler.form__EditPage_submitData(req.body, res);
    } catch (e) {
        logErr(fun, e);
        sendResponse({res: res, msg: INTERNAL_SERVER_ERR_MSG, errorMsg: e});
    }
});

// Apply checkIfUserLoggedIn middleware only to routes that require authentication
server.post('/protected', (req, res) => {
    res.status(200).send('You are successfully logged in!');
});
// Error handling middleware
server.use((err, req, res, next) => {
    logErr('Error handling middleware:', err.stack);
    res.status(500).send({message: 'Internal Server Error'});
});


//Check if the user is logged in or not
// server.post('/test-request', (req, res) => {
//     sendResponse({res: res, msg: 'This is test response data'});
// });

//-------------------------Utils methods - start-------------------------
//-------------------------Utils methods - end-------------------------

function log(...text) {
    printLog(TAG, ...text);
}

function logErr(...text) {
    printError(TAG, ...text);
}


server.listen(SERVER_PORT, () => {
    log(`Server is running on ${SERVER_PORT}`);
});

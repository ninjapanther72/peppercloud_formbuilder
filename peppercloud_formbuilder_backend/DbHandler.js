const {getMongoDbCon} = require("./utils/DbConn");
const {
    checkNullArr,
    checkNullStr,
    getArrIndexValue,
    isBoolTrue,
    parseInteger,
    getDefJsonValue,
    checkNullJson,
    printLog, printError,
    isJsonValueTrue, jsonToStr, checkNull, generateUniqueString, getArrLen, sortJsonList, sendResponse,
    dropArrEmptyValues,
} = require("./utils/ServerUtils");
const {Messages, DbCollections, ModuleFieldsData, Modules, ID_LEN} = require("./config/ServerConfig");
const {} = require("./utils/ServerUtils");
const {Db} = require('mongodb');

const TAG = 'DbHandler.js';

const INTERNAL_SERVER_ERROR = Messages.serverErrorMsg;
const UPLOAD_SUCCESS_MSG = Messages.uploadSuccessMsg;
const UPLOAD_ERROR_MSG = Messages.uploadErrMsg;
const RECORD_DELETE_MSG = Messages.recordDelete;
const RECORD_DELETE_FAILED_MSG = Messages.recordDeleteFailed;

const dbMethods = {};

/**
 * Initialize a variable to store the MongoClient db-connection.
 * @type {Db}
 */
let dbConn = null;

/**
 * Initializes the {@link Db} instance if it hasn't been initialized already.
 *
 * @returns {Db} The {@link Db} instance.
 */
async function checkDbConn() {
    if (!checkNull(dbConn)) {
        log('checkDbConn: connection established');
        const {db} = await getMongoDbCon();
        dbConn = db;
    }
    return dbConn;
}

/**
 * Executes a filter-query on the specified collection and returns the result.
 *
 * For more information see {@link dbMethods.executeQuery}
 */
async function executeQuery({
                                collection,
                                filterQuery,
                                resultIndex = 0,
                                defValue = {},
                                aggregate = false,
                                raw = false,
                                onFetched,
                                onError,
                            }) {
    const fun = "executeQuery:";
    const manager = await checkDbConn();

    printLog('\n', TAG, fun, 'collection:', collection, '|', "filterQuery:", (jsonToStr(filterQuery, 0) + '').substring(0, 500));
    return new Promise(async (resolve, reject) => {
        try {
            let result = {};
            const coll = await dbConn.collection(collection);
            if (isBoolTrue(aggregate)) {
                return await coll.aggregate(filterQuery).toArray();
            } else {
                let result = coll.find(filterQuery);
                if (!isBoolTrue(raw)) result = result.toArray();
                if (onFetched) onFetched(result);
            }
            if (parseInteger(resultIndex, -1) >= 0 && checkNullJson(filterQuery)) {
                result = getArrIndexValue(result, resultIndex, defValue);
            }
            return resolve(checkNullJson(result) ? result : defValue);
        } catch (e) {
            logErr(fun, e);
            return resolve(e);
        }
    });
}

/**
 * Executes a filter-query on the specified collection and returns the result.
 *
 * @example:
 * const filterQuery = { name: 'John Doe' };
 * const result = await dbMethods.executeQuery({ collection: 'collection_name', filterQuery: filterQuery });
 * console.log('Query result:', result);
 *
 * @param {Object} params
 * @param {string} params.collection - The name of the collection for the filter-query.
 * @param {Object} params.filterQuery - The filterQuery criteria (check above example).
 * @param {any} params.defValue - Def-value to be returned if an error occurs or no result is found. Default is Object.
 * @param {any} params.resultIndex - Index-value to be extracted from the fetched-array. Default is 0.
 * @param {boolean} params.aggregate - Whether to perform aggregation or just simply execute the query. Default is false.
 * @param {function} params.onFetched - A callback for when the query has been executed. It contains the fetched results.
 * @param {function} params.onError - A callback for if/when any error is thrown. It contains the error & message.
 * @returns {Promise<Array> | Promise<any>} Returns a promise containing result-array/object or def-value.
 */
dbMethods.executeQuery = async ({
                                    collection,
                                    filterQuery,
                                    resultIndex = 0,
                                    defValue = {},
                                    aggregate = false,
                                    onFetched,
                                    onError,
                                }) => {
    return await executeQuery({collection, filterQuery, resultIndex, defValue, aggregate, onFetched, onError});
}


dbMethods.home__fetchForms = async () => {
    return new Promise(async (resolve, reject) => {
        const fun = 'home__fetchForms:';
        await checkDbConn();

        //fetch forms
        await executeQuery({
            collection: DbCollections.forms,
            onFetched: (async (fetchedData) => {
                const recordList = await fetchedData;
                // const recordList=[];
                // log(fun, 'fetchedData.recordList:', recordList);
                log(fun, 'fetchedData.recordList.len:', getArrLen(recordList));
                const success = checkNullArr(recordList);
                // storeJsonDataInTempFile({fun, success, recordList});
                return resolve({recordList, success: success, message: success ? "Forms found." : "No forms found!"});
            }),
            onError: ((error) => {
                logErr(fun, error);
                return resolve({recordList: [], success: false, message: INTERNAL_SERVER_ERROR});
            })
        });
    });
}

dbMethods.form__EditPage_fetchEditData = async (reqBody) => {
    return new Promise(async (resolve, reject) => {
        const fun = 'form__EditPage_fetchEditData:';
        await checkDbConn();
        log(fun, 'reqBody:', reqBody);

        const recordId = getDefJsonValue(reqBody, 'recordId');
        const mf_form = ModuleFieldsData[Modules.Forms];
        const mf_qs = ModuleFieldsData[Modules.FormQuestions];

        const [fetchedFormData, fetchedQs] = await Promise.all([
            dbConn.collection(DbCollections.forms).find({[mf_form.formId.field]: recordId}).toArray(),
            dbConn.collection(DbCollections.formQs).find({[mf_qs.formId.field]: recordId}).toArray() // Fetch all documents from qs-collection
        ]);

        const formFound = checkNullJson(fetchedFormData);
        const qsFound = checkNullArr(fetchedQs);
        // log(fun, 'fetchedFormData:', fetchedFormData, 'fetchedQs:', fetchedQs);
        log(fun, 'formFound:', formFound, 'qsFound:', qsFound);

        let formData = {};
        let formQs = [];
        if (formFound) {
            if (qsFound) {
                //Sort q-list based on order
                formQs = sortJsonList(fetchedQs, mf_qs.order.field);
            }
            formData = getArrIndexValue(fetchedFormData, 0, {});
            formData = {
                ...checkNullJson(formData) ? formData : {},
                [mf_form.questions.field]: formQs
            }
        }

        // storeJsonDataInTempFile({fun, reqBody, qsFound, formData});
        return resolve({
            formData,
            success: formFound,
            message: formFound ? (qsFound ? "Data found." : "No questions found for this form!") : "Invalid record-Id!"
        });
    });
}

dbMethods.form__EditPage_submitData = async (reqBody, res) => {
    const fun = 'form__EditPage_submitData:';
    const formData = reqBody.formData;
    // storeJsonDataInTempFile({fun, reqBody});
    try {
        await checkDbConn();
        const mf_form = ModuleFieldsData[Modules.Forms];//_id, formId, title, description, questions, createdAt, updatedAt
        const mf_qs = ModuleFieldsData[Modules.FormQuestions];//id, formId, questionType, title, placeholder, required, order, answer, takenAt

        const updateOnly = isJsonValueTrue(reqBody, 'updateOnly');
        const recordId = getDefJsonValue(reqBody, 'recordId');

        const title = getDefJsonValue(formData, 'title');
        const description = getDefJsonValue(formData, 'description');
        let questions = getDefJsonValue(formData, 'questions');
        const createdAt = new Date();
        const updatedAt = new Date();

        const proceed = true;
        // const proceed = false;//For testing purposes only
        if (!proceed) {
            sendResponse({res: res, message: Messages.testDataReceived});
            return false;
        }

        //Check if questions found
        if (!checkNullArr(questions)) {
            sendResponse({res: res, message: "No questions found!"});
            return false;
        }

        //Get collections
        const formColl = await dbConn.collection(DbCollections.forms);
        const formQsColl = await dbConn.collection(DbCollections.formQs);

        //Insert/update data
        if (updateOnly) {
            // sendResponse({res: res, message: "Operation pending!"});

            //Update form
            const formUpdateResult = await formColl.updateOne(
                {[mf_form.formId.field]: recordId},
                {
                    $set: {
                        // [mf_form._id.field]: getDefJsonValue(formData, mf_form.formId.field),//Error:'_id' would modify the immutable field '_id'"
                        [mf_form.formId.field]: recordId,
                        [mf_form.title.field]: getDefJsonValue(formData, mf_form.title.field),
                        [mf_form.description.field]: getDefJsonValue(formData, mf_form.description.field),
                        [mf_form.createdAt.field]: getDefJsonValue(formData, mf_form.createdAt.field),
                        [mf_form.updatedAt.field]: updatedAt,
                    }
                });
            const formUpdated = parseInteger(getDefJsonValue(formUpdateResult, 'modifiedCount')) > 0;
            log(fun, 'formUpdateResult:', formUpdateResult, 'formUpdated:', formUpdated);
            if (!formUpdated) {
                sendResponse({res: res, message: "Invalid record-id!"});
                return false;
            }
            // sendResponse({res: res, success: formUpdated, msg: formUpdated ? UPLOAD_SUCCESS_MSG : UPLOAD_ERROR_MSG});

            //Delete form-qs to avoid conflict with new qs
            const deleteQsResult = await formQsColl.deleteMany({[mf_qs.formId.field]: recordId});
            const qsDeleted = parseInteger(getDefJsonValue(deleteQsResult, 'deletedCount')) > 0;
            log(fun, 'deleteQsResult:', deleteQsResult, 'qsDeleted:', qsDeleted);

            //Add missing fields in qs-data
            const oldQIds = dropArrEmptyValues(questions.map(item => getDefJsonValue(item, mf_qs.id.field)));
            questions = questions.map((qItem) => {
                const alreadyId = getDefJsonValue(qItem, mf_qs.id.field);
                const uniqueQId = checkNullStr(alreadyId) ? alreadyId : generateUniqueString(oldQIds, ID_LEN);
                oldQIds.push(uniqueQId);
                return {
                    ...qItem,
                    [mf_qs.id.field]: uniqueQId,
                    [mf_qs.formId.field]: recordId,
                    [mf_qs.isTaken.field]: false,
                }
            });
            log(fun, 'formUpdated.oldQIds:', oldQIds);
            // log(fun, 'formUpdated.questions:', questions);

            //insert-qs-data
            const qsInsertResult = await formQsColl.insertMany(questions);
            const qsInserted = parseInteger(getDefJsonValue(qsInsertResult, 'insertedCount')) > 0;
            log(fun, 'formUpdated.qsInsertResult:', qsInsertResult, 'qsInserted:', qsInserted);

            const success = qsInserted;
            sendResponse({res: res, success: success, msg: success ? UPLOAD_SUCCESS_MSG : UPLOAD_ERROR_MSG});
        } else {
            //check if form already exists
            const existingRecords = await formColl.find({[mf_form.title.field]: title}).toArray();
            log(fun, 'existingRecords.len:', existingRecords.length);
            if (checkNullArr(existingRecords)) {
                sendResponse({res: res, message: "Form with the same name already exists!"});
                return false;
            }

            const existingIds = getDefJsonValue(await fetchKeysFromCollection(DbCollections.forms, [mf_form.formId.field]), mf_form.formId.field, []);
            const uniqueFormId = generateUniqueString(existingIds, ID_LEN);
            log(fun, 'existingIds:', existingIds, 'uniqueFormId:', uniqueFormId);

            //Insert form
            const formInsertResult = await formColl.insertOne({
                [mf_form._id.field]: uniqueFormId,
                [mf_form.formId.field]: uniqueFormId,
                [mf_form.title.field]: title,
                [mf_form.description.field]: description,
                [mf_form.createdAt.field]: createdAt,
                [mf_form.updatedAt.field]: updatedAt,
            });
            const formInserted = isJsonValueTrue(formInsertResult, 'acknowledged');
            log(fun, 'formInsertResult:', formInsertResult, 'formInserted:', formInserted);

            //Insert qs
            let qsInserted = false;
            if (formInserted) {
                //Add missing fields in qs-data
                const oldQIds = [];
                questions = questions.map((qItem) => {
                    const uniqueQId = generateUniqueString(oldQIds, ID_LEN);
                    oldQIds.push(uniqueQId);
                    return {
                        ...qItem,
                        [mf_qs.id.field]: uniqueQId,
                        [mf_qs.formId.field]: uniqueFormId,
                        [mf_qs.isTaken.field]: false,
                    }
                });
                log(fun, 'formInserted.oldQIds:', oldQIds);
                // log(fun, 'formInserted.questions:', questions);

                //insert-qs-data
                const qsInsertResult = await formQsColl.insertMany(questions);
                qsInserted = parseInteger(getDefJsonValue(qsInsertResult, 'insertedCount')) > 0;
                log(fun, 'formInserted.qsInsertResult:', qsInsertResult, 'qsInserted:', qsInserted);
            }
            const success = formInserted || qsInserted;
            sendResponse({res: res, success: success, msg: success ? UPLOAD_SUCCESS_MSG : UPLOAD_ERROR_MSG});
        }
    } catch (error) {
        logErr(fun, error);
        sendResponse({res: res, message: INTERNAL_SERVER_ERROR, errorMsg: error});
    }
}


dbMethods.form__viewPage_submitFormQsAnswers = async (reqBody, res) => {
    const fun = 'form__viewPage_submitFormQsAnswers:';
    const formData = reqBody.formData;
    const recordId = getDefJsonValue(reqBody, 'recordId');
    // storeJsonDataInTempFile({fun, reqBody});
    try {
        await checkDbConn();
        const mf_qs = ModuleFieldsData[Modules.FormQuestions];//id, formId, questionType, title, placeholder, required, order, answer, takenAt
        let questions = getDefJsonValue(formData, 'questions');

        const proceed = true;
        // const proceed = false;//For testing purposes only
        if (!proceed) {
            sendResponse({res: res, message: Messages.testDataReceived});
            return false;
        }

        //Check if questions found
        if (!checkNullArr(questions)) {
            sendResponse({res: res, message: "No questions found!"});
            return false;
        }

        //Get collections
        const formQsColl = await dbConn.collection(DbCollections.formQs);

        //Create bulk-ops to update all docs at once
        const bulkOperations = questions.map((qItem, qIndex) => {
            const answer = getDefJsonValue(qItem, mf_qs.answer.field);
            const taken = checkNullStr(answer);
            return {
                updateOne: {
                    filter: {_id: qItem._id},
                    update: {
                        $set: {
                            [mf_qs.answer.field]: answer,
                            [mf_qs.order.field]: qIndex,
                            [mf_qs.isTaken.field]: taken,
                            [mf_qs.takenAt.field]: taken ? new Date() : null,
                        }
                    }
                }
            }
        });
        // log(fun, 'questions.bulkOperations:', bulkOperations);

        const qsUpdateResult = await formQsColl.bulkWrite(bulkOperations);
        const qsUpdated = parseInteger(getDefJsonValue(qsUpdateResult, 'modifiedCount')) > 0;
        log(fun, 'qsUpdateResult:', qsUpdateResult, 'qsUpdated:', qsUpdated);

        const success = qsUpdated;
        sendResponse({res: res, success: success, msg: success ? UPLOAD_SUCCESS_MSG : UPLOAD_ERROR_MSG});
    } catch (error) {
        logErr(fun, error);
        sendResponse({res: res, message: INTERNAL_SERVER_ERROR, errorMsg: error});
    }
}

dbMethods.form__viewPage_DeleteForm = async (reqBody, res) => {
    const fun = 'form__viewPage_DeleteForm:';
    // storeJsonDataInTempFile({fun, reqBody});
    const recordId = getDefJsonValue(reqBody, 'recordId');
    try {
        await checkDbConn();
        const mf_form = ModuleFieldsData[Modules.Forms];//formId
        const mf_qs = ModuleFieldsData[Modules.FormQuestions];//formId

        const proceed = true;
        // const proceed = false;//For testing purposes only
        if (!proceed) {
            sendResponse({res: res, message: Messages.testDataReceived});
            return false;
        }

        //Check if recordId found
        if (!checkNullStr(recordId)) {
            sendResponse({res: res, message: "Record-id not found!"});
            return false;
        }

        //Delete form
        const formColl = await dbConn.collection(DbCollections.forms);
        const formDeleteResult = await formColl.deleteOne({[mf_form.formId.field]: recordId});
        const formDeleted = parseInteger(getDefJsonValue(formDeleteResult, 'deletedCount')) > 0;
        log(fun, 'formDeleteResult:', formDeleteResult, 'formDeleted:', formDeleted);

        //Delete form-qs
        if (formDeleted) {
            //Insert qs
            const formQsColl = await dbConn.collection(DbCollections.formQs);
            const qsDeleteResult = await formQsColl.deleteMany({[mf_qs.formId.field]: recordId});
            const qsDeleted = parseInteger(getDefJsonValue(qsDeleteResult, 'deletedCount')) > 0;
            log(fun, 'formDeleted.qsDeleteResult:', qsDeleteResult, 'qsDeleted:', qsDeleted);

            const success = formDeleted || qsDeleted;
            sendResponse({res: res, success: success, msg: success ? RECORD_DELETE_MSG : RECORD_DELETE_FAILED_MSG});
        } else {
            sendResponse({res: res, message: "Invalid form-id!"});
        }
    } catch (error) {
        logErr(fun, error);
        sendResponse({res: res, message: INTERNAL_SERVER_ERROR, errorMsg: error});
    }
}


/**
 * Fetches values of multiple keys from all documents in a collection.
 *
 * @param {string} collection - The name of the collection to fetch from.
 * @param {string[]} keys - An array of keys whose values need to be fetched.
 * @returns {Promise<Object>} - A promise that resolves with an object containing key-value pairs for each specified key.
 *
 * @example
 * // Fetch usernames and email addresses from the 'users' collection
 * const keys = ['id', 'userId'];
 * const values = await fetchKeysFromCollection('users', keys);
 * console.log('Values:', values);
 * //output
 * userIds: {
 *   id: [ 1, 2, 3, 4, 5 ],
 *   userid: [
 *     'kjhgTYujk',
 *     'LKJhgTYUJK',
 *     'lKJBFTYUGG',
 *     'KJHGFRTYUI',
 *     'kjhgfRTYUJ'
 *   ]
 * }
 */
async function fetchKeysFromCollection(collection, keys) {
    const fun = 'fetchKeysFromCollection';
    await checkDbConn();
    try {
        const query = {};
        const projection = {};
        keys.forEach(key => projection[key] = 1);
        const coll = await dbConn.collection(collection);
        const documents = await coll.find(query, {projection}).toArray();
        const values = {};
        documents.forEach(doc => {
            keys.forEach(key => {
                if (doc.hasOwnProperty(key)) {
                    if (!values[key]) {
                        values[key] = [];
                    }
                    values[key].push(doc[key]);
                }
            });
        });
        return values;
    } catch (error) {
        logErr(fun, `Error fetching keys '${keys.join(', ')}' values from collection '${collection}':`, error);
        return {};
    }
}

function log(...text) {
    printLog(TAG, ...text);
}

function logErr(...text) {
    printError(TAG, ...text);
}

module.exports.DbHandler = dbMethods;

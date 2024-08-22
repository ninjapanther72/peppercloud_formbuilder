import React, {useEffect, useState} from 'react';
import {Anchor, AppInterface, Button, Flexbox, GridBox, Label, LoadingSection, Section} from "../components";
import {
    checkNullArr,
    checkNullStr,
    createTimeout,
    formatDateValue,
    getDefJsonValue,
    isBoolTrue,
    isJsonValueTrue,
    limitStringWords,
    printError,
    printLog,
    scrollToTop,
    sendRequest
} from "../utils/AppUtils";
import {CssVariant, GenRouteUrls, IsFormSubmissionDisabled, ModuleFieldsData, Modules, ReqUrls} from "../config/AppConfig";

const FormsListPage = React.memo(() => {
    const TAG = "FormsListPage";
    const mf = ModuleFieldsData[Modules.Forms];

    const Fields = {
        isDataFetched: 'isDataFetched',
        isDataLoading: 'isDataLoading',
        isDataSuccess: 'isDataSuccess',
        dataLoadingMsg: 'dataLoadingMsg',

        formRecords: 'formRecords',

        msgText: 'msgText',
        msgTextVariant: 'msgTextVariant',

        currRecord_deleteId: 'currRecord_deleteId',
        currRecord_deleteBtn_AsLoading: 'currRecord_deleteBtn_AsLoading',
        currRecord_deleteBtn_disabled: 'currRecord_deleteBtn_disabled',
    };
    const [fieldsData, setFieldsData] = useState({
        [Fields.isDataLoading]: true,
    });

    useEffect(() => {
        fetchFormsData();
        scrollToTop();
    }, []);

    useEffect(() => {
        if (checkNullStr(getField(Fields.msgText))) {
            createTimeout(() => {
                panelMsg(null);
                updateField(Fields.currRecord_deleteId, null);
            }, 5000);
        }
    }, [getField(Fields.msgText)]);

    return (<AppInterface label={'Forms'}>
        <LoadingSection
            success={isFieldTrue(Fields.isDataSuccess)}
            loading={isFieldTrue(Fields.isDataLoading)}
            msg={getField(Fields.dataLoadingMsg)}
        />

        {isFieldTrue(Fields.isDataSuccess) &&
            <div>
                <div>
                    <Flexbox justifyAt={'end'}>
                        {/*add-btn*/}
                        <Button className={'px-3 py-1 text-light'}
                                variant={'primary'}
                                text={'Add Form'}
                                href={`${GenRouteUrls.formCreate}`}
                        />
                    </Flexbox>
                </div>

                {/*msg-box*/}
                {checkNullStr(getField(Fields.msgText)) && <Label
                    className={`text-wrap p-1 bg-${getField(Fields.msgTextVariant, 'dark')}-25 mt-2 rounded-1 text-${getField(Fields.msgTextVariant, 'dark')}`}
                    textAt={'center'} widthClass={100}>{getField(Fields.msgText)}</Label>}


                {/*forms*/}
                <GridBox className={''} md={6}>
                    {checkNullArr(getField(Fields.formRecords)) && getField(Fields.formRecords).map((item, index) => {
                        const recordId = getDefJsonValue(item, mf.formId.field);
                        const recordDisabled = recordId == getField(Fields.currRecord_deleteId) && isFieldTrue(Fields.currRecord_deleteBtn_disabled);
                        return <div key={index} className={`h-100`}>
                            <Section className={'p-3 h-100'}>
                                {/*title-link*/}
                                <div>
                                    <Anchor href={`${GenRouteUrls.formView.replace(':id', recordId)}`}
                                            disabled={recordDisabled}>
                                        <span className={'fw-bold'}>{getDefJsonValue(item, mf.title.field)}</span>
                                    </Anchor>
                                </div>

                                {/*createdAt*/}
                                <div>
                                    <Label className={'text-gray fs-sm'}>{formatDateValue(getDefJsonValue(item, mf.createdAt.field))}</Label>
                                </div>

                                {/*description*/}
                                <div className={'mt-1'}>
                                    <Label>{limitStringWords(getDefJsonValue(item, mf.description.field), 250, '', '...')}</Label>
                                </div>

                                {/*controls*/}
                                <Flexbox key={index} className={`mt-2`}>
                                    {/*view-btn*/}
                                    {/*<Button className={'px-3 py-1 text-light'}*/}
                                    {/*        variant={'primary'}*/}
                                    {/*        iconClass={'bi bi-eye fs-md pe-1'}*/}
                                    {/*        text={'View'}*/}
                                    {/*        disabled={recordDisabled}*/}
                                    {/*        href={`${GenRouteUrls.formView.replace(':id', recordId)}`}*/}
                                    {/*/>*/}

                                    {/*edit-btn*/}
                                    <Button className={'px-3 py-1 text-light'}
                                            variant={'primary'}
                                            iconClass={'bi bi-pencil fs-sm pe-1'}
                                            text={'Edit'}
                                        // ml={3}
                                            disabled={recordDisabled}
                                            href={`${GenRouteUrls.formEdit.replace(':id', recordId)}`}
                                    />

                                    {/*delete-btn*/}
                                    <Button className={'px-3 py-1 text-light'}
                                            variant={'danger'}
                                            iconClass={'bi bi-trash fs-md pe-1'}
                                            text={'Delete'}
                                            ml={3}
                                            asLoading={recordId == getField(Fields.currRecord_deleteId) && isFieldTrue(Fields.currRecord_deleteBtn_AsLoading)}
                                            disabled={recordDisabled}
                                            onClick={() => {
                                                if (window.confirm("Are you sure you want to delete this record?")) {
                                                    if (!IsFormSubmissionDisabled) {
                                                        handleDeleteRecord(recordId);
                                                    } else {
                                                        updateField(Fields.currRecord_deleteId,recordId);
                                                        panelMsg("This operation has been disabled for security reasons!",CssVariant.danger);
                                                    }
                                                }
                                            }}
                                    />
                                </Flexbox>

                                {/*msg-box*/}
                                {(checkNullStr(getField(Fields.msgText)) && recordId == getField(Fields.currRecord_deleteId)) && <Label
                                    className={`text-wrap p-1 bg-${getField(Fields.msgTextVariant, 'dark')}-25 mt-2 rounded-1 text-${getField(Fields.msgTextVariant, 'dark')}`}
                                    textAt={'center'} widthClass={100}>{getField(Fields.msgText)}</Label>}
                            </Section>
                        </div>
                    })}
                </GridBox>
            </div>}
    </AppInterface>)

    function fetchFormsData(checkNullBefore = true) {
        const fun = 'fetchFormsData:';
        try {
            if (!checkNullBefore || (checkNullBefore && !isFieldTrue(Fields.isDataFetched))) {
                updateField(Fields.isDataFetched, true);
                updateField(Fields.isDataLoading, true);
                updateField(Fields.isDataSuccess, false);
                updateField(Fields.dataLoadingMsg, null);
                updateField(Fields.formRecords, []);

                sendRequest({
                    reqUrl: ReqUrls.home__fetchForms, onFetched: (fetchedData) => {
                        log(fun, 'fetchedData:', fetchedData);

                        const success = isJsonValueTrue(fetchedData, 'success');
                        const message = getDefJsonValue(fetchedData, 'message');
                        const formRecords = getDefJsonValue(fetchedData, 'data');

                        updateField(Fields.isDataSuccess, success);
                        updateField(Fields.dataLoadingMsg, message);
                        updateField(Fields.isDataLoading, false);

                        if (success) {
                            updateField(Fields.formRecords, formRecords);
                            scrollToTop();
                        }
                    }, onError: (error) => {
                        logErr(fun, error);
                        updateField(Fields.dataLoadingMsg, "Couldn't load forms, please try again!");
                        updateField(Fields.isDataLoading, false);
                        updateField(Fields.isDataSuccess, false);
                    }
                });
            }
        } catch (error) {
            logErr(fun, error);
            updateField(Fields.dataLoadingMsg, "Couldn't load forms, please try again!");
            updateField(Fields.isDataLoading, false);
            updateField(Fields.isDataSuccess, false);
        }
    }

    function handleDeleteRecord(recordId) {
        const fun = 'handleDeleteRecord:';
        const proceed = true;
        // const proceed = false;
        log(fun, 'recordId:', recordId);

        if (!checkNullStr(recordId)) {
            panelMsg("Record-id not found!", CssVariant.danger);
            return false;
        }
        if (proceed) {
            try {
                updateField(Fields.currRecord_deleteId, recordId);
                updateField(Fields.currRecord_deleteBtn_AsLoading, true);
                updateField(Fields.currRecord_deleteBtn_disabled, true);

                sendRequest({
                    reqUrl: ReqUrls.form__viewPage_DeleteForm,
                    reqOptions: {recordId},
                    onFetched: (fetchedData) => {
                        log(fun, 'fetchedData:', fetchedData);

                        const success = isJsonValueTrue(fetchedData, 'success');
                        const message = getDefJsonValue(fetchedData, 'message');

                        updateField(Fields.currRecord_deleteBtn_AsLoading, false);
                        panelMsg(message, success ? CssVariant.success : CssVariant.danger);

                        if (success) {
                            createTimeout(() => {
                                panelMsg(`Refreshing data now...`, CssVariant.info);
                                createTimeout(() => {
                                    fetchFormsData(false);
                                    updateField(Fields.currRecord_deleteId, null);
                                    panelMsg(null);
                                }, 1500);
                            }, 2000);
                        } else {
                            updateField(Fields.currRecord_deleteBtn_disabled, false);
                        }
                    },
                    onError: (error) => {
                        logErr(fun, error);
                        panelMsg("Delete failed, please try again!", CssVariant.danger);
                        updateField(Fields.currRecord_deleteBtn_AsLoading, false);
                        updateField(Fields.currRecord_deleteBtn_disabled, false);
                        updateField(Fields.currRecord_deleteId, null);
                    }
                });
            } catch (error) {
                logErr(fun, error);
                panelMsg("Delete failed, please try again!", CssVariant.danger);
                updateField(Fields.currRecord_deleteBtn_AsLoading, false);
                updateField(Fields.currRecord_deleteBtn_disabled, false);
                updateField(Fields.currRecord_deleteId, null);
            }
        }
    }

    function updateField(field, value) {
        setFieldsData(prevState => ({...prevState, [field]: value}));
    }

    function getField(field, defValue) {
        return getDefJsonValue(fieldsData, field, defValue);
    }

    function isFieldTrue(field) {
        return isBoolTrue(getField(field), true, true);
    }

    function panelMsg(msg, variant = 'dark') {
        updateField(Fields.msgText, msg);
        updateField(Fields.msgTextVariant, variant);
    }

    function log(...text) {
        printLog(TAG, ...text);
    }

    function logErr(...text) {
        printError(TAG, ...text);
    }
});
export default FormsListPage;

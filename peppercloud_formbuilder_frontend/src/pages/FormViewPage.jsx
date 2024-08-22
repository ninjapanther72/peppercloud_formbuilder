import React, {useEffect, useState} from 'react';
import {AppInterface, Button, GridBox, Input, Label, LoadingSection, Section} from "../components";
import {
    checkNullArr,
    checkNullJson,
    checkNullStr,
    createTimeout,
    focusFormIdElement,
    getDefJsonValue,
    getDefValueStr,
    getFormIdFromBrowserUrl,
    isBoolTrue,
    isJsonValueTrue,
    printError,
    printLog,
    scrollToTop,
    sendRequest
} from "../utils/AppUtils";
import {CssVariant, IsFormSubmissionDisabled, ModuleFieldsData, ModuleRouteUrls, Modules, ReqUrls} from "../config/AppConfig";
import {useNavigate} from "react-router-dom";

const FormViewPage = React.memo(() => {
    const TAG = "FormViewPage";
    const mf_q = ModuleFieldsData[Modules.FormQuestions];
    const mf_form = ModuleFieldsData[Modules.Forms];

    const navigate = useNavigate();

    const MAX_INPUT_LEN = 20;

    const Fields = {
        isDataFetched: 'isDataFetched',
        isDataLoading: 'isDataLoading',
        isDataSuccess: 'isDataSuccess',
        dataLoadingMsg: 'dataLoadingMsg',

        recordId: 'recordId',

        panelMsg: 'panelMsg',
        panelMsgVariant: 'panelMsgVariant',
        submitBtn_AsLoading: 'submitBtn_AsLoading',
        submitBtn_disabled: 'submitBtn_disabled',
    };

    const [fieldsData, setFieldsData] = useState({
        [Fields.isDataLoading]: true,
    });
    const [formData, setFormData] = useState({});

    useEffect(() => {
        scrollToTop();
        fetchEditFormData(getFormIdFromBrowserUrl());
    }, []);

    useEffect(() => {
        if (checkNullStr(getField(Fields.panelMsg))) {
            createTimeout(() => {
                panelMsg(null);
            }, 5000);
        }
    }, [getField(Fields.panelMsg)]);

    return (<AppInterface label={getPageTitle()}>
        <LoadingSection
            success={isFieldTrue(Fields.isDataSuccess)}
            loading={isFieldTrue(Fields.isDataLoading)}
            msg={getField(Fields.dataLoadingMsg)}
        />

        {isFieldTrue(Fields.isDataSuccess) &&
            <div>
                <GridBox className={'px-2 mt-1'} md={6} justifyAt={'center'}>
                    {renderPreviewForm()}
                </GridBox>
            </div>}
    </AppInterface>)

    function inputList_updateSingleField(field, value, currIndex) {
        const fun = 'inputList_updateSingleField';
        log(fun, 'field:', field.field, ' | value:', value, ' | currIndex:', currIndex);
        try {
            let updatedList = getFormField(mf_form.questions);
            // log(fun, 'updatedList:', updatedList);
            updatedList = checkNullArr(updatedList) ? updatedList : [];
            updatedList = updatedList.map((mapItem, mapIndex) => {
                if (currIndex == mapIndex) {
                    log(fun, 'updatedList.map.mapItem:', mapItem, ' | mapIndex:', mapIndex, ' | currIndex:', currIndex, ' | index-match:', currIndex == mapIndex);
                    return {
                        ...mapItem,
                        [field.field]: value,
                    };
                }
                return mapItem;
            });
            // log(fun, 'updatedList-after:', updatedList);
            updateFormField(mf_form.questions, updatedList);
        } catch (error) {
            logErr(fun, error);
        }
    }

    function renderPreviewForm() {
        return <div className={'bg-infox'}>
            <Section className={'px-3 py-2 border-gray-light border-2 app-section pb-3'}>
                {/*<Label className={'text-gray-dark fs-normal fw-bold text-nowrap'} textAt={'center'} widthClass={100}>Form Preview</Label>*/}
                {/*<div>{jsonToStr(getFormField(mf_form.questions))}</div>*/}


                <div className={'mt-3x'}>
                    {/*form-elements*/}
                    <div className={''}>
                        {/*title*/}
                        <div>
                            <Label className={`fw-bold fs-lg ${checkNullStr(getFormField(mf_form.title)) ? 'text-black' : 'text-gray-md'}`}>
                                {getDefValueStr(getFormField(mf_form.title))}
                            </Label>
                        </div>

                        {/*desc*/}
                        <div>
                            <Label className={`fs-md mt-2 text-wrap ${checkNullStr(getFormField(mf_form.description)) ? 'text-black' : 'text-gray-md'}`}>
                                {getDefValueStr(getFormField(mf_form.description))}
                            </Label>
                        </div>
                    </div>

                    {/*form-qs*/}
                    {checkNullArr(getFormField(mf_form.questions)) ?
                        <div className={'mt-1'}>
                            {/*<Label className={'m-0 p-0 fw-bold fs-normal text-gray-dark'} widthClass={100}>Questions</Label>*/}
                            <GridBox className={'px-2'} md={6}>
                                {getFormField(mf_form.questions).map((qItem, qIndex) => {
                                    return <div key={qIndex} className={``}>
                                        {/*title,placeholder,questionType,order,required,answer,takenAt*/}
                                        <Input
                                            wrapperClassName={'mt-1x'}
                                            className={'rounded-2'}
                                            label={getDefJsonValue(qItem, mf_q.title.field)}
                                            placeholder={getDefJsonValue(qItem, mf_q.placeholder.field)}
                                            required={isJsonValueTrue(qItem, mf_q.required.field)}
                                            id={getDefJsonValue(qItem, mf_q.id.field)}
                                            value={getDefJsonValue(qItem, mf_q.answer.field)}
                                            type={(getDefJsonValue(qItem, mf_q.questionType.field) + '').toLowerCase()}
                                            placeholderAsLabel={false}
                                            showMsgOverride={false}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                log('questions.Input.onChange.qIndex:', qIndex, 'value:', value);
                                                inputList_updateSingleField(mf_q.answer, value, qIndex);
                                            }}
                                        />
                                    </div>
                                })}
                            </GridBox>
                        </div>
                        : <Label className={'mt-2 text-danger'} widthClass={100} textAt={'center'}>No questions found!</Label>}


                    {/*msg-box*/}
                    <div className={'mt-2'}>
                        {checkNullStr(getField(Fields.panelMsg)) &&
                            <Label
                                className={`text-wrap p-1 bg-${getField(Fields.panelMsgVariant, 'danger')}-25 mt-2 rounded-1 text-${getField(Fields.panelMsgVariant, 'danger')}`}
                                textAt={'center'} widthClass={100}>
                                {getField(Fields.panelMsg)}
                            </Label>}

                        {/*save-btn*/}
                        <Button className={'px-3 py-1 text-light mt-2'}
                                variant={'primary'}
                                text={isFieldTrue(Fields.submitBtn_AsLoading) ? 'Submitting...' : 'Submit Feedback'}
                                asLoading={isFieldTrue(Fields.submitBtn_AsLoading)}
                                disabled={isFieldTrue(Fields.submitBtn_disabled)||!checkNullArr(getFormField(mf_form.questions))}
                                onClick={handleFormSubmit}
                        />
                    </div>
                </div>
            </Section>
        </div>
    }

    function fetchEditFormData(recordId, checkNullBefore = true) {
        const fun = 'fetchEditFormData:';
        try {
            log(fun, 'recordId:', recordId);
            if (!checkNullBefore || (checkNullBefore && !isFieldTrue(Fields.isDataFetched))) {
                updateField(Fields.isDataFetched, true);
                updateField(Fields.isDataLoading, true);
                updateField(Fields.isDataSuccess, false);
                updateField(Fields.dataLoadingMsg, null);
                updateField(Fields.recordId, recordId);
                setFormData({});

                sendRequest({
                    reqUrl: ReqUrls.form__EditPage_fetchEditData,
                    reqOptions: {recordId},
                    onFetched: (fetchedData) => {
                        log(fun, 'fetchedData:', fetchedData);

                        const success = isJsonValueTrue(fetchedData, 'success');
                        const message = getDefJsonValue(fetchedData, 'message');
                        const formData = getDefJsonValue(fetchedData, 'data');

                        updateField(Fields.isDataSuccess, success);
                        updateField(Fields.dataLoadingMsg, message);
                        updateField(Fields.isDataLoading, false);

                        if (success) {
                            setFormData(formData);
                        }
                    },
                    onError: (error) => {
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

    function handleFormSubmit() {
        const fun = 'handleFormSubmit:';
        let allChecked = checkRequiredFields();
        // allChecked = false;
        log(fun, 'formData:', formData);
        try {
            if (allChecked) {
                if (!IsFormSubmissionDisabled) {
                    updateField(Fields.submitBtn_AsLoading, true);
                    updateField(Fields.submitBtn_disabled, true);

                    sendRequest({
                        reqUrl: ReqUrls.form__viewPage_submitFormQsAnswers,
                        reqOptions: {
                            recordId: getField(Fields.recordId),
                            formData
                        },
                        onFetched: (fetchedData) => {
                            log(fun, 'fetchedData:', fetchedData);

                            const success = isJsonValueTrue(fetchedData, 'success');
                            const message = getDefJsonValue(fetchedData, 'message');

                            updateField(Fields.submitBtn_AsLoading, false);
                            // updateField(Fields.submitBtn_disabled, false);//For testing purposes only
                            panelMsg(message, success ? CssVariant.success : CssVariant.danger);

                            if (success) {
                                redirectPage();
                            } else {
                                updateField(Fields.submitBtn_disabled, false);
                            }
                        },
                        onError: (error) => {
                            logErr(fun, error);
                            panelMsg("Submission failed, please try again!", CssVariant.danger);
                            updateField(Fields.submitBtn_AsLoading, false);
                            updateField(Fields.submitBtn_disabled, false);
                        }
                    });
                } else {
                    panelMsg("Form submission has been disabled for security reasons!", CssVariant.danger);
                }
            }
        } catch (error) {
            logErr(fun, error);
            panelMsg("Submission failed, please try again!", CssVariant.danger);
            updateField(Fields.submitBtn_AsLoading, false);
            updateField(Fields.submitBtn_disabled, false);
        }
    }

    function checkRequiredFields() {
        const formQs = getFormField(mf_form.questions);
        const requiredFields = checkNullArr(formQs) ? formQs.filter(item => isJsonValueTrue(item, mf_q.required.field)) : [];
        // log("checkRequiredFields.requiredFields:", requiredFields);

        let verified = false;
        let field = {};
        for (const loopField of requiredFields) {
            const fieldValue = loopField[mf_q.answer.field];
            // log("checkRequiredFields.for.fieldValue:", fieldValue);
            if (!checkNullStr(fieldValue)) {
                field = loopField;
                verified = false;
                break;
            } else {
                verified = true;
            }
        }
        if (!verified && checkNullJson(field)) {
            const colTitle = field.title;
            // log("checkRequiredFields.!verified.field:", field, 'idToFocus:', field.field);
            panelMsg(`'${colTitle}' field is required!`, CssVariant.danger);
            focusIdField(field[mf_q.id.field]);
        }
        return verified;
    }

    function focusIdField(id, onlyFocus = false) {
        focusFormIdElement(id, onlyFocus, 2000);
    }

    function redirectPage() {
        createTimeout(() => {
            panelMsg(`Redirecting you to the home-page now...`, CssVariant.info);
            createTimeout(() => {
                // window.location.href = AdminModuleRouteUrls[moduleName];
                navigate(ModuleRouteUrls[Modules.Home]);
            }, 1500);
        }, 2000);
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

    function updateFormField(field, value) {
        setFormData(prevState => ({...prevState, [field.field]: value}));
    }

    function getFormField(field, defValue) {
        return getDefJsonValue(formData, field.field, defValue);
    }

    function getPageTitle() {
        return 'View Form';
    }

    function panelMsg(msg, variant = 'danger') {
        updateField(Fields.panelMsg, msg);
        updateField(Fields.panelMsgVariant, variant);
    }

    function log(...text) {
        printLog(TAG, ...text);
    }

    function logErr(...text) {
        printError(TAG, ...text);
    }
});
export default FormViewPage;

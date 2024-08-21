import React, {useEffect, useState} from 'react';
import {AppInterface, Button, Checkbox, Flexbox, GridBox, HorDiv, Input, Label, LoadingPanel, Section} from "../components";
import {
    checkNullArr,
    checkNullStr,
    createTimeout,
    formatDate,
    getArrLen,
    getDefJsonValue, getDefValueStr,
    getFormIdFromBrowserUrl, getJsonValueFromNestedKeys,
    isBoolTrue,
    isJsonValueTrue,
    limitStringWords,
    printError,
    printLog, randomInt, scrollToTop,
    sendRequest, trim
} from "../utils/AppUtils";
import {Constants, CssVariant, FORM_INPUT_TYPES, ModuleFieldsData, ModuleRouteUrls, Modules, ReqUrls} from "../config/AppConfig";
import {useNavigate} from "react-router-dom";

const FormAddEditPage = React.memo(({updateOnly = false}) => {
    const TAG = "FormAddEditPage";
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

        builder_msg: 'builder_msg',
        builder_msgVariant: 'builder_msgVariant',
        builder_maxInputErr: 'builder_maxInputErr',
        builder_submitBtn_AsLoading: 'builder_submitBtn_AsLoading',
        builder_submitBtn_disabled: 'builder_submitBtn_disabled',
    };

    const [fieldsData, setFieldsData] = useState({});
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (updateMode()) {
            scrollToTop();
            fetchEditFormData(getFormIdFromBrowserUrl());
        } else {
            updateField(Fields.isDataLoading, false);
            updateField(Fields.isDataSuccess, true);
            updateField(Fields.dataLoadingMsg, null);
        }
    }, [updateOnly]);

    useEffect(() => {
        if (checkNullStr(getField(Fields.builder_msg))) {
            createTimeout(() => {
                builderMsg(null);
            }, 5000);
        }
    }, [getField(Fields.builder_msg)]);

    useEffect(() => {
        if (checkNullStr(getField(Fields.builder_maxInputErr))) {
            createTimeout(() => {
                updateField(Fields.builder_maxInputErr, null);
            }, 5000);
        }
    }, [getField(Fields.builder_maxInputErr)]);

    return (<AppInterface label={getPageTitle()}>
        <LoadingPanel
            success={isFieldTrue(Fields.isDataSuccess)}
            loading={isFieldTrue(Fields.isDataLoading)}
            msg={getField(Fields.dataLoadingMsg)}
        />

        {isFieldTrue(Fields.isDataSuccess) &&
            <div>
                <GridBox className={'px-2 mt-1'} md={[5, 7]}>
                    {renderBuilderForm()}
                    {renderPreviewForm()}
                </GridBox>
            </div>}
    </AppInterface>)

    function renderBuilderForm() {
        return <div className={''}>
            <Section className={'px-3 py-2 border-gray-light border-2 app-section'}>
                <Label className={'text-gray-dark fs-normal fw-bold text-nowrap'} textAt={'center'} widthClass={100}>Form Builder</Label>

                {/*top-section*/}
                <div>
                    {/*title*/}
                    <Input
                        className={'form-builder-input fs-lg fw-bold'}
                        placeholder={'Form title goes here'}
                        placeholderAsLabel={false}
                        showMsgOverride={false}
                        pt={0} p={0} pe={0} ps={0}
                        value={getFormField(mf_form.title)}
                        onChange={(e) => {
                            const value = e.target.value;
                            updateFormField(mf_form.title, value);
                            if (checkNullStr(value)) {
                                builderMsg(null);
                            }
                        }}
                    />

                    {/*desc*/}
                    <Input
                        className={'form-builder-input fs-md mt-1'}
                        placeholder={'Form description goes here'}
                        placeholderAsLabel={false}
                        showMsgOverride={false}
                        pt={0} p={0} pe={0} ps={0}
                        value={getFormField(mf_form.description)}
                        asTextArea={true}
                        style={{
                            minHeight: '28px',
                            // height: (getFormField(mf_form.description) + '').length > 55 ? '40px' : '24px',
                            height: `${(getFormField(mf_form.description) + '').length / 2.1}px`,
                            maxHeight: '150px',
                        }}
                        onChange={(e) => {
                            const value = e.target.value;
                            updateFormField(mf_form.description, value);
                            if (checkNullStr(value)) {
                                builderMsg(null);
                            }
                        }}
                    />

                    {updateMode() && <div>
                        <Label className={'text-gray fs-sm'}>
                            {/*updatedAt*/}
                            {checkNullStr(getFormField(mf_form.updatedAt)) && <span className={'text-nowrap'}>
                                <span className={'fw-semi-bold text-dark'}>Last edited on: </span>
                                    <span>{formatDate(getFormField(mf_form.updatedAt), Constants.DD_MM_YYYY_DASH)}</span>
                            </span>}

                            {/*createdAt*/}{checkNullStr(getFormField(mf_form.createdAt)) && <span className={'text-nowrap'}>
                            <span className={''}>&nbsp;|&nbsp;</span>
                                <span className={'fw-semi-bold text-dark'}>Created on: </span>
                                <span>{formatDate(getFormField(mf_form.createdAt), Constants.DD_MM_YYYY_DASH)}</span>
                            </span>}
                        </Label>
                    </div>}

                    {/*msg-box*/}
                    {checkNullStr(getField(Fields.builder_msg)) &&
                        <Label
                            className={`text-wrap p-1 bg-${getField(Fields.builder_msgVariant, 'danger')}-25 mt-2 rounded-1 text-${getField(Fields.builder_msgVariant, 'danger')}`}
                            textAt={'center'} widthClass={100}>
                            {getField(Fields.builder_msg)}
                        </Label>}

                    {/*save-btn*/}
                    <Button className={'px-3 py-1 text-light w-100 mt-3'}
                            variant={'primary'}
                            iconClass={'bi bi-check2 fs-md'}
                            text={isFieldTrue(Fields.builder_submitBtn_AsLoading) ? 'Saving changes...' : 'Save Changes'}
                            loadingWidth={'100%'}
                            loadingColorVariant={'warning'}
                            asLoading={isFieldTrue(Fields.builder_submitBtn_AsLoading)}
                            disabled={isFieldTrue(Fields.builder_submitBtn_disabled)}
                            onClick={handleFormBuilderSubmit}
                    />
                </div>

                <HorDiv className={'mt-3 mb-2'}/>

                {/*q-inputs*/}
                <div className={''}>
                    {/*heading*/}
                    <div><Label className={'text-dark fs-normal fw-bold'}>Add/Edit Questions</Label></div>

                    {/*input-list*/}
                    <div className={'mt-2'}>
                        {checkNullArr(getFormField(mf_form.questions)) && getFormField(mf_form.questions).map((inputItem, inputIndex) => {
                            const label = getDefJsonValue(inputItem, mf_q.title.field);
                            const placeholder = getDefJsonValue(inputItem, mf_q.placeholder.field);
                            const required = isJsonValueTrue(inputItem, mf_q.required.field);
                            const questionType = getDefJsonValue(inputItem, mf_q.questionType.field);
                            // const order = isJsonValueTrue(inputItem, mf_q.order.field);
                            // const value = getDefJsonValue(inputItem, mf_q.answer.field);
                            // const takenAt = isJsonValueTrue(inputItem, mf_q.takenAt.field);
                            return <div key={inputIndex} className={`${inputIndex > 0 ? 'mt-3' : ''}`}>
                                <Label className={'m-0 p-0 px-1 text-gray fw-semi-bold'}>
                                    {`Question: ${inputIndex + 1}`}
                                </Label>
                                <Section className={'px-3 py-2'} roundedVariant={2} borderColor={'#c9cbca'}>
                                    {/*label-edit & required*/}
                                    <Flexbox className={'w-100'} alignAt={'center'} justifyAt={'between'} wrap={'wrap'}>
                                        <Flexbox className={'w-auto'} alignAt={'center'} justifyAt={'start'}>
                                            <Label className={'m-0 p-0 text-dark text-nowrap'}>{limitStringWords(label, 20, '', '...')}</Label>
                                            <Button
                                                className={'p-2 fs-sm text-light'}
                                                variant={'transparent'}
                                                width={'24px'}
                                                height={'24px'}
                                                iconClass={'bi bi-pencil text-primary'}
                                                mx={2}
                                                onClick={() => {
                                                    const promptText = window.prompt("Please enter label text", label);
                                                    if (checkNullStr(promptText)) {
                                                        inputList_updateSingleField(mf_q.title, promptText, inputIndex);
                                                    }
                                                }}
                                            />

                                            {/*required*/}
                                            <Checkbox
                                                wrapperClassName={'ms-3 w-auto'}
                                                className={'w-auto'}
                                                px={1}
                                                py={0}
                                                checked={required}
                                                defaultChecked={required}
                                                onChange={(e, value) => {
                                                    inputList_updateSingleField(mf_q.required, value, inputIndex);
                                                }}>Required</Checkbox>
                                        </Flexbox>

                                        {/*delete-input*/}
                                        <Button
                                            className={'p-2 fs-sm'}
                                            variant={'transparent'}
                                            width={'24px'}
                                            height={'24px'}
                                            iconClass={'bi bi-trash text-danger'}
                                            ml={2}
                                            onClick={() => {
                                                try {
                                                    let updatedList = getFormField(mf_form.questions);
                                                    updatedList.splice(inputIndex, 1);
                                                    updateFormField(mf_form.questions, updatedList);
                                                } catch (error) {
                                                    logErr(error);
                                                }
                                            }}
                                        />
                                    </Flexbox>

                                    {/*input-box*/}
                                    <Input
                                        wrapperClassName={'mt-2'}
                                        className={'rounded-2'}
                                        placeholder={'Placeholder goes here'}
                                        label={''}
                                        value={placeholder}
                                        placeholderAsLabel={false}
                                        showMsgOverride={false}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            inputList_updateSingleField(mf_q.placeholder, value, inputIndex);
                                        }}
                                    />

                                    {/*questionType*/}
                                    <Flexbox className={'mt-2'} wrap={'wrap'}>
                                        {Object.values(FORM_INPUT_TYPES).map((typeItem, typeIndex) => {
                                            return <Button className={'px-2 fs-md-sm py-1 text-light rounded-1'}
                                                           key={typeIndex + typeItem}
                                                           variant={trim(questionType).toLowerCase() == trim(typeItem).toLowerCase() ? 'info-dark' : 'info'}
                                                           text={typeItem}
                                                           m={1}
                                                           onClick={() => {
                                                               inputList_updateSingleField(mf_q.questionType, typeItem, inputIndex);
                                                           }}
                                            />
                                        })}</Flexbox>
                                </Section>
                            </div>
                        })}
                    </div>

                    <div className={'mt-3'}>
                        {/*msg-box*/}
                        {checkNullStr(getField(Fields.builder_maxInputErr)) &&
                            <Label className={'text-wrap p-1 bg-danger-25 rounded-1 text-danger mb-2'} textAt={'center'} widthClass={100}>
                                {getField(Fields.builder_maxInputErr)}
                            </Label>}

                        {/*add-input btn*/}
                        <Button className={'px-3 py-1 text-light'}
                                variant={'success'}
                                text={'Add Input'}
                                onClick={() => {
                                    try {
                                        let updatedList = getFormField(mf_form.questions);
                                        const nextIndex = getArrLen(updatedList) + 1;

                                        const DEFAULT_DATA = {
                                            [mf_q.title.field]: `Label goes here: ${nextIndex}`,
                                            [mf_q.placeholder.field]: `Placeholder goes here: ${nextIndex}`,
                                            // [mf_q.questionType.field]: FORM_INPUT_TYPES.number,
                                            [mf_q.questionType.field]: Object.values(FORM_INPUT_TYPES)[randomInt(0, Object.values(FORM_INPUT_TYPES).length - 1)],
                                            [mf_q.order.field]: nextIndex,
                                            [mf_q.required.field]: [true, false, true, false, true, false][randomInt(0, 5)],
                                            [mf_q.answer.field]: null,
                                            [mf_q.takenAt.field]: null,
                                        };

                                        if (getArrLen(updatedList) < MAX_INPUT_LEN) {
                                            updatedList = checkNullArr(updatedList) ? updatedList : [];
                                            updatedList.push(DEFAULT_DATA);
                                            updateFormField(mf_form.questions, updatedList);
                                            updateField(Fields.builder_maxInputErr, ``);
                                        } else {
                                            updateField(Fields.builder_maxInputErr, `Max inputs: ${MAX_INPUT_LEN}`);
                                        }
                                    } catch (error) {
                                        logErr(error);
                                    }
                                    builderMsg(null);
                                }}
                        />
                    </div>
                </div>
            </Section>
        </div>
    }

    function inputList_updateSingleField(field, value, currIndex) {
        const fun = 'inputList_updateSingleField';
        // const value = e.target.value;
        // log(fun, 'field:', field.field, ' | value:', value, ' | currIndex:', currIndex);
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
            <Section className={'px-3 py-2 border-gray-light border-2 app-section'}>
                <Label className={'text-gray-dark fs-normal fw-bold text-nowrap'} textAt={'center'} widthClass={100}>Form Preview</Label>
                {/*<div>{jsonToStr(getFormField(mf_form.questions))}</div>*/}


                <div className={'mt-3x'}>
                    {/*form-elements*/}
                    <div className={''}>
                        {/*title*/}
                        <div>
                            <Label className={`fw-bold fs-lg ${checkNullStr(getFormField(mf_form.title)) ? 'text-black' : 'text-gray-md'}`}>
                                {getDefValueStr(getFormField(mf_form.title), "Form title goes here")}
                            </Label>
                        </div>

                        {/*desc*/}
                        <div>
                            <Label className={`fs-md mt-2 text-wrap ${checkNullStr(getFormField(mf_form.description)) ? 'text-black' : 'text-gray-md'}`}>
                                {getDefValueStr(getFormField(mf_form.description), "Form description goes here")}
                            </Label>
                        </div>
                    </div>

                    {/*form-qs*/}
                    {checkNullArr(getFormField(mf_form.questions)) ?
                        <div className={'mt-1'}>
                            {/*<Label className={'m-0 p-0 fw-bold fs-normal text-gray-dark'} widthClass={100}>Questions</Label>*/}
                            <GridBox className={'px-2'} md={6}>
                                {getFormField(mf_form.questions).map((item, index) => {
                                    return <div key={index} className={``}>
                                        {/*title,placeholder,questionType,order,required,answer,takenAt*/}
                                        <Input
                                            wrapperClassName={'mt-1x'}
                                            className={'rounded-2'}
                                            label={`${limitStringWords(getDefJsonValue(item, mf_q.title.field), 15, '', '...')} (Type: ${getDefJsonValue(item, mf_q.questionType.field)})`}
                                            placeholder={getDefJsonValue(item, mf_q.placeholder.field)}
                                            required={isJsonValueTrue(item, mf_q.required.field)}
                                            type={(getDefJsonValue(item, mf_q.questionType.field) + '').toLowerCase()}
                                            placeholderAsLabel={false}
                                            showMsgOverride={false}
                                            readOnly={true}
                                        />
                                    </div>
                                })}
                            </GridBox>
                        </div>
                        : <Label className={'mt-2 text-danger'}>No questions found!</Label>}
                </div>
            </Section>
        </div>
    }

    function fetchEditFormData(recordId, checkNullBefore = true) {
        const fun = 'fetchEditFormData:';
        try {
            log(fun, 'recordId:', recordId);
            // if (!checkNullBefore || (checkNullBefore && !isFieldTrue(Fields.isDataFetched))) {
            if (!isFieldTrue(Fields.isDataFetched)) {
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

    function handleFormBuilderSubmit() {
        const fun = 'handleFormBuilderSubmit:';
        let allChecked = checkFormBuilderRequiredFields();
        // allChecked = false;
        log(fun, 'formData:', formData);
        try {
            if (allChecked) {
                updateField(Fields.builder_submitBtn_AsLoading, true);
                updateField(Fields.builder_submitBtn_disabled, true);

                sendRequest({
                    reqUrl: ReqUrls.form__EditPage_submitData,
                    reqOptions: {
                        updateOnly: updateMode(),
                        recordId: getField(Fields.recordId),
                        formData
                    },
                    onFetched: (fetchedData) => {
                        log(fun, 'fetchedData:', fetchedData);

                        const success = isJsonValueTrue(fetchedData, 'success');
                        const message = getDefJsonValue(fetchedData, 'message');

                        updateField(Fields.builder_submitBtn_AsLoading, false);
                        // updateField(Fields.builder_submitBtn_disabled, false);//For testing purposes only
                        builderMsg(message, success ? CssVariant.success : CssVariant.danger);

                        if (success) {
                            redirectPage();
                        } else {
                            updateField(Fields.builder_submitBtn_disabled, false);
                        }
                    },
                    onError: (error) => {
                        logErr(fun, error);
                        builderMsg("Submission failed, please try again!", CssVariant.danger);
                        updateField(Fields.builder_submitBtn_AsLoading, false);
                        updateField(Fields.builder_submitBtn_disabled, false);
                    }
                });
            }
        } catch (error) {
            logErr(fun, error);
            builderMsg("Submission failed, please try again!", CssVariant.danger);
            updateField(Fields.builder_submitBtn_AsLoading, false);
            updateField(Fields.builder_submitBtn_disabled, false);
        }
    }

    function checkFormBuilderRequiredFields() {
        let checked = false;
        if (!checkNullStr(getFormField(mf_form.title))) {
            builderMsg("Form title is required!");
        } else if (!checkNullStr(getFormField(mf_form.description))) {
            builderMsg("Form description is required!");
        } else if (!checkNullArr(getFormField(mf_form.questions))) {
            builderMsg("Please add at least one question in the form!");
        } else {
            checked = true;
        }
        if (!checked) {
            scrollToTop();
        }
        return checked;
    }

    function redirectPage() {
        createTimeout(() => {
            builderMsg(`Redirecting you to the home-page now...`, CssVariant.info);
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

    function updateMode() {
        return isBoolTrue(updateOnly);
    }

    function getPageTitle() {
        return updateMode() ? 'Edit form' : 'Create Form';
    }

    function builderMsg(msg, variant = 'danger') {
        updateField(Fields.builder_msg, msg);
        updateField(Fields.builder_msgVariant, variant);
    }

    function log(...text) {
        printLog(TAG, ...text);
    }

    function logErr(...text) {
        printError(TAG, ...text);
    }
});
export default FormAddEditPage;

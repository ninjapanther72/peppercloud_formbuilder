// const process = require('node:process');
// require("dotenv").config({path: "../.env"});

const AppName = "PepperCloud Form Builder";
const DefStr = "";
const DefStrNA = "N/A";
const DB_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const ID_LEN = 25;
const DebugOn = true;
const IsProd = true;

const AllowedFrontendUrls = [
    'http://localhost:3030',
    'https://peppercloud-formbuilder.netlify.app/',
    'https://peppercloud-formbuilder.netlify.app',
];


//--------------Backend-Frontend common fields start-------------------------------
const Modules = {
    Home: "Home",
    Forms: "Forms",
    FormQuestions: "Form Questions",
    FormCreate: "Create Form",
    FormEdit: "Edit Form",
    FormView: "View Form",
};

const ModuleRouteUrls = {
    [Modules.Home]: '/',
};

const GenRouteUrls = {
    formCreate: '/form/create',
    formView: '/form/:id',
    formEdit: '/form/:id/edit',
    _404: '*',
};

const ReqUrls = {
    home__fetchForms: '/home-fetch-forms',
    form__viewPage_submitQResponses: '/form-view-page-submit-q-responses',
    form__viewPage_DeleteForm: '/form-view-page-delete-form',
    form__EditPage_fetchEditData: '/form-edit-page-fetch-edit-data',
    form__EditPage_submitData: '/form-edit-page-submit-data',
    form__viewPage_submitFormQsAnswers: '/form-view-page-submit-form-qs-answers',
};

const Keys = {
    theme: 'theme',
    themeValues: 'themeValues',
    browserUrl: 'browserUrl',
};

const ModuleFieldsData = {
    [Modules.Forms]: {
        //document-fields: _id, form_id, title, description, created_at, updated_at
        _id: {
            field: '_id',
            title: '_id'
        },
        formId: {
            field: 'form_id',
            title: 'Form Id'
        },
        title: {
            field: 'title',
            title: 'Title'
        },
        description: {
            field: 'description',
            title: 'Description'
        },
        questions: {
            field: 'questions',
            title: 'Questions'
        },
        createdAt: {
            field: 'created_at',
            title: 'Created At'
        },
        updatedAt: {
            field: 'updated_at',
            title: 'Updated At'
        }
    },
    [Modules.FormQuestions]: {
        // _id, form_id, question_type, title, placeholder, required, order, answer, taken_at
        id: {
            field: '_id',
            title: '_id'
        },
        formId: {
            field: 'form_id',
            title: 'Form Id'
        },
        questionType: {
            field: 'question_type',
            title: 'Question Type'
        },
        title: {
            field: 'title',
            title: 'Title'
        },
        placeholder: {
            field: 'placeholder',
            title: 'Placeholder'
        },
        required: {
            field: 'required',
            title: 'Required'
        },
        order: {
            field: 'order',
            title: 'Order'
        },
        answer: {
            field: 'answer',
            title: 'Answer'
        },
        takenAt: {
            field: 'taken_at',
            title: 'Taken At'
        },
        isTaken: {
            field: 'is_taken',
            title: 'Is Taken'
        }
    },

};

/**
 * Represents a collection of essential message, error messages, date-formats etc.
 */
const Messages = {
    invalidCredsMsg: "Invalid credentials!",
    verifyErrMsg: "Verification failed, please try again",
    verifySuccessMsg: "Verification successful, welcome back",
    uploadErrMsg: "Couldn't save your data, please try again",
    uploadImgErrMsg: "Couldn't save your images, please try again",
    uploadSuccessMsg: "You data has been saved successfully",
    recordDelete: "Record deleted",
    recordDisable: "Record disabled",
    recordEnabled: "Record Enabled",
    recordDeleteFailed: "Couldn't delete the record, please try again!",
    fetchSuccessMsg: "Successfully fetched your data",
    fetchErrMsg: "Sorry! Couldn't retrieve data, please try again",
    emailExistsMsg: "Email already exists",
    serverErrorMsg: "Internal Server Error",
    similarDataExistsMsg: 'Similar data already exists',
    invalidEmailMsg: "Email has invalid domain",
    unidentifiedEmailMsg: "Unidentified email",
    sessionExpired: 'Session expired, please login again!',
    sessionAuthFailed: 'Authentication failed! Please try again :(',
    testDataReceived: 'Data received (for testing only)',
}

const Constants = {

    YYYY_MM_DD_DASH: "YYYY-MM-DD",
    YYYY_MMM_DD_DASH: "YYYY-MMM-DD",
    DD_MMM_YYYY_DASH: "DD-MMM-yyyy",
    DD_MMM_YYYY_DASH_HMSA: "DD-MMM-yyyy hh:mm:ssA",
    YYYY_MM_DD_DASH_HMS: "YYYY-MM-DD HH:mm:ss",
    DD_MMM_YYYY_UNDERSCORE: "DD_MMM_yyyy",
    DD_MMM_YYYY_SLASH: "DD/MMM/yyyy",
    DD_MM_YYYY_DASH: "DD-MM-YYYY",
    DD_MM_YYYY_SLASH: "DD/MM/YYYY",
};
//--------------Backend-Frontend common fields end-------------------------------

const DbCollections = {
    forms: 'forms',
    formQs: 'form_questions',
};
const Patterns = {
    plainNumber: /^[0-9]*$/,
    allNumber: /^\-?\d+((\.)\d+)?$/,
    emailMobText: /^[a-zA-Z\s]*$/, // plainText: /^[a-zA-Z\s]*$/,
    plainText: /^[a-zA-Z\ ]*$/, // plainText: /^[A-Za-z\s_\-]+$/,
    /**
     * One uppercase letter, two digits, three lowercase letters, min-length=8
     */
    password: /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9].*[0-9])(?=.*[a-z].*[a-z].*[a-z]).{8,}$/,
    prefix: /^[a-zA-Z\s.\-]+$/,

    // email: /^[a-zA-Z0-9.!#$%&'*+/:?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // mobile: /^(\+?\d{1,3})?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/,
    // mobile: /^\+\d{1,14}-\d{1,}$/,
    mobile: /^[0-9]*$/,
    mobileWithCountryCode: /^[\d+ ]{0,14}$/,
    mobileWithCountryCodeAdvance: /^[+-]?[0-9]{10,14}$/, // mobileWithCountryCode: /^(\+\d{1,3}\s)?\d{1,14}$/,
    pincode: /^[0-9]*$/,
    skills: /^[a-zA-Z\. \-\,\(\)\#\@\/\n]*$/,
    file: /^([a-zA-Z]:)?((\/|\\)[^<>:"/\\|?*\n\r]+)+(\.|\/|\\)([^<>:"/\\|?*\n\r]+)*$/,
    alphaNumeric: /^[a-zA-Z0-9]+$/,
    url: /^(http(s)?:\/\/)?([w]{3}\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})(\/[a-zA-Z0-9-_#]+)*\/?(\?[a-zA-Z0-9-_#]+=[a-zA-Z0-9-%]+(&[a-zA-Z0-9-_#]+=[a-zA-Z0-9-%]+)*)?$/,
    imageUrl: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})(\/[^\s]*)?\.(jpg|jpeg|png|gif|bmp|svg)$/i,
    fax: /^\+?[0-9\s-]+$/,
    message: /^[\w\s.,!?@#$%^&*()-+=<>[\]{}|\\/]+$/, // message: /^[\w\s\-.,!@()/&]+$/,
    experience: /^[\w\s\-_.&]+$/,
    unicodeStr: /^[\w\s,()&\-\/.\\]+$/,
    address: /^[a-zA-Z0-9 ,.\-_/\\]+$/,
    msgAdvance: /[^a-zA-Z0-9\s\.,?!:;'"()-]/g,
    commaDashUnderscoreSpaceStr: /^[a-zA-Z\s, -]+$/, // message: /^[a-zA-Z0-9\. \-\,\(\)\#\@\/\n]*$/,
};


module.exports = {
    DB_DATE_FORMAT,
    IsProd,
    AppName,
    ID_LEN,
    Modules,
    ModuleRouteUrls,
    DefStr,
    GenRouteUrls,
    DefStrNA,
    DebugOn,
    Messages,
    Patterns,
    Constants,
    ReqUrls,
    ModuleFieldsData,
    Keys,
    DbCollections,
    AllowedFrontendUrls,
};

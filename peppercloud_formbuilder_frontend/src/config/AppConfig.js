export const AppName = "PepperCloud Form Builder";
export const AppDateFormat = "DD-MMM-YYYY, hh:mm A";
export const THEME = "primary";
export const DebugOn = true;
export const IsProd = false;
export const BaseReqUrl = IsProd ? "https://peppercloud-formbuilder-backend.onrender.com" : "http://localhost:8030";

//--------------Backend-Frontend common fields start-------------------------------
export const Modules = {
    Home: "Home",
    Forms: "Forms",
    FormQuestions: "Form Questions",
    FormCreate: "Create Form",
    FormEdit: "Edit Form",
    FormView: "View Form",
};

export const ModuleRouteUrls = {
    [Modules.Home]: '/',
};

export const GenRouteUrls = {
    formCreate: '/form/create',
    formView: '/form/:id',
    formEdit: '/form/:id/edit',
    _404: '*',
};

export const ReqUrls = {
    home__fetchForms: '/home-fetch-forms',
    form__viewPage_submitQResponses: '/form-view-page-submit-q-responses',
    form__viewPage_DeleteForm: '/form-view-page-delete-form',
    form__EditPage_fetchEditData: '/form-edit-page-fetch-edit-data',
    form__EditPage_submitData: '/form-edit-page-submit-data',
    form__viewPage_submitFormQsAnswers: '/form-view-page-submit-form-qs-answers',
};

export const Keys = {
    theme: 'theme',
    themeValues: 'themeValues',
    browserUrl: 'browserUrl',
};

export const ModuleFieldsData = {
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
        title: {
            field: 'title',
            title: 'Title'
        },
        placeholder: {
            field: 'placeholder',
            title: 'Placeholder'
        },
        questionType: {
            field: 'question_type',
            title: 'Question Type'
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

export const FORM_INPUT_TYPES = {
    //Email, Text, Password, Number, date
    email: "EMAIL",
    text: "TEXT",
    password: "PASSWORD",
    number: "NUMBER",
    date: "DATE",
};

/**
 * Represents a collection of essential message, error messages, date-formats etc.
 */
export const Messages = {
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
export const Constants = {

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

export const CssVariant = {
    primary: 'primary',
    primaryDark: 'primaryDark',
    success: 'success',
    secondary: 'secondary',
    warning: 'warning',
    info: 'info',
    dark: 'dark',
    light: 'light',
    danger: 'danger',
    white: 'white',
};
export const FsVarVariant = {
    XS: "var(--fs-xs)",
    MD_XS: "var(--fs-md-xs)",
    SM: "var(--fs-sm)",
    MD_SM: "var(--fs-md-sm)",
    NORMAL: "var(--fs-normal)",
    MD: "var(--fs-md)",
    SM_MD: "var(--fs-sm-md)",
    MD_LG: "var(--fs-md-lg)",
    LG: "var(--fs-lg)",
    XL: "var(--fs-xl)",
    XXL: "var(--fs-xxl)",
    XXXL: "var(--fs-xxxl)",
    XXXXL: "var(--fs-xxxxl)",
    XXXXXL: "var(--fs-xxxxxl)",
    XXXXXXL: "var(--fs-xxxxxxl)",
};

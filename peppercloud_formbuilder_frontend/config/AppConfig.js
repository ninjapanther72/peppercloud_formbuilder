export const AppName = "PepperCloud FormBuilder";
export const AppDateFormat = "ddd, DD-MMM-YYYY, hh:mm A";
export const DebugOn = true;
export const IsProd = false;
export const BaseReqUrl = IsProd ? "https://peppercloud-formbuilder-backend.onrender.com" : "http://localhost:8030";

//--------------Backend-Frontend common fields start-------------------------------
export const Modules = {
    Dashboard: "Dashboard",
    WebMeeting: "Web Meeting",
    DiscussionForum: "Discussion Forum",
};

export const ModuleRouteUrls = {
    [Modules.Home]: '/',
    [Modules.Dashboard]: '/',
    [Modules.UserProfile]: '/myaccount',
};

export const GenRouteUrls = {
    login: '/login',
    requestAccess: '/request_access',
    forgotPw: '/forgot-password',
    _404: '*',

    //meeting-route-urls
    meeting_uploadPage: '/create-meeting',
};

export const ReqUrls = {
    //wm
    wm__mainPage_fetch_recordList: '/wm-main-page-fetch-record-list',
    wm__mainPage_delete_record: '/wm-main-page-delete-record',
    wm__addEditPage_submit_formData: '/wm-add-edit-page-submit-form-data',
    wm__addEditPage_fetch_editFormData: '/wm-add-edit-page-fetch-edit-form-data',
};

export const Keys = {
    theme: 'theme',
    themeValues: 'themeValues',
    browserUrl: 'browserUrl',
};

export const ModuleFieldsData = {
    [Modules.UserProfile]: {
        //table-columns: member_id, company_id, member_prefix, first_name, last_name, user_name, user_password, vok_user_password, member_user, member_dob, gender, member_email1, member_email2, work_phone1, work_phone2, member_mobile1, member_mobile2, home_phone, member_speciality1, member_speciality2, member_image, country_id, state_id, city_id, member_timezone, member_organisation1, member_designation1, member_organisation2, member_designation2, highest_education, interest_area1, interest_area2, member_biography, work_address1, work_address2, home_address, member_remark, you_have, access_internet, send_reminder, con_time, other_time, con_day, other_day, accept_policy, member_status, insert_date, insert_by, update_date, update_by, `timestamp`, member_online, login_time, logout_time, total_login, new_total_login
        memberId: {
            column: "member_id",
            title: "Member Id",
            field: "memberId",
        },
        companyId: {
            column: "company_id",
            title: "Company Id",
            field: "companyId",
        },
        memberPrefix: {
            column: "member_prefix",
            title: "Member Prefix",
            field: "memberPrefix",
        },
        firstName: {
            column: "first_name",
            title: "First Name",
            field: "firstName",
        },
        lastName: {
            column: "last_name",
            title: "Last Name",
            field: "lastName",
        },
        fullName: {
            column: "fullName",
            title: "Full Name",
            field: "fullName",
        },
        username: {
            column: "user_name",
            title: "Username",
            field: "username",
        },
        userPassword: {
            column: "user_password",
            title: "User Password",
            field: "userPassword",
        },
        vokUserPassword: {
            column: "vok_user_password",
            title: "Vok User Password",
            field: "vokUserPassword",
        },
        loginPin: {
            column: "login_pin",
            title: "Login PIN",
        },
        memberUser: {
            column: "member_user",
            title: "Member User",
            field: "memberUser",
        },
        memberDob: {
            column: "member_dob",
            title: "Member Dob",
            field: "memberDob",
        },
        gender: {
            column: "gender",
            title: "Gender",
            field: "gender",
        },
        memberEmail1: {
            column: "member_email1",
            title: "Member Email 1",
            field: "memberEmail1",
        },
        memberEmail2: {
            column: "member_email2",
            title: "Member Email 2",
            field: "memberEmail2",
        },
        workPhone1: {
            column: "work_phone1",
            title: "Work Phone 1",
            field: "workPhone1",
        },
        workPhone2: {
            column: "work_phone2",
            title: "Work Phone 2",
            field: "workPhone2",
        },
        memberMobile1: {
            column: "member_mobile1",
            title: "Member Mobile 1",
            field: "memberMobile1",
        },
        memberMobile2: {
            column: "member_mobile2",
            title: "Member Mobile 2",
            field: "memberMobile2",
        },
        homePhone: {
            column: "home_phone",
            title: "Home Phone",
            field: "homePhone",
        },
        memberSpeciality1: {
            column: "member_speciality1",
            title: "Member Speciality 1",
            titleAlt: "Specialization",
            field: "memberSpeciality1",
        },
        memberSpeciality2: {
            column: "member_speciality2",
            title: "Member Speciality 2",
            field: "memberSpeciality2",
        },
        memberImage: {
            column: "member_image",
            title: "Member Image",
            field: "memberImage",
        },
        countryId: {
            column: "country_id",
            title: "Country Id",
            field: "countryId",
        },
        stateId: {
            column: "state_id",
            title: "State Id",
            field: "stateId",
        },
        cityId: {
            column: "city_id",
            title: "City Id",
            field: "cityId",
        },
        countryName: {
            column: "country_name",
            title: "Country",
        },
        stateName: {
            column: "state_name",
            title: "State",
        },
        cityName: {
            column: "city_name",
            title: "City",
        },
        memberTimezone: {
            column: "member_timezone",
            title: "Member Timezone",
            field: "memberTimezone",
        },
        memberOrganisation1: {
            column: "member_organisation1",
            title: "Member Organisation 1",
            field: "memberOrganisation1",
        },
        memberDesignation1: {
            column: "member_designation1",
            title: "Member Designation 1",
            field: "memberDesignation1",
        },
        memberOrganisation2: {
            column: "member_organisation2",
            title: "Member Organisation 2",
            field: "memberOrganisation2",
        },
        memberDesignation2: {
            column: "member_designation2",
            title: "Member Designation 2",
            field: "memberDesignation2",
        },
        highestEducation: {
            column: "highest_education",
            title: "Highest Education",
            field: "highestEducation",
        },
        interestArea1: {
            column: "interest_area1",
            title: "Interest Area 1",
            field: "interestArea1",
        },
        interestArea2: {
            column: "interest_area2",
            title: "Interest Area 2",
            field: "interestArea2",
        },
        memberBiography: {
            column: "member_biography",
            title: "Member Biography",
            titleAlt: "Bio",
            field: "memberBiography",
        },
        workAddress1: {
            column: "work_address1",
            title: "Work Address 1",
            field: "workAddress1",
        },
        workAddress2: {
            column: "work_address2",
            title: "Work Address 2",
            field: "workAddress2",
        },
        homeAddress: {
            column: "home_address",
            title: "Home Address",
            field: "homeAddress",
        },
        memberRemark: {
            column: "member_remark",
            title: "Member Remark",
            field: "memberRemark",
        },
        youHave: {
            column: "you_have",
            title: "You Have",
            field: "youHave",
        },
        accessInternet: {
            column: "access_internet",
            title: "Access Internet",
            field: "accessInternet",
        },
        sendReminder: {
            column: "send_reminder",
            title: "Send Reminder",
            field: "sendReminder",
        },
        conTime: {
            column: "con_time",
            title: "Con Time",
            field: "conTime",
        },
        otherTime: {
            column: "other_time",
            title: "Other Time",
            field: "otherTime",
        },
        conDay: {
            column: "con_day",
            title: "Con Day",
            field: "conDay",
        },
        otherDay: {
            column: "other_day",
            title: "Other Day",
            field: "otherDay",
        },
        acceptPolicy: {
            column: "accept_policy",
            title: "Accept Policy",
            field: "acceptPolicy",
        },
        memberStatus: {
            column: "member_status",
            title: "Member Status",
            field: "memberStatus",
        },
        insertDate: {
            column: "insert_date",
            title: "Insert Date",
            field: "insertDate",
        },
        insertBy: {
            column: "insert_by",
            title: "Insert By",
            field: "insertBy",
        },
        updateDate: {
            column: "update_date",
            title: "Update Date",
            field: "updateDate",
        },
        updateBy: {
            column: "update_by",
            title: "Update By",
            field: "updateBy",
        },
        timestamp: {
            column: "timestamp",
            title: "Timestamp",
            field: "timestamp",
        },
        memberOnline: {
            column: "member_online",
            title: "Member Online",
            field: "memberOnline",
        },
        loginTime: {
            column: "login_time",
            title: "Login Time",
            field: "loginTime",
        },
        logoutTime: {
            column: "logout_time",
            title: "Logout Time",
            field: "logoutTime",
        },
        totalLogin: {
            column: "total_login",
            title: "Total Login",
            field: "totalLogin",
        },
        newTotalLogin: {
            column: "new_total_login",
            title: "New Total Login",
            field: "newTotalLogin"
        },
        imageExt: {
            column: "imageExt",
            title: "imageExt",
            field: "imageExt"
        }
    },

};

export const SurveyQTypes = {
    textarea: {name: "Textarea", value: "Textarea"},
    paragraph: {name: "Paragraph", value: "Paragraph"},
    multipleChoice: {name: "Multiple Choice (to choose from many)", value: "Multiple Choice"},
    checkboxes: {name: "Checkboxes (to choose more than one)", value: "Checkboxes"},
    sliderRange: {name: "Slider Range (1,2,3...10)", value: "Slider Range"},
    dateTime: {name: "Date & Time", value: "Date and Time"},
    likert: {name: "Likert/Option Grid", value: "Likert"},
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
//--------------Backend-Frontend common fields end-------------------------------

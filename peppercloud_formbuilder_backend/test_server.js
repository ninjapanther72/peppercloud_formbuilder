const {ModuleFieldsData, Modules,DbCollections} =require ("./config/ServerConfig");
const {storeJsonDataInTempFile} =require( "./utils/ServerUtils");

//col-titles
// console.log(Object.values(ModuleFieldsData[Modules.Company]).map(item => item.title).join(', '));
// console.log(Object.values(ModuleFieldsData[Modules.Members]).map(item => item.column).join(', '));
console.log(Object.keys(ModuleFieldsData[Modules.FormQuestions]).join(', '));


function convertFieldsToJSON(fields) {
    const json = {};
    fields.forEach(field => {
        const camelCaseName = field.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
        const spacedName = camelCaseName.split(/(?=[A-Z])/).join(' ');
        const capitalizedWords = spacedName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1));
        const title = capitalizedWords.join(' ');
        json[camelCaseName] = {
            field: field, title: title, // field: camelCaseName,
        };
    });
    return json;
}

const form={
    "_id": "64ddf4e1fc13ae24d9000020",
    "form_id": "8765rop09876543456yhgr5",
    "question_type": "email",
    "title": "Email Address",
    "placeholder": "Enter your email",
    "required": true,
    "order": 1,
    "answer": "user@example.com",
    "taken_at": "2024-08-12T12:15:00Z"
}


// const fields =Object.keys(form);
// const result = convertFieldsToJSON(fields);
// storeJsonDataInTempFile(result);
// console.log(fields);
// console.log(result);

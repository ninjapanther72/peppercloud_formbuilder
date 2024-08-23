const axios = require('axios');

// const arr = [5, 6, 7, 8];
//
// //map
// const newArr = arr.map(item => item * 2);
// console.log('newArr:', newArr);

// const reqUrl = 'https://reqres.in/api/users?page=2';
//
// function fetchData() {
//     axios.get(reqUrl)
//         .then(resData => {
//             // fetch
//         })
//         .catch((e) => console.error(e));
//     //2
// }
// fetchData();

// async function sleepFun(delay = 2000) {
//     return await new Promise(resolve => setTimeout(resolve, delay));
// }
//
// //
// async function printNumbersWithDelay(delay = 2000) {
//     for (let i = 1; i <= 10; i++) {
//         await sleepFun(delay);
//         // setTimeout(() => {
//             console.log(i);
//         // }, i * delay);
//     }
// }
// function printNums() {
//     printNumbersWithDelay();
// }
// printNums();


//harish -> haris
// const srcStr='harish';
//Bind

// const person = {
//     firstName: "X",
//     lastName: "Y",
//     fullName: function()  {
//         return `${this.firstName} ${this.lastName}`
//     }
// };
// const member = {firstName: "John", lastName: "Doe"};
// const fullName = person.fullName.bind(member)
// console.log('fullName:', fullName());

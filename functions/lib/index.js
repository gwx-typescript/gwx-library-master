"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
// import * as Admin from "firebase-admin";
// const admin = Admin.initializeApp();
exports.getListAllUsers = functions
    .region("asia-northeast1")
    .https.onCall((data, context) => {
    function listAllUsers() {
        return { data: data, auth: context.auth };
        // let result: any[] = new Array();
        // // List batch of users, 1000 at a time.
        // admin
        //   .auth()
        //   .listUsers(1000)
        //   .then(function(listUsersResult) {
        //     listUsersResult.users.forEach(function(userRecord) {
        //       result.push(userRecord.toJSON());
        //     });
        //   })
        //   .catch(function(error) {
        //     console.log("Error listing users:", error);
        //   });
        // return result;
    }
    // Start listing users from the beginning, 1000 at a time.
    listAllUsers();
});
//# sourceMappingURL=index.js.map
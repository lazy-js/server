"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Query = Query;
exports.Param = Param;
exports.Body = Body;
exports.Token = Token;
exports.UserId = UserId;
const App_1 = require("../server/App");
function Query(...properties) {
    const req = App_1.requestStorage.getStore();
    if (!req)
        throw new Error("Query helper should run inside a async hook");
    const result = {};
    for (const prop of properties) {
        result[prop] = req.query[prop];
    }
    return result;
}
function Param(...properties) {
    const req = App_1.requestStorage.getStore();
    if (!req)
        throw new Error("Query helper should run inside a async hook");
    const result = {};
    for (const prop of properties) {
        result[prop] = req.params[prop];
    }
    return result;
}
function Body(...properties) {
    const req = App_1.requestStorage.getStore();
    if (!req)
        throw new Error("Query helper should run inside a async hook");
    const result = {};
    for (const prop of properties) {
        result[prop] = req.body[prop];
    }
    return result;
}
function Token() {
    const req = App_1.requestStorage.getStore();
    if (!req)
        throw new Error("Query helper should run inside a async hook");
    return req.headers.authorization;
}
function UserId(userIdPropperty = "user_id") {
    const req = App_1.requestStorage.getStore();
    if (!req)
        throw new Error("Query helper should run inside a async hook");
    return req[userIdPropperty];
}
//# sourceMappingURL=requestHelpers.js.map
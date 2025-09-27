import { requestStorage } from "../server/App";
export function Query(...properties) {
    const req = requestStorage.getStore();
    if (!req)
        throw new Error("Query helper should run inside a async hook");
    const result = {};
    for (const prop of properties) {
        result[prop] = req.query[prop];
    }
    return result;
}
export function Param(...properties) {
    const req = requestStorage.getStore();
    if (!req)
        throw new Error("Query helper should run inside a async hook");
    const result = {};
    for (const prop of properties) {
        result[prop] = req.params[prop];
    }
    return result;
}
export function Body(...properties) {
    const req = requestStorage.getStore();
    if (!req)
        throw new Error("Query helper should run inside a async hook");
    const result = {};
    for (const prop of properties) {
        result[prop] = req.body[prop];
    }
    return result;
}
export function Token() {
    const req = requestStorage.getStore();
    if (!req)
        throw new Error("Query helper should run inside a async hook");
    return req.headers.authorization;
}
export function UserId(userIdPropperty = "user_id") {
    const req = requestStorage.getStore();
    if (!req)
        throw new Error("Query helper should run inside a async hook");
    return req[userIdPropperty];
}
//# sourceMappingURL=requestHelpers.js.map
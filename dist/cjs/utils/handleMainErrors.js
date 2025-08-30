"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMainErrors = void 0;
exports.handleMainException = handleMainException;
const utils_1 = require("@lazy-js/utils");
function handleMainException(err, callback, restartDelaySeconds = 2) {
    return new Promise((resolve, reject) => {
        let appError;
        if (Array.isArray(err.errors)) {
            appError = (0, utils_1.handeleZodError)(err);
            resolve(appError);
        }
        else {
            appError = new utils_1.AppError({
                code: 'INTERNAL_SERVER_ERROR',
                label: err.message,
                category: 'error',
            });
            resolve(appError);
        }
        setTimeout(() => {
            callback();
        }, restartDelaySeconds * 1000);
    });
}
exports.handleMainErrors = handleMainException;
//# sourceMappingURL=handleMainErrors.js.map
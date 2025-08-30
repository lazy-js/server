"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = globalErrorHandler;
const utils_1 = require("@lazy-js/utils");
function globalErrorHandler(err, _, res, __) {
    if (Array.isArray(err.errors)) {
        const zodError = (0, utils_1.handeleZodError)(err);
        return res.status(zodError.statusCode || 500).json((0, utils_1.errorResponse)(zodError));
    }
    if (err instanceof utils_1.AppError) {
        return res.status(err.statusCode || 500).json((0, utils_1.errorResponse)(err));
    }
    else {
        return res
            .status(500)
            .json((0, utils_1.errorResponse)(new utils_1.AppError(utils_1.generalErrors.INTERNAL_SERVER_ERROR)));
    }
}
//# sourceMappingURL=globalErrorHandler.js.map
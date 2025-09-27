"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGlobalErrorHandler = getGlobalErrorHandler;
function getGlobalErrorHandler(config) {
    const _config = {
        serviceName: (config === null || config === void 0 ? void 0 : config.serviceName) || "unknown service",
        traceIdHeader: (config === null || config === void 0 ? void 0 : config.traceIdHeader) || "x-trace-id",
        traceIdProperty: (config === null || config === void 0 ? void 0 : config.traceIdProperty) || "traceId",
    };
    return function globalErrorHandler(err, req, res, __) {
        const sharedErrorObject = {
            [_config.traceIdProperty]: req.headers[_config.traceIdHeader],
            serviceName: _config.serviceName,
            timestamp: new Date(),
        };
        const interfaceServerError = {
            code: "INTERNAL_SERVER_ERROR",
            message: "internal server error catched in default global error handler",
            ...sharedErrorObject,
        };
        if (typeof err === "object") {
            const message = err.code || err.message;
            return res.status(500).json({
                success: false,
                error: message
                    ? { code: message, message: message, ...sharedErrorObject }
                    : interfaceServerError,
            });
        }
        if (typeof err === "string") {
            return res.status(500).json({
                success: false,
                error: { code: err, message: err, ...sharedErrorObject },
            });
        }
        else {
            return res.status(500).json({
                success: false,
                error: interfaceServerError,
            });
        }
    };
}
//# sourceMappingURL=globalErrorHandler.js.map
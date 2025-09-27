import { Request, Response, NextFunction } from "express";

interface GlobalErrorHandlerConfig {
        serviceName?: string;
        traceIdHeader?: string;
        traceIdProperty?: string;
}

export function getGlobalErrorHandler(config?: GlobalErrorHandlerConfig) {
        const _config: Required<GlobalErrorHandlerConfig> = {
                serviceName: config?.serviceName || "unknown service",
                traceIdHeader: config?.traceIdHeader || "x-trace-id",
                traceIdProperty: config?.traceIdProperty || "traceId",
        };
        return function globalErrorHandler(err: any, req: Request, res: Response, __: NextFunction) {
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
                } else {
                        return res.status(500).json({
                                success: false,
                                error: interfaceServerError,
                        });
                }
        };
}

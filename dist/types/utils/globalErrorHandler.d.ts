import { Request, Response, NextFunction } from "express";
interface GlobalErrorHandlerConfig {
    serviceName?: string;
    traceIdHeader?: string;
    traceIdProperty?: string;
}
export declare function getGlobalErrorHandler(config?: GlobalErrorHandlerConfig): (err: any, req: Request, res: Response, __: NextFunction) => Response<any, Record<string, any>>;
export {};
//# sourceMappingURL=globalErrorHandler.d.ts.map
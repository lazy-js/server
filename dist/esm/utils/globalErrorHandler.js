import { handeleZodError, errorResponse, AppError, generalErrors, } from '@lazy-js/utils';
export function globalErrorHandler(err, _, res, __) {
    if (Array.isArray(err.errors)) {
        const zodError = handeleZodError(err);
        return res.status(zodError.statusCode || 500).json(errorResponse(zodError));
    }
    if (err instanceof AppError) {
        return res.status(err.statusCode || 500).json(errorResponse(err));
    }
    else {
        return res
            .status(500)
            .json(errorResponse(new AppError(generalErrors.INTERNAL_SERVER_ERROR)));
    }
}
//# sourceMappingURL=globalErrorHandler.js.map
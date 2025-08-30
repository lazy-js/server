import { AppError, handeleZodError } from '@lazy-js/utils';
export function handleMainException(err, callback, restartDelaySeconds = 2) {
    return new Promise((resolve, reject) => {
        let appError;
        if (Array.isArray(err.errors)) {
            appError = handeleZodError(err);
            resolve(appError);
        }
        else {
            appError = new AppError({
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
export const handleMainErrors = handleMainException;
//# sourceMappingURL=handleMainErrors.js.map
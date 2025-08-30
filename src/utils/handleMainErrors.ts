import { AppError, handeleZodError } from '@lazy-js/utils';

export function handleMainException(
  err: any,
  callback: () => void,
  restartDelaySeconds: number = 2,
) {
  return new Promise((resolve: (_appError: AppError) => void, reject) => {
    let appError: AppError;
    if (Array.isArray(err.errors)) {
      appError = handeleZodError(err);
      resolve(appError);
    } else {
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

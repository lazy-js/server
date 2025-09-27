interface RetryOptions {
        retryTimes: number;
        delayMs: number;
}

export class CallWithRetry {
        private options: RetryOptions;

        constructor(options?: RetryOptions) {
                this.options = {
                        retryTimes: options?.retryTimes ?? 3,
                        delayMs: options?.delayMs ?? 1000,
                };
        }

        async call<T>(main: () => Promise<T> | T): Promise<T> {
                let retries = this.options.retryTimes;

                while (true) {
                        try {
                                const result = main();
                                return result instanceof Promise ? await result : result;
                        } catch (err) {
                                if (retries <= 0) throw err;
                                retries--;
                                await delay(this.options.delayMs);
                        }
                }
        }
}

export function callWithRetry<T>(main: () => Promise<T> | T, options?: RetryOptions): Promise<T> {
        const _callWithRetryInstance = new CallWithRetry(options);
        return _callWithRetryInstance.call(main);
}

function delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
}

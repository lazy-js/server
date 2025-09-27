interface RetryOptions {
    retryTimes: number;
    delayMs: number;
}
export declare class CallWithRetry {
    private options;
    constructor(options?: RetryOptions);
    call<T>(main: () => Promise<T> | T): Promise<T>;
}
export declare function callWithRetry<T>(main: () => Promise<T> | T, options?: RetryOptions): Promise<T>;
export {};
//# sourceMappingURL=callWithRetry.d.ts.map
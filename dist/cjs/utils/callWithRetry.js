"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallWithRetry = void 0;
exports.callWithRetry = callWithRetry;
class CallWithRetry {
    constructor(options) {
        var _a, _b;
        this.options = {
            retryTimes: (_a = options === null || options === void 0 ? void 0 : options.retryTimes) !== null && _a !== void 0 ? _a : 3,
            delayMs: (_b = options === null || options === void 0 ? void 0 : options.delayMs) !== null && _b !== void 0 ? _b : 1000,
        };
    }
    async call(main) {
        let retries = this.options.retryTimes;
        while (true) {
            try {
                const result = main();
                return result instanceof Promise ? await result : result;
            }
            catch (err) {
                if (retries <= 0)
                    throw err;
                retries--;
                await delay(this.options.delayMs);
            }
        }
    }
}
exports.CallWithRetry = CallWithRetry;
function callWithRetry(main, options) {
    const _callWithRetryInstance = new CallWithRetry(options);
    return _callWithRetryInstance.call(main);
}
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
//# sourceMappingURL=callWithRetry.js.map
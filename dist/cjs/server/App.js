"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = exports.requestStorage = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const utils_1 = require("@lazy-js/utils");
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const events_1 = require("events");
const routerLogger_1 = require("../utils/routerLogger");
const async_hooks_1 = require("async_hooks");
const globalErrorHandler_1 = require("../utils/globalErrorHandler");
require("./process");
class AppEventEmitter extends events_1.EventEmitter {
    emit(event, ...args) {
        return super.emit(event, ...args);
    }
    on(event, listener) {
        return super.on(event, listener);
    }
    once(event, listener) {
        return super.once(event, listener);
    }
}
exports.requestStorage = new async_hooks_1.AsyncLocalStorage();
class App extends AppEventEmitter {
    constructor(params) {
        super();
        this.routes = [];
        this.mountModule = this.mountController;
        this.port = params.port;
        this.serviceName = params.serviceName || 'unknown';
        this.prefix = params.prefix || '';
        this.allowedOrigins = params.allowedOrigins;
        this.disableRequestLogging = !!params.disableRequestLogging;
        this.disableSecurityHeaders = !!params.disableSecurityHeaders;
        this.enableRoutesLogging = !!params.enableRoutesLogging;
        this.app = (0, express_1.default)();
        this.routes = [];
        this.setupEssentialMiddlewares();
        this.setupHealthRoute();
    }
    setupEssentialMiddlewares() {
        this.app.use((0, cors_1.default)({ origin: this.allowedOrigins }));
        this.app.use(express_1.default.json());
        if (!this.disableSecurityHeaders) {
            this.app.use((0, helmet_1.default)());
        }
        if (!this.disableRequestLogging) {
            this.app.use((0, morgan_1.default)('dev'));
        }
        this.app.use((req, res, next) => {
            App.requestStorage.run(req, () => next());
        });
    }
    setupHealthRoute() {
        this.app.get('/health', (req, res) => {
            if (req.query.response_type === 'json') {
                res.json({ message: 'OK' });
            }
            else {
                res.send('OK');
            }
        });
    }
    setupNotFoundRoute() {
        this.app.use((req, res, next) => {
            next(new utils_1.AppError(utils_1.generalErrors.PATH_NOT_FOUND));
        });
    }
    setupErrorHandling() {
        const generalErrorHandler = (err, req, res, next) => {
            this.emit('error', err, req);
            (0, globalErrorHandler_1.globalErrorHandler)(err, req, res, next);
        };
        this.app.use(generalErrorHandler);
    }
    mountController(controller, route = '') {
        var _a;
        if ((controller.pathname && !controller.pathname.startsWith('/')) ||
            (this.prefix && !this.prefix.startsWith('/')) ||
            (this.prefix && this.prefix.endsWith('/'))) {
            throw new Error('Invalid endpoint configuration');
        }
        if (this.enableRoutesLogging)
            (0, routerLogger_1.logRouterPaths)(controller.getRouter(), {
                basePath: this.prefix + route,
                label: (_a = controller.pathname) === null || _a === void 0 ? void 0 : _a.toUpperCase(),
            });
        this.app.use(this.prefix + route, controller.getRouter());
        return this;
    }
    mountRoute({ router, prefix, endpoint, }) {
        if ((endpoint && !endpoint.startsWith('/')) ||
            (prefix && !prefix.startsWith('/')) ||
            (prefix && prefix.endsWith('/'))) {
            throw new utils_1.AppError({
                code: 'INVALID_ENDPOINT',
                statusCode: 400,
                label: 'Invalid endpoint',
                category: 'router',
            });
        }
        this.app.use(prefix ? prefix + (endpoint ? endpoint : '/') : endpoint ? endpoint : '/', router);
        this.routes.push(router);
        return this;
    }
    start(alternativePort) {
        try {
            this.setupNotFoundRoute();
            this.setupErrorHandling();
            this.app.listen(alternativePort || this.port, () => {
                this.emit('started');
            });
        }
        catch (error) {
            throw error;
        }
    }
}
exports.App = App;
App.requestStorage = exports.requestStorage;
//# sourceMappingURL=App.js.map
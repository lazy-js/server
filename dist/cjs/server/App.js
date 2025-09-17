"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = exports.requestStorage = exports.Router = void 0;
const express_1 = __importStar(require("express"));
Object.defineProperty(exports, "Router", { enumerable: true, get: function () { return express_1.Router; } });
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
        this.serviceName = params.serviceName || "unknown";
        this.prefix = params.prefix || "";
        this.allowedOrigins = params.allowedOrigins;
        this.disableRequestLogging = !!params.disableRequestLogging;
        this.disableSecurityHeaders = !!params.disableSecurityHeaders;
        this.enableRoutesLogging = !!params.enableRoutesLogging;
        this.expressApp = (0, express_1.default)();
        this.routes = [];
        this.setupEssentialMiddlewares();
        this.setupHealthRoute();
    }
    setupEssentialMiddlewares() {
        this.expressApp.use((0, cors_1.default)({ origin: this.allowedOrigins }));
        this.expressApp.use(express_1.default.json());
        if (!this.disableSecurityHeaders) {
            this.expressApp.use((0, helmet_1.default)());
        }
        if (!this.disableRequestLogging) {
            this.expressApp.use((0, morgan_1.default)("dev"));
        }
        this.expressApp.use((req, res, next) => {
            App.requestStorage.run(req, () => next());
        });
    }
    setupHealthRoute() {
        this.expressApp.get("/health", (req, res) => {
            if (req.query.response_type === "json") {
                res.json({ message: "OK" });
            }
            else {
                res.send("OK");
            }
        });
    }
    setupNotFoundRoute() {
        this.expressApp.use((req, res, next) => {
            next(new utils_1.AppError(utils_1.generalErrors.PATH_NOT_FOUND));
        });
    }
    setupErrorHandling() {
        const generalErrorHandler = (err, req, res, next) => {
            this.emit("error", err, req);
            (0, globalErrorHandler_1.globalErrorHandler)(err, req, res, next);
        };
        this.expressApp.use(generalErrorHandler);
    }
    mountController(controller, route = "") {
        var _a;
        if ((controller.pathname && !controller.pathname.startsWith("/")) ||
            (this.prefix && !this.prefix.startsWith("/")) ||
            (this.prefix && this.prefix.endsWith("/"))) {
            throw new Error("Invalid endpoint configuration");
        }
        if (this.enableRoutesLogging)
            (0, routerLogger_1.logRouterPaths)(controller.getRouter(), {
                basePath: this.prefix + route,
                label: (_a = controller.pathname) === null || _a === void 0 ? void 0 : _a.toUpperCase(),
            });
        this.expressApp.use(this.prefix + route, controller.getRouter());
        return this;
    }
    mountRoute({ router, prefix, endpoint }) {
        if ((endpoint && !endpoint.startsWith("/")) ||
            (prefix && !prefix.startsWith("/")) ||
            (prefix && prefix.endsWith("/"))) {
            throw new utils_1.AppError({
                code: "INVALID_ENDPOINT",
                statusCode: 400,
                label: "Invalid endpoint",
                category: "router",
            });
        }
        this.expressApp.use(prefix ? prefix + (endpoint ? endpoint : "/") : endpoint ? endpoint : "/", router);
        this.routes.push(router);
        return this;
    }
    start(alternativePort) {
        try {
            this.setupNotFoundRoute();
            this.setupErrorHandling();
            this.expressApp.listen(alternativePort || this.port, () => {
                this.emit("started");
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
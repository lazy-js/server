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
require("./process");
const morgan_1 = __importDefault(require("morgan"));
const express_1 = __importStar(require("express"));
Object.defineProperty(exports, "Router", { enumerable: true, get: function () { return express_1.Router; } });
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const events_1 = require("events");
const routerLogger_1 = require("../utils/routerLogger");
const async_hooks_1 = require("async_hooks");
const globalErrorHandler_1 = require("../utils/globalErrorHandler");
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
        var _a, _b, _c, _d, _e, _f, _g;
        super();
        this.routes = [];
        this.mountModule = this.mountController;
        const serviceName = params.config.serviceName || "unknown";
        const traceIdHeader = params.config.traceIdHeader || "x-trace-id";
        const traceIdProperty = params.config.traceIdProperty || "traceId";
        const _globalErrorHandler = (0, globalErrorHandler_1.getGlobalErrorHandler)({
            serviceName,
            traceIdHeader,
            traceIdProperty,
        });
        this.config = {
            port: params.config.port,
            serviceName: serviceName,
            routerPrefix: params.config.routerPrefix || "",
            parseJson: !!params.config.parseJson,
            traceIdHeader: traceIdHeader,
            traceIdProperty: traceIdProperty,
            globalErrorHandler: (_a = params.config.globalErrorHandler) !== null && _a !== void 0 ? _a : _globalErrorHandler,
        };
        this.log = {
            logMorgan: !!((_b = params === null || params === void 0 ? void 0 : params.log) === null || _b === void 0 ? void 0 : _b.logMorgan),
            logRoutes: !!((_c = params === null || params === void 0 ? void 0 : params.log) === null || _c === void 0 ? void 0 : _c.logMorgan),
            logger: (_e = (_d = params.log) === null || _d === void 0 ? void 0 : _d.logger) !== null && _e !== void 0 ? _e : console,
        };
        this.security = {
            cors: ((_f = params.security) === null || _f === void 0 ? void 0 : _f.cors) || "disabled",
            helmet: ((_g = params.security) === null || _g === void 0 ? void 0 : _g.helmet) || "disabled",
        };
        this.expressApp = (0, express_1.default)();
        this.routes = [];
        this.setupEssentialMiddlewares();
        this.setupHealthRoute();
    }
    setupEssentialMiddlewares() {
        if (this.security.cors !== "disabled") {
            this.expressApp.use((0, cors_1.default)(this.security.cors));
        }
        if (this.config.parseJson) {
            this.expressApp.use(express_1.default.json());
        }
        if (this.security.helmet !== "disabled") {
            this.expressApp.use((0, helmet_1.default)(this.security.helmet));
        }
        if (!this.log.logMorgan) {
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
            next(new Error("PATH_NOT_FOUND"));
        });
    }
    setupErrorHandling() {
        this.expressApp.use((err, req, res, next) => {
            try {
                this.emit("err-in-global-handler", err, req);
            }
            catch (e) { }
            this.config.globalErrorHandler(err, req, res, next);
        });
    }
    mountController(controller, route = "") {
        var _a;
        const routerPrefix = this.config.routerPrefix;
        if ((controller.pathname && !controller.pathname.startsWith("/")) ||
            (routerPrefix && !routerPrefix.startsWith("/")) ||
            (routerPrefix && routerPrefix.endsWith("/"))) {
            throw new Error("Invalid endpoint configuration");
        }
        if (this.log.logRoutes)
            (0, routerLogger_1.logRouterPaths)(controller.getRouter(), {
                basePath: routerPrefix + route,
                label: (_a = controller.pathname) === null || _a === void 0 ? void 0 : _a.toUpperCase(),
                logger: this.log.logger,
            });
        this.expressApp.use(routerPrefix + route, controller.getRouter());
        return this;
    }
    mountRoute({ router, prefix, endpoint }) {
        if ((endpoint && !endpoint.startsWith("/")) ||
            (prefix && !prefix.startsWith("/")) ||
            (prefix && prefix.endsWith("/"))) {
            throw new Error("Invalid endpoint or prefix");
        }
        this.expressApp.use(prefix ? prefix + (endpoint ? endpoint : "/") : endpoint ? endpoint : "/", router);
        this.routes.push(router);
        return this;
    }
    start(alternativePort) {
        try {
            this.setupNotFoundRoute();
            this.setupErrorHandling();
            const PORT = alternativePort || this.config.port;
            this.expressApp.listen(PORT, () => {
                this.emit("started", PORT, process.pid);
            });
        }
        catch (startError) {
            try {
                this.emit("start-error", startError);
            }
            catch (e) { }
            throw startError;
        }
    }
}
exports.App = App;
App.requestStorage = exports.requestStorage;
//# sourceMappingURL=App.js.map
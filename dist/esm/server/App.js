import "./process";
import morgan from "morgan";
import express, { Router } from "express";
import cors from "cors";
import helmet from "helmet";
import { EventEmitter } from "events";
import { logRouterPaths } from "../utils/routerLogger";
import { AsyncLocalStorage } from "async_hooks";
import { getGlobalErrorHandler } from "../utils/globalErrorHandler";
export { Router };
class AppEventEmitter extends EventEmitter {
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
export const requestStorage = new AsyncLocalStorage();
export class App extends AppEventEmitter {
    constructor(params) {
        var _a, _b, _c, _d, _e, _f, _g;
        super();
        this.routes = [];
        this.mountModule = this.mountController;
        const serviceName = params.config.serviceName || "unknown";
        const traceIdHeader = params.config.traceIdHeader || "x-trace-id";
        const traceIdProperty = params.config.traceIdProperty || "traceId";
        const _globalErrorHandler = getGlobalErrorHandler({
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
        this.expressApp = express();
        this.routes = [];
        this.setupEssentialMiddlewares();
        this.setupHealthRoute();
    }
    setupEssentialMiddlewares() {
        if (this.security.cors !== "disabled") {
            this.expressApp.use(cors(this.security.cors));
        }
        if (this.config.parseJson) {
            this.expressApp.use(express.json());
        }
        if (this.security.helmet !== "disabled") {
            this.expressApp.use(helmet(this.security.helmet));
        }
        if (!this.log.logMorgan) {
            this.expressApp.use(morgan("dev"));
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
            logRouterPaths(controller.getRouter(), {
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
App.requestStorage = requestStorage;
//# sourceMappingURL=App.js.map
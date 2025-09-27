import "./process";
import morgan from "morgan";
import express, { Request, Response, NextFunction, ErrorRequestHandler, Router } from "express";

import cors, { CorsOptions } from "cors";
import helmet, { HelmetOptions } from "helmet";
import { EventEmitter } from "events";
import { logRouterPaths } from "../utils/routerLogger";
import { AsyncLocalStorage } from "async_hooks";
import { getGlobalErrorHandler } from "../utils/globalErrorHandler";

export { Request, Response, NextFunction, Router };

interface IController {
        getRouter(): Router;
        pathname?: string;
}

interface ILogger {
        error(...args: any[]): void;
        info(...args: any[]): void;
        warn(...args: any[]): void;
        group(...args: any[]): void;
        groupEnd(...args: any[]): void;
        groupCollapsed(...args: any[]): void;
        table(...args: any[]): void;
}

interface LogOptions {
        logMorgan?: boolean;
        logRoutes?: boolean;
        logger?: ILogger;
}

interface SecurityOptions {
        cors?: "disabled" | CorsOptions;
        helmet?: "disabled" | HelmetOptions;
}

interface Config {
        port: number;
        serviceName?: string;
        routerPrefix?: string;
        parseJson?: boolean;
        globalErrorHandler?: ErrorRequestHandler;
        traceIdHeader?: string;
        traceIdProperty?: string;
}

interface AppParams {
        config: Config;
        security?: SecurityOptions;
        log?: LogOptions;
}

interface AppEvents {
        started: (port?: number, pid?: number) => void;
        "start-error": (err: any) => void;
        "err-in-global-handler": (err: Error, req: Request) => void;
}

class AppEventEmitter extends EventEmitter {
        emit<Event extends keyof AppEvents>(event: Event, ...args: Parameters<AppEvents[Event]>): boolean {
                return super.emit(event, ...args);
        }

        on<Event extends keyof AppEvents>(event: Event, listener: AppEvents[Event]): this {
                return super.on(event, listener);
        }

        once<Event extends keyof AppEvents>(event: Event, listener: AppEvents[Event]): this {
                return super.once(event, listener);
        }
}

export const requestStorage = new AsyncLocalStorage<Request>();

export class App extends AppEventEmitter {
        static requestStorage = requestStorage;
        public expressApp: express.Application;
        private routes: Router[] = [];

        public config: Required<Config>;
        public log: Required<LogOptions>;
        public security: Required<SecurityOptions>;

        constructor(params: AppParams) {
                super();
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
                        globalErrorHandler: params.config.globalErrorHandler ?? _globalErrorHandler,
                };

                this.log = {
                        logMorgan: !!params?.log?.logMorgan,
                        logRoutes: !!params?.log?.logMorgan,
                        logger: params.log?.logger ?? console,
                };

                this.security = {
                        cors: params.security?.cors || "disabled",
                        helmet: params.security?.helmet || "disabled",
                };

                this.expressApp = express();
                this.routes = [];
                this.setupEssentialMiddlewares();
                this.setupHealthRoute();
        }

        private setupEssentialMiddlewares(): void {
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

        private setupHealthRoute(): void {
                this.expressApp.get("/health", (req, res) => {
                        if (req.query.response_type === "json") {
                                res.json({ message: "OK" });
                        } else {
                                res.send("OK");
                        }
                });
        }

        private setupNotFoundRoute(): void {
                this.expressApp.use((req, res, next) => {
                        next(new Error("PATH_NOT_FOUND"));
                });
        }

        private setupErrorHandling(): void {
                this.expressApp.use((err: any, req: Request, res: Response, next: NextFunction) => {
                        try {
                                this.emit("err-in-global-handler", err, req);
                        } catch (e) {}
                        this.config.globalErrorHandler(err, req, res, next);
                });
        }

        public mountModule = this.mountController;
        public mountController(controller: IController, route: string = "") {
                const routerPrefix = this.config.routerPrefix;
                if (
                        (controller.pathname && !controller.pathname.startsWith("/")) ||
                        (routerPrefix && !routerPrefix.startsWith("/")) ||
                        (routerPrefix && routerPrefix.endsWith("/"))
                ) {
                        throw new Error("Invalid endpoint configuration");
                }
                if (this.log.logRoutes)
                        logRouterPaths(controller.getRouter(), {
                                basePath: routerPrefix + route,
                                label: controller.pathname?.toUpperCase(),
                                logger: this.log.logger,
                        });
                this.expressApp.use(routerPrefix + route, controller.getRouter());
                return this;
        }

        public mountRoute({ router, prefix, endpoint }: { router: Router; prefix?: string; endpoint?: string }) {
                if (
                        (endpoint && !endpoint.startsWith("/")) ||
                        (prefix && !prefix.startsWith("/")) ||
                        (prefix && prefix.endsWith("/"))
                ) {
                        throw new Error("Invalid endpoint or prefix");
                }

                this.expressApp.use(prefix ? prefix + (endpoint ? endpoint : "/") : endpoint ? endpoint : "/", router);
                this.routes.push(router);
                return this;
        }

        public start(alternativePort?: number) {
                try {
                        this.setupNotFoundRoute();
                        this.setupErrorHandling();

                        const PORT = alternativePort || this.config.port;
                        this.expressApp.listen(PORT, () => {
                                this.emit("started", PORT, process.pid);
                        });
                } catch (startError) {
                        try {
                                this.emit("start-error", startError);
                        } catch (e) {}
                        throw startError;
                }
        }
}

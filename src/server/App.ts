import express, { Request, Response, NextFunction, ErrorRequestHandler, Router } from "express";
import cors from "cors";
import { AppError, generalErrors } from "@lazy-js/utils";
import morgan from "morgan";
import helmet from "helmet";
import { EventEmitter } from "events";
import { logRouterPaths } from "../utils/routerLogger";
import { AsyncLocalStorage } from "async_hooks";
import { globalErrorHandler } from "../utils/globalErrorHandler";
import "./process";
export { Request, Response, NextFunction, Router };
interface IController {
        getRouter(): Router;
        pathname?: string;
}

interface AppParams {
        port: number;
        allowedOrigins: string[];
        disableRequestLogging?: boolean;
        disableSecurityHeaders?: boolean;
        enableRoutesLogging?: boolean;
        serviceName?: string;
        prefix?: string;
}

interface AppEvents {
        started: () => void;
        error: (err: Error, req: Request) => void;
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
        private readonly port: number;
        public expressApp: express.Application;
        private routes: Router[] = [];
        private allowedOrigins: string[];
        private disableRequestLogging: boolean;
        private disableSecurityHeaders: boolean;
        public serviceName: string;
        private prefix: string;
        private enableRoutesLogging: boolean;
        constructor(params: AppParams) {
                super();
                this.port = params.port;
                this.serviceName = params.serviceName || "unknown";
                this.prefix = params.prefix || "";
                this.allowedOrigins = params.allowedOrigins;
                this.disableRequestLogging = !!params.disableRequestLogging;
                this.disableSecurityHeaders = !!params.disableSecurityHeaders;
                this.enableRoutesLogging = !!params.enableRoutesLogging;

                this.expressApp = express();
                this.routes = [];
                this.setupEssentialMiddlewares();
                this.setupHealthRoute();
        }

        private setupEssentialMiddlewares(): void {
                this.expressApp.use(cors({ origin: this.allowedOrigins }));
                this.expressApp.use(express.json());
                if (!this.disableSecurityHeaders) {
                        this.expressApp.use(helmet());
                }
                if (!this.disableRequestLogging) {
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
                        next(new AppError(generalErrors.PATH_NOT_FOUND));
                });
        }

        private setupErrorHandling(): void {
                const generalErrorHandler: ErrorRequestHandler = (
                        err: Error,
                        req: Request,
                        res: Response,
                        next: NextFunction
                ) => {
                        this.emit("error", err, req);
                        globalErrorHandler(err, req, res, next);
                };
                this.expressApp.use(generalErrorHandler);
        }

        public mountModule = this.mountController;
        public mountController(controller: IController, route: string = "") {
                if (
                        (controller.pathname && !controller.pathname.startsWith("/")) ||
                        (this.prefix && !this.prefix.startsWith("/")) ||
                        (this.prefix && this.prefix.endsWith("/"))
                ) {
                        throw new Error("Invalid endpoint configuration");
                }
                if (this.enableRoutesLogging)
                        logRouterPaths(controller.getRouter(), {
                                basePath: this.prefix + route,
                                label: controller.pathname?.toUpperCase(),
                        });
                this.expressApp.use(this.prefix + route, controller.getRouter());
                return this;
        }

        public mountRoute({ router, prefix, endpoint }: { router: Router; prefix?: string; endpoint?: string }) {
                if (
                        (endpoint && !endpoint.startsWith("/")) ||
                        (prefix && !prefix.startsWith("/")) ||
                        (prefix && prefix.endsWith("/"))
                ) {
                        throw new AppError({
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

        public start(alternativePort?: number) {
                try {
                        this.setupNotFoundRoute();
                        this.setupErrorHandling();
                        this.expressApp.listen(alternativePort || this.port, () => {
                                this.emit("started");
                        });
                } catch (error) {
                        throw error;
                }
        }
}

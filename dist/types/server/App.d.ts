import express, { Request, Response, NextFunction, Router } from "express";
import { EventEmitter } from "events";
import { AsyncLocalStorage } from "async_hooks";
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
declare class AppEventEmitter extends EventEmitter {
    emit<Event extends keyof AppEvents>(event: Event, ...args: Parameters<AppEvents[Event]>): boolean;
    on<Event extends keyof AppEvents>(event: Event, listener: AppEvents[Event]): this;
    once<Event extends keyof AppEvents>(event: Event, listener: AppEvents[Event]): this;
}
export declare const requestStorage: AsyncLocalStorage<express.Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>>;
export declare class App extends AppEventEmitter {
    static requestStorage: AsyncLocalStorage<express.Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>>;
    private readonly port;
    expressApp: express.Application;
    private routes;
    private allowedOrigins;
    private disableRequestLogging;
    private disableSecurityHeaders;
    serviceName: string;
    private prefix;
    private enableRoutesLogging;
    constructor(params: AppParams);
    private setupEssentialMiddlewares;
    private setupHealthRoute;
    private setupNotFoundRoute;
    private setupErrorHandling;
    mountModule: (controller: IController, route?: string) => this;
    mountController(controller: IController, route?: string): this;
    mountRoute({ router, prefix, endpoint }: {
        router: Router;
        prefix?: string;
        endpoint?: string;
    }): this;
    start(alternativePort?: number): void;
}
//# sourceMappingURL=App.d.ts.map
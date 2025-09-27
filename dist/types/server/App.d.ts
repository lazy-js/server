import "./process";
import express, { Request, Response, NextFunction, ErrorRequestHandler, Router } from "express";
import { CorsOptions } from "cors";
import { HelmetOptions } from "helmet";
import { EventEmitter } from "events";
import { AsyncLocalStorage } from "async_hooks";
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
declare class AppEventEmitter extends EventEmitter {
    emit<Event extends keyof AppEvents>(event: Event, ...args: Parameters<AppEvents[Event]>): boolean;
    on<Event extends keyof AppEvents>(event: Event, listener: AppEvents[Event]): this;
    once<Event extends keyof AppEvents>(event: Event, listener: AppEvents[Event]): this;
}
export declare const requestStorage: AsyncLocalStorage<express.Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>>;
export declare class App extends AppEventEmitter {
    static requestStorage: AsyncLocalStorage<express.Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>>;
    expressApp: express.Application;
    private routes;
    config: Required<Config>;
    log: Required<LogOptions>;
    security: Required<SecurityOptions>;
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
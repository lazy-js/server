import express, { Router } from 'express';
import { EventEmitter } from 'events';
import { AsyncLocalStorage } from 'async_hooks';
import './process';
interface IController {
    getRouter(): Router;
    pathname?: string;
}
interface AppParams {
    port: number;
    allowedOrigins: string[];
    disableRequestLogging?: boolean;
    disableSecurityHeaders?: boolean;
    serviceName?: string;
    prefix?: string;
}
interface IApp {
    mountRoute({ router, prefix, endpoint, }: {
        router: Router;
        prefix?: string;
        endpoint?: string;
    }): void;
    start(alternativePort?: number): void;
}
export declare const requestStorage: AsyncLocalStorage<express.Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>>;
export declare class App extends EventEmitter implements IApp {
    static requestStorage: AsyncLocalStorage<express.Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>>;
    private readonly port;
    private app;
    private routes;
    private allowedOrigins;
    private disableRequestLogging;
    private disableSecurityHeaders;
    serviceName: string;
    private prefix;
    constructor(params: AppParams);
    private setupEssentialMiddlewares;
    private setupHealthRoute;
    private setupNotFoundRoute;
    private setupErrorHandling;
    mountModule: (controller: IController, route?: string) => this;
    mountController(controller: IController, route?: string): this;
    mountRoute({ router, prefix, endpoint, }: {
        router: Router;
        prefix?: string;
        endpoint?: string;
    }): this;
    start(alternativePort?: number): void;
}
export {};
//# sourceMappingURL=App.d.ts.map
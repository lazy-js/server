import { RequestHandler, Router } from "express";
export declare class BaseController {
    pathname?: string;
    router: Router;
    constructor(params?: {
        pathname?: string;
        healthRoute?: `/${string}`;
    });
    get: (route?: string, ...handler: RequestHandler[]) => void;
    post: (route?: string, ...handler: RequestHandler[]) => void;
    put: (route?: string, ...handler: RequestHandler[]) => void;
    delete: (route?: string, ...handler: RequestHandler[]) => void;
    patch: (route?: string, ...handler: RequestHandler[]) => void;
    mountPostRoute(route?: string, ...handler: RequestHandler[]): void;
    mountGetRoute(route?: string, ...handler: RequestHandler[]): void;
    mountPutRoute(route?: string, ...handler: RequestHandler[]): void;
    mountDeleteRoute(route?: string, ...handler: RequestHandler[]): void;
    mountPatchRoute(route?: string, ...handler: RequestHandler[]): void;
    mountController(controller: BaseController, route?: string): this;
    mountRouter(router: Router, route?: string): this;
    getRouter(): Router;
}
//# sourceMappingURL=BaseController.d.ts.map
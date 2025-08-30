import { RequestHandler, Router } from 'express';
interface RouteDefinition {
    description?: string;
    tags?: string[];
}
export declare class BaseController {
    pathname?: string;
    router: Router;
    constructor(params?: {
        pathname?: string;
    });
    mountPostRoute(route: string | undefined, handler: RequestHandler, definition?: RouteDefinition): void;
    mountGetRoute(route: string | undefined, handler: RequestHandler, definition?: RouteDefinition): void;
    mountPutRoute(route: string | undefined, handler: RequestHandler, definition?: RouteDefinition): void;
    mountDeleteRoute(route: string | undefined, handler: RequestHandler, definition?: RouteDefinition): void;
    mountPatchRoute(route: string | undefined, handler: RequestHandler, definition?: RouteDefinition): void;
    mountController(controller: BaseController, route?: string): this;
    mountRouter(router: Router, route?: string): this;
    getRouter(): Router;
}
export {};
//# sourceMappingURL=BaseController.d.ts.map
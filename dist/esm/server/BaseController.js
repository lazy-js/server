import { Router } from 'express';
export class BaseController {
    constructor(params) {
        this.pathname = (params === null || params === void 0 ? void 0 : params.pathname) || '';
        this.router = Router();
        this.mountGetRoute('/ping', async function (req, res, next) {
            res.send('pong');
        });
    }
    mountPostRoute(route = '/', handler, definition) {
        this.router.post(this.pathname + route, handler);
    }
    mountGetRoute(route = '/', handler, definition) {
        this.router.get(this.pathname + route, handler);
    }
    mountPutRoute(route = '/', handler, definition) {
        this.router.put(this.pathname + route, handler);
    }
    mountDeleteRoute(route = '/', handler, definition) {
        this.router.delete(this.pathname + route, handler);
    }
    mountPatchRoute(route = '/', handler, definition) {
        this.router.patch(this.pathname + route, handler);
    }
    mountController(controller, route = '/') {
        this.mountRouter(controller.getRouter(), route);
        return this;
    }
    mountRouter(router, route = '/') {
        this.router.use(this.pathname + route, router);
        return this;
    }
    getRouter() {
        return this.router;
    }
}
//# sourceMappingURL=BaseController.js.map
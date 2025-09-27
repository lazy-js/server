import { Router } from "express";
export class BaseController {
    constructor(params) {
        this.get = this.mountGetRoute;
        this.post = this.mountPostRoute;
        this.put = this.mountPutRoute;
        this.delete = this.mountDeleteRoute;
        this.patch = this.mountPatchRoute;
        this.pathname = (params === null || params === void 0 ? void 0 : params.pathname) || "";
        this.router = Router();
        if (params === null || params === void 0 ? void 0 : params.healthRoute) {
            this.mountGetRoute(params.healthRoute, async function (req, res, next) {
                res.status(200).send("ok");
            });
        }
    }
    mountPostRoute(route = "/", ...handler) {
        this.router.post(this.pathname + route, ...handler);
    }
    mountGetRoute(route = "/", ...handler) {
        this.router.get(this.pathname + route, ...handler);
    }
    mountPutRoute(route = "/", ...handler) {
        this.router.put(this.pathname + route, ...handler);
    }
    mountDeleteRoute(route = "/", ...handler) {
        this.router.delete(this.pathname + route, ...handler);
    }
    mountPatchRoute(route = "/", ...handler) {
        this.router.patch(this.pathname + route, ...handler);
    }
    mountController(controller, route = "/") {
        this.mountRouter(controller.getRouter(), route);
        return this;
    }
    mountRouter(router, route = "/") {
        this.router.use(this.pathname + route, router);
        return this;
    }
    getRouter() {
        return this.router;
    }
}
//# sourceMappingURL=BaseController.js.map
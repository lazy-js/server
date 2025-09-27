import { RequestHandler, Router } from "express";

export class BaseController {
        public pathname?: string;
        public router: Router;

        constructor(params?: { pathname?: string; healthRoute?: `/${string}` }) {
                this.pathname = params?.pathname || "";
                this.router = Router();
                if (params?.healthRoute) {
                        this.mountGetRoute(params.healthRoute, async function (req, res, next) {
                                res.status(200).send("ok");
                        });
                }
        }

        public get = this.mountGetRoute;
        public post = this.mountPostRoute;
        public put = this.mountPutRoute;
        public delete = this.mountDeleteRoute;
        public patch = this.mountPatchRoute;

        public mountPostRoute(route: string = "/", ...handler: RequestHandler[]) {
                this.router.post(this.pathname + route, ...handler);
        }

        public mountGetRoute(route: string = "/", ...handler: RequestHandler[]) {
                this.router.get(this.pathname + route, ...handler);
        }

        public mountPutRoute(route: string = "/", ...handler: RequestHandler[]) {
                this.router.put(this.pathname + route, ...handler);
        }

        public mountDeleteRoute(route: string = "/", ...handler: RequestHandler[]) {
                this.router.delete(this.pathname + route, ...handler);
        }

        public mountPatchRoute(route: string = "/", ...handler: RequestHandler[]) {
                this.router.patch(this.pathname + route, ...handler);
        }

        public mountController(controller: BaseController, route: string = "/") {
                this.mountRouter(controller.getRouter(), route);
                return this;
        }

        public mountRouter(router: Router, route: string = "/") {
                this.router.use(this.pathname + route, router);
                return this;
        }

        public getRouter() {
                return this.router;
        }
}

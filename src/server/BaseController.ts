import { RequestHandler, Router } from 'express';

interface RouteDefinition {
  description?: string;
  tags?: string[];
}
export class BaseController {
  public pathname?: string;
  public router: Router;

  constructor(params?: { pathname?: string }) {
    this.pathname = params?.pathname || '';
    this.router = Router();
    this.mountGetRoute('/ping', async function (req, res, next) {
      res.send('pong');
    });
  }

  public mountPostRoute(
    route: string = '/',
    handler: RequestHandler,
    definition?: RouteDefinition,
  ) {
    this.router.post(this.pathname + route, handler);
  }

  public mountGetRoute(
    route: string = '/',
    handler: RequestHandler,
    definition?: RouteDefinition,
  ) {
    this.router.get(this.pathname + route, handler);
  }

  public mountPutRoute(
    route: string = '/',
    handler: RequestHandler,
    definition?: RouteDefinition,
  ) {
    this.router.put(this.pathname + route, handler);
  }

  public mountDeleteRoute(
    route: string = '/',
    handler: RequestHandler,
    definition?: RouteDefinition,
  ) {
    this.router.delete(this.pathname + route, handler);
  }

  public mountPatchRoute(
    route: string = '/',
    handler: RequestHandler,
    definition?: RouteDefinition,
  ) {
    this.router.patch(this.pathname + route, handler);
  }

  public mountController(controller: BaseController, route: string = '/') {
    this.mountRouter(controller.getRouter(), route);
    return this;
  }

  public mountRouter(router: Router, route: string = '/') {
    this.router.use(this.pathname + route, router);
    return this;
  }

  public getRouter() {
    return this.router;
  }
}

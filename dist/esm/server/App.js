import express from 'express';
import cors from 'cors';
import { AppError, generalErrors } from '@lazy-js/utils';
import morgan from 'morgan';
import helmet from 'helmet';
import { EventEmitter } from 'events';
import { logRouterPaths } from '../utils/routerLogger';
import { AsyncLocalStorage } from 'async_hooks';
import { globalErrorHandler } from '../utils/globalErrorHandler';
import './process';
export const requestStorage = new AsyncLocalStorage();
export class App extends EventEmitter {
    constructor(params) {
        super();
        this.routes = [];
        this.mountModule = this.mountController;
        this.port = params.port;
        this.allowedOrigins = params.allowedOrigins;
        this.disableRequestLogging = params.disableRequestLogging || false;
        this.disableSecurityHeaders = params.disableSecurityHeaders || false;
        this.app = express();
        this.routes = [];
        this.serviceName = params.serviceName || 'unknown';
        this.prefix = params.prefix || '';
        this.setupEssentialMiddlewares();
        this.setupHealthRoute();
    }
    setupEssentialMiddlewares() {
        this.app.use(cors({ origin: this.allowedOrigins }));
        this.app.use(express.json());
        if (!this.disableSecurityHeaders) {
            this.app.use(helmet());
        }
        if (!this.disableRequestLogging) {
            this.app.use(morgan('dev'));
        }
        this.app.use((req, res, next) => {
            App.requestStorage.run(req, () => next());
        });
    }
    setupHealthRoute() {
        this.app.get('/health', (req, res) => {
            if (req.query.response_type === 'json') {
                res.json({ message: 'OK' });
            }
            else {
                res.send('OK');
            }
        });
    }
    setupNotFoundRoute() {
        this.app.use((req, res, next) => {
            next(new AppError(generalErrors.PATH_NOT_FOUND));
        });
    }
    setupErrorHandling() {
        const generalErrorHandler = (err, req, res, next) => {
            this.emit('error', err);
            globalErrorHandler(err, req, res, next);
        };
        this.app.use(generalErrorHandler);
    }
    mountController(controller, route = '') {
        var _a;
        if ((controller.pathname && !controller.pathname.startsWith('/')) ||
            (this.prefix && !this.prefix.startsWith('/')) ||
            (this.prefix && this.prefix.endsWith('/'))) {
            throw new AppError({
                code: 'INVALID_ENDPOINT',
                statusCode: 400,
                label: 'Invalid endpoint',
                category: 'router',
            });
        }
        logRouterPaths(controller.getRouter(), {
            basePath: this.prefix + route,
            label: (_a = controller.pathname) === null || _a === void 0 ? void 0 : _a.toUpperCase(),
        });
        this.app.use(this.prefix + route, controller.getRouter());
        return this;
    }
    mountRoute({ router, prefix, endpoint, }) {
        if ((endpoint && !endpoint.startsWith('/')) ||
            (prefix && !prefix.startsWith('/')) ||
            (prefix && prefix.endsWith('/'))) {
            throw new AppError({
                code: 'INVALID_ENDPOINT',
                statusCode: 400,
                label: 'Invalid endpoint',
                category: 'router',
            });
        }
        this.app.use(prefix ? prefix + (endpoint ? endpoint : '/') : endpoint ? endpoint : '/', router);
        this.routes.push(router);
        return this;
    }
    start(alternativePort) {
        try {
            this.setupNotFoundRoute();
            this.setupErrorHandling();
            this.app.listen(alternativePort || this.port, () => {
                this.emit('started');
            });
        }
        catch (error) {
            throw error;
        }
    }
}
App.requestStorage = requestStorage;
//# sourceMappingURL=App.js.map
# @lazy-js/server API Documentation

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [App Class](#app-class)
- [BaseController Class](#basecontroller-class)
- [Utility Functions](#utility-functions)
- [Error Handling](#error-handling)
- [Configuration](#configuration)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## Overview

@lazy-js/server is a modern, TypeScript-first Node.js server framework built on Express.js. It provides a clean, modular architecture for building scalable web applications and APIs with built-in security, logging, and error handling.

### Key Features

- **TypeScript First**: Full TypeScript support with comprehensive type definitions
- **Express.js Based**: Built on Express.js for robust HTTP server capabilities
- **Modular Architecture**: Clean separation with controllers and utilities
- **Built-in Security**: Helmet.js integration and CORS support
- **Request Context**: AsyncLocalStorage for request context management
- **Dual Build**: CommonJS and ES Modules support
- **Error Handling**: Comprehensive error handling with global error handlers
- **Health Checks**: Built-in health check endpoints
- **Request Logging**: Morgan integration for HTTP request logging

## Installation

```bash
npm install github:lazy-js/server
```

## Quick Start

```typescript
import { App, BaseController } from "@lazy-js/server";

// Create a simple controller
class HelloController extends BaseController {
        constructor() {
                super({ pathname: "/hello" });

                this.mountGetRoute("/", (req, res) => {
                        res.json({ message: "Hello World!" });
                });
        }
}

// Create and configure the app
const app = new App({
        config: {
                port: 3000,
                serviceName: "my-api",
                parseJson: true,
        },
        security: {
                cors: {
                        origin: ["http://localhost:3000"],
                },
                helmet: {}, // Enable Helmet with default settings
        },
        log: {
                logMorgan: true,
                logRoutes: true,
        },
});

// Mount the controller
app.mountController(new HelloController());

// Start the server
app.start();
```

## App Class

The main application class that manages the Express server, middleware, and route mounting.

### Constructor

```typescript
new App(params: AppParams)
```

#### AppParams Interface

```typescript
interface AppParams {
        config: Config;
        security?: SecurityOptions;
        log?: LogOptions;
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

interface SecurityOptions {
        cors?: "disabled" | CorsOptions;
        helmet?: "disabled" | HelmetOptions;
}

interface LogOptions {
        logMorgan?: boolean;
        logRoutes?: boolean;
        logger?: ILogger;
}
```

### Methods

#### `mountController(controller: IController, route?: string): App`

Mounts a controller to the application.

**Parameters:**

- `controller`: Controller instance implementing IController interface
- `route`: Optional route prefix (default: "")

**Returns:** App instance for method chaining

**Example:**

```typescript
const userController = new UserController();
app.mountController(userController, "/api/users");
```

#### `mountRoute(params: MountRouteParams): App`

Mounts a router directly to the application.

**Parameters:**

```typescript
interface MountRouteParams {
        router: Router;
        prefix?: string;
        endpoint?: string;
}
```

**Example:**

```typescript
const customRouter = Router();
customRouter.get("/custom", (req, res) => res.json({ message: "Custom route" }));

app.mountRoute({
        router: customRouter,
        prefix: "/api",
        endpoint: "/custom",
});
```

#### `start(alternativePort?: number): void`

Starts the Express server.

**Parameters:**

- `alternativePort`: Optional port override

**Example:**

```typescript
app.start(); // Uses configured port
app.start(8080); // Uses port 8080
```

### Events

The App class extends EventEmitter and emits the following events:

#### `started`

Emitted when the server starts successfully.

```typescript
app.on("started", (port: number, pid: number) => {
        console.log(`Server started on port ${port} with PID ${pid}`);
});
```

#### `start-error`

Emitted when server startup fails.

```typescript
app.on("start-error", (error: any) => {
        console.error("Failed to start server:", error);
});
```

#### `err-in-global-handler`

Emitted when an error occurs in the global error handler.

```typescript
app.on("err-in-global-handler", (error: Error, req: Request) => {
        console.error("Error in global handler:", error);
});
```

## BaseController Class

Base class for creating controllers with common HTTP method routing.

### Constructor

```typescript
new BaseController(params?: BaseControllerParams)

interface BaseControllerParams {
  pathname?: string;
  healthRoute?: `/${string}`;
}
```

### Methods

#### HTTP Method Mounting

All methods follow the same pattern: `mount{Method}Route(route, handler)`

- `mountGetRoute(route: string, handler: RequestHandler): void`
- `mountPostRoute(route: string, handler: RequestHandler): void`
- `mountPutRoute(route: string, handler: RequestHandler): void`
- `mountDeleteRoute(route: string, handler: RequestHandler): void`
- `mountPatchRoute(route: string, handler: RequestHandler): void`

**Example:**

```typescript
class UserController extends BaseController {
        constructor() {
                super({ pathname: "/users" });

                this.mountGetRoute("/", this.getAllUsers);
                this.mountGetRoute("/:id", this.getUserById);
                this.mountPostRoute("/", this.createUser);
                this.mountPutRoute("/:id", this.updateUser);
                this.mountDeleteRoute("/:id", this.deleteUser);
        }

        private getAllUsers = async (req: Request, res: Response) => {
                res.json({ users: [] });
        };

        private getUserById = async (req: Request, res: Response) => {
                const { id } = req.params;
                res.json({ user: { id } });
        };

        // ... other methods
}
```

#### Controller Mounting

```typescript
mountController(controller: BaseController, route?: string): BaseController
```

Mounts another controller as a nested controller.

**Example:**

```typescript
class ApiController extends BaseController {
        constructor() {
                super({ pathname: "/api" });

                // Mount nested controllers
                this.mountController(new UserController(), "/users");
                this.mountController(new ProductController(), "/products");
        }
}
```

#### Router Mounting

```typescript
mountRouter(router: Router, route?: string): BaseController
```

Mounts an Express Router instance.

**Example:**

```typescript
const customRouter = Router();
customRouter.get("/custom", (req, res) => res.json({ message: "Custom" }));

this.mountRouter(customRouter, "/custom");
```

#### Router Access

```typescript
getRouter(): Router
```

Returns the Express Router instance for the controller.

## Utility Functions

### Request Helpers

The package provides utility functions for accessing request data within async contexts:

#### `Query<T>(...properties: T): { [K in T[number]]: any }`

Extracts query parameters from the current request.

```typescript
import { Query } from "@lazy-js/server";

// In a route handler
const { page, limit, sort } = Query("page", "limit", "sort");
```

#### `Param<T>(...properties: T): { [K in T[number]]: any }`

Extracts route parameters from the current request.

```typescript
import { Param } from "@lazy-js/server";

// In a route handler
const { id, category } = Param("id", "category");
```

#### `Body<T>(...properties: T): { [K in T[number]]: any }`

Extracts body properties from the current request.

```typescript
import { Body } from "@lazy-js/server";

// In a route handler
const { name, email, age } = Body("name", "email", "age");
```

#### `Token(): string | undefined`

Gets the authorization token from the request headers.

```typescript
import { Token } from "@lazy-js/server";

// In a route handler
const token = Token();
```

#### `UserId(userIdProperty?: string): string | undefined`

Gets the user ID from the request object.

```typescript
import { UserId } from "@lazy-js/server";

// In a route handler
const userId = UserId("user_id");
```

### Retry Utility

#### `CallWithRetry` Class

Provides retry functionality for async operations.

```typescript
import { CallWithRetry } from "@lazy-js/server";

const retry = new CallWithRetry({
        retryTimes: 3,
        delayMs: 1000,
});

try {
        const result = await retry.call(async () => {
                // Your async operation here
                return await someAsyncOperation();
        });
} catch (error) {
        // Handle final error after all retries
}
```

#### `callWithRetry` Function

Convenience function for one-off retry operations.

```typescript
import { callWithRetry } from "@lazy-js/server";

const result = await callWithRetry(async () => await someAsyncOperation(), { retryTimes: 3, delayMs: 1000 });
```

### Router Logger

#### `logRouterPaths(router: Router, options?: RouterLoggerOptions): RouterLogEntry[]`

Logs all routes in a router for debugging purposes.

```typescript
import { logRouterPaths } from "@lazy-js/server";

const entries = logRouterPaths(controller.getRouter(), {
        basePath: "/api",
        label: "API Routes",
        collapsed: true,
});
```

## Error Handling

### Global Error Handler

The package includes a comprehensive global error handler that:

- Captures all unhandled errors
- Provides structured error responses
- Includes trace ID for request tracking
- Logs errors with context

### Error Response Format

```typescript
{
  success: false,
  error: {
    code: string,
    message: string,
    traceId: string,
    serviceName: string,
    timestamp: Date
  }
}
```

### Custom Error Handler

You can provide a custom error handler:

```typescript
const app = new App({
        config: {
                port: 3000,
                globalErrorHandler: (err, req, res, next) => {
                        // Your custom error handling logic
                        res.status(500).json({ error: "Custom error message" });
                },
        },
});
```

## Configuration

### TypeScript Configuration

The package supports both CommonJS and ES Modules:

```json
{
        "compilerOptions": {
                "module": "ESNext",
                "target": "ES2019",
                "moduleResolution": "node",
                "strict": true
        }
}
```

### Build Scripts

```bash
# Development (watch mode)
npm run dev

# Build both CJS and ESM
npm run build

# Build ESM only
npm run build:esm

# Build CJS only
npm run build:cjs

# Start production server
npm start

# Run tests
npm test
```

## Examples

### Basic API Server

```typescript
import { App, BaseController } from "@lazy-js/server";

class TodoController extends BaseController {
        constructor() {
                super({ pathname: "/todos" });

                this.mountGetRoute("/", this.getTodos);
                this.mountPostRoute("/", this.createTodo);
                this.mountGetRoute("/:id", this.getTodo);
                this.mountPutRoute("/:id", this.updateTodo);
                this.mountDeleteRoute("/:id", this.deleteTodo);
        }

        private getTodos = async (req: Request, res: Response) => {
                res.json({ todos: [] });
        };

        private createTodo = async (req: Request, res: Response) => {
                const { title, description } = req.body;
                res.status(201).json({
                        id: Date.now(),
                        title,
                        description,
                        completed: false,
                });
        };

        // ... other methods
}

const app = new App({
        config: {
                port: 3000,
                serviceName: "todo-api",
                parseJson: true,
        },
        security: {
                cors: { origin: ["http://localhost:3000"] },
                helmet: {},
        },
});

app.mountController(new TodoController());
app.start();
```

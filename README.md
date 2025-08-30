# @lazy-js/server

A modern, lightweight Node.js server framework built with TypeScript, Express, and best practices for building scalable web applications and APIs.

## 🚀 Features

- **TypeScript First**: Built with TypeScript for type safety and better developer experience
- **Express.js Based**: Leverages Express.js for robust HTTP server capabilities
- **Modular Architecture**: Clean separation of concerns with controllers and utilities
- **Built-in Security**: Helmet.js for security headers, CORS support
- **Request Logging**: Morgan integration for HTTP request logging
- **Error Handling**: Comprehensive error handling with global error handlers
- **Health Checks**: Built-in health check endpoints
- **Async Context**: AsyncLocalStorage for request context management
- **Dual Build Support**: CommonJS and ES Modules support
- **Testing Ready**: Vitest integration for testing

## 📦 Installation

```bash
npm install @lazy-js/server
```

## 🏗️ Project Structure

```
src/
├── server/
│   ├── App.ts              # Main application class
│   ├── BaseController.ts   # Base controller class
│   └── index.ts           # Server exports
├── utils/
│   ├── globalErrorHandler.ts    # Global error handling
│   ├── handleMainErrors.ts      # Main error handling logic
│   ├── requestHelpers.ts        # Request utility functions
│   ├── routerLogger.ts          # Router logging utilities
│   └── index.ts                 # Utils exports
└── index.ts                # Main package exports
```

## 🚀 Quick Start

### Basic Server Setup

```typescript
import { App } from '@lazy-js/server';

const app = new App({
  port: 3000,
  allowedOrigins: ['http://localhost:3000'],
  serviceName: 'my-api',
});

app.start();
```

### Creating a Controller

```typescript
import { BaseController } from '@lazy-js/server';

class UserController extends BaseController {
  constructor() {
    super({ pathname: '/users' });

    // Mount routes
    this.mountGetRoute('/', this.getAllUsers);
    this.mountPostRoute('/', this.createUser);
    this.mountGetRoute('/:id', this.getUserById);
  }

  private getAllUsers = async (req, res) => {
    res.json({ users: [] });
  };

  private createUser = async (req, res) => {
    res.status(201).json({ message: 'User created' });
  };

  private getUserById = async (req, res) => {
    const { id } = req.params;
    res.json({ user: { id } });
  };
}

// Mount the controller
const userController = new UserController();
app.mountController(userController);
```

## 📚 API Reference

### App Class

The main application class that manages the Express server.

#### Constructor

```typescript
new App(params: AppParams)
```

**AppParams:**

- `port: number` - Server port number
- `allowedOrigins: string[]` - CORS allowed origins
- `disableRequestLogging?: boolean` - Disable Morgan logging (default: false)
- `disableSecurityHeaders?: boolean` - Disable Helmet security headers (default: false)
- `serviceName?: string` - Service name for identification (default: 'unknown')
- `prefix?: string` - Global route prefix (default: '')

#### Methods

- `mountController(controller: IController, route?: string): App` - Mount a controller
- `mountRoute(params: MountRouteParams): App` - Mount a router directly
- `start(alternativePort?: number): void` - Start the server

### BaseController Class

Base class for creating controllers with common HTTP method routing.

#### Constructor

```typescript
new BaseController(params?: { pathname?: string })
```

#### Methods

- `mountGetRoute(route: string, handler: RequestHandler, definition?: RouteDefinition): void`
- `mountPostRoute(route: string, handler: RequestHandler, definition?: RouteDefinition): void`
- `mountPutRoute(route: string, handler: RequestHandler, definition?: RouteDefinition): void`
- `mountDeleteRoute(route: string, handler: RequestHandler, definition?: RouteDefinition): void`
- `mountPatchRoute(route: string, handler: RequestHandler, definition?: RouteDefinition): void`
- `mountController(controller: BaseController, route?: string): BaseController`
- `mountRouter(router: Router, route?: string): BaseController`
- `getRouter(): Router` - Get the Express router instance

## 🔧 Configuration

### TypeScript Configuration

The project includes multiple TypeScript configurations:

- `tsconfig.json` - ES Modules build
- `tsconfig.cjs.json` - CommonJS build
- `tsconfig.test.json` - Test configuration

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
```

## 🧪 Testing

The project uses Vitest for testing:

```bash
npm test
```

## 📦 Dependencies

### Core Dependencies

- `express` - Web framework
- `cors` - CORS middleware
- `helmet` - Security headers
- `morgan` - HTTP request logging
- `@lazy-js/utils` - Utility functions

### Development Dependencies

- `typescript` - TypeScript compiler
- `vitest` - Testing framework
- Type definitions for Express, CORS, and Morgan

## 🌟 Examples

### Advanced Server with Multiple Controllers

```typescript
import { App, BaseController } from '@lazy-js/server';

// API Controller
class ApiController extends BaseController {
  constructor() {
    super({ pathname: '/api' });

    this.mountGetRoute('/status', this.getStatus);
  }

  private getStatus = async (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  };
}

// Auth Controller
class AuthController extends BaseController {
  constructor() {
    super({ pathname: '/auth' });

    this.mountPostRoute('/login', this.login);
    this.mountPostRoute('/logout', this.logout);
  }

  private login = async (req, res) => {
    // Login logic
    res.json({ token: 'jwt-token' });
  };

  private logout = async (req, res) => {
    res.json({ message: 'Logged out' });
  };
}

// Main app
const app = new App({
  port: 3000,
  allowedOrigins: ['http://localhost:3000'],
  serviceName: 'advanced-api',
  prefix: '/v1',
});

// Mount controllers
app.mountController(new ApiController());
app.mountController(new AuthController());

app.start();
```

### Nested Controllers

```typescript
class UserController extends BaseController {
  constructor() {
    super({ pathname: '/users' });

    // Mount nested controllers
    this.mountController(new UserProfileController(), '/profile');
    this.mountController(new UserSettingsController(), '/settings');
  }
}

class UserProfileController extends BaseController {
  constructor() {
    super({ pathname: '/profile' });

    this.mountGetRoute('/', this.getProfile);
    this.mountPutRoute('/', this.updateProfile);
  }

  // ... implementation
}
```

## 🔒 Security Features

- **CORS Protection**: Configurable allowed origins
- **Security Headers**: Helmet.js integration for security headers
- **Input Validation**: Built-in endpoint validation
- **Error Handling**: Comprehensive error handling without exposing sensitive information

## 📝 Logging

- **Request Logging**: Morgan integration for HTTP request logging
- **Router Logging**: Built-in router path logging
- **Error Logging**: Structured error logging with context

## 🚨 Error Handling

The framework provides comprehensive error handling:

- Global error handler middleware
- Structured error responses
- Error event emission for monitoring
- Request context preservation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

ISC License

## 🆘 Support

For issues and questions, please open an issue on the GitHub repository.

---

Built with ❤️ by the Lazy.js team

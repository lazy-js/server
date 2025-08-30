# Class Diagram for App and BaseController

```mermaid
classDiagram
    class EventEmitter {
        <<external>>
    }

    class IController {
        <<interface>>
        +getRouter() Router
        +pathname? string
    }

    class IApp {
        <<interface>>
        +mountRoute(params) void
        +start(alternativePort?) void
    }

    class AppParams {
        +port number
        +allowedOrigins string[]
        +disableRequestLogging? boolean
        +disableSecurityHeaders? boolean
        +serviceName? string
        +prefix? string
    }

    class App {
        -port number
        -app express.Application
        -routes Router[]
        -allowedOrigins string[]
        -disableRequestLogging boolean
        -disableSecurityHeaders boolean
        +serviceName string
        -prefix string
        +static requestStorage AsyncLocalStorage~Request~

        +constructor(params AppParams)
        -setupEssentialMiddlewares() void
        -setupHealthRoute() void
        -setupNotFoundRoute() void
        -setupErrorHandling() void
        +mountModule(controller, route?) App
        +mountController(controller, route?) App
        +mountRoute(params) App
        +start(alternativePort?) void
    }

    class RouteDefinition {
        +description? string
        +tags? string[]
    }

    class BaseController {
        +pathname? string
        +router Router

        +constructor(params?)
        +mountPostRoute(route, handler, definition?) void
        +mountGetRoute(route, handler, definition?) void
        +mountPutRoute(route, handler, definition?) void
        +mountDeleteRoute(route, handler, definition?) void
        +mountPatchRoute(route, handler, definition?) void
        +mountController(controller, route?) BaseController
        +mountRouter(router, route?) BaseController
        +getRouter() Router
    }

    class Router {
        <<external>>
    }

    class RequestHandler {
        <<external>>
    }

    EventEmitter <|-- App
    IApp <|-- App
    IController <|-- BaseController

    App --> AppParams : uses
    App --> IController : mounts
    BaseController --> Router : has
    BaseController --> RouteDefinition : uses
    BaseController --> RequestHandler : uses

    App --> BaseController : can mount
    BaseController --> BaseController : can mount
```

## Class Descriptions

### App Class

- **Inherits from**: `EventEmitter`, implements `IApp`
- **Purpose**: Main application class that manages Express server setup, middleware, and route mounting
- **Key Features**:
  - CORS configuration
  - Security headers (Helmet)
  - Request logging (Morgan)
  - Health check endpoint
  - Error handling
  - Route mounting system

### BaseController Class

- **Implements**: `IController`
- **Purpose**: Base class for creating controllers with common HTTP method routing
- **Key Features**:
  - HTTP method routing (GET, POST, PUT, DELETE, PATCH)
  - Nested controller mounting
  - Router management
  - Built-in ping endpoint

### Relationships

- **App** can mount **BaseController** instances using `mountController()`
- **BaseController** can mount other **BaseController** instances for nested routing
- Both classes work with Express **Router** instances
- **App** implements the **IApp** interface
- **BaseController** implements the **IController** interface

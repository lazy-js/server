/**
 * Router Logger
 * -------------
 * Utilities to introspect an Express Router and log its mounted routes.
 *
 * What it does
 * - Recursively traverses a router (including nested routers)
 * - Emits a table with one row per (path, method) pair
 * - Includes handler function names for visibility
 * - Adds a synthetic "MOUNT" row for each nested router showing the mounted handler name
 *
 * Notes and limitations
 * - This relies on Express' internal `router.stack` structure, which is not part of the public API.
 *   It works with Express 4/5 traditional routers but may break with future internal changes.
 * - Mount path detection for nested routers uses a best‑effort conversion of the layer's `regexp`.
 *   Complex patterns may not convert perfectly; the raw path will be approximated.
 * - Anonymous route handlers will appear as `anonymous` in the handlers list.
 *
 * Example
 * ```ts
 * import { logRouterPaths } from './RouterLogger';
 * import { Logger } from '../../utils';
 *
 * const entries = logRouterPaths(controller.getRouter(), {
 *   basePath: controller.pathname,      // optional
 *   logger: Logger.create('Routes'),    // optional
 *   label: 'HTTP Routes',               // optional
 *   collapsed: true,                    // optional
 * });
 * ```
 */
import { Router } from 'express';
import { Logger } from '@lazy-js/utils';
/** Options to customize router logging behavior. */
type RouterLoggerOptions = {
    /** Optional prefix prepended to discovered route paths (e.g., controller pathname). */
    basePath?: string;
    /** Logger instance to use; defaults to a new `Logger` named "Router Logger". */
    logger?: Logger;
    /** Console group label. */
    label?: string;
    /** Whether to use `groupCollapsed` instead of `group`. Defaults to true. */
    collapsed?: boolean;
};
/** A single discovered router entry. */
type RouterLogEntry = {
    /** HTTP method (e.g., GET, POST) or the string "MOUNT" for nested routers. */
    method: string;
    /** Full resolved path for the route or mount point. */
    path: string;
    /** Names of handler functions attached to the route. */
    handlers: string[];
};
/**
 * Recursively logs all routes within an Express `Router`.
 *
 * Output
 * - Console group (collapsible by default) labeled via `options.label`
 * - Table with rows: `{ path, method, handlers }`
 *
 * Return value
 * - The raw list of discovered entries (including `MOUNT` rows for nested routers)
 *
 * @param router - The root router to inspect
 * @param options - Optional logger/presentation settings
 * @returns Array of discovered router entries
 */
export declare function logRouterPaths(router: Router, options?: RouterLoggerOptions): RouterLogEntry[];
export type { RouterLogEntry, RouterLoggerOptions };
//# sourceMappingURL=routerLogger.d.ts.map
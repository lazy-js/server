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
// Import Express Router type to type the introspection target
import { Router } from 'express';
// Import shared Logger utility for consistent console formatting
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
 * Join two path fragments ensuring a single slash boundary and normalizing duplicates.
 */
function joinPaths(basePath: string, subPath: string): string {
  // Treat a single slash as empty to avoid double slashes when joining
  const base = basePath === '/' ? '' : basePath || '';
  const sub = subPath === '/' ? '' : subPath || '';
  // If sub already starts with '/', avoid injecting another '/'
  const joined = `${base}${sub.startsWith('/') ? sub : `/${sub}`}`.replace(
    /\/\/+/, // collapse duplicated slashes
    '/',
  );
  // Fall back to root if everything collapsed away
  return joined || '/';
}

/**
 * Best‑effort conversion of Express internal layer regex into a readable mount path.
 * Falls back to '/' if the source cannot be reasonably interpreted.
 */
function regexToMountPath(regex: RegExp): string {
  // Best-effort conversion of Express' internal layer regex to a readable path
  // Examples we try to handle:
  //   /^\/?(?=\/|$)/i          -> '/'
  //   /^\/api\/?(?=\/|$)/i     -> '/api'
  //   /^\/users(?:\/(?=$))?$/i  -> '/users'
  // Fallback to regex string if not recognizable
  const source = (regex as any)?.source || regex?.toString?.() || '';
  if (!source) return '';

  let path = source
    // Remove leading anchor and normalize start
    .replace(/^\^\/?/, '/')
    // Remove common trailing lookahead for end or slash
    .replace(/\\\/\?\(\?=\\\/(\|\$)\)/g, '')
    // Remove specific optional end segment patterns
    .replace(/\(\?:\\\/(\?=\$)\)\?/g, '')
    // Remove non-capturing optional groups like (?:/something)?
    .replace(/\(\?:.*?\)\?/g, '')
    // Remove generic lookaheads
    .replace(/\(\?=.*?\)/g, '')
    // Remove end anchor
    .replace(/\$$/, '')
    // Unescape slashes
    .replace(/\\\//g, '/');

  // Clean trailing regex tokens
  path = path.replace(/\/$/, '');
  if (path === '') return '/';
  return path;
}

/**
 * Depth‑first traversal of an Express Router, collecting route and nested router entries.
 *
 * @param router - The router to traverse
 * @param basePath - Current base path accumulated from parent mounts
 * @param entries - Destination array for discovered entries
 */
function collectRoutes(
  router: Router,
  basePath: string,
  entries: RouterLogEntry[],
  seenMounts?: Set<string>,
): void {
  // Express attaches an internal `stack` array describing layers (routes, routers, middleware)
  const stack: any[] = (router as any)?.stack || [];
  for (const layer of stack) {
    if (layer?.route) {
      // Concrete route definitions live under `layer.route`
      const routePath: string | string[] = layer.route.path;
      // Enabled HTTP verbs are tracked on `route.methods`
      const methods = Object.entries(layer.route.methods || {})
        .filter(([, enabled]) => !!enabled)
        .map(([m]) => m.toUpperCase());

      // Route handlers (and middleware) for this route are under `route.stack`
      const routeLayers: any[] = Array.isArray(layer.route.stack)
        ? layer.route.stack
        : [];
      // Derive function names for visibility (falls back to 'anonymous')
      const handlerNames = routeLayers
        .map((rl) => rl?.handle?.name || rl?.name || 'anonymous')
        .filter(Boolean);

      // Express can store a string or an array of paths
      const paths = Array.isArray(routePath) ? routePath : [routePath];
      for (const p of paths) {
        // Build the full path by prefixing with the current base
        const full = joinPaths(basePath || '', p || '/');
        for (const method of methods) {
          // Record a separate entry per (path, method)
          entries.push({ method, path: full, handlers: handlerNames });
        }
      }
    } else if (layer?.name === 'router' && layer?.handle?.stack) {
      // Nested router: determine its mount path
      const mountPath: string =
        layer?.path || regexToMountPath(layer?.regexp) || '';
      // Optional: note mounted router handler name for visibility
      const mountedName: string =
        layer?.handle?.name || layer?.name || 'router';
      // Push a synthetic entry for mount to show handler name (no method)
      // Consumers can ignore entries with method "MOUNT"
      const mountFullPath = joinPaths(basePath || '', mountPath || '/');
      const key = `MOUNT|${mountFullPath}|${mountedName}`;
      if (!seenMounts || !seenMounts.has(key)) {
        entries.push({
          method: 'MOUNT',
          path: mountFullPath,
          handlers: [mountedName],
        });
        seenMounts?.add(key);
      }
      // Recurse into the nested router with updated base path
      const nextBase = joinPaths(basePath || '', mountPath || '/');
      collectRoutes(layer.handle as Router, nextBase, entries, seenMounts);
    }
  }
}

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
export function logRouterPaths(
  router: Router,
  options?: RouterLoggerOptions,
): RouterLogEntry[] {
  // Resolve presentation options with sensible defaults
  const basePath = options?.basePath || '';
  const logger = options?.logger || Logger.create('Router Logger');
  const label = options?.label || 'Routes';
  const collapsed = options?.collapsed ?? true;

  // Collect route entries via depth‑first traversal
  const entries: RouterLogEntry[] = [];
  const seenMounts = new Set<string>();
  collectRoutes(router, basePath, entries, seenMounts);

  // Start a console group to make route output easier to skim
  if (collapsed) logger.groupCollapsed(label);
  else logger.group(label);
  try {
    // Sort by path, then by method for stable output
    const sorted = entries
      .slice()
      .sort((a, b) =>
        a.path === b.path
          ? a.method.localeCompare(b.method)
          : a.path.localeCompare(b.path),
      );

    // Render a simple table: one row per (path, method)
    logger.table(
      sorted.map((e) => ({
        path: e.path,
        method: e.method,
        handlers: (e.handlers || []).join(', '),
      })),
    );
  } finally {
    // Always end the console group to avoid nested groups piling up
    logger.groupEnd();
  }

  return entries;
}

export type { RouterLogEntry, RouterLoggerOptions };

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logRouterPaths = logRouterPaths;
// Import shared Logger utility for consistent console formatting
const utils_1 = require("@lazy-js/utils");
/**
 * Join two path fragments ensuring a single slash boundary and normalizing duplicates.
 */
function joinPaths(basePath, subPath) {
    // Treat a single slash as empty to avoid double slashes when joining
    const base = basePath === '/' ? '' : basePath || '';
    const sub = subPath === '/' ? '' : subPath || '';
    // If sub already starts with '/', avoid injecting another '/'
    const joined = `${base}${sub.startsWith('/') ? sub : `/${sub}`}`.replace(/\/\/+/, // collapse duplicated slashes
    '/');
    // Fall back to root if everything collapsed away
    return joined || '/';
}
/**
 * Best‑effort conversion of Express internal layer regex into a readable mount path.
 * Falls back to '/' if the source cannot be reasonably interpreted.
 */
function regexToMountPath(regex) {
    var _a;
    // Best-effort conversion of Express' internal layer regex to a readable path
    // Examples we try to handle:
    //   /^\/?(?=\/|$)/i          -> '/'
    //   /^\/api\/?(?=\/|$)/i     -> '/api'
    //   /^\/users(?:\/(?=$))?$/i  -> '/users'
    // Fallback to regex string if not recognizable
    const source = (regex === null || regex === void 0 ? void 0 : regex.source) || ((_a = regex === null || regex === void 0 ? void 0 : regex.toString) === null || _a === void 0 ? void 0 : _a.call(regex)) || '';
    if (!source)
        return '';
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
    if (path === '')
        return '/';
    return path;
}
/**
 * Depth‑first traversal of an Express Router, collecting route and nested router entries.
 *
 * @param router - The router to traverse
 * @param basePath - Current base path accumulated from parent mounts
 * @param entries - Destination array for discovered entries
 */
function collectRoutes(router, basePath, entries, seenMounts) {
    var _a, _b;
    // Express attaches an internal `stack` array describing layers (routes, routers, middleware)
    const stack = (router === null || router === void 0 ? void 0 : router.stack) || [];
    for (const layer of stack) {
        if (layer === null || layer === void 0 ? void 0 : layer.route) {
            // Concrete route definitions live under `layer.route`
            const routePath = layer.route.path;
            // Enabled HTTP verbs are tracked on `route.methods`
            const methods = Object.entries(layer.route.methods || {})
                .filter(([, enabled]) => !!enabled)
                .map(([m]) => m.toUpperCase());
            // Route handlers (and middleware) for this route are under `route.stack`
            const routeLayers = Array.isArray(layer.route.stack)
                ? layer.route.stack
                : [];
            // Derive function names for visibility (falls back to 'anonymous')
            const handlerNames = routeLayers
                .map((rl) => { var _a; return ((_a = rl === null || rl === void 0 ? void 0 : rl.handle) === null || _a === void 0 ? void 0 : _a.name) || (rl === null || rl === void 0 ? void 0 : rl.name) || 'anonymous'; })
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
        }
        else if ((layer === null || layer === void 0 ? void 0 : layer.name) === 'router' && ((_a = layer === null || layer === void 0 ? void 0 : layer.handle) === null || _a === void 0 ? void 0 : _a.stack)) {
            // Nested router: determine its mount path
            const mountPath = (layer === null || layer === void 0 ? void 0 : layer.path) || regexToMountPath(layer === null || layer === void 0 ? void 0 : layer.regexp) || '';
            // Optional: note mounted router handler name for visibility
            const mountedName = ((_b = layer === null || layer === void 0 ? void 0 : layer.handle) === null || _b === void 0 ? void 0 : _b.name) || (layer === null || layer === void 0 ? void 0 : layer.name) || 'router';
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
                seenMounts === null || seenMounts === void 0 ? void 0 : seenMounts.add(key);
            }
            // Recurse into the nested router with updated base path
            const nextBase = joinPaths(basePath || '', mountPath || '/');
            collectRoutes(layer.handle, nextBase, entries, seenMounts);
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
function logRouterPaths(router, options) {
    var _a;
    // Resolve presentation options with sensible defaults
    const basePath = (options === null || options === void 0 ? void 0 : options.basePath) || '';
    const logger = (options === null || options === void 0 ? void 0 : options.logger) || utils_1.Logger.create('Router Logger');
    const label = (options === null || options === void 0 ? void 0 : options.label) || 'Routes';
    const collapsed = (_a = options === null || options === void 0 ? void 0 : options.collapsed) !== null && _a !== void 0 ? _a : true;
    // Collect route entries via depth‑first traversal
    const entries = [];
    const seenMounts = new Set();
    collectRoutes(router, basePath, entries, seenMounts);
    // Start a console group to make route output easier to skim
    if (collapsed)
        logger.groupCollapsed(label);
    else
        logger.group(label);
    try {
        // Sort by path, then by method for stable output
        const sorted = entries
            .slice()
            .sort((a, b) => a.path === b.path
            ? a.method.localeCompare(b.method)
            : a.path.localeCompare(b.path));
        // Render a simple table: one row per (path, method)
        logger.table(sorted.map((e) => ({
            path: e.path,
            method: e.method,
            handlers: (e.handlers || []).join(', '),
        })));
    }
    finally {
        // Always end the console group to avoid nested groups piling up
        logger.groupEnd();
    }
    return entries;
}
//# sourceMappingURL=routerLogger.js.map
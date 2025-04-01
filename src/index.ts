/**
 * @file Main entry point for the @webmasterdevlin/json-server package
 *
 * This file exports the public API for the json-server package.
 * It provides factory functions, classes, types, and utilities
 * for creating and managing JSON API servers.
 *
 * @author webmasterdevlin
 * @copyright MIT License
 */

import { createServer, JsonServer } from './lib';
import {
  ServerOptions,
  CliArgs,
  Database,
  RoutesConfig,
  CustomRoute,
  HttpMethod,
  RouteHandler,
} from './types';
import { delayMiddleware, corsMiddleware, readOnlyMiddleware, CorsConfig } from './middleware';
import * as utils from './utils/utils';

/**
 * Create a new JSON server instance with the specified options
 *
 * @param options - Server configuration options
 * @returns A new JsonServer instance
 *
 * @example
 * ```typescript
 * // Create a server with custom options
 * const server = create({
 *   port: 3001,
 *   delay: 500,
 *   readOnly: true
 * });
 *
 * // Load database and start server
 * server.loadDatabase('./db.json');
 * server.start().then(() => {
 *   console.log('Server started!');
 * });
 * ```
 */
export function create(options: Partial<ServerOptions> = {}): JsonServer {
  // Apply default options
  const serverOptions: ServerOptions = {
    port: options.port || 3000,
    host: options.host || 'localhost',
    cors: options.cors !== undefined ? options.cors : true,
    static: options.static || [],
    middlewares: options.middlewares || [],
    bodyParser: options.bodyParser !== undefined ? options.bodyParser : true,
    noCors: options.noCors || false,
    noGzip: options.noGzip || false,
    delay: options.delay || 0,
    quiet: options.quiet || false,
    readOnly: options.readOnly || false,
  };

  return createServer(serverOptions);
}

// Export public API
export {
  // Core classes and factories
  JsonServer,
  createServer,

  // Types
  ServerOptions,
  CliArgs,
  Database,
  RoutesConfig,
  CustomRoute,
  HttpMethod,
  RouteHandler,

  // Middleware
  delayMiddleware,
  corsMiddleware,
  readOnlyMiddleware,
  CorsConfig,

  // Utilities
  utils,
};

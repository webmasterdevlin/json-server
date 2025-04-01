/**
 * @file Server library exports for json-server
 *
 * This file provides the core server functionality for the json-server package.
 * It exports the JsonServer class and factory function for creating server instances.
 *
 * @author webmasterdevlin
 * @copyright MIT License
 */

import { JsonServer } from './server';
import { ServerOptions } from '../types';

/**
 * Create a new JsonServer instance with the specified options
 *
 * @param options - Server configuration options
 * @returns A new JsonServer instance
 */
export function createServer(options: ServerOptions): JsonServer {
  return new JsonServer(options);
}

export { JsonServer };

/**
 * @file Middleware exports for json-server
 *
 * This file exports all middleware components for the json-server package.
 * These middlewares handle common HTTP server functionality such as CORS,
 * response delays, read-only mode, and API prefix routing.
 */

import { corsMiddleware, CorsConfig } from './cors';
import { delayMiddleware } from './delay';
import { readOnlyMiddleware } from './readOnly';
import { apiPrefixMiddleware } from './apiPrefix';

export { corsMiddleware, delayMiddleware, readOnlyMiddleware, apiPrefixMiddleware, CorsConfig };

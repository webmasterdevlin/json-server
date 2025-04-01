import cors, { CorsOptions } from 'cors';
import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * CORS middleware configuration options
 */
export interface CorsConfig {
  /** Whether CORS is enabled */
  enabled?: boolean;
  /** Origin(s) to allow (default: '*') */
  origin?:
    | boolean
    | string
    | RegExp
    | (string | RegExp)[]
    | ((
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void
      ) => void);
  /** HTTP methods to allow */
  methods?: string[];
  /** HTTP headers to allow */
  allowedHeaders?: string[];
  /** Whether to allow credentials */
  credentials?: boolean;
}

/**
 * Creates middleware to handle Cross-Origin Resource Sharing (CORS)
 *
 * @param enableCors - Enable CORS or provide configuration options (default: true)
 * @returns Express middleware function
 */
export function corsMiddleware(enableCors: boolean | CorsConfig = true): RequestHandler {
  // If CORS is disabled, return a pass-through middleware
  if (enableCors === false) {
    return (_req: Request, _res: Response, next: NextFunction): void => {
      next();
    };
  }

  // Set default CORS options if enabled
  const corsOptions: CorsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  };

  // Apply custom configuration if provided
  if (typeof enableCors === 'object') {
    const config = enableCors;

    // Return pass-through middleware if explicitly disabled via config object
    if (config.enabled === false) {
      return (_req: Request, _res: Response, next: NextFunction): void => {
        next();
      };
    }

    // Apply custom settings
    if (config.origin !== undefined) corsOptions.origin = config.origin as CorsOptions['origin'];
    if (config.methods !== undefined) corsOptions.methods = config.methods;
    if (config.allowedHeaders !== undefined) corsOptions.allowedHeaders = config.allowedHeaders;
    if (config.credentials !== undefined) corsOptions.credentials = config.credentials;
  }

  // Return configured CORS middleware
  return cors(corsOptions);
}

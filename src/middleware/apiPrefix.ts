import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Creates middleware to handle API prefix routing
 *
 * This middleware allows requests to be made with an /api prefix,
 * automatically stripping the prefix before processing the request.
 * For example, a request to /api/users will be treated as /users internally.
 *
 * This feature is useful when:
 * - You want to make your mock API feel more like a real backend
 * - You need to differentiate API routes from other routes in your application
 * - You're working with frontend frameworks that expect API routes to start with /api
 *
 * Both standard routes (/users) and API-prefixed routes (/api/users) will work
 * simultaneously when this middleware is enabled.
 *
 * @param enableApiPrefix - Whether to enable API prefix routing (default: true)
 * @returns Express middleware function
 *
 * @example
 * // Usage in Express application
 * app.use(apiPrefixMiddleware(true));
 *
 * // This will allow both these requests to work:
 * // GET /users
 * // GET /api/users
 */
export function apiPrefixMiddleware(enableApiPrefix: boolean = true): RequestHandler {
  // If API prefix is disabled, return a pass-through middleware
  if (!enableApiPrefix) {
    return (_req: Request, _res: Response, next: NextFunction): void => {
      next();
    };
  }

  return (req: Request, _res: Response, next: NextFunction): void => {
    // Check if the request path starts with /api/
    if (req.path.startsWith('/api/')) {
      // Rewrite the URL by removing the /api prefix
      req.url = req.url.replace(/^\/api/, '');
    }

    next();
  };
}

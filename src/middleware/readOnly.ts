import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * HTTP methods that modify data
 */
const WRITE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * Creates middleware to enforce read-only mode
 *
 * When enabled, this middleware blocks all write operations (POST, PUT, PATCH, DELETE)
 * and returns a 403 Forbidden response with a descriptive error message.
 *
 * @param readOnly - Whether to enable read-only mode (default: false)
 * @returns Express middleware function
 */
export function readOnlyMiddleware(readOnly: boolean = false): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (readOnly && WRITE_METHODS.includes(req.method)) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Server is in read-only mode. Write operations are not allowed.',
        method: req.method,
        path: req.path,
      });
      return;
    }
    next();
  };
}

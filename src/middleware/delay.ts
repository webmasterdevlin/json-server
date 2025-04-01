import { Request, Response, NextFunction, RequestHandler } from 'express';
import pause from 'connect-pause';

/**
 * Middleware to add an artificial delay to API responses
 *
 * This is useful for simulating network latency in development and testing environments.
 *
 * @param delay - Delay time in milliseconds (default: 0)
 * @returns Express middleware function
 */
export function delayMiddleware(delay: number = 0): RequestHandler {
  // If no delay is specified, return a pass-through middleware
  if (!delay || delay <= 0) {
    return (req: Request, res: Response, next: NextFunction): void => {
      next();
    };
  }

  // Use the connect-pause package for reliable delay implementation
  return pause(delay) as RequestHandler;
}

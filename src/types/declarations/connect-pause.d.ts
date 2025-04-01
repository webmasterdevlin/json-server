declare module "connect-pause" {
  import { RequestHandler } from "express";

  /**
   * Middleware that adds a delay to all requests
   * @param ms - Delay in milliseconds
   * @returns Express middleware function
   */
  function pause(ms: number): RequestHandler;

  export default pause;
}

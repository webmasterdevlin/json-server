import express, { Express, Request, Response, NextFunction, RequestHandler } from 'express';
import path from 'path';
import fs from 'fs';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import serveStatic from 'serve-static';
import { ServerOptions, Database, RoutesConfig, HttpMethod } from '../types';
import { corsMiddleware, delayMiddleware, readOnlyMiddleware } from '../middleware';
import { fileExists, loadJsonFile, saveJsonFile, parseRoutesFile } from '../utils/utils';

/**
 * Main JsonServer class that handles all server functionality
 *
 * @class JsonServer
 */
export class JsonServer {
  /** Express application instance */
  private app: Express;

  /** In-memory database */
  private db: Database = {};

  /** Path to the JSON database file */
  private dbPath: string = '';

  /** Custom routes configuration */
  private routes: RoutesConfig = {};

  /** Field to use as the primary key/ID (default: 'id') */
  private idField: string = 'id';

  /**
   * Creates an instance of JsonServer
   *
   * @param options - Server configuration options
   */
  constructor(private options: ServerOptions) {
    this.app = express();
    this.setupMiddlewares();
  }

  /**
   * Get the Express application instance
   *
   * @returns The Express application
   */
  getApp(): Express {
    return this.app;
  }

  /**
   * Setup all middleware for the server
   *
   * @private
   */
  private setupMiddlewares(): void {
    // Add logging middleware if not in quiet mode
    if (!this.options.quiet) {
      this.app.use(morgan('dev'));
    }

    // CORS middleware
    this.app.use(corsMiddleware(!this.options.noCors));

    // Body parser middleware
    if (this.options.bodyParser) {
      this.app.use(bodyParser.json({ limit: '10mb' }));
      this.app.use(bodyParser.urlencoded({ extended: false, limit: '10mb' }));
    }

    // Delay middleware for simulating network latency
    if (this.options.delay > 0) {
      this.app.use(delayMiddleware(this.options.delay));
    }

    // Read-only middleware to prevent data modifications
    this.app.use(readOnlyMiddleware(this.options.readOnly) as RequestHandler);

    // Serve static files if configured
    this.setupStaticFiles();

    // Custom middlewares
    this.setupCustomMiddlewares();
  }

  /**
   * Set up static file serving
   *
   * @private
   */
  private setupStaticFiles(): void {
    if (
      !this.options.static ||
      (Array.isArray(this.options.static) && this.options.static.length === 0)
    ) {
      return;
    }

    const statics = Array.isArray(this.options.static)
      ? this.options.static
      : [this.options.static];

    statics.forEach((staticPath) => {
      if (!fs.existsSync(path.resolve(staticPath))) {
        console.warn(`Warning: Static path not found: ${staticPath}`);
        return;
      }

      this.app.use(
        serveStatic(path.resolve(staticPath), {
          index: ['index.html'],
        })
      );

      if (!this.options.quiet) {
        console.log(`Serving static files from: ${staticPath}`);
      }
    });
  }

  /**
   * Set up custom middlewares provided in options
   *
   * @private
   */
  private setupCustomMiddlewares(): void {
    if (Array.isArray(this.options.middlewares) && this.options.middlewares.length > 0) {
      this.options.middlewares.forEach((middleware, index) => {
        this.app.use(middleware);
        if (!this.options.quiet) {
          console.log(`Applied custom middleware #${index + 1}`);
        }
      });
    }
  }

  /**
   * Get paginated resources from a collection
   *
   * @param resourceName - Name of the resource collection
   * @param page - Current page number (default: 1)
   * @param pageSize - Number of items per page (default: 10)
   * @returns Object containing paginated data and metadata
   */
  getPaginatedResource(
    resourceName: string,
    page: number = 1,
    pageSize: number = 10
  ): Record<string, any> {
    if (!this.db[resourceName]) {
      return {
        data: [],
        pagination: {
          currentPage: page,
          pageSize,
          totalItems: 0,
          totalPages: 0,
          hasMore: false,
        },
      };
    }

    const collection = this.db[resourceName];
    const totalItems = collection.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const data = collection.slice(start, end);

    return {
      data,
      pagination: {
        currentPage: page,
        pageSize,
        totalItems,
        totalPages,
        hasMore: this.continueToIterate(page, pageSize, totalItems),
      },
    };
  }

  /**
   * Determines if pagination should continue to next page
   *
   * @param currentPage - Current page number
   * @param pageSize - Items per page
   * @param totalItems - Total number of items
   * @returns Boolean indicating if there are more pages to iterate
   */
  continueToIterate(currentPage: number, pageSize: number, totalItems: number): boolean {
    return currentPage * pageSize < totalItems;
  }

  /**
   * Load database from JSON file
   *
   * @param dbPath - Path to the database JSON file
   * @returns This server instance for chaining
   * @throws Error if database file doesn't exist
   */
  loadDatabase(dbPath: string): JsonServer {
    this.dbPath = path.resolve(dbPath);

    if (!fileExists(this.dbPath)) {
      throw new Error(`Database file not found: ${this.dbPath}`);
    }

    try {
      this.db = loadJsonFile(this.dbPath);

      if (!this.options.quiet) {
        // Log number of collections and total items
        const collections = Object.keys(this.db);
        const totalItems = collections.reduce((sum, coll) => sum + this.db[coll].length, 0);
        console.log(
          `Loaded ${collections.length} collections with ${totalItems} items from ${this.dbPath}`
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to load database: ${errorMessage}`);
    }

    return this;
  }

  /**
   * Save the current database state to the JSON file
   *
   * @throws Error if no database file is specified or if save fails
   */
  saveDatabase(): void {
    if (!this.dbPath) {
      throw new Error('No database file specified. Call loadDatabase() first.');
    }

    try {
      saveJsonFile(this.dbPath, this.db);

      if (!this.options.quiet) {
        console.log(`Database saved to ${this.dbPath}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to save database: ${errorMessage}`);
    }
  }

  /**
   * Set the ID field name (default is 'id')
   *
   * @param idField - Field name to use as ID
   * @returns This server instance for chaining
   */
  setIdField(idField: string): JsonServer {
    this.idField = idField;

    if (!this.options.quiet) {
      console.log(`Using '${idField}' as the ID field`);
    }

    return this;
  }

  /**
   * Load custom routes from a configuration file
   *
   * @param routesPath - Path to the routes configuration file
   * @returns This server instance for chaining
   */
  loadRoutes(routesPath: string): JsonServer {
    const fullPath = path.resolve(routesPath);

    try {
      this.routes = parseRoutesFile(fullPath);

      if (!this.options.quiet) {
        const routeCount = Object.keys(this.routes).length;
        console.log(`Loaded ${routeCount} custom routes from ${fullPath}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Failed to load routes: ${errorMessage}`);
    }

    return this;
  }

  /**
   * Add a custom route
   *
   * @param path - Route path
   * @param method - HTTP method
   * @param handler - Route handler function
   * @returns This server instance for chaining
   */
  addRoute(
    routePath: string,
    method: HttpMethod | string,
    handler: (req: Request, res: Response) => void
  ): JsonServer {
    if (!this.routes[routePath]) {
      this.routes[routePath] = {};
    }

    this.routes[routePath][method.toLowerCase()] = handler;

    if (!this.options.quiet) {
      console.log(`Added custom ${method.toUpperCase()} route: ${routePath}`);
    }

    return this;
  }

  /**
   * Create API endpoints for all resources in the database
   *
   * @private
   */
  private createResourceRoutes(): void {
    // Get entire database
    this.app.get('/db', ((req: Request, res: Response) => {
      res.json(this.db);
    }) as RequestHandler);

    // Get paginated results for a resource
    this.app.get('/:resource/paginate', ((req: Request, res: Response) => {
      const { resource } = req.params;
      const page = parseInt(req.query._page as string) || 1;
      const pageSize = parseInt(req.query._limit as string) || 10;

      const paginatedResult = this.getPaginatedResource(resource, page, pageSize);
      res.json(paginatedResult);
    }) as RequestHandler);

    // Get all entries for a resource
    this.app.get('/:resource', ((req: Request, res: Response) => {
      const { resource } = req.params;
      const resourceData = this.db[resource] || [];

      // Handle query parameters for filtering
      if (Object.keys(req.query).length > 0) {
        const filteredData = resourceData.filter((item) => {
          return Object.entries(req.query).every(([key, value]) => {
            // Skip special query parameters like _page, _limit, _sort
            if (key.startsWith('_')) return true;
            return String(item[key]) === String(value);
          });
        });

        return res.json(filteredData);
      }

      res.json(resourceData);
    }) as RequestHandler);

    // Get single entry by ID
    this.app.get('/:resource/:id', ((req: Request, res: Response) => {
      const { resource, id } = req.params;

      if (!this.db[resource]) {
        return res.status(404).json({
          error: `Resource '${resource}' not found`,
          message: `The resource '${resource}' does not exist in the database`,
        });
      }

      const item = this.db[resource].find((item: any) => String(item[this.idField]) === String(id));

      if (!item) {
        return res.status(404).json({
          error: `Item with ID '${id}' not found`,
          message: `No item with ID '${id}' exists in resource '${resource}'`,
        });
      }

      res.json(item);
    }) as RequestHandler);

    // Create new entry
    this.app.post('/:resource', ((req: Request, res: Response) => {
      const { resource } = req.params;
      const newItem = req.body;

      if (!newItem || typeof newItem !== 'object') {
        return res.status(400).json({
          error: 'Invalid request body',
          message: 'Request body must be a valid JSON object',
        });
      }

      if (!this.db[resource]) {
        this.db[resource] = [];
      }

      // Generate ID if not provided
      if (!newItem[this.idField]) {
        newItem[this.idField] = Date.now().toString();
      }

      this.db[resource].push(newItem);

      try {
        this.saveDatabase();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return res.status(500).json({
          error: 'Failed to save database',
          message: errorMessage,
        });
      }

      res.status(201).json(newItem);
    }) as RequestHandler);

    // Update entry (PUT - full update)
    this.app.put('/:resource/:id', ((req: Request, res: Response) => {
      const { resource, id } = req.params;
      const updateData = req.body;

      if (!updateData || typeof updateData !== 'object') {
        return res.status(400).json({
          error: 'Invalid request body',
          message: 'Request body must be a valid JSON object',
        });
      }

      if (!this.db[resource]) {
        return res.status(404).json({
          error: `Resource '${resource}' not found`,
          message: `The resource '${resource}' does not exist in the database`,
        });
      }

      const index = this.db[resource].findIndex(
        (item: any) => String(item[this.idField]) === String(id)
      );

      if (index === -1) {
        return res.status(404).json({
          error: `Item with ID '${id}' not found`,
          message: `No item with ID '${id}' exists in resource '${resource}'`,
        });
      }

      // Preserve the ID
      updateData[this.idField] = this.db[resource][index][this.idField];

      this.db[resource][index] = updateData;

      try {
        this.saveDatabase();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return res.status(500).json({
          error: 'Failed to save database',
          message: errorMessage,
        });
      }

      res.json(updateData);
    }) as RequestHandler);

    // Update entry (PATCH - partial update)
    this.app.patch('/:resource/:id', ((req: Request, res: Response) => {
      const { resource, id } = req.params;
      const updateData = req.body;

      if (!updateData || typeof updateData !== 'object') {
        return res.status(400).json({
          error: 'Invalid request body',
          message: 'Request body must be a valid JSON object',
        });
      }

      if (!this.db[resource]) {
        return res.status(404).json({
          error: `Resource '${resource}' not found`,
          message: `The resource '${resource}' does not exist in the database`,
        });
      }

      const index = this.db[resource].findIndex(
        (item: any) => String(item[this.idField]) === String(id)
      );

      if (index === -1) {
        return res.status(404).json({
          error: `Item with ID '${id}' not found`,
          message: `No item with ID '${id}' exists in resource '${resource}'`,
        });
      }

      // Preserve the ID and merge with existing data
      const updatedItem = { ...this.db[resource][index], ...updateData };
      updatedItem[this.idField] = this.db[resource][index][this.idField];

      this.db[resource][index] = updatedItem;

      try {
        this.saveDatabase();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return res.status(500).json({
          error: 'Failed to save database',
          message: errorMessage,
        });
      }

      res.json(updatedItem);
    }) as RequestHandler);

    // Delete entry
    this.app.delete('/:resource/:id', ((req: Request, res: Response) => {
      const { resource, id } = req.params;

      if (!this.db[resource]) {
        return res.status(404).json({
          error: `Resource '${resource}' not found`,
          message: `The resource '${resource}' does not exist in the database`,
        });
      }

      const index = this.db[resource].findIndex(
        (item: any) => String(item[this.idField]) === String(id)
      );

      if (index === -1) {
        return res.status(404).json({
          error: `Item with ID '${id}' not found`,
          message: `No item with ID '${id}' exists in resource '${resource}'`,
        });
      }

      const deletedItem = this.db[resource][index];
      this.db[resource].splice(index, 1);

      try {
        this.saveDatabase();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return res.status(500).json({
          error: 'Failed to save database',
          message: errorMessage,
        });
      }

      res.json(deletedItem);
    }) as RequestHandler);
  }

  /**
   * Apply custom routes defined in routes config
   *
   * @private
   */
  private applyCustomRoutes(): void {
    Object.entries(this.routes).forEach(([routePath, handlers]) => {
      Object.entries(handlers).forEach(([method, handler]) => {
        const routeMethod = method.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete';

        if (typeof this.app[routeMethod] !== 'function') {
          console.error(`Unsupported HTTP method: ${method}`);
          return;
        }

        if (typeof handler === 'string') {
          // String handler: redirect or proxy to another route
          const targetPath = handler;
          this.app[routeMethod](routePath, ((req: Request, res: Response) => {
            // Replace path parameters in target path
            let resolvedPath = targetPath;
            const pathParamsMatch = routePath.match(/:[a-zA-Z0-9_]+/g);

            if (pathParamsMatch) {
              pathParamsMatch.forEach((paramName) => {
                const paramKey = paramName.substring(1); // Remove the ':'
                if (req.params[paramKey]) {
                  resolvedPath = resolvedPath.replace(paramName, req.params[paramKey]);
                }
              });
            }

            res.redirect(resolvedPath);
          }) as RequestHandler);

          if (!this.options.quiet) {
            console.log(
              `Registered custom route: ${method.toUpperCase()} ${routePath} -> ${targetPath}`
            );
          }
        } else if (typeof handler === 'function') {
          // Function handler: direct route handler
          this.app[routeMethod](routePath, handler as RequestHandler);

          if (!this.options.quiet) {
            console.log(
              `Registered custom route with handler function: ${method.toUpperCase()} ${routePath}`
            );
          }
        }
      });
    });
  }

  /**
   * Start the server
   *
   * @returns A promise resolving to the server instance
   */
  start(): Promise<any> {
    // Create API routes for resources
    this.createResourceRoutes();

    // Apply custom routes if defined
    if (Object.keys(this.routes).length > 0) {
      this.applyCustomRoutes();
    }

    // Handle 404 errors
    this.app.use(((req: Request, res: Response) => {
      res.status(404).json({
        error: 'Not found',
        message: `The requested URL ${req.url} was not found on this server`,
        path: req.url,
      });
    }) as RequestHandler);

    // Handle server errors (500)
    this.app.use(((err: Error, req: Request, res: Response, _next: NextFunction) => {
      console.error('Server error:', err);
      res.status(500).json({
        error: 'Internal server error',
        message: err.message || 'An unexpected error occurred',
      });
    }) as RequestHandler);

    // Start the server
    return new Promise((resolve, reject) => {
      try {
        const server = this.app.listen(this.options.port, this.options.host, () => {
          if (!this.options.quiet) {
            console.log(`
╭───────────────────────────────────────────╮
│                                           │
│   JSON Server is running                  │
│                                           │
│   URL: http://${this.options.host}:${this.options.port}          │
│   Home: http://${this.options.host}:${this.options.port}/db       │
│                                           │
│   Type Ctrl+C to stop the server          │
│                                           │
╰───────────────────────────────────────────╯
`);
          }
          resolve(server);
        });

        // Handle server close
        server.on('close', () => {
          if (!this.options.quiet) {
            console.log('JSON Server has been stopped');
          }
        });

        // Handle server errors
        server.on('error', (err) => {
          const errorMessage = err instanceof Error ? err.message : String(err);
          reject(new Error(`Failed to start server: ${errorMessage}`));
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        reject(new Error(`Failed to start server: ${errorMessage}`));
      }
    });
  }
}

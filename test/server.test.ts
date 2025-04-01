// Mock Express to avoid module resolution issues
jest.mock('express', () => {
  const mockExpress: any = () => {
    const app = {
      use: jest.fn(),
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      listen: jest.fn().mockImplementation((port, host, cb) => {
        cb();
        return { close: jest.fn() };
      }),
    };
    return app;
  };

  mockExpress.json = jest.fn();
  mockExpress.urlencoded = jest.fn();

  return mockExpress;
});

// Mock path
jest.mock('path', () => ({
  resolve: jest.fn((path) => path),
}));

// Mock the middlewares
jest.mock('../src/middleware', () => ({
  corsMiddleware: jest.fn(() => jest.fn()),
  delayMiddleware: jest.fn(() => jest.fn()),
  readOnlyMiddleware: jest.fn(() => jest.fn()),
}));

import { JsonServer } from '../src/lib/server';
import { ServerOptions } from '../src/types';

describe('JsonServer', () => {
  let server: JsonServer;

  beforeEach(() => {
    const options: ServerOptions = {
      port: 3000,
      host: 'localhost',
      cors: true,
      static: [],
      middlewares: [],
      bodyParser: true,
      noCors: false,
      noGzip: false,
      delay: 0,
      quiet: true,
      readOnly: false,
    };

    server = new JsonServer(options);

    // Mock the loadDatabase and saveDatabase methods
    server.loadDatabase = jest.fn().mockReturnValue(server);
    server.saveDatabase = jest.fn();
  });

  describe('initialization', () => {
    it('should create a server instance', () => {
      expect(server).toBeInstanceOf(JsonServer);
    });

    it('should set up middlewares correctly', () => {
      const app = server.getApp();
      expect(app.use).toHaveBeenCalled();
    });
  });

  describe('API methods', () => {
    it('should provide chainable methods', () => {
      expect(server.loadDatabase('test.json')).toBe(server);
      expect(server.setIdField('_id')).toBe(server);
    });
  });
});

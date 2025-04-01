// filepath: /Users/devlinduldulao/Downloads/json-server/test/pagination.test.ts
import { JsonServer } from '../src/lib/server';
import { ServerOptions } from '../src/types';
import express, { Request, Response } from 'express';
import request from 'supertest';

// Mock the file utilities
jest.mock('../src/utils/utils', () => ({
  fileExists: jest.fn(() => true),
  loadJsonFile: jest.fn(() => ({
    items: Array.from({ length: 100 }, (_, i) => ({
      id: String(i + 1),
      name: `Item ${i + 1}`,
      value: i + 1,
    })),
    emptyResource: [],
    smallCollection: Array.from({ length: 5 }, (_, i) => ({
      id: String(i + 1),
      name: `Small Item ${i + 1}`,
    })),
  })),
  saveJsonFile: jest.fn(),
  parseRoutesFile: jest.fn(),
}));

describe('Pagination Feature Tests', () => {
  let server: JsonServer;
  let app: express.Express;

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

    // Create a real server instance for testing
    server = new JsonServer(options);
    server.loadDatabase('test-db.json');
    app = server.getApp();

    // Manually call start to set up routes
    // but don't actually listen on a port
    const originalStart = server.start;
    server.start = jest.fn().mockImplementation(() => {
      // Set up routes without starting the server
      (server as any).createResourceRoutes();
      (server as any).applyCustomRoutes();
      return Promise.resolve();
    });
    server.start();
    server.start = originalStart;
  });

  // Test 1: Basic pagination with default parameters
  test('getPaginatedData should return paginated data with default values', () => {
    const mockCollection = Array.from({ length: 30 }, (_, i) => ({ id: i + 1 }));
    const result = (server as any).getPaginatedData(mockCollection);

    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('first', 1);
    expect(result).toHaveProperty('last');
    expect(result).toHaveProperty('pages');
    expect(result).toHaveProperty('items', 30);
    expect(result.data).toHaveLength(10); // Default perPage is 10
  });

  // Test 2: Custom page and perPage parameters
  test('getPaginatedData should use custom page and perPage values', () => {
    const mockCollection = Array.from({ length: 30 }, (_, i) => ({ id: i + 1 }));
    const result = (server as any).getPaginatedData(mockCollection, 2, 5);

    expect(result.data).toHaveLength(5); // perPage is 5
    expect(result.data[0].id).toBe(6); // Second page, first item should be id 6
    expect(result.prev).toBe(1); // Previous page should exist
    expect(result.next).toBe(3); // Next page should exist
  });

  // Test 3: Last page with fewer items than perPage
  test('getPaginatedData should handle last page with fewer items', () => {
    const mockCollection = Array.from({ length: 22 }, (_, i) => ({ id: i + 1 }));
    const result = (server as any).getPaginatedData(mockCollection, 3, 10);

    expect(result.data).toHaveLength(2); // Last page has only 2 items
    expect(result.prev).toBe(2); // Previous page should exist
    expect(result.next).toBeNull(); // No next page
    expect(result.pages).toBe(3); // Total pages
  });

  // Test 4: Empty collection
  test('getPaginatedData should handle empty collections', () => {
    const result = (server as any).getPaginatedData([]);

    expect(result.data).toHaveLength(0);
    expect(result.prev).toBeNull();
    expect(result.next).toBeNull();
    expect(result.pages).toBe(1); // Minimum 1 page even if empty
  });

  // Test 5: Page out of bounds (larger than total pages)
  test('getPaginatedData should handle page number larger than total pages', () => {
    const mockCollection = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));
    const result = (server as any).getPaginatedData(mockCollection, 3, 5);

    expect(result.data).toHaveLength(0); // No items on this page
    expect(result.prev).toBe(2); // Previous page exists
    expect(result.next).toBeNull(); // No next page
  });

  // Test 6: GET /:resource with _page and _per_page params
  test('GET /:resource should apply pagination when _page and _per_page are specified', async () => {
    // Mock the app.get implementation for this specific test
    const mockReq = {
      params: { resource: 'items' },
      query: { _page: '2', _per_page: '5' },
    } as unknown as Request;

    // Create a mock response object
    const mockRes = {
      json: jest.fn(),
    } as unknown as Response;

    // Find the route handler and call it directly
    const handlers = app.get.mock.calls.find((call) => call[0] === '/:resource');
    if (handlers && typeof handlers[1] === 'function') {
      await handlers[1](mockReq, mockRes, () => {});

      // Check that response.json was called with paginated data
      expect(mockRes.json).toHaveBeenCalled();
      const responseData = mockRes.json.mock.calls[0][0];

      expect(responseData).toHaveProperty('data');
      expect(responseData.data).toHaveLength(5); // perPage is 5
      expect(responseData).toHaveProperty('prev', 1);
      expect(responseData).toHaveProperty('next', 3);
    } else {
      fail('Route handler for /:resource not found');
    }
  });

  // Test 7: GET /:resource with only _page param (default _per_page)
  test('GET /:resource should use default perPage when only _page is specified', async () => {
    const mockReq = {
      params: { resource: 'items' },
      query: { _page: '2' },
    } as unknown as Request;

    const mockRes = {
      json: jest.fn(),
    } as unknown as Response;

    const handlers = app.get.mock.calls.find((call) => call[0] === '/:resource');
    if (handlers && typeof handlers[1] === 'function') {
      await handlers[1](mockReq, mockRes, () => {});

      const responseData = mockRes.json.mock.calls[0][0];
      expect(responseData.data).toHaveLength(10); // Default perPage is 10
    } else {
      fail('Route handler for /:resource not found');
    }
  });

  // Test 8: GET /:resource with only _per_page param (default page 1)
  test('GET /:resource should use page 1 when only _per_page is specified', async () => {
    const mockReq = {
      params: { resource: 'items' },
      query: { _per_page: '15' },
    } as unknown as Request;

    const mockRes = {
      json: jest.fn(),
    } as unknown as Response;

    const handlers = app.get.mock.calls.find((call) => call[0] === '/:resource');
    if (handlers && typeof handlers[1] === 'function') {
      await handlers[1](mockReq, mockRes, () => {});

      const responseData = mockRes.json.mock.calls[0][0];
      expect(responseData.data).toHaveLength(15);
      expect(responseData.prev).toBeNull(); // No previous page
      expect(responseData.first).toBe(1); // First page is 1
    } else {
      fail('Route handler for /:resource not found');
    }
  });

  // Test 9: Pagination with filtering
  test('GET /:resource should filter before pagination', async () => {
    const mockReq = {
      params: { resource: 'items' },
      query: { _page: '1', _per_page: '5', value: '10' },
    } as unknown as Request;

    const mockRes = {
      json: jest.fn(),
    } as unknown as Response;

    const handlers = app.get.mock.calls.find((call) => call[0] === '/:resource');
    if (handlers && typeof handlers[1] === 'function') {
      await handlers[1](mockReq, mockRes, () => {});

      const responseData = mockRes.json.mock.calls[0][0];
      // Should only be one item with value=10
      expect(responseData.data).toHaveLength(1);
      expect(responseData.data[0].value).toBe(10);
    } else {
      fail('Route handler for /:resource not found');
    }
  });

  // Test 10: Non-existent resource
  test('GET /:resource should return empty array for non-existent resource', async () => {
    const mockReq = {
      params: { resource: 'nonExistentResource' },
      query: { _page: '1', _per_page: '5' },
    } as unknown as Request;

    const mockRes = {
      json: jest.fn(),
    } as unknown as Response;

    const handlers = app.get.mock.calls.find((call) => call[0] === '/:resource');
    if (handlers && typeof handlers[1] === 'function') {
      await handlers[1](mockReq, mockRes, () => {});

      const responseData = mockRes.json.mock.calls[0][0];
      expect(responseData.data).toHaveLength(0);
      expect(responseData.items).toBe(0);
    } else {
      fail('Route handler for /:resource not found');
    }
  });

  // Test 11: Empty resource
  test('GET /:resource should handle empty resources correctly', async () => {
    const mockReq = {
      params: { resource: 'emptyResource' },
      query: { _page: '1', _per_page: '5' },
    } as unknown as Request;

    const mockRes = {
      json: jest.fn(),
    } as unknown as Response;

    const handlers = app.get.mock.calls.find((call) => call[0] === '/:resource');
    if (handlers && typeof handlers[1] === 'function') {
      await handlers[1](mockReq, mockRes, () => {});

      const responseData = mockRes.json.mock.calls[0][0];
      expect(responseData.data).toHaveLength(0);
      expect(responseData.pages).toBe(1); // Minimum of 1 page
    } else {
      fail('Route handler for /:resource not found');
    }
  });

  // Test 12: Small collection pagination
  test('getPaginatedData should handle small collections correctly', () => {
    const mockReq = {
      params: { resource: 'smallCollection' },
      query: { _page: '1', _per_page: '10' },
    } as unknown as Request;

    const mockRes = {
      json: jest.fn(),
    } as unknown as Response;

    const handlers = app.get.mock.calls.find((call) => call[0] === '/:resource');
    if (handlers && typeof handlers[1] === 'function') {
      handlers[1](mockReq, mockRes, () => {});

      const responseData = mockRes.json.mock.calls[0][0];
      expect(responseData.data).toHaveLength(5); // All 5 items
      expect(responseData.next).toBeNull(); // No next page
      expect(responseData.pages).toBe(1); // Only 1 page
    }
  });
});

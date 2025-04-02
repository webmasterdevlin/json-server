import { apiPrefixMiddleware } from '../src/middleware/apiPrefix';
import { Request, Response } from 'express';

describe('API Prefix Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {};
    nextFunction = jest.fn();
  });

  test('should not modify URL when API prefix is disabled', () => {
    const middleware = apiPrefixMiddleware(false);

    // Set up the mock request with path getter
    mockRequest = {
      url: '/users',
      // Path is a computed property in Express, so we need to mock it with a getter
      get path() {
        return '/users';
      },
    };

    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockRequest.url).toBe('/users');
    expect(nextFunction).toHaveBeenCalled();
  });

  test('should not modify URL for non-API paths', () => {
    const middleware = apiPrefixMiddleware(true);

    mockRequest = {
      url: '/users',
      get path() {
        return '/users';
      },
    };

    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockRequest.url).toBe('/users');
    expect(nextFunction).toHaveBeenCalled();
  });

  test('should remove API prefix from URL', () => {
    const middleware = apiPrefixMiddleware(true);

    mockRequest = {
      url: '/api/users',
      get path() {
        return '/api/users';
      },
    };

    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockRequest.url).toBe('/users');
    expect(nextFunction).toHaveBeenCalled();
  });

  test('should handle API prefix with query parameters', () => {
    const middleware = apiPrefixMiddleware(true);

    mockRequest = {
      url: '/api/users?_page=1&_limit=10',
      get path() {
        return '/api/users';
      },
    };

    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockRequest.url).toBe('/users?_page=1&_limit=10');
    expect(nextFunction).toHaveBeenCalled();
  });
});

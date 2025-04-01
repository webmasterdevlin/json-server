import { JsonServer } from '../src/lib/server';
import { ServerOptions } from '../src/types';
import request from 'supertest';
import express from 'express';

// Mock the file utilities
jest.mock('../src/utils/utils', () => ({
  fileExists: jest.fn(() => true),
  loadJsonFile: jest.fn(() => ({
    // Create 100 test posts
    posts: Array.from({ length: 100 }, (_, i) => ({
      id: String(i + 1),
      title: `Post ${i + 1}`,
      body: `Body of post ${i + 1}`,
      authorId: Math.floor(i / 10) + 1,
    })),
    // Create 10 test users
    users: Array.from({ length: 10 }, (_, i) => ({
      id: String(i + 1),
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
    })),
    // Empty collection
    emptyCollection: [],
    // Small collection with just 3 items
    smallCollection: Array.from({ length: 3 }, (_, i) => ({
      id: String(i + 1),
      name: `Item ${i + 1}`,
    })),
  })),
  saveJsonFile: jest.fn(),
  parseRoutesFile: jest.fn(),
}));

describe('Pagination Integration Tests', () => {
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

    // Create a server instance for testing
    server = new JsonServer(options);
    server.loadDatabase('test-db.json');
    app = server.getApp();

    // Setup routes without actually starting the server
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

  // Test 1: Basic pagination should work with _page and _per_page parameters
  test('should paginate posts with _page and _per_page parameters', async () => {
    const response = await request(app).get('/posts?_page=2&_per_page=10').expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveLength(10);
    // Check that we got posts 11-20
    expect(response.body.data[0].id).toBe('11');
    expect(response.body.data[9].id).toBe('20');
  });

  // Test 2: Default pagination (page 1, per_page 10) when no parameters provided
  test('should use default pagination when no parameters provided', async () => {
    const response = await request(app).get('/posts').expect(200);

    // Without pagination params, should return all results
    // If pagination is working, it should return only the first page (10 items)
    expect(response.body.length <= 10 || response.body.data?.length <= 10).toBeTruthy();
  });

  // Test 3: Pagination with only _page parameter
  test('should use default per_page when only _page is provided', async () => {
    const response = await request(app).get('/posts?_page=3').expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveLength(10);
    // Check that we got posts 21-30
    expect(response.body.data[0].id).toBe('21');
  });

  // Test 4: Pagination with only _per_page parameter
  test('should use default page when only _per_page is provided', async () => {
    const response = await request(app).get('/posts?_per_page=15').expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveLength(15);
    // Check that we got posts 1-15
    expect(response.body.data[0].id).toBe('1');
    expect(response.body.data[14].id).toBe('15');
  });

  // Test 5: Pagination with invalid parameters
  test('should handle invalid pagination parameters gracefully', async () => {
    // Invalid page number (negative)
    const responseNegPage = await request(app).get('/posts?_page=-1&_per_page=10').expect(200);

    // Should default to page 1
    expect(responseNegPage.body.data[0].id).toBe('1');

    // Invalid per_page (too high)
    const responseLargePerPage = await request(app)
      .get('/posts?_page=1&_per_page=1000')
      .expect(200);

    // Should still work but return all available data
    expect(responseLargePerPage.body.data.length).toBeLessThanOrEqual(100);
  });

  // Test 6: Pagination with non-numeric parameters
  test('should handle non-numeric pagination parameters', async () => {
    const response = await request(app).get('/posts?_page=abc&_per_page=xyz').expect(200);

    // Should default to page 1, per_page 10
    expect(response.body.data).toHaveProperty('length');
    expect(response.body.data[0].id).toBe('1');
  });

  // Test 7: Pagination with filtering
  test('should apply filters before pagination', async () => {
    const response = await request(app).get('/posts?authorId=1&_page=1&_per_page=5').expect(200);

    // Should get only posts with authorId=1 (posts 1-10)
    // and then paginate (first 5)
    expect(response.body.data).toHaveLength(5);
    expect(response.body.data[0].authorId).toBe(1);
    expect(response.body.data[4].authorId).toBe(1);
  });

  // Test 8: Pagination with sorting
  test('should apply sorting before pagination', async () => {
    const response = await request(app)
      .get('/posts?_sort=id&_order=desc&_page=1&_per_page=5')
      .expect(200);

    // Should get posts sorted by id in descending order (100-96)
    expect(response.body.data).toHaveLength(5);
    expect(response.body.data[0].id).toBe('100');
    expect(response.body.data[4].id).toBe('96');
  });

  // Test 9: Pagination with last page having fewer items
  test('should handle last page with fewer items correctly', async () => {
    const response = await request(app).get('/posts?_page=10&_per_page=10').expect(200);

    // 100 posts, so the 10th page should have 10 items (91-100)
    expect(response.body.data).toHaveLength(10);

    const responsePartialPage = await request(app).get('/posts?_page=11&_per_page=10').expect(200);

    // Page 11 should be empty (no more data)
    expect(responsePartialPage.body.data).toHaveLength(0);
  });

  // Test 10: Pagination with empty collection
  test('should handle pagination on empty collection', async () => {
    const response = await request(app).get('/emptyCollection?_page=1&_per_page=10').expect(200);

    // Should return empty data array
    expect(response.body.data).toHaveLength(0);
  });

  // Test 11: Pagination with small collection
  test('should handle pagination on small collection', async () => {
    const response = await request(app).get('/smallCollection?_page=1&_per_page=10').expect(200);

    // Should return all 3 items
    expect(response.body.data).toHaveLength(3);

    // Page 2 should be empty
    const responsePage2 = await request(app)
      .get('/smallCollection?_page=2&_per_page=10')
      .expect(200);

    expect(responsePage2.body.data).toHaveLength(0);
  });

  // Test 12: Pagination metadata should be correct
  test('should return correct pagination metadata', async () => {
    const response = await request(app).get('/posts?_page=2&_per_page=20').expect(200);

    expect(response.body).toHaveProperty('first', 1);
    expect(response.body).toHaveProperty('prev', 1);
    expect(response.body).toHaveProperty('next', 3);
    expect(response.body).toHaveProperty('last', 5); // 100 posts / 20 per page = 5 pages
    expect(response.body).toHaveProperty('pages', 5);
    expect(response.body).toHaveProperty('items', 100);
  });

  // Test 13: Check links header (if implemented)
  test('should include pagination links in response headers if implemented', async () => {
    const response = await request(app).get('/posts?_page=2&_per_page=10').expect(200);

    // If Link header is implemented, check it
    if (response.headers.link) {
      expect(response.headers.link).toContain('rel="first"');
      expect(response.headers.link).toContain('rel="prev"');
      expect(response.headers.link).toContain('rel="next"');
      expect(response.headers.link).toContain('rel="last"');
    }
  });
});

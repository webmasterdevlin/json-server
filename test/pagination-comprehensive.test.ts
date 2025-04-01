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

describe('Comprehensive Pagination Tests', () => {
  let app: express.Application;
  let server: JsonServer;
  const options: ServerOptions = {
    port: 3000,
    host: 'localhost',
    quiet: true,
    readOnly: false,
    noCors: false,
    bodyParser: true,
  };

  beforeEach(() => {
    server = new JsonServer(options);
    server.loadDatabase('fake-db.json');
    app = server.getApp();
  });

  // Test standard endpoint pagination with _page and _per_page
  describe('Standard Endpoint Pagination', () => {
    test('should paginate data with _page=2 and _per_page=10', async () => {
      const response = await request(app).get('/posts?_page=2&_per_page=10').expect(200);

      // Check if response is properly paginated
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(10);
      expect(response.body.data[0].id).toBe('11');
      expect(response.body.data[9].id).toBe('20');

      // Check pagination metadata
      expect(response.body).toHaveProperty('first', 1);
      expect(response.body).toHaveProperty('prev', 1);
      expect(response.body).toHaveProperty('next', 3);
      expect(response.body).toHaveProperty('last', 10);
      expect(response.body).toHaveProperty('pages', 10);
      expect(response.body).toHaveProperty('items', 100);
    });

    test('should paginate data with only _page parameter', async () => {
      const response = await request(app).get('/posts?_page=3').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(10);
      expect(response.body.data[0].id).toBe('21');
      expect(response.body.data[9].id).toBe('30');
    });

    test('should paginate data with only _per_page parameter', async () => {
      const response = await request(app).get('/posts?_per_page=5').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(5);
      expect(response.body.data[0].id).toBe('1');
      expect(response.body.data[4].id).toBe('5');
    });

    test('should return the first page when _page=1', async () => {
      const response = await request(app).get('/posts?_page=1&_per_page=15').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(15);
      expect(response.body.data[0].id).toBe('1');
      expect(response.body.data[14].id).toBe('15');
    });

    test('should return empty data array for page beyond total', async () => {
      const response = await request(app).get('/posts?_page=20&_per_page=10').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(0);
    });

    test('should handle invalid _page parameter', async () => {
      const response = await request(app).get('/posts?_page=invalid&_per_page=10').expect(200);

      // Should default to page 1
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(10);
      expect(response.body.data[0].id).toBe('1');
    });

    test('should handle invalid _per_page parameter', async () => {
      const response = await request(app).get('/posts?_page=2&_per_page=invalid').expect(200);

      // Should default to 10 items per page
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(10);
      expect(response.body.data[0].id).toBe('11');
    });
  });

  // Test dedicated paginate endpoint
  describe('Dedicated Paginate Endpoint', () => {
    test('should paginate data with default parameters', async () => {
      const response = await request(app).get('/posts/paginate').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(10);
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.pageSize).toBe(10);
      expect(response.body.pagination.totalItems).toBe(100);
      expect(response.body.pagination.totalPages).toBe(10);
      expect(response.body.pagination.hasMore).toBe(true);
    });

    test('should paginate data with custom page and limit', async () => {
      const response = await request(app).get('/posts/paginate?_page=3&_limit=5').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(5);
      expect(response.body.pagination.currentPage).toBe(3);
      expect(response.body.pagination.pageSize).toBe(5);
      expect(response.body.data[0].id).toBe('11'); // Items 11-15 should be on page 3 with pageSize 5
    });

    test('should indicate no more pages on last page', async () => {
      const response = await request(app).get('/posts/paginate?_page=10&_limit=10').expect(200);

      expect(response.body.pagination.hasMore).toBe(false);
    });
  });

  // Test edge cases
  describe('Pagination Edge Cases', () => {
    test('should handle pagination for empty collections', async () => {
      const response = await request(app).get('/emptyCollection?_page=1&_per_page=10').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(0);
      expect(response.body).toHaveProperty('pages', 1);
      expect(response.body).toHaveProperty('items', 0);
    });

    test('should handle pagination for small collections', async () => {
      const response = await request(app).get('/smallCollection?_page=1&_per_page=10').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(3); // Collection only has 3 items
      expect(response.body).toHaveProperty('pages', 1);
      expect(response.body).toHaveProperty('items', 3);
      expect(response.body).toHaveProperty('next', null); // No next page
    });

    test('should handle second page pagination for small collections', async () => {
      const response = await request(app).get('/smallCollection?_page=2&_per_page=2').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(1); // Only 1 item on second page
      expect(response.body).toHaveProperty('pages', 2);
      expect(response.body).toHaveProperty('items', 3);
      expect(response.body).toHaveProperty('next', null); // No next page
    });
  });

  // Test loading ALL data when no pagination params are provided
  test('should return all data when no pagination parameters provided', async () => {
    const response = await request(app).get('/posts').expect(200);

    // Without pagination, all 100 posts should be returned
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(100);
    expect(response.body[0].id).toBe('1');
    expect(response.body[99].id).toBe('100');
  });
});

const request = require('supertest');
const { JsonServer } = require('../dist/lib/server');
const express = require('express');

// Create a simple test database
const testDb = {
  items: Array.from({ length: 100 }, (_, i) => ({
    id: String(i + 1),
    name: `Item ${i + 1}`
  }))
};

// Create server instance
const options = {
  port: 3000,
  host: 'localhost',
  quiet: true,
  readOnly: false,
  bodyParser: true,
  noCors: false
};

const server = new JsonServer(options);

// Mock database loading
server.loadDatabase = () => {
  server.db = testDb;
  return server;
};

// Load database and start server
server.loadDatabase();

// Get Express app
const app = server.getApp();
server.createResourceRoutes(); // Make this method accessible for testing

async function testPagination() {
  console.log('Testing pagination with _page and _per_page parameters');
  const response1 = await request(app).get('/items?_page=2&_per_page=10');
  console.log('Response with _page and _per_page:');
  console.log(`Status: ${response1.status}`);
  console.log(`Data length: ${response1.body.data ? response1.body.data.length : 'N/A'}`);
  console.log(`First item ID: ${response1.body.data && response1.body.data[0] ? response1.body.data[0].id : 'N/A'}`);
  console.log('Full response:', JSON.stringify(response1.body, null, 2));
  
  console.log('\nTesting pagination with only _per_page parameter');
  const response2 = await request(app).get('/items?_per_page=10');
  console.log('Response with only _per_page:');
  console.log(`Status: ${response2.status}`);
  console.log(`Data length: ${response2.body.data ? response2.body.data.length : 'N/A'}`);
  console.log(`First item ID: ${response2.body.data && response2.body.data[0] ? response2.body.data[0].id : 'N/A'}`);
  console.log('Full response:', JSON.stringify(response2.body, null, 2));
}

testPagination().catch(console.error);
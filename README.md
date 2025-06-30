# @webmasterdevlin/json-server

[![npm version](https://img.shields.io/npm/v/@webmasterdevlin/json-server.svg)](https://www.npmjs.com/package/@webmasterdevlin/json-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/webmasterdevlin/json-server/actions/workflows/ci.yml/badge.svg)](https://github.com/webmasterdevlin/json-server/actions)

A TypeScript implementation of json-server with additional features and comprehensive TypeScript types.

## Features

- **Full TypeScript support** with comprehensive type definitions
- **RESTful API endpoints** from a JSON file or JavaScript object
- **API prefix support** - Access all routes with `/api/*` prefix for production-like experience
- **Configurable routes** with custom route definitions
- **Multiple package managers** support (npm, yarn, pnpm, bun)
- **CORS support** with configurable options
- **Delay simulation** for network latency testing
- **Read-only mode** for safe demonstrations
- **Static file serving** for frontend assets
- **Custom middleware support** for advanced use cases
- **Deno compatibility** for modern runtime support
- **Beautiful CLI interface** with color-coded outputs and intuitive feedback
- **Comprehensive pagination** with flexible query parameters
- **Advanced filtering** and sorting capabilities

## Installation

### Using npm

```bash
npm install @webmasterdevlin/json-server
```

### Using yarn

```bash
yarn add @webmasterdevlin/json-server
```

### Using pnpm

```bash
pnpm add @webmasterdevlin/json-server
```

### Using bun

```bash
bun add @webmasterdevlin/json-server
```

## Quick Start

### CLI Usage

Create a `db.json` file:

```json
{
  "posts": [{ "id": 1, "title": "json-server", "author": "webmasterdevlin" }],
  "comments": [{ "id": 1, "body": "some comment", "postId": 1 }],
  "profile": { "name": "webmasterdevlin" }
}
```

Start the JSON Server:

```bash
npx json-server db.json
```

Or with API prefix support (enables `/api/*` routes):

```bash
npx json-server db.json --enable-api-prefix
```

Or use it from your package.json scripts:

```json
{
  "scripts": {
    "mock-api": "json-server db.json",
    "mock-api-with-prefix": "json-server db.json --enable-api-prefix"
  }
}
```

Now if you go to http://localhost:3000/posts/1, you'll get:

```json
{ "id": 1, "title": "json-server", "author": "webmasterdevlin" }
```

With API prefix enabled, you can also access the same data at http://localhost:3000/api/posts/1.

### API Usage

```typescript
import { create } from '@webmasterdevlin/json-server';

// Create a server with custom options
const server = create({
  port: 3001,
  host: 'localhost',
  delay: 500, // Add 500ms delay to all responses
});

// Load database from file
server.loadDatabase('./db.json');

// Start the server
server.start().then(() => {
  console.log('Server is running at http://localhost:3001');
});
```

### Deno Usage

```typescript
// Import from URL or local file
import { create } from 'npm:@webmasterdevlin/json-server';
// OR use the mod.ts entry point
// import { create } from "./mod.ts";

const server = create({
  port: 8000,
  host: 'localhost',
});

// Load database from file
server.loadDatabase('./db.json');

// Start the server
await server.start();
```

## Routes

All HTTP methods are supported:

```
GET    /posts
GET    /posts/1
POST   /posts
PUT    /posts/1
PATCH  /posts/1
DELETE /posts/1
```

### Custom Routes

Create a `routes.json` file:

```json
{
  "/api/*": "/$1",
  "/blog/:id": "/posts/:id",
  "/blog/:category/:title": "/posts?category=:category&title=:title"
}
```

Start the server with custom routes:

```bash
json-server db.json --routes routes.json
```

Now you can access your resources with:

```
/api/posts
/api/posts/1
/blog/1
/blog/javascript/typescript-basics
```

## Command Line Options

```
Usage:
  json-server [options] <source>

Options:
  --port, -p         Set port                                  [default: 3000]
  --host, -H         Set host                          [default: "localhost"]
  --watch, -w        Watch for changes                        [default: false]
  --routes, -r       Path to routes file                               [string]
  --middlewares, -m  Path to middlewares files                          [array]
  --static, -s       Path to static files                               [array]
  --read-only, --ro  Allow only GET requests                  [default: false]
  --no-cors, --nc    Disable CORS                             [default: false]
  --no-gzip, --ng    Disable GZIP compression                 [default: false]
  --enable-api-prefix, --api  Enable /api/* prefix routes     [default: false]
  --delay, -d        Add delay to responses (ms)                       [number]
  --id, -i           Set database id field                     [default: "id"]
  --foreignKeySuffix Set foreign key suffix               [default: "_id"]
  --quiet, -q        Suppress log messages                    [default: false]
  --help, -h         Show help                                        [boolean]
  --version, -v      Show version                                     [boolean]
```

### Example Commands

```bash
# Basic usage
json-server db.json

# With API prefix support
json-server db.json --enable-api-prefix

# Custom port with API prefix
json-server db.json --port 3001 --api

# With delay and API prefix
json-server db.json --delay 1000 --enable-api-prefix

# With custom routes and API prefix
json-server db.json --routes routes.json --api

# Read-only mode with API prefix
json-server db.json --read-only --enable-api-prefix
```

## Filtering and Pagination

Use query parameters for filtering:

```
GET /posts?title=json-server&author=webmasterdevlin
GET /posts?id=1&id=2
```

Pagination and sorting:

```
GET /posts?_page=1&_limit=10
GET /posts?_sort=title&_order=asc
GET /posts?_sort=title&_order=desc
```

## API Prefix

The API prefix feature allows you to access all your resources with an `/api` prefix, making your mock API feel more like a production backend. When enabled, both standard routes and API-prefixed routes work simultaneously.

### Why Use API Prefix?

- **Production-like experience**: Makes your mock API behave like a real backend with `/api` routes
- **Frontend framework compatibility**: Works seamlessly with frameworks that expect API routes to start with `/api`
- **Route organization**: Helps differentiate API routes from static file routes
- **Development consistency**: Matches common backend API patterns

### Using API Prefix with CLI

Enable the API prefix feature using the `--enable-api-prefix` (or `--api` shorthand) flag:

```bash
json-server db.json --enable-api-prefix
```

**Both route styles work simultaneously:**

```bash
# Standard routes (still work)
curl http://localhost:3000/posts
curl http://localhost:3000/posts/1
curl http://localhost:3000/db

# API-prefixed routes (also work)
curl http://localhost:3000/api/posts
curl http://localhost:3000/api/posts/1
curl http://localhost:3000/api/db
```

### All HTTP Methods Supported

The API prefix works with all HTTP methods:

```bash
# GET requests
GET /api/posts
GET /api/posts/1

# POST requests
POST /api/posts
Content-Type: application/json
{"title": "New Post", "author": "John Doe"}

# PUT requests
PUT /api/posts/1
Content-Type: application/json
{"id": 1, "title": "Updated Post", "author": "John Doe"}

# PATCH requests
PATCH /api/posts/1
Content-Type: application/json
{"title": "Partially Updated Post"}

# DELETE requests
DELETE /api/posts/1
```

### Query Parameters and Pagination

All query parameters work with the API prefix:

```bash
# Filtering
GET /api/posts?author=webmasterdevlin
GET /api/posts?title=json-server&author=webmasterdevlin

# Pagination
GET /api/posts?_page=1&_limit=10
GET /api/posts?_page=2&_limit=5

# Sorting
GET /api/posts?_sort=title&_order=asc
GET /api/posts?_sort=id&_order=desc

# Pagination endpoint
GET /api/posts/paginate?_page=1&_limit=10
```

### Using API Prefix Programmatically

```typescript
import { create } from '@webmasterdevlin/json-server';

const server = create({
  port: 3000,
  enableApiPrefix: true, // Enable the API prefix feature
});

server.loadDatabase('./db.json');
server.start().then(() => {
  console.log('Server running with API prefix support');
  console.log('Access your API at:');
  console.log('- http://localhost:3000/posts (standard)');
  console.log('- http://localhost:3000/api/posts (with prefix)');
});
```

### Example with Custom Routes

When using custom routes with API prefix enabled:

**routes.json:**

```json
{
  "/api/profile": {
    "GET": "/users/1"
  },
  "/api/featured-post": {
    "GET": "/posts/1"
  },
  "/api/users/:id/posts": {
    "GET": "/posts?userId=:id"
  }
}
```

**Start server:**

```bash
json-server db.json --routes routes.json --enable-api-prefix
```

**Access routes:**

```bash
curl http://localhost:3000/api/profile
curl http://localhost:3000/api/featured-post
curl http://localhost:3000/api/users/1/posts
```

## Programmatic Usage

### Basic Usage

```typescript
import { create } from '@webmasterdevlin/json-server';

// Database object
const data = {
  posts: [{ id: 1, title: 'json-server', author: 'webmasterdevlin' }],
  comments: [{ id: 1, body: 'some comment', postId: 1 }],
};

// Create server
const server = create({
  port: 3000,
  host: 'localhost',
  readOnly: false, // Allow all HTTP methods
  delay: 1000, // Add 1s delay to responses
  enableApiPrefix: true, // Enable /api/* prefix for all routes
});

// Create a custom route
server.addRoute('/custom-route', 'GET', (req, res) => {
  res.json({ message: 'This is a custom route' });
});

// Start server
server.loadDatabase('./db.json');
server.start().then(() => {
  console.log('JSON Server is running');
  console.log('Standard routes: http://localhost:3000/posts');
  console.log('API routes: http://localhost:3000/api/posts');
});
```

### Configuration Options

```typescript
interface ServerOptions {
  port: number; // Server port (default: 3000)
  host: string; // Server host (default: 'localhost')
  cors: boolean; // Enable CORS (default: true)
  static: string | string[]; // Static file paths
  middlewares: RequestHandler[]; // Custom middlewares
  bodyParser: boolean; // Enable body parsing (default: true)
  noCors: boolean; // Disable CORS (default: false)
  noGzip: boolean; // Disable gzip (default: false)
  delay: number; // Response delay in ms (default: 0)
  quiet: boolean; // Suppress logs (default: false)
  readOnly: boolean; // Read-only mode (default: false)
  enableApiPrefix: boolean; // Enable /api/* routes (default: false)
}
```

## Beautiful CLI Experience

One of the standout features of this implementation is the beautifully styled CLI interface, designed to make your development experience more enjoyable and informative.

### Server Status Display

When you start the server, you'll see a beautiful status banner with:

```
🚀 JSON Server is running

 http://localhost:3000 - API Root
 http://localhost:3000/db - Full Database

 Read Only: No
 API Prefix: Enabled
 CORS: Enabled

 ℹ️ Press Ctrl+C to stop the server
```

### Color-Coded Messages

All CLI messages are color-coded for better readability:

- 🟢 Green for success messages
- 🔵 Blue for informational messages
- 🟡 Yellow for warnings
- 🔴 Red for errors

### Visual Feedback for Key Events

```bash
💾 Database loaded: db.json (3 collections, 20 items)
🔀 Loaded 4 custom routes from routes.json
👀 Watching for changes: db.json
```

### Beautiful Help Display

The help command (`json-server --help`) provides a well-organized and colorful display of all available options:

```bash
⚡️ @webmasterdevlin/json-server ⚡️
A TypeScript-powered REST API mock server

Usage:
json-server [options] <source>

Options:
  --port, -p         Set port                                  [default: 3000]
  --host, -H         Set host                          [default: "localhost"]
  # ...more options...

Examples:
  json-server db.json
  json-server db.json --port 3001
  # ...more examples...
```

### Try It Yourself!

Experience the beautiful CLI interface by installing and running json-server:

```bash
npm install @webmasterdevlin/json-server
npx json-server db.json
```

## Development

### Prerequisites

- Node.js (v16.0.0 or higher)
- npm, yarn, pnpm, or bun

### Setup

```bash
# Clone the repository
git clone https://github.com/webmasterdevlin/json-server.git
cd json-server

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Real-World Examples

### Frontend Development with API Prefix

When developing a React/Vue/Angular application that will eventually connect to a backend API with `/api` routes:

```bash
# Start json-server with API prefix
json-server db.json --enable-api-prefix --port 3001

# Your frontend can now make requests to:
# http://localhost:3001/api/users
# http://localhost:3001/api/posts
# http://localhost:3001/api/comments
```

**Frontend code example:**

```javascript
// This will work with both your mock server and production API
const response = await fetch('/api/users');
const users = await response.json();
```

### Testing Different Network Conditions

```bash
# Simulate slow network
json-server db.json --api --delay 2000

# Test with different delays
json-server db.json --api --delay 500   # 500ms delay
json-server db.json --api --delay 1500  # 1.5s delay
```

### Safe Demo Mode

```bash
# Read-only mode with API prefix for demos
json-server db.json --api --read-only

# Only GET requests will work, perfect for demonstrations
```

## Contributing

Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

This project is inspired by the original [json-server](https://github.com/typicode/json-server) by webmasterdevlin, rewritten in TypeScript with additional features and improvements.

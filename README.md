# @webmasterdevlin/json-server

[![npm version](https://img.shields.io/npm/v/@webmasterdevlin/json-server.svg)](https://www.npmjs.com/package/@webmasterdevlin/json-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/webmasterdevlin/json-server/actions/workflows/ci.yml/badge.svg)](https://github.com/webmasterdevlin/json-server/actions)

A TypeScript implementation of json-server with additional features and comprehensive TypeScript types.

## Features

- Full TypeScript support with type definitions
- RESTful API endpoints from a JSON file or JavaScript object
- Configurable routes
- Support for multiple package managers (npm, yarn, pnpm, bun)
- CORS support
- Delay simulation for network latency testing
- Read-only mode
- Static file serving
- Custom middleware support
- Deno compatibility

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
  "posts": [{ "id": 1, "title": "json-server", "author": "typicode" }],
  "comments": [{ "id": 1, "body": "some comment", "postId": 1 }],
  "profile": { "name": "typicode" }
}
```

Start the JSON Server:

```bash
npx json-server db.json
```

Or use it from your package.json scripts:

```json
{
  "scripts": {
    "mock-api": "json-server db.json"
  }
}
```

Now if you go to http://localhost:3000/posts/1, you'll get:

```json
{ "id": 1, "title": "json-server", "author": "typicode" }
```

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
  --delay, -d        Add delay to responses (ms)                       [number]
  --id, -i           Set database id field                     [default: "id"]
  --foreignKeySuffix Set foreign key suffix               [default: "_id"]
  --quiet, -q        Suppress log messages                    [default: false]
  --help, -h         Show help                                        [boolean]
  --version, -v      Show version                                     [boolean]
```

## Filtering and Pagination

Use query parameters for filtering:

```
GET /posts?title=json-server&author=typicode
GET /posts?id=1&id=2
```

Pagination and sorting:

```
GET /posts?_page=1&_limit=10
GET /posts?_sort=title&_order=asc
GET /posts?_sort=title&_order=desc
```

## Programmatic Usage

```typescript
import { create } from '@webmasterdevlin/json-server';

// Database object
const data = {
  posts: [{ id: 1, title: 'json-server', author: 'typicode' }],
  comments: [{ id: 1, body: 'some comment', postId: 1 }],
};

// Create server
const server = create({
  port: 3000,
  host: 'localhost',
  readOnly: false, // Allow all HTTP methods
  delay: 1000, // Add 1s delay to responses
});

// Create a custom route
server.addRoute('/custom-route', 'GET', (req, res) => {
  res.json({ message: 'This is a custom route' });
});

// Start server
server.loadDatabase('./db.json');
server.start().then(() => {
  console.log('JSON Server is running');
});
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

## Contributing

Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

This project is inspired by the original [json-server](https://github.com/typicode/json-server) by typicode, rewritten in TypeScript with additional features and improvements.

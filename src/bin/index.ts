#!/usr/bin/env node

/**
 * @file Command Line Interface for json-server
 *
 * This file implements the CLI for the json-server package.
 * It parses command line arguments and starts a server instance
 * with the specified configuration.
 *
 * The CLI supports several features including:
 * - Database loading from local or remote files
 * - Custom routes and middleware
 * - API prefix support (/api/* routes)
 * - Delay simulation for network latency testing
 * - Read-only mode for safe demonstrations
 *
 * @author webmasterdevlin
 * @copyright MIT License
 */

import minimist from 'minimist';
import path from 'path';
import fs from 'fs';
import { createServer } from '../lib';
import { CliArgs, ServerOptions } from '../types';
import { fileExists } from '../utils/utils';

// Default server configuration
const DEFAULT_PORT = 3000;
const DEFAULT_HOST = 'localhost';

/**
 * Parse command line arguments into a structured object
 *
 * @returns Parsed command line arguments
 */
function parseArgs(): CliArgs {
  // Define aliases for command line arguments
  const aliases = {
    p: 'port',
    H: 'host',
    w: 'watch',
    r: 'routes',
    m: 'middlewares',
    s: 'static',
    d: 'delay',
    i: 'id',
    q: 'quiet',
    h: 'help',
    v: 'version',
    ro: 'read-only',
    nc: 'no-cors',
    ng: 'no-gzip',
    api: 'enable-api-prefix', // Short alias for enabling API prefix
  };

  // Parse command line arguments with minimist
  const argv = minimist(process.argv.slice(2), { alias: aliases });

  // Handle help flag
  if (argv.help) {
    showHelp();
    process.exit(0);
  }

  // Handle version flag
  if (argv.version) {
    showVersion();
    process.exit(0);
  }

  return argv;
}

/**
 * Display version information
 */
function showVersion(): void {
  try {
    const packageJsonPath = path.join(__dirname, '../../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    console.log(`@webmasterdevlin/json-server v${packageJson.version}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error reading package version:', errorMessage);
    process.exit(1);
  }
}

/**
 * Display help information with usage examples
 */
function showHelp(): void {
  console.log(`
╭───────────────────────────────────────────────────────────────────────────╮
│                                                                           │
│                   @webmasterdevlin/json-server CLI                        │
│                                                                           │
╰───────────────────────────────────────────────────────────────────────────╯

A TypeScript implementation of json-server with additional features.

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
  --enable-api-prefix, --api  Enable /api/* prefix            [default: false]
  --delay, -d        Add delay to responses (ms)                       [number]
  --id, -i           Set database id field                     [default: "id"]
  --foreignKeySuffix Set foreign key suffix               [default: "_id"]
  --quiet, -q        Suppress log messages                    [default: false]
  --help, -h         Show help                                        [boolean]
  --version, -v      Show version                                     [boolean]

Examples:
  json-server db.json
  json-server db.json --port 3001
  json-server db.json --watch
  json-server db.json --routes routes.json
  json-server db.json --routes routes.js
  json-server db.json --delay 1000
  json-server db.json --id _id
  json-server db.json --enable-api-prefix     # Enable /api/* routes
  json-server http://example.com/db.json

For more information, visit:
https://github.com/webmasterdevlin/json-server
  `);
}

/**
 * Get source file path from arguments
 *
 * @param args - Command line arguments
 * @returns Source file path or null if not found
 */
function getSourcePath(args: string[]): string | null {
  // Find the first argument that doesn't start with -
  const source = args.find((arg) => !arg.startsWith('-') && !arg.startsWith('--'));
  return source || null;
}

/**
 * Entry point for the CLI application
 */
async function main(): Promise<void> {
  try {
    const cliArgs = parseArgs();
    const args = process.argv.slice(2);

    // Get database source
    const source = getSourcePath(args);
    if (!source) {
      console.error('Error: No database source provided');
      showHelp();
      process.exit(1);
    }

    // Check if source file exists (if it's a local file)
    if (source.startsWith('http://') || source.startsWith('https://')) {
      console.log(`Using remote database: ${source}`);
    } else if (!fileExists(source)) {
      console.error(`Error: Database file not found: ${source}`);
      process.exit(1);
    }

    // Create server options from CLI arguments
    const options: ServerOptions = {
      port: cliArgs.port || DEFAULT_PORT,
      host: cliArgs.host || DEFAULT_HOST,
      cors: !(cliArgs['no-cors'] || false),
      static: cliArgs.static || [],
      middlewares: [],
      bodyParser: true,
      noCors: cliArgs['no-cors'] || false,
      noGzip: cliArgs['no-gzip'] || false,
      delay: cliArgs.delay || 0,
      quiet: cliArgs.quiet || false,
      readOnly: cliArgs['read-only'] || false,
      enableApiPrefix: cliArgs['enable-api-prefix'] || false, // Enable API prefix feature if specified
    };

    // Create and configure the server
    const server = createServer(options);

    // Set ID field if specified
    if (cliArgs.id) {
      server.setIdField(cliArgs.id);
    }

    // Load custom routes if specified
    if (cliArgs.routes) {
      if (!fileExists(cliArgs.routes)) {
        console.warn(`Warning: Routes file not found: ${cliArgs.routes}`);
      } else {
        server.loadRoutes(cliArgs.routes);
      }
    }

    // Load database from source file
    server.loadDatabase(source);

    // Start the server
    await server.start();

    // Set up file watcher if requested
    if (cliArgs.watch && !source.startsWith('http')) {
      setupFileWatcher(source, server);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error starting server:', errorMessage);
    process.exit(1);
  }
}

/**
 * Set up a file watcher for auto-reloading when the database changes
 *
 * @param dbPath - Path to the database file
 * @param server - Server instance
 */
function setupFileWatcher(dbPath: string, server: any): void {
  try {
    // Use Node's fs.watch API to monitor file changes
    fs.watch(dbPath, (eventType) => {
      if (eventType === 'change') {
        console.log(`Database file changed: ${dbPath}`);
        try {
          server.loadDatabase(dbPath);
          console.log('Database reloaded');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error('Error reloading database:', errorMessage);
        }
      }
    });

    console.log(`Watching for changes: ${dbPath}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error setting up file watcher:', errorMessage);
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT. Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM. Shutting down...');
  process.exit(0);
});

// Start the application
main().catch((error) => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});

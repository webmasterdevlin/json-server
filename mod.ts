/**
 * @file Deno entry point for @webmasterdevlin/json-server
 *
 * This module provides a Deno-compatible interface for json-server.
 * It can be used both as a CLI and as a programmatic API from Deno scripts.
 *
 * @example
 * // Run from command line:
 * // deno run --allow-read --allow-write --allow-net --allow-run mod.ts db.json --port 3001
 *
 * // Import programmatically:
 * // import { create } from "./mod.ts";
 * // const server = create({ port: 3000 });
 * // server.loadDatabase("./db.json");
 * // await server.start();
 *
 * @author webmasterdevlin
 * @copyright MIT License
 */

import { parse } from 'npm:minimist';
import { create, JsonServer, ServerOptions } from 'npm:@webmasterdevlin/json-server';

/**
 * Display help information for Deno usage
 */
function showHelp(): void {
  console.log(`
╭───────────────────────────────────────────────────────────────────────────╮
│                                                                           │
│               @webmasterdevlin/json-server for Deno                       │
│                                                                           │
╰───────────────────────────────────────────────────────────────────────────╯

Usage:
  deno run --allow-read --allow-write --allow-net --allow-run mod.ts [options] <source>

Options:
  --port, -p         Set port                                  [default: 3000]
  --host, -H         Set host                          [default: "localhost"]
  --routes, -r       Path to routes file                               [string]
  --delay, -d        Add delay to responses (ms)                       [number]
  --id, -i           Set database id field                     [default: "id"]
  --read-only, --ro  Allow only GET requests                  [default: false]
  --no-cors, --nc    Disable CORS                             [default: false]
  --quiet, -q        Suppress log messages                    [default: false]
  --help, -h         Show help                                        [boolean]
  --version, -v      Show version                                     [boolean]

Examples:
  deno run --allow-read --allow-write --allow-net --allow-run mod.ts db.json
  deno run --allow-read --allow-write --allow-net --allow-run mod.ts db.json --port 3001
  deno run --allow-read --allow-write --allow-net --allow-run mod.ts db.json --delay 500
  `);
}

/**
 * Check if the script is being run directly (not imported as a module)
 */
if (import.meta.main) {
  // Parse command line arguments
  const args = parse(Deno.args, {
    alias: {
      p: 'port',
      H: 'host',
      r: 'routes',
      d: 'delay',
      i: 'id',
      h: 'help',
      v: 'version',
      q: 'quiet',
      nc: 'no-cors',
      ro: 'read-only',
    },
  });

  // Display help if requested
  if (args.help) {
    showHelp();
    Deno.exit(0);
  }

  // Display version if requested
  if (args.version) {
    try {
      // Using dynamic import for version information
      const packageInfo = await import('npm:@webmasterdevlin/json-server/package.json', {
        assert: { type: 'json' },
      });
      console.log(`@webmasterdevlin/json-server v${packageInfo.default.version}`);
    } catch (error) {
      console.log('Version information not available');
    }
    Deno.exit(0);
  }

  // Get source file (database)
  const source = args._.length > 0 ? String(args._[0]) : null;

  if (!source) {
    console.error('Error: No database source provided');
    showHelp();
    Deno.exit(1);
  }

  // Check if source file exists
  try {
    await Deno.stat(source);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      console.error(`Error: Database file not found: ${source}`);
      Deno.exit(1);
    } else if (!(source.startsWith('http://') || source.startsWith('https://'))) {
      console.error(`Error accessing database file: ${error.message}`);
      Deno.exit(1);
    }
  }

  // Set up server options
  const options: ServerOptions = {
    port: args.port || 3000,
    host: args.host || 'localhost',
    cors: !args['no-cors'],
    static: [],
    middlewares: [],
    bodyParser: true,
    noCors: args['no-cors'] || false,
    noGzip: false,
    delay: args.delay || 0,
    quiet: args.quiet || false,
    readOnly: args['read-only'] || false,
  };

  try {
    // Create and configure server
    const server = create(options);

    // Set ID field if specified
    if (args.id) {
      server.setIdField(args.id);
    }

    // Load routes if specified
    if (args.routes) {
      try {
        server.loadRoutes(args.routes);
      } catch (error) {
        console.warn(`Warning: Failed to load routes: ${error.message}`);
      }
    }

    // Load database and start server
    server.loadDatabase(source);
    await server.start();

    // Handle process termination
    Deno.addSignalListener('SIGINT', () => {
      console.log('\nShutting down...');
      Deno.exit(0);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    Deno.exit(1);
  }
}

// Export all components for programmatic usage
export * from 'npm:@webmasterdevlin/json-server';

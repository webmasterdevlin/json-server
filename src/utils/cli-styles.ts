import chalk from 'chalk';

/**
 * CLI styling utility functions for beautiful terminal output
 */

export const styles = {
  // Preset color combinations
  primary: chalk.hex('#4834d4').bold,
  secondary: chalk.hex('#686de0'),
  success: chalk.hex('#6ab04c').bold,
  info: chalk.hex('#4bcffa'),
  warning: chalk.hex('#f9ca24').bold,
  error: chalk.hex('#eb4d4b').bold,
  highlight: chalk.hex('#be2edd').bold,
  muted: chalk.gray,

  // Structure elements
  header: chalk.hex('#4834d4').bold.underline,
  subheader: chalk.hex('#686de0').bold,
  border: chalk.hex('#686de0'),
  url: chalk.hex('#22a6b3').underline,
  label: chalk.hex('#009432').bold,
  key: chalk.hex('#f0932b'),
  value: chalk.white,
  command: chalk.hex('#eb4d4b'),
  code: chalk.hex('#f9ca24'),

  // Icons (emojis for better visibility)
  icons: {
    success: '✅',
    error: '❌',
    warning: '⚠️ ',
    info: 'ℹ️ ',
    server: '🚀',
    api: '🌐',
    database: '💾',
    routes: '🔀',
    config: '⚙️ ',
    watch: '👀',
    time: '⏱️',
    stop: '🛑',
    arrow: '➡️ ',
    star: '⭐',
  },
};

/**
 * Creates a colorful box around text
 *
 * @param title - Box title or null for no title
 * @param content - Content lines to display inside the box
 * @param type - Box type (default, success, error, warning)
 * @returns Formatted box string
 */
export function createBox(
  title: string | null,
  content: string[],
  type: 'default' | 'success' | 'error' | 'warning' = 'default'
): string {
  // Select colors based on type
  let boxColor, titleColor;

  switch (type) {
    case 'success':
      boxColor = styles.success;
      titleColor = styles.success;
      break;
    case 'error':
      boxColor = styles.error;
      titleColor = styles.error;
      break;
    case 'warning':
      boxColor = styles.warning;
      titleColor = styles.warning;
      break;
    default:
      boxColor = styles.border;
      titleColor = styles.primary;
  }

  // Calculate box width (minimum 40, or based on content)
  const contentMaxWidth = Math.max(...content.map((line) => stripAnsi(line).length), 0);
  const titleWidth = title ? stripAnsi(title).length + 4 : 0; // +4 for spaces and symbols
  const boxWidth = Math.max(40, contentMaxWidth + 4, titleWidth);

  // Prepare box elements
  const topBorder = boxColor('╭' + '─'.repeat(boxWidth - 2) + '╮');
  const bottomBorder = boxColor('╰' + '─'.repeat(boxWidth - 2) + '╯');
  let result = '';

  // Add top border
  result += topBorder + '\n';

  // Add title if provided
  if (title) {
    const padding = Math.floor((boxWidth - stripAnsi(title).length - 4) / 2);
    result +=
      boxColor('│') +
      ' '.repeat(padding) +
      titleColor(title) +
      ' '.repeat(boxWidth - padding - stripAnsi(title).length - 2) +
      boxColor('│') +
      '\n';
    result += boxColor('│') + ' '.repeat(boxWidth - 2) + boxColor('│') + '\n';
  }

  // Add content with proper padding
  for (const line of content) {
    const lineLength = stripAnsi(line).length;
    result +=
      boxColor('│') + ' ' + line + ' '.repeat(boxWidth - lineLength - 3) + boxColor('│') + '\n';
  }

  // Add bottom border
  result += bottomBorder;

  return result;
}

/**
 * Creates a branded header for the application
 *
 * @returns Formatted header string
 */
export function createHeader(): string {
  return `
${chalk.hex('#4834d4').bold('⚡️ @webmasterdevlin/json-server ⚡️')}
${chalk.hex('#686de0')('A TypeScript-powered REST API mock server')}
`;
}

/**
 * Creates a stylish server status banner
 *
 * @param host - Server host
 * @param port - Server port
 * @param options - Additional server options to display
 * @returns Formatted server status banner
 */
export function createServerBanner(
  host: string,
  port: number,
  options: Record<string, any> = {}
): string {
  // Create endpoints - keeping it simple regardless of host binding
  const endpoints = [
    `${styles.url(`http://localhost:${port}`)} - API Root`,
    `${styles.url(`http://localhost:${port}/db`)} - Full Database`,
  ];

  const settings = Object.entries(options).map(
    ([key, value]) => `${styles.key(key)}: ${styles.value(String(value))}`
  );

  return createBox(
    '🚀 JSON Server is running',
    [
      '',
      ...endpoints,
      '',
      ...settings,
      '',
      `${styles.icons.info} ${styles.info('Press Ctrl+C to stop the server')}`,
      '',
    ],
    'success'
  );
}

/**
 * Format error message with nice styling
 *
 * @param title - Error title
 * @param message - Error message
 * @param details - Optional error details
 * @returns Formatted error message
 */
export function formatError(title: string, message: string, details?: string): string {
  const content = ['', `${styles.error(title)}`, '', `${styles.muted(message)}`];

  if (details) {
    content.push('');
    content.push(styles.muted(details));
  }

  content.push('');

  return createBox(null, content, 'error');
}

/**
 * Format a list of items with bullets and styling
 *
 * @param items - Array of items to format
 * @param icon - Optional icon to use as bullet
 * @returns Formatted list
 */
export function formatList(items: string[], icon: string = '•'): string {
  return items.map((item) => `${styles.info(icon)} ${item}`).join('\n');
}

/**
 * Format help sections for CLI help display
 *
 * @param sections - Record of section title -> content
 * @returns Formatted help text
 */
export function formatHelp(sections: Record<string, string>): string {
  let result = createHeader();

  Object.entries(sections).forEach(([title, content]) => {
    result += '\n' + styles.header(title) + '\n\n';
    result += content + '\n';
  });

  return result;
}

/**
 * Strip ANSI color codes from string for length calculations
 * Simple implementation that handles basic ANSI codes
 *
 * @param str - String with ANSI color codes
 * @returns String without ANSI codes
 */
function stripAnsi(str: string): string {
  return str.replace(/\x1B\[\d+m/g, '');
}

/**
 * Format a database summary
 *
 * @param dbPath - Path to the database file
 * @param collections - Number of collections
 * @param itemCount - Total number of items
 * @returns Formatted database summary
 */
export function formatDatabaseSummary(
  dbPath: string,
  collections: number,
  itemCount: number
): string {
  return `${styles.icons.database} ${styles.success('Database loaded:')} ${styles.highlight(dbPath)} ${styles.muted(`(${collections} collections, ${itemCount} items)`)}`;
}

/**
 * Format a route registration message
 *
 * @param method - HTTP method
 * @param path - Route path
 * @param target - Optional target path if it's a redirect
 * @returns Formatted route message
 */
export function formatRouteRegistration(method: string, path: string, target?: string): string {
  let message = `${styles.icons.routes} ${styles.label(method.toUpperCase())} ${styles.info(path)}`;

  if (target) {
    message += ` ${styles.icons.arrow} ${styles.secondary(target)}`;
  }

  return message;
}

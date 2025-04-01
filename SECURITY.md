# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of our project seriously. If you believe you've found a security vulnerability, please follow these steps:

1. **Do Not Open a Public Issue**

   - Security vulnerabilities should not be reported through our public issue tracker.

2. **Email the Project Maintainer**

   - Send an email to security@example.com (replace with your actual contact email)
   - Include as much information as possible about the vulnerability
   - If possible, include steps to reproduce the issue

3. **Response Time**

   - We will acknowledge receipt of your vulnerability report within 48 hours
   - We will send you regular updates about our progress

4. **Disclosure Policy**
   - Once we have addressed the vulnerability, we will notify you
   - We will publicly disclose the vulnerability after it has been fixed
   - We will credit you for discovering the vulnerability (unless you prefer to remain anonymous)

## Security Best Practices for Users

When using this library:

1. **Keep Dependencies Updated**

   - Always use the latest version of @webmasterdevlin/json-server
   - Regularly check for updates of all your dependencies

2. **Production Usage Caution**

   - This tool is primarily intended for development and testing environments
   - If used in production, implement proper authentication and authorization
   - Consider putting the server behind a reverse proxy or API gateway

3. **Data Exposure**

   - Be careful about what data you include in your JSON database files
   - Don't include sensitive or personal information in development databases

4. **Network Security**

   - Consider restricting access to the server to localhost when not needed externally
   - Use the `--host` option to bind to specific interfaces only when required

5. **Read-Only Mode**
   - When possible, use the `--read-only` flag to prevent data modifications

## Security-Related Configuration

```typescript
// Secure configuration example
import { create } from '@webmasterdevlin/json-server';

const server = create({
  // Bind only to localhost for development
  host: 'localhost',

  // Enable read-only mode to prevent data modifications
  readOnly: true,

  // Disable CORS for more security when not needed
  noCors: true,
});

server.loadDatabase('./safe-db.json');
server.start();
```

Thank you for helping keep this project and its users secure!

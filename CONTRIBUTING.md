# Contributing to @webmasterdevlin/json-server

Thank you for considering contributing to this project! This document outlines the process and guidelines for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to see if the problem has already been reported. If it has and the issue is still open, add a comment to the existing issue instead of opening a new one.

When you are creating a bug report, please include as many details as possible:

- Use a clear and descriptive title
- Describe the exact steps to reproduce the problem
- Provide specific examples to demonstrate the steps
- Describe the behavior you observed after following the steps
- Explain which behavior you expected to see instead and why
- Include screenshots or animated GIFs if possible
- Include details about your environment (OS, Node.js version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When you are creating an enhancement suggestion, please include as many details as possible:

- Use a clear and descriptive title
- Provide a step-by-step description of the suggested enhancement
- Provide specific examples to demonstrate the steps or point out the part of code which the suggestion applies to
- Explain why this enhancement would be useful to most users
- List some other applications where this enhancement exists, if applicable

### Pull Requests

The process described here has several goals:

- Maintain project quality
- Fix problems that are important to users
- Engage the community in working toward the best possible version of the project
- Enable a sustainable system for the project's maintainers to review contributions

Please follow these steps to have your contribution considered by the maintainers:

1. Follow all instructions in the pull request template
2. Follow the styleguides
3. After you submit your pull request, verify that all status checks are passing

While the prerequisites above must be satisfied prior to having your pull request reviewed, the reviewer(s) may ask you to complete additional design work, tests, or other changes before your pull request can be ultimately accepted.

## Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line
- When only changing documentation, include `[docs]` in the commit title
- Consider starting the commit message with an applicable emoji:
  - 🎨 `:art:` when improving the format/structure of the code
  - 🐎 `:racehorse:` when improving performance
  - 🚱 `:non-potable_water:` when plugging memory leaks
  - 📝 `:memo:` when writing docs
  - 🐛 `:bug:` when fixing a bug
  - 🔥 `:fire:` when removing code or files
  - 💚 `:green_heart:` when fixing the CI build
  - ✅ `:white_check_mark:` when adding tests
  - 🔒 `:lock:` when dealing with security
  - ⬆️ `:arrow_up:` when upgrading dependencies
  - ⬇️ `:arrow_down:` when downgrading dependencies
  - 👕 `:shirt:` when removing linter warnings

### JavaScript/TypeScript Styleguide

All JavaScript/TypeScript code is linted with [ESLint](https://eslint.org/) and formatted with [Prettier](https://prettier.io/).

- Use camelCase for variable names, function names, method names, and file names
- Prefer const over let, and avoid var
- Use explicit types in TypeScript wherever possible
- Document all public methods and classes with JSDoc comments
- Use async/await instead of callbacks where possible
- Avoid using any type in TypeScript unless absolutely necessary

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Run tests: `npm test`

### Development Workflow

1. Create a new branch for your changes (`git checkout -b feature/amazing-feature`)
2. Make your changes
3. Add tests for your changes
4. Make sure all tests pass: `npm test`
5. Make sure your code follows the style guidelines: `npm run lint`
6. Commit your changes with a descriptive message
7. Push to your branch: `git push origin feature/amazing-feature`
8. Create a pull request

### Package Manager Support

This project supports multiple package managers. You can use any of the following:

- **npm**: Standard commands (`npm install`, `npm test`, etc.)
- **yarn**: Use the `yarn:` prefix for scripts (`yarn:build`, `yarn:test`, etc.)
- **pnpm**: Use the `pnpm:` prefix for scripts (`pnpm:build`, `pnpm:test`, etc.)
- **bun**: Use the `bun:` prefix for scripts (`bun:build`, `bun:test`, etc.)

## Testing

We use [Jest](https://jestjs.io/) for testing. Please write tests for your new features or bug fixes.

- Run all tests: `npm test`
- Run tests in watch mode: `npm run test:watch`
- Generate coverage report: `npm run test:coverage`

## Additional Notes

### Issue and Pull Request Labels

| Label name         | Description                                          |
| ------------------ | ---------------------------------------------------- |
| `bug`              | Confirmed bugs or reports that are likely to be bugs |
| `feature`          | Feature requests                                     |
| `documentation`    | Documentation-related changes                        |
| `good first issue` | Good for newcomers                                   |
| `help wanted`      | Extra attention is needed                            |
| `question`         | Questions about the project                          |
| `security`         | Security-related issues                              |

## Thank You!

Your contributions to open source, large or small, make projects like this possible. Thank you for taking the time to contribute.

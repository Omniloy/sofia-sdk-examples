# Contributing to Sofia SDK Examples

Thank you for your interest in contributing! This repository contains integration examples for the Sofia SDK. We welcome bug reports, documentation improvements, and new integration examples.

## Reporting Issues

- Use [GitHub Issues](https://github.com/omniloy/sofia-sdk-examples/issues) with the appropriate template (bug, feature, question).
- Include the framework, Node.js version, and steps to reproduce.

## Development Setup

1. Clone the repo and install Node.js 22+ (see `.nvmrc`):
   ```bash
   git clone https://github.com/omniloy/sofia-sdk-examples.git
   nvm use
   ```

2. Install and run any example:
   ```bash
   cd examples/vanilla-ts   # or angular, angularjs
   npm install
   npm run dev
   ```

3. Install root-level hooks (for secret scanning):
   ```bash
   npm install   # in repo root
   ```

## Pull Requests

1. Fork the repo and create a branch from `main`.
2. Make your changes in the relevant example directory.
3. Ensure the example builds without errors (`npm run build`).
4. Keep the dev console UI consistent across all three examples (see `CLAUDE.md` for requirements).
5. Do **not** commit real API keys or credentials — use placeholder values.
6. Open a pull request with a clear description of the change.

## Code Style

- Follow existing patterns in each example.
- Use lowercase HTML attributes for the `<sofia-sdk>` web component (`baseurl`, not `baseUrl`).
- Do not use deprecated SDK properties (see `CLAUDE.md` for the full list).

## Security

If you discover a security vulnerability, please report it privately. See [SECURITY.md](./SECURITY.md) for details.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

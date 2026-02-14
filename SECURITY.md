# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| latest  | Yes       |

## Reporting a Vulnerability

If you discover a security vulnerability in this repository, **please do not open a public issue**.

Instead, report it privately via email:

- **Email**: [enrique.alcazar@omniloy.com](mailto:enrique.alcazar@omniloy.com)
- **Subject**: `[SECURITY] sofia-sdk-examples — <brief description>`

We will acknowledge your report within 48 hours and provide a timeline for a fix.

## Security Measures

This repository uses the following security measures:

- **Pre-commit hooks**: [Trivy](https://trivy.dev/) for vulnerability scanning and [GitLeaks](https://gitleaks.io/) for secret detection.
- **Gitignore**: Environment files with credentials are excluded from version control.
- **SRI hashes**: CDN-loaded scripts include Subresource Integrity (SRI) attributes.
- **Placeholder values**: Example files use `YOUR_*` placeholders instead of real credentials.

## Best Practices for Contributors

- Never commit real API keys, tokens, or credentials.
- Use the `.example` environment files as templates.
- Run `npm run security` from the repo root before submitting a PR.

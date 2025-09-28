# Security Policy

## GitHub Actions Security

This repository follows security best practices for GitHub Actions workflows:

### Permissions

All workflows in this repository explicitly specify minimal permissions using the `permissions` keyword:

- **Node.js CI** (`.github/workflows/node.js.yml`): 
  - `contents: read` - Required for checking out repository code
  - All other permissions are implicitly denied

- **DocSearch Scraper** (`.github/workflows/scrape.yml`):
  - `contents: read` - Required for checking out repository code and reading configuration files
  - All other permissions are implicitly denied

### Why This Matters

By explicitly setting minimal permissions, we:

1. **Follow the Principle of Least Privilege**: Workflows only get the permissions they actually need
2. **Reduce Attack Surface**: Prevents potential security issues if workflow files are compromised
3. **Improve Auditability**: Makes it clear what permissions each workflow requires
4. **Prevent Privilege Escalation**: Ensures workflows cannot perform unexpected actions

### Default vs Explicit Permissions

Without explicit permissions, GitHub Actions workflows receive broad default permissions including:
- `actions: write`
- `checks: write` 
- `contents: write`
- `deployments: write`
- `id-token: write`
- `issues: write`
- `discussions: write`
- `packages: write`
- `pages: write`
- `pull-requests: write`
- `repository-projects: write`
- `security-events: write`
- `statuses: write`

Our workflows only need `contents: read`, so all other permissions are denied.

## Reporting Security Issues

If you discover a security vulnerability, please report it privately via GitHub's security advisory process rather than creating a public issue.
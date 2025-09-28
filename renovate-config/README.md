# @ykzts/renovate-config

Shared Renovate configuration for repository maintenance and dependency updates.

## Purpose

This package provides a centralized Renovate configuration that automates dependency updates across the ykzts monorepo and related projects. It includes best practices for dependency management, security updates, and semantic versioning compliance to maintain code quality and security.

## Usage

The configuration is designed to be extended by other projects:

```json
{
  "extends": ["github>ykzts/ykzts//renovate-config"]
}
```

### Configuration Features

- **Best Practices**: Extends Renovate's recommended best practices
- **Semantic Commits**: Automatically generates conventional commit messages
- **Grouped Updates**: Intelligently groups related dependencies
- **Security Alerts**: Enables vulnerability alerts with proper labeling
- **Custom Datasources**: Support for specialized update sources

### Validation

```bash
pnpm validate  # Validates configuration syntax and rules
```

## Dependencies

### Internal Dependencies
None - this is a configuration-only package

### External Dependencies
- `renovate` (dev): Configuration validation tool

## Configuration Details

### Update Strategies
- **Patch/Minor Combining**: Groups non-breaking updates together
- **Major Separation**: Handles major version updates separately
- **Lock File Maintenance**: Weekly updates for package-lock files
- **Immediate PRs**: Creates pull requests without delay

### Specialized Groupings
- **Docker Containers**: Groups container updates by project (Immich, Mastodon)
- **Terraform Providers**: Groups Google Cloud provider updates
- **Build Tools**: Special handling for development and build dependencies

### Security & Quality
- **Vulnerability Alerts**: Automatic security update labeling
- **Preserve Semver**: Maintains existing version range patterns
- **Dependency Dashboard**: Centralized overview of pending updates
- **Conflict Resolution**: Automatic rebase when conflicts occur

## Supported Ecosystems

- **Node.js**: npm, pnpm, yarn package management
- **Docker**: Container image updates
- **Terraform**: Infrastructure provider updates
- **GitHub Actions**: Workflow dependency updates
- **Go Modules**: Go dependency management with tidying
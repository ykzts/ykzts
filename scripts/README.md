# Package Age Check Script

This script validates that newly added dependencies meet a minimum release age requirement, similar to Renovate's `minimumReleaseAge` setting but for direct pnpm operations.

## Purpose

The `check-package-age` script helps prevent installing packages that were published too recently. This provides an additional safety layer when updating dependencies outside of Renovate, helping to:

- Avoid packages with critical bugs discovered shortly after release
- Give the community time to identify issues
- Reduce the risk of supply chain attacks through compromised packages
- Complement Renovate's `minimumReleaseAge` setting (currently 3 days) with a shorter threshold for manual updates

## Usage

### Basic Usage

Check packages that have been added or changed since the main branch:

```bash
pnpm check:package-age
```

### Check All Packages

Check all packages in the lockfile (limited to first 50 for performance):

```bash
pnpm check:package-age --check-all
```

### Custom Minimum Age

Set a different minimum age threshold (in hours):

```bash
# Check for packages younger than 48 hours
pnpm check:package-age --minimum-age=48

# Check for packages younger than 12 hours
pnpm check:package-age --minimum-age=12
```

### Fail on New Packages

Exit with an error code if packages younger than the threshold are found (useful for CI):

```bash
pnpm check:package-age --fail-on-new
```

## Configuration

### Default Settings

- **Minimum Release Age**: 24 hours (1 day)
- **Check Mode**: Only changed packages (compared to origin/main)
- **Behavior**: Warnings only (does not block installation)

### Comparison with Renovate

| Setting | Renovate | check-package-age |
|---------|----------|-------------------|
| Minimum Age | 3 days | 1 day (default) |
| Scope | Automated PRs | Manual updates |
| Enforcement | Blocks PRs | Warnings only |

The shorter minimum age (24 hours vs 3 days) allows for faster manual updates while still providing safety against very recent releases.

## How It Works

1. Parses `pnpm-lock.yaml` to identify packages
2. Compares with `origin/main` to find newly added packages (or checks all if git comparison fails)
3. Queries the npm registry for each package's publish date
4. Warns about packages published within the minimum age threshold
5. Returns exit code 0 (success with warnings) or 1 (failure if --fail-on-new is used)

## Example Output

```
Checking for packages published within the last 24 hours...

Checking newly added packages...

Found 5 package(s) to check

⚠️  Warning: Found 1 package(s) published within the last 24 hours:

  • example-package@1.2.3
    Published: 2024-01-15T10:30:00.000Z
    Age: 8 hours (minimum required: 24 hours)

Consider waiting before using these packages in production to ensure stability.
```

## Integration with CI/CD

You can add this check to your CI pipeline to enforce minimum package ages:

```yaml
# .github/workflows/ci.yml
- name: Check package ages
  run: pnpm check:package-age --fail-on-new
```

## Limitations

- Checks only npm registry packages (not git dependencies, workspace packages, or local paths)
- Network requests to npm registry may be slow for large lockfiles (limited to 50 packages with --check-all)
- Does not prevent installation, only provides warnings (by design)
- Requires git repository to detect changed packages

## See Also

- [Renovate minimumReleaseAge documentation](https://docs.renovatebot.com/configuration-options/#minimumreleaseage)
- [pnpm documentation](https://pnpm.io/)

#!/usr/bin/env node
/**
 * check-package-age.js
 *
 * Validates that newly added dependencies meet the minimumReleaseAge requirement.
 * Similar to Renovate's minimumReleaseAge but for direct pnpm operations.
 *
 * Usage:
 *   node scripts/check-package-age.js [options]
 *
 * Options:
 *   --minimum-age=<hours>  Minimum age in hours (default: 24)
 *   --check-all            Check all dependencies (default: only check changed ones)
 *   --fail-on-new          Exit with error if new packages are found (default: warning only)
 */

const https = require('node:https')
const { execSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

// Configuration
const args = process.argv.slice(2)
const MINIMUM_RELEASE_AGE_HOURS = parseInt(
  args.find((arg) => arg.startsWith('--minimum-age'))?.split('=')[1] || '24',
  10
)
const CHECK_ALL = args.includes('--check-all')
const FAIL_ON_NEW = args.includes('--fail-on-new')
const MINIMUM_RELEASE_AGE_MS = MINIMUM_RELEASE_AGE_HOURS * 60 * 60 * 1000

console.log(
  `Checking for packages published within the last ${MINIMUM_RELEASE_AGE_HOURS} hours...\n`
)

/**
 * Fetch package metadata from npm registry
 */
function fetchPackagePublishDate(packageName, version) {
  return new Promise((resolve, reject) => {
    const url = `https://registry.npmjs.org/${encodeURIComponent(packageName).replace('%2F', '/')}`

    const req = https.get(url, { timeout: 10000 }, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const pkg = JSON.parse(data)
            const publishDate = pkg.time?.[version]

            if (publishDate) {
              resolve(new Date(publishDate))
              return
            }
          }
          resolve(null)
        } catch (error) {
          reject(error)
        }
      })
    })

    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })
  })
}

/**
 * Parse pnpm lockfile to get list of packages
 */
function parsePackagesFromLockfile() {
  try {
    const lockfilePath = path.join(process.cwd(), 'pnpm-lock.yaml')
    const lockfileContent = fs.readFileSync(lockfilePath, 'utf-8')

    const packages = []
    const lines = lockfileContent.split('\n')
    let inPackagesSection = false

    for (const line of lines) {
      if (line.startsWith('packages:')) {
        inPackagesSection = true
        continue
      }

      if (inPackagesSection && line.match(/^[^ ]/)) {
        // Exited packages section
        break
      }

      if (inPackagesSection && line.match(/^ {2}'[^']+':$/)) {
        const match = line.match(/^ {2}'([^']+)':$/)
        if (match) {
          const pkgId = match[1]
          let packageName, version

          // Handle scoped packages (@scope/name@version)
          if (pkgId.startsWith('@')) {
            const lastAtIndex = pkgId.lastIndexOf('@')
            if (lastAtIndex > 0) {
              packageName = pkgId.substring(0, lastAtIndex)
              version = pkgId.substring(lastAtIndex + 1)
            }
          } else {
            // Handle regular packages (name@version)
            const atIndex = pkgId.indexOf('@')
            if (atIndex > 0) {
              packageName = pkgId.substring(0, atIndex)
              version = pkgId.substring(atIndex + 1)
            }
          }

          if (packageName && version) {
            packages.push({ name: packageName, version })
          }
        }
      }
    }

    return packages
  } catch (error) {
    console.error('Error reading lockfile:', error.message)
    return []
  }
}

/**
 * Get changed packages by comparing with main branch
 */
function getChangedPackages() {
  try {
    // Check if we're in a git repository
    execSync('git rev-parse --git-dir', { stdio: 'ignore' })

    // Get the diff of pnpm-lock.yaml
    const diff = execSync('git diff origin/main HEAD -- pnpm-lock.yaml', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore']
    })

    const changedPackages = []
    const lines = diff.split('\n')

    for (const line of lines) {
      // Look for added package lines (starting with +)
      if (line.match(/^\+ {2}'[^']+':$/)) {
        const match = line.match(/^\+ {2}'([^']+)':$/)
        if (match) {
          const pkgId = match[1]
          let packageName, version

          // Handle scoped packages
          if (pkgId.startsWith('@')) {
            const lastAtIndex = pkgId.lastIndexOf('@')
            if (lastAtIndex > 0) {
              packageName = pkgId.substring(0, lastAtIndex)
              version = pkgId.substring(lastAtIndex + 1)
            }
          } else {
            const atIndex = pkgId.indexOf('@')
            if (atIndex > 0) {
              packageName = pkgId.substring(0, atIndex)
              version = pkgId.substring(atIndex + 1)
            }
          }

          if (packageName && version) {
            changedPackages.push({ name: packageName, version })
          }
        }
      }
    }

    return changedPackages
  } catch (error) {
    console.warn('Could not get changed packages:', error.message)
    console.warn('Falling back to checking all packages\n')
    return null
  }
}

/**
 * Check packages for recent publishes
 */
async function checkPackages(packages) {
  const warnings = []
  const checked = new Set()

  for (const pkg of packages) {
    const key = `${pkg.name}@${pkg.version}`

    if (checked.has(key)) {
      continue
    }
    checked.add(key)

    try {
      const publishDate = await fetchPackagePublishDate(pkg.name, pkg.version)

      if (publishDate) {
        const ageMs = Date.now() - publishDate.getTime()
        const ageInHours = Math.floor(ageMs / (60 * 60 * 1000))

        if (ageMs < MINIMUM_RELEASE_AGE_MS) {
          warnings.push({
            ageInHours,
            name: pkg.name,
            publishDate,
            version: pkg.version
          })
        }
      }
    } catch (error) {
      // Skip packages that can't be checked
      console.warn(
        `  ⚠ Could not check ${pkg.name}@${pkg.version}: ${error.message}`
      )
    }
  }

  return warnings
}

/**
 * Main execution
 */
async function main() {
  let packagesToCheck

  if (CHECK_ALL) {
    console.log('Checking all packages in lockfile...\n')
    packagesToCheck = parsePackagesFromLockfile()
  } else {
    console.log('Checking newly added packages...\n')
    packagesToCheck = getChangedPackages()

    if (!packagesToCheck) {
      packagesToCheck = parsePackagesFromLockfile()
    }
  }

  if (packagesToCheck.length === 0) {
    console.log('✓ No packages to check\n')
    return 0
  }

  console.log(`Found ${packagesToCheck.length} package(s) to check\n`)

  // Limit the number of packages to check to avoid rate limiting
  const maxToCheck = CHECK_ALL ? 50 : Math.min(10, packagesToCheck.length)
  const packagesSubset = packagesToCheck.slice(0, maxToCheck)

  if (packagesToCheck.length > maxToCheck) {
    console.log(`  (Limiting check to first ${maxToCheck} packages)\n`)
  }

  const warnings = await checkPackages(packagesSubset)

  if (warnings.length > 0) {
    console.log(
      `⚠️  Warning: Found ${warnings.length} package(s) published within the last ${MINIMUM_RELEASE_AGE_HOURS} hours:\n`
    )

    for (const warning of warnings) {
      console.log(`  • ${warning.name}@${warning.version}`)
      console.log(`    Published: ${warning.publishDate.toISOString()}`)
      console.log(
        `    Age: ${warning.ageInHours} hours (minimum required: ${MINIMUM_RELEASE_AGE_HOURS} hours)`
      )
      console.log('')
    }

    console.log(
      'Consider waiting before using these packages in production to ensure stability.\n'
    )

    if (FAIL_ON_NEW) {
      return 1
    }
  } else {
    console.log(
      `✓ All checked packages meet the minimum release age of ${MINIMUM_RELEASE_AGE_HOURS} hours\n`
    )
  }

  return 0
}

// Run the script
main()
  .then((exitCode) => {
    process.exit(exitCode)
  })
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })

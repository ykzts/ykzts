import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test.describe('Accessibility Tests', () => {
  test('homepage should not have any automatically detectable WCAG A/AA violations', async ({
    page
  }) => {
    await page.goto('/')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('homepage should have proper keyboard navigation', async ({ page }) => {
    await page.goto('/')

    // Test skip link functionality
    await page.keyboard.press('Tab')
    const skipLink = page.locator('.skip-link:focus, [href="#content"]:focus')
    await expect(skipLink).toBeVisible()

    // Verify skip link text
    const skipLinkText = await skipLink.textContent()
    expect(skipLinkText).toContain('メインコンテンツにスキップ')

    // Verify skip link navigates to main content
    await skipLink.click()
    const mainContent = page.locator('#content')
    await expect(mainContent).toBeVisible()
  })

  test('homepage should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/')

    // Should have exactly one h1
    const h1Elements = page.locator('h1')
    await expect(h1Elements).toHaveCount(1)
    const h1Text = await h1Elements.first().textContent()
    expect(h1Text).toContain('Test User')

    // Should have h2 elements for sections
    const h2Elements = page.locator('h2')
    const h2Count = await h2Elements.count()
    expect(h2Count).toBeGreaterThan(0)
  })

  test('homepage should have proper ARIA labels on interactive elements', async ({
    page
  }) => {
    await page.goto('/')

    // Check navigation skip link
    const skipLink = page.locator('[href="#content"]')
    await expect(skipLink).toBeVisible()

    // Check social media links have proper aria-labels
    const socialLinks = page.locator('[aria-label*="Test Userの"]')
    const socialLinkCount = await socialLinks.count()
    expect(socialLinkCount).toBeGreaterThan(0)
  })

  test('homepage should have all images with alt attributes', async ({
    page
  }) => {
    await page.goto('/')

    // Get all images
    const images = page.locator('img')
    const imageCount = await images.count()

    // Check each image has an alt attribute
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const altAttribute = await img.getAttribute('alt')
      expect(altAttribute).not.toBeNull()
    }
  })

  test('homepage should have proper main landmark', async ({ page }) => {
    await page.goto('/')

    // Check for main element with proper id
    const main = page.locator('main#content')
    await expect(main).toBeVisible()
  })

  test('homepage interactive elements should have visible focus indicators', async ({
    page
  }) => {
    await page.goto('/')

    // Test focus on skip link
    await page.keyboard.press('Tab')
    const skipLink = page.locator('.skip-link:focus, [href="#content"]:focus')
    await expect(skipLink).toBeVisible()

    // Check focus indicator is visible (outline should be present)
    const outlineColor = await skipLink.evaluate((el) =>
      window.getComputedStyle(el).getPropertyValue('outline-color')
    )
    // Outline color should not be transparent or the same as background
    expect(outlineColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(outlineColor).not.toBe('transparent')
  })

  test('homepage color contrast should meet WCAG AA standards', async ({
    page
  }) => {
    await page.goto('/')

    // Run with only color-contrast enabled
    const contrastResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze()

    expect(contrastResults.violations).toEqual([])
  })
})

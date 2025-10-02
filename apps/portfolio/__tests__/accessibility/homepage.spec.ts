import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

// Mock data for Sanity works
const mockWorks = [
  {
    content: [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'Sample work description' }]
      }
    ],
    slug: 'sample-work',
    title: 'Sample Work'
  }
]

// Mock data for Sanity profile
const mockProfile = {
  bio: 'Software developer specializing in web applications.',
  bioJa:
    '山岸和利に対するお問い合わせやご依頼はメールからお願いします。スケジュール次第ではありますが有期もしくは案件単位での作業依頼や技術相談でしたら有償で承ります。\n\nただし無償もしくは報酬が不明瞭な依頼に関してはお応えできかねます。また依頼主が不明であるスカウトメールやオファーメールにつきましてはご返答いたしかねますのであらかじめご容赦ください。',
  email: 'ykzts@desire.sh',
  name: 'Yamagishi Kazutoshi',
  nameJa: '山岸和利',
  socialLinks: [
    {
      labelJa: '山岸和利のGitHubアカウント',
      platform: 'GitHub',
      url: 'https://github.com/ykzts'
    },
    {
      labelJa: '山岸和利のXアカウント',
      platform: 'X',
      url: 'https://x.com/ykzts'
    }
  ],
  tagline: 'Software Developer',
  taglineJa: 'ソフトウェア開発者'
}

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept Sanity API calls and return mock data
    await page.route('**/cdn.sanity.io/**', async (route) => {
      const url = route.request().url()
      // Handle different query types
      if (url.includes('profile')) {
        await route.fulfill({
          body: JSON.stringify({ result: mockProfile }),
          contentType: 'application/json',
          status: 200
        })
      } else {
        await route.fulfill({
          body: JSON.stringify({ result: mockWorks }),
          contentType: 'application/json',
          status: 200
        })
      }
    })

    // Also handle direct API calls
    await page.route('**/*sanity*/**', async (route) => {
      const url = route.request().url()
      if (url.includes('profile')) {
        await route.fulfill({
          body: JSON.stringify({ result: mockProfile }),
          contentType: 'application/json',
          status: 200
        })
      } else {
        await route.fulfill({
          body: JSON.stringify({ result: mockWorks }),
          contentType: 'application/json',
          status: 200
        })
      }
    })
  })

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
    expect(h1Text).toContain('ykzts')

    // Should have h2 elements for sections
    const h2Elements = page.locator('h2')
    const h2Count = await h2Elements.count()
    expect(h2Count).toBeGreaterThan(0)
  })

  test('homepage should have proper ARIA labels on interactive elements', async ({
    page
  }) => {
    await page.goto('/')

    // Check arrow link has proper aria-label
    const arrowLink = page.locator('[aria-label*="コンテンツ"]')
    await expect(arrowLink).toBeVisible()

    // Check social media links have proper aria-labels
    const socialLinks = page.locator('[aria-label*="山岸和利の"]')
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

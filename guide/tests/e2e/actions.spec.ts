import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const PAGE = '/onboarding/complete-onboarding'
const section = (page: Page, id: string) => page.locator(`[data-guide-section-id="${id}"]`)

async function seriousViolations(page: Page) {
  // Excluded: Docus theme markup we don't own (footer separator wrapping links; search button aria-label "Search…").
  const { violations } = await new AxeBuilder({ page })
    .exclude('[role=separator][data-slot=root]')
    .exclude('button[aria-label="Search…"]')
    .analyze()
  return violations.filter(v => v.impact === 'serious' || v.impact === 'critical').map(v => `${v.id}: ${v.nodes.map(n => n.target).join(', ')}`)
}

test.describe('Question', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] })
  test('builds a prompt from the clicked section and copies it', async ({ page }) => {
    await page.goto(PAGE)
    await section(page, 'onboarding-complete-handler').getByRole('button', { name: /Question about/ }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Your question').fill('Why is there a transaction?')
    await dialog.getByRole('button', { name: 'Build prompt' }).click()
    const preview = dialog.getByTestId('prompt-preview')
    await expect(preview).toContainText('Section id: onboarding-complete-handler')
    await expect(preview).toContainText('defineEventHandler')
    await expect(preview).toContainText('Why is there a transaction?')
    await expect(preview).toContainText('Stack: Nuxt/Nitro, Drizzle, Zod, PostgreSQL')
    await expect(preview).not.toContainText('onboarding-complete-verify')
    await expect(dialog.getByTestId('privacy-notice')).toBeVisible()
    expect(await seriousViolations(page)).toEqual([])
    await dialog.getByRole('button', { name: 'Copy prompt' }).click()
    await expect(dialog.getByRole('status')).toHaveText('Copied')
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('<<<USER_INPUT_START>>>\nWhy is there a transaction?')
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })
})

test.describe('Report', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] })
  test('builds a troubleshooting prompt with expected vs actual', async ({ page }) => {
    await page.goto(PAGE)
    await section(page, 'onboarding-complete-handler').getByRole('button', { name: /Report a problem/ }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('What happened?').fill('I got a 403')
    await dialog.getByLabel('Error text (optional)').fill('EMAIL_NOT_VERIFIED')
    await dialog.getByRole('button', { name: 'Build report' }).click()
    const preview = dialog.getByTestId('prompt-preview')
    await expect(preview).toContainText("Expected result: 200 with { status: 'completed', nextStep: null, selections }")
    await expect(preview).toContainText('What happened: I got a 403')
    await expect(preview).toContainText('Error text: EMAIL_NOT_VERIFIED')
    await expect(preview).toContainText('Steps taken: not provided')
    expect(await seriousViolations(page)).toEqual([])
    await dialog.getByRole('button', { name: 'Copy report' }).click()
    await expect(dialog.getByRole('status')).toHaveText('Copied')
  })
})

test('manual-copy fallback when the clipboard is blocked', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('blocked')) } })
  })
  await page.goto(PAGE)
  await section(page, 'onboarding-complete-handler').getByRole('button', { name: /Question about/ }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Your question').fill('Fallback?')
  await dialog.getByRole('button', { name: 'Build prompt' }).click()
  await dialog.getByRole('button', { name: 'Copy prompt' }).click()
  await expect(dialog.getByRole('status')).toContainText('Copy failed')
  const fallback = dialog.getByLabel('Prompt (select all and copy)')
  await expect(fallback).toBeFocused()
  await expect(fallback).toHaveValue(/Fallback\?/)
})

for (const width of [375, 768, 1280]) {
  test(`usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(PAGE)
    const btn = section(page, 'onboarding-complete-handler').getByRole('button', { name: /Question about/ })
    await btn.scrollIntoViewIfNeeded()
    await expect(btn).toBeVisible()
    await btn.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog')).toBeVisible()
    const box = await page.getByRole('dialog').boundingBox()
    expect(box!.width).toBeLessThanOrEqual(width)
  })
}

const API_DOMAINS = ['auth', 'onboarding', 'communities', 'feed', 'missions-xp', 'watch-parties', 'talent-admin', 'discover-plans']
const A11Y_PATHS = ['/', PAGE, '/api-reference', ...API_DOMAINS.map(d => `/api-reference/${d}`)]

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`${colorScheme} mode`, () => {
    test.use({ colorScheme })
    for (const path of A11Y_PATHS) {
      test(`no serious a11y violations on ${path}`, async ({ page }) => {
        await page.goto(path)
        expect(await seriousViolations(page)).toEqual([])
      })
    }
  })
}

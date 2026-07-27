const path = require('path')
const { sharedHelper, moduleHelper, fixturePath } = require(path.join(
  process.env.AURORA_MOBILE_E2E_ROOT,
  'e2e/helpers/paths'
))
const { test, expect } = require('@playwright/test')
const { step } = sharedHelper('login')

test.describe('Mobile login page', () => {
  test('shows login form', async ({ page }) => {
    await step('Open mobile URL', async () => {
      await page.goto('/')
    })

    await step('Expect login form fields', async () => {
      await expect(page.getByTestId('login-email')).toBeVisible({
        timeout: 30000,
      })
      await expect(page.getByTestId('login-password')).toBeVisible()
      await expect(page.getByTestId('login-submit')).toBeVisible()
    })
  })
})

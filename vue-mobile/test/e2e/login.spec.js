const path = require('path')
const { sharedHelper, moduleHelper, fixturePath } = require(path.join(
  process.env.AURORA_MOBILE_E2E_ROOT,
  'e2e/helpers/paths'
))
const { test, expect } = require('@playwright/test')
const { loginAsTestUser, step } = sharedHelper('login')

const hasCredentials = !!(process.env.E2E_LOGIN && process.env.E2E_PASSWORD)

test.describe('Mobile login', () => {
  test.skip(!hasCredentials, 'Set E2E_LOGIN and E2E_PASSWORD in .env.e2e')

  test('user can log in', async ({ page }) => {
    test.setTimeout(90000)
    await loginAsTestUser(page)

    await step('Confirm login form is gone', async () => {
      await expect(page.getByTestId('login-email')).not.toBeVisible()
    })
  })
})

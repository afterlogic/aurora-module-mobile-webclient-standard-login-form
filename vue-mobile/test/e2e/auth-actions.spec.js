const path = require('path')
const { sharedHelper, moduleHelper, fixturePath } = require(path.join(
  process.env.AURORA_MOBILE_E2E_ROOT,
  'test/e2e/helpers/paths'
))
const { test, expect } = sharedHelper('fixtures')
const {
  loginAsTestUser,
  step,
  attachScreenshot,
  fieldControl,
  waitForTurnstileToken,
} = sharedHelper('login')
const { clickReady } = sharedHelper('ready')
const { logoutToLoginForm } = moduleHelper('SettingsMobileWebclient', 'settings')

const hasCredentials = !!(process.env.E2E_LOGIN && process.env.E2E_PASSWORD)

test.describe('Mobile auth', () => {
  test.skip(!hasCredentials, 'Set E2E_LOGIN and E2E_PASSWORD in .env.e2e')

  test('rejects invalid password and stays on login', async ({ page }) => {
    test.setTimeout(120000)
    const login = process.env.E2E_LOGIN

    await step('Open login page', async () => {
      await page.context().clearCookies()
      await page.goto('', { waitUntil: 'domcontentloaded' })
      await expect(page.getByTestId('login-email')).toBeVisible({
        timeout: 30000,
      })
      await waitForTurnstileToken(page)
    })

    await step('Submit wrong password', async () => {
      await fieldControl(page, 'login-email').fill(login)
      await fieldControl(page, 'login-password').fill(
        `wrong-password-${Date.now()}`
      )
      await waitForTurnstileToken(page)
      await expect(page.getByTestId('login-submit')).toBeEnabled({
        timeout: 10000,
      })
      await clickReady(page.getByTestId('login-submit'))
    })

    await step('Stay on login; error notification or 2FA screen', async () => {
      // Wait until submit finishes (button not in loading state) or feedback appears.
      await expect
        .poll(
          async () => {
            if (await page.getByTestId('login-2fa').isVisible().catch(() => false)) {
              return '2fa'
            }
            if (
              await page
                .locator('.q-notification')
                .first()
                .isVisible()
                .catch(() => false)
            ) {
              return 'notify'
            }
            const loading = await page
              .getByTestId('login-submit')
              .locator('.q-spinner, .q-btn__progress')
              .count()
              .catch(() => 0)
            if (loading === 0) return 'idle'
            return 'pending'
          },
          { timeout: 45000 }
        )
        .not.toBe('pending')

      await expect(page.getByTestId('app-shell')).not.toBeVisible()
      // Wrong password must not land in the app. 2FA after wrong password would be a bug.
      if (await page.getByTestId('login-2fa').isVisible().catch(() => false)) {
        throw new Error(
          '2FA screen shown after wrong password — unexpected product behaviour'
        )
      }
      await expect(page.getByTestId('login-email')).toBeVisible({
        timeout: 15000,
      })
      const notification = page.locator('.q-notification').first()
      if (await notification.isVisible().catch(() => false)) {
        const text = (await notification.innerText()).trim()
        console.log(`  → Notification: ${text}`)
        expect(text.length).toBeGreaterThan(0)
      } else {
        console.log('  → No toast visible; still on login (acceptable)')
      }
      await attachScreenshot(page, 'auth-invalid-01')
    })
  })

  test('opens forgot-password form and returns to login', async ({ page }) => {
    test.setTimeout(120000)

    await step('Open login page', async () => {
      await page.context().clearCookies()
      await page.goto('', { waitUntil: 'domcontentloaded' })
      await expect(page.getByTestId('login-email')).toBeVisible({
        timeout: 30000,
      })
    })

    const forgot = page.getByTestId('login-forgot-password')
    test.skip(
      (await forgot.count()) === 0,
      'Forgot password not available (StandardResetPassword disabled)'
    )

    await step('Open reset password', async () => {
      await clickReady(forgot)
      await expect(page.getByTestId('reset-password-page')).toBeVisible({
        timeout: 30000,
      })
      await expect(page.getByTestId('reset-password-email')).toBeVisible({
        timeout: 15000,
      })
      await expect(page.getByTestId('reset-password-continue')).toBeVisible()
      await expect(page.getByTestId('reset-password-back')).toBeVisible()
      console.log('  → Reset password step 1 open')
      await attachScreenshot(page, 'auth-reset-01')
    })

    await step('Back to login without sending recovery', async () => {
      await clickReady(page.getByTestId('reset-password-back'))
      await expect(page.getByTestId('login-email')).toBeVisible({
        timeout: 30000,
      })
      await expect(page.getByTestId('reset-password-page')).toBeHidden({
        timeout: 15000,
      })
      console.log('  → Back on login')
      await attachScreenshot(page, 'auth-reset-02-login')
    })
  })

  test('logout then login again', async ({ page }) => {
    test.setTimeout(180000)
    await loginAsTestUser(page)

    await step('Logout from settings', async () => {
      await logoutToLoginForm(page)
      await attachScreenshot(page, 'auth-relogin-01-logged-out')
    })

    await step('Login again with same credentials', async () => {
      await waitForTurnstileToken(page)
      await fieldControl(page, 'login-email').fill(process.env.E2E_LOGIN)
      await fieldControl(page, 'login-password').fill(process.env.E2E_PASSWORD)
      await waitForTurnstileToken(page)
      await clickReady(page.getByTestId('login-submit'))
      await expect(page.getByTestId('app-shell')).toBeVisible({
        timeout: 45000,
      })
      await expect(page.getByTestId('nav-mail')).toBeVisible({
        timeout: 30000,
      })
      console.log('  → Re-login success')
      await attachScreenshot(page, 'auth-relogin-02-shell')
    })
  })

  test('toggles password visibility on login form', async ({ page }) => {
    test.setTimeout(90000)

    await step('Open login and type password', async () => {
      await page.context().clearCookies()
      await page.goto('', { waitUntil: 'domcontentloaded' })
      await expect(page.getByTestId('login-email')).toBeVisible({
        timeout: 30000,
      })
      const pwd = fieldControl(page, 'login-password')
      await pwd.fill('secret-visible-check')
      await expect(pwd).toHaveAttribute('type', 'password')
    })

    await step('Toggle show/hide password', async () => {
      const toggle = page.getByTestId('login-password-toggle')
      await expect(toggle).toBeVisible({ timeout: 10000 })
      await clickReady(toggle)
      await expect(fieldControl(page, 'login-password')).toHaveAttribute(
        'type',
        'text'
      )
      await clickReady(toggle)
      await expect(fieldControl(page, 'login-password')).toHaveAttribute(
        'type',
        'password'
      )
      console.log('  → Password visibility toggled')
      await attachScreenshot(page, 'auth-password-toggle-01')
    })
  })
})

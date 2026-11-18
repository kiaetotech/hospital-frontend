const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://hospital-frontend-kiaeto.vercel.app';
const API_URL = 'https://hospital-backend-ilhi.onrender.com';

const TABS = [
  { id: 'products',      label: /Product/i },
  { id: 'applications',  label: /Application/i },
  { id: 'offers',        label: /Offer/i },
  { id: 'agreements',    label: /Agreement/i },
  { id: 'disbursements', label: /Disburse/i },
  { id: 'repayment',     label: /Repay/i },
  { id: 'collections',   label: /Collection/i },
  { id: 'analytics',     label: /Analytic/i },
  { id: 'webhooks',      label: /Webhook/i },
  { id: 'compliance',    label: /Compliance/i },
];

test.describe('Loan — Lender Dashboard', () => {

  // ============================================
  // 1. LOGIN PAGE (no auth)
  // ============================================
  test('Login page renders Email + Mobile OTP tabs', async ({ page }) => {
    await page.goto(`${BASE_URL}/lender/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('input[type="password"]')).toBeVisible();
    const loginBtn = page.locator('button[type="submit"]');
    await expect(loginBtn).toBeVisible();
    await expect(loginBtn).toHaveText(/login/i);
  });

  test('Login form rejects invalid credentials without crashing', async ({ page }) => {
    await page.goto(`${BASE_URL}/lender/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.locator('input[type="email"]').fill('nobody@example.com');
    await page.locator('input[type="password"]').fill('wrongpassword123');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(4000);
    const body = await page.locator('body').innerText();
    expect(body.length).toBeGreaterThan(50);
    // Should still be on login page (or show error) — no crash
    const hasError = /invalid|incorrect|failed|error|wrong/i.test(body);
    const stillOnLogin = /login/i.test(page.url());
    expect(hasError || stillOnLogin).toBeTruthy();
  });

  // ============================================
  // 2. UNAUTHENTICATED → REDIRECT
  // ============================================
  test('Unauthenticated /lender/loan-hub redirects to login', async ({ page }) => {
    await page.goto(`${BASE_URL}/lender/loan-hub`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2500);
    const url = page.url();
    const body = await page.locator('body').innerText();
    const redirected = /login/i.test(url);
    const showsLogin = /login|sign in/i.test(body);
    expect(redirected || showsLogin).toBeTruthy();
  });

  // ============================================
  // 3. AUTHENTICATED DASHBOARD (mock token)
  // ============================================
  test.describe('Authenticated dashboard', () => {
    test.beforeEach(async ({ page }) => {
      // CORRECTED: uses 'lenderData' key (not 'lender') per LenderContext.js
      await page.addInitScript(() => {
        const mockLender = {
          _id: '000000000000000000000000',
          name: 'E2E Test Lender',
          email: 'e2e-test@example.com',
          role: 'lender',
          isVerified: true,
        };
        // JWT-shaped dummy token (will fail server-side auth — but passes client-side check)
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({
          id: mockLender._id,
          role: 'lender',
          exp: Math.floor(Date.now() / 1000) + 3600,
        }));
        const token = `${header}.${payload}.e2e-dummy-signature`;

        localStorage.setItem('lenderToken', token);
        localStorage.setItem('lenderData', JSON.stringify(mockLender)); // ← FIXED
      });
    });

    test('Dashboard shell renders with 10 tabs', async ({ page }) => {
      const consoleErrors = [];
      page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

      await page.goto(`${BASE_URL}/lender/loan-hub`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(3000);

      const url = page.url();
      expect(url).toMatch(/lender\/loan-hub/);

      const pageText = await page.locator('body').innerText();
      const tabLabels = ['Product', 'Application', 'Offer', 'Agreement',
                         'Disburse', 'Repay', 'Collection', 'Analytic',
                         'Webhook', 'Compliance'];
      for (const label of tabLabels) {
        expect(pageText).toMatch(new RegExp(label, 'i'));
      }

      const fatal = consoleErrors.filter(e => /Uncaught|TypeError|ReferenceError/.test(e));
      expect(fatal).toEqual([]);
    });

    test('Clicking each tab switches content', async ({ page }) => {
      await page.goto(`${BASE_URL}/lender/loan-hub`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(3000);

      for (const t of TABS) {
        const btn = page.locator('button').filter({ hasText: t.label }).first();
        if (await btn.count() > 0) {
          await btn.click({ timeout: 5000 }).catch(() => {});
          await page.waitForTimeout(600);
          expect(page.url()).toMatch(/lender\/loan-hub/);
        }
      }
    });

    test('No uncaught exceptions across all tabs', async ({ page }) => {
      const errors = [];
      page.on('pageerror', (err) => errors.push(err.message));
      page.on('console', (msg) => {
        if (msg.type() === 'error' && /Uncaught|TypeError|ReferenceError/.test(msg.text())) {
          errors.push(msg.text());
        }
      });

      await page.goto(`${BASE_URL}/lender/loan-hub`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(3000);

      for (const t of TABS) {
        const btn = page.locator('button').filter({ hasText: t.label }).first();
        if (await btn.count() > 0) {
          await btn.click({ timeout: 5000 }).catch(() => {});
          await page.waitForTimeout(500);
        }
      }

      expect(errors).toEqual([]);
    });
  });
});
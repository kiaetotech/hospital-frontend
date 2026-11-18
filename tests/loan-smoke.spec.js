const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://hospital-frontend-kiaeto.vercel.app';
const API_URL = 'https://hospital-backend-ilhi.onrender.com';

test.describe('Loan Module Smoke Test', () => {

  test('Loan health endpoint returns 200', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/loan/v2/health`, { timeout: 90000 });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data).toBeTruthy();
  });

  test('Public EMI calculator loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/healthcare-emi-calculator`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page).toHaveURL(/healthcare-emi-calculator/);
    const body = await page.locator('body').innerText();
    expect(body.length).toBeGreaterThan(50);
  });

  test('Patient financing wizard loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/financing`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page).toHaveURL(/financing/);
    const body = await page.locator('body').innerText();
    expect(body.length).toBeGreaterThan(50);
  });

  test('Lender login page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/lender/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page).toHaveURL(/lender\/login/);
    const inputs = page.locator('input');
    expect(await inputs.count()).toBeGreaterThan(0);
  });

    test('Protected loan endpoint requires auth', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/loan/v2/products`, { timeout: 90000 });
    expect([401, 403]).toContain(res.status());
  });

  test('Lender hub redirects unauthenticated users', async ({ page }) => {
    await page.goto(`${BASE_URL}/lender/loan-hub`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);
    const url = page.url();
    const body = await page.locator('body').innerText();
    const isLoginPage = /login/i.test(url) || /login|sign in/i.test(body);
    expect(isLoginPage).toBeTruthy();
  });
});
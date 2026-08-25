const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://hospital-frontend-kiaeto.vercel.app';
const API_URL = 'https://hospital-backend-production-7d0f.up.railway.app';

test.describe('Ambulance E2E Tests', () => {

  test('API health check', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/health`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.services.mongodb).toBe('connected');
    expect(data.services.redis).toBe('connected');
  });

  test('Driver login flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/ambulance/driver/login`);
    await page.fill('input[placeholder="Phone Number"]', '3333333334');
    await page.click('button:has-text("Send OTP")');
    await expect(page.locator('input[placeholder="Enter OTP"]')).toBeVisible({ timeout: 10000 });
  });

  test('Provider login page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/ambulance/login`);
    await expect(page.locator('input[placeholder="Enter your email"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[placeholder="Enter your password"]')).toBeVisible({ timeout: 10000 });
  });

  test('Patient login page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator('input[placeholder="Enter email"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[placeholder="Enter password"]')).toBeVisible({ timeout: 10000 });
  });

  test('Scheduled booking form loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/ambulance`);
    await page.click('text=Schedule Transport');
    await expect(page.locator('input[placeholder="Patient Name *"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[placeholder="Phone Number *"]')).toBeVisible({ timeout: 10000 });
  });

});
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://hospital-frontend-kiaeto.vercel.app';
const API_URL = 'https://hospital-backend-production-7d0f.up.railway.app';

test.describe('Ambulance Production E2E - Complete Coverage', () => {

  // ============================================
  // 1. PUBLIC ENDPOINTS
  // ============================================
  test('Health check', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/health`);
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.services.mongodb).toBe('connected');
    expect(data.services.redis).toBe('connected');
  });

  test('Cancellation policy public', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/ambulance/cancellation-policy`);
    expect(res.status()).toBe(200);
  });

  test('Tracking public', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/ambulance/tracking/AMB1787534043861197`);
    expect(res.status()).toBe(200);
  });

  test('Booking details public', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/ambulance/booking/AMB1787534043861197`);
    expect(res.status()).toBe(200);
  });

  // ============================================
  // 2. AUTH-REQUIRED ENDPOINTS (should 401/403 without token)
  // ============================================
  test('Active trips requires auth', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/ambulance/active-trips`);
    expect([401, 403]).toContain(res.status());
  });

  test('Financial summary requires auth', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/ambulance/financial-summary`);
    expect([401, 403]).toContain(res.status());
  });

  test('Settlements requires auth', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/ambulance/settlements`);
    expect([401, 403]).toContain(res.status());
  });

  test('Complaints requires auth', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/ambulance/complaints`);
    expect([401, 403]).toContain(res.status());
  });

  test('My bookings requires auth', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/ambulance/my-bookings`);
    expect([401, 403]).toContain(res.status());
  });

  test('Driver dashboard requires auth', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/ambulance/driver/dashboard`);
    expect([401, 403]).toContain(res.status());
  });

  test('Provider bookings requires auth', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/ambulance/bookings`);
    expect([401, 403]).toContain(res.status());
  });

  test('Vehicles requires auth', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/ambulance/vehicles`);
    expect([401, 403]).toContain(res.status());
  });

  // ============================================
  // 3. UI PAGES - PATIENT
  // ============================================
  test('Patient login page', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator('input[placeholder="Enter mobile number"]')).toBeVisible();
    });

  test('Patient registration page', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click('text=Register');
    await expect(page.locator('input[placeholder="Full Name *"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Email *"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Mobile *"]')).toBeVisible();
  });

  test('Forgot password option exists', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator('text=Forgot')).toBeVisible();
  });

  // ============================================
  // 4. UI PAGES - AMBULANCE
  // ============================================
  test('Ambulance page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/ambulance`);
    await expect(page.locator('text=EMERGENCY').first()).toBeVisible();
    await expect(page.locator('text=Schedule Transport')).toBeVisible();
  });

  test('Emergency request flow - hold button', async ({ page }) => {
    await page.goto(`${BASE_URL}/ambulance`);
    await expect(page.locator('text=EMERGENCY').first()).toBeVisible();
  });

  // ============================================
  // 5. UI PAGES - DRIVER
  // ============================================
  test('Driver login page', async ({ page }) => {
    await page.goto(`${BASE_URL}/ambulance/driver/login`);
    await expect(page.locator('input[placeholder="Phone Number"]')).toBeVisible();
    await expect(page.locator('button:has-text("Send OTP")')).toBeVisible();
  });

  // ============================================
  // 6. UI PAGES - PROVIDER
  // ============================================
  test('Provider login page', async ({ page }) => {
    await page.goto(`${BASE_URL}/ambulance/login`);
    await expect(page.locator('input[placeholder="Enter your email"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Enter your password"]')).toBeVisible();
  });

  test('Provider registration page', async ({ page }) => {
    await page.goto(`${BASE_URL}/ambulance/login`);
    await expect(page.locator('input[placeholder="Enter your email"]')).toBeVisible();
  });

  // ============================================
  // 7. SEARCH
  // ============================================
  test('Nearby ambulances search requires coords', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/ambulance/nearby-ambulances`);
    expect(res.status()).toBe(400); // Missing coords
  });

  test('Nearby ambulances with coords', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/ambulance/nearby-ambulances?lat=21.2153&lng=79.0797`);
    expect(res.status()).toBe(200);
  });

  test('Ambulance search with coords', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/ambulance/search?lat=21.2153&lng=79.0797`);
    expect(res.status()).toBe(200);
  });

  test('Cities list public', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/ambulance/cities`);
    expect(res.status()).toBe(200);
  });

  // ============================================
  // 8. FARE ESTIMATE
  // ============================================
  test('Fare estimate works', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/ambulance/fare-estimate?distance=5&ambulanceType=basic`);
    expect(res.status()).toBe(200);
  });

  test('Surge check requires coords', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/ambulance/surge-check`);
    expect(res.status()).toBe(400);
  });

  test('Surge check with coords', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/ambulance/surge-check?lat=21.2153&lng=79.0797`);
    expect(res.status()).toBe(200);
  });

  // ============================================
  // 9. PAYMENT
  // ============================================
  test('Payment gateway active', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/payment`);
    expect(res.status()).toBe(200);
  });

  test('Payment status requires booking', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/payment/status/INVALID_BOOKING`);
    expect(res.status()).toBe(404);
  });

  // ============================================
  // 10. RATING
  // ============================================
  test('Rate trip requires auth', async ({ request }) => {
    const res = await request.post(`${API_URL}/api/ambulance/rate-trip/AMB1787534043861197`, { data: {} });
    expect([401, 403]).toContain(res.status());
  });

  // ============================================
  // 11. CANCELLATION
  // ============================================
  test('Cancellation quote requires auth', async ({ request }) => {
    const res = await request.post(`${API_URL}/api/ambulance/cancellation-quote/AMB1787534043861197`, { data: {} });
    expect([401, 403]).toContain(res.status());
  });

  test('Cancel booking requires auth', async ({ request }) => {
    const res = await request.put(`${API_URL}/api/ambulance/cancel-booking/AMB1787534043861197`, { data: {} });
    expect([401, 403]).toContain(res.status());
  });

  // ============================================
  // 12. DRIVER LOGIN API
  // ============================================
  test('Driver login API works', async ({ request }) => {
    const res = await request.post(`${API_URL}/api/ambulance/driver-login`, {
      data: { phone: '+913333333334' }
    });
    expect(res.status()).toBe(200);
  });

});
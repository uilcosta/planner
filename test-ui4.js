const { chromium } = require('playwright');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join('C:/Users/user/OneDrive/Desenvolvimentos/meu-planner-financeiro', '.env.test') });

const artifactDir = path.join('C:/Users/user/OneDrive/Desenvolvimentos/meu-planner-financeiro', 'playwright-artifacts');
const TEST_EMAIL = process.env.TEST_EMAIL || 'uilian_costa@hotmail.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'heyolhaprodj';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  try {
    const page = await browser.newPage();

    // Enable console logging
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    // Login first
    console.log('=== Login ===');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    console.log('On login page');

    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    console.log('Clicked submit');

    // Wait for navigation
    await page.waitForURL('**/*', { timeout: 10000 });
    console.log('URL after submit:', page.url());

    // Wait for hydration and auth check
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    console.log('URL after wait:', page.url());

    // Screenshot
    await page.screenshot({ path: path.join(artifactDir, 'debug-after-login-2.png'), fullPage: true });

    // Check cookies
    const cookies = await page.context().cookies();
    console.log('Cookies:', cookies.filter(c => c.name.includes('supabase') || c.name.includes('sb-')));

    // Now try to access dashboard directly
    console.log('\n=== Direct dashboard access ===');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    console.log('URL after direct access:', page.url());

    await page.screenshot({ path: path.join(artifactDir, 'debug-direct-dashboard.png'), fullPage: true });

    // Check for dashboard elements
    const aside = page.locator('aside[aria-label="Menu principal"]');
    console.log('Aside visible:', await aside.isVisible().catch(() => false));

    const main = page.locator('main');
    console.log('Main visible:', await main.isVisible().catch(() => false));

    // Get visible text
    const bodyText = await page.locator('body').textContent();
    console.log('Body text (first 2000):', bodyText?.substring(0, 2000));

    // Check for loading spinner
    const spinner = page.locator('.animate-spin, [role="status"]');
    console.log('Spinner visible:', await spinner.isVisible().catch(() => false));

    // Check for ProtectedRoute fallback
    const protectedRoute = page.locator('[data-protected], .protected-route');
    console.log('Protected route elements:', await protectedRoute.count());

  } catch(e) {
    console.error('Error:', e);
  } finally {
    await browser.close();
  }
})();
const { chromium } = require('playwright');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join('C:/Users/user/OneDrive/Desenvolvimentos/meu-planner-financeiro', '.env.test') });

const artifactDir = path.join('C:/Users/user/OneDrive/Desenvolvimentos/meu-planner-financeiro', 'playwright-artifacts');
const TEST_EMAIL = process.env.TEST_EMAIL || 'uilian_costa@hotmail.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'heyolhaprodj';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  try {
    const page = await browser.newPage();

    // Login first
    console.log('=== Login ===');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('URL:', page.url());

    // Screenshot of what we have
    await page.screenshot({ path: path.join(artifactDir, 'debug-dashboard.png'), fullPage: true });

    // Get all content
    const bodyText = await page.locator('body').textContent();
    console.log('Body text (first 2000 chars):', bodyText.substring(0, 2000));

    // Check for specific elements
    const allElements = await page.locator('*').all();
    console.log('\nTotal elements:', allElements.length);

    // Look for aside, nav, header
    const aside = page.locator('aside');
    console.log('Aside count:', await aside.count());

    const nav = page.locator('nav');
    console.log('Nav count:', await nav.count());

    const header = page.locator('header');
    console.log('Header count:', await header.count());

    const main = page.locator('main');
    console.log('Main count:', await main.count());

    // Check for ProtectedRoute content
    const protectedContent = page.locator('[data-protected], .protected-content');
    console.log('Protected content count:', await protectedContent.count());

    // Get HTML
    const html = await page.content();
    console.log('\nHTML length:', html.length);

    // Save HTML for inspection
    const fs = require('fs');
    fs.writeFileSync(path.join(artifactDir, 'debug-dashboard.html'), html);
    console.log('HTML saved to debug-dashboard.html');

  } catch(e) {
    console.error('Error:', e);
  } finally {
    await browser.close();
  }
})();
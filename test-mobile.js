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

    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });

    // Login first
    console.log('=== Mobile Login ===');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });

    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL('**/', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: path.join(artifactDir, 'mobile-dashboard.png'), fullPage: true });
    console.log('Mobile dashboard screenshot captured');

    // Check for mobile bottom navigation
    const bottomNav = page.locator('nav[aria-label="Navegação móvel"]');
    console.log('Bottom nav visible:', await bottomNav.isVisible().catch(() => false));

    // Check for mobile menu button
    const menuBtn = page.locator('button[aria-label="Abrir menu"]');
    console.log('Menu button visible:', await menuBtn.isVisible().catch(() => false));

    // Test opening sidebar drawer
    if (await menuBtn.isVisible().catch(() => false)) {
      await menuBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(artifactDir, 'mobile-sidebar-open.png'), fullPage: true });
      console.log('Sidebar drawer opened');

      // Check sidebar visible
      const aside = page.locator('aside[aria-label="Menu principal"]');
      console.log('Sidebar visible on mobile:', await aside.isVisible().catch(() => false));

      // Click a nav link to close drawer
      const firstLink = page.locator('aside a[href="/"]').first();
      if (await firstLink.isVisible().catch(() => false)) {
        await firstLink.click();
        await page.waitForTimeout(500);
      }
    }

    // Test bottom navigation
    const bottomNavLinks = page.locator('nav[aria-label="Navegação móvel"] a');
    const count = await bottomNavLinks.count();
    console.log('Bottom nav links count:', count);

    for (let i = 0; i < Math.min(count, 3); i++) {
      const link = bottomNavLinks.nth(i);
      const href = await link.getAttribute('href');
      console.log(`Bottom nav link ${i}:`, href);
      await link.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(artifactDir, `mobile-nav-${href?.replace('/', '') || i}.png`), fullPage: true });

      // Go back to dashboard
      if (href !== '/') {
        await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(500);
      }
    }

    // Test theme toggle on mobile
    const themeToggle = page.locator('button[aria-label*="tema" i], button[aria-label*="theme" i]');
    if (await themeToggle.isVisible().catch(() => false)) {
      await themeToggle.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(artifactDir, 'mobile-dark.png'), fullPage: true });
      console.log('Mobile dark mode');
    }

    console.log('\n=== Mobile tests completed ===');

  } catch(e) {
    console.error('Error:', e);
  } finally {
    await browser.close();
  }
})();
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

    // Test 1: Login page - Light mode
    console.log('=== Testing Login Page (Light) ===');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(artifactDir, 'ui-test-login-light.png'), fullPage: true });

    // Check for text visibility
    const loginTitle = await page.locator('h1, h2').first().textContent();
    console.log('Login title:', loginTitle);

    const emailLabel = await page.locator('label[for="email"], label:has-text("E-mail")').first().textContent();
    console.log('Email label visible:', !!emailLabel);

    // Test 2: Login page - Dark mode
    console.log('\n=== Testing Login Page (Dark) ===');
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(artifactDir, 'ui-test-login-dark.png'), fullPage: true });

    // Test 3: Login and go to Dashboard
    console.log('\n=== Logging in ===');
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    console.log('Current URL after login:', page.url());

    // Wait a bit more for potential redirect
    await page.waitForTimeout(2000);
    console.log('Current URL after wait:', page.url());

    // If still on login, check for error
    if (page.url().includes('/login')) {
      const errorMsg = await page.locator('[role="alert"], .text-variance-danger, .text-danger').textContent();
      console.log('Login error:', errorMsg);
    }

    // Test 4: Dashboard - Light mode (if logged in)
    if (!page.url().includes('/login')) {
      console.log('\n=== Testing Dashboard (Light) ===');
      await page.screenshot({ path: path.join(artifactDir, 'ui-test-dashboard-light.png'), fullPage: true });

      // Check sidebar
      const sidebar = page.locator('aside[aria-label="Menu principal"]');
      console.log('Sidebar visible:', await sidebar.isVisible());

      // Check sidebar collapse button
      const collapseBtn = page.locator('button[aria-label="Colapsar menu"], button[aria-label="Expandir menu"]');
      console.log('Collapse button visible:', await collapseBtn.isVisible());
      if (await collapseBtn.isVisible()) {
        console.log('Collapse button aria-label:', await collapseBtn.getAttribute('aria-label'));
      }

      // Check navigation items
      const navItems = page.locator('nav[aria-label="Navegação principal"] a');
      const count = await navItems.count();
      console.log('Nav items count:', count);
      for (let i = 0; i < count; i++) {
        const text = await navItems.nth(i).textContent();
        const href = await navItems.nth(i).getAttribute('href');
        console.log(`  - ${text.trim()} (${href})`);
      }

      // Check header
      const header = page.locator('header');
      console.log('Header visible:', await header.isVisible());

      // Check month selector
      const monthSelector = page.locator('text=/Janeiro|Fevereiro|Março|Abril|Maio|Junho|Julho|Agosto|Setembro|Outubro|Novembro|Dezembro/');
      console.log('Month selector visible:', await monthSelector.isVisible());
      if (await monthSelector.isVisible()) {
        console.log('Month text:', await monthSelector.textContent());
      }

      // Test 5: Dashboard - Dark mode
      console.log('\n=== Testing Dashboard (Dark) ===');
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(artifactDir, 'ui-test-dashboard-dark.png'), fullPage: true });

      // Check sidebar in dark mode
      console.log('Sidebar visible (dark):', await sidebar.isVisible());
      console.log('Collapse button visible (dark):', await collapseBtn.isVisible());

      // Test 6: Toggle sidebar collapse
      console.log('\n=== Testing Sidebar Collapse ===');
      if (await collapseBtn.isVisible()) {
        await collapseBtn.click();
        await page.waitForTimeout(300);
        await page.screenshot({ path: path.join(artifactDir, 'ui-test-dashboard-collapsed.png'), fullPage: true });
        console.log('Sidebar collapsed');

        // Expand again
        const expandBtn = page.locator('button[aria-label="Expandir menu"]');
        if (await expandBtn.isVisible()) {
          await expandBtn.click();
          await page.waitForTimeout(300);
          console.log('Sidebar expanded');
        }
      }

      // Test 7: Mobile viewport
      console.log('\n=== Testing Mobile Viewport ===');
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(artifactDir, 'ui-test-mobile.png'), fullPage: true });

      const mobileMenuBtn = page.locator('button[aria-label="Abrir menu"]');
      console.log('Mobile menu button visible:', await mobileMenuBtn.isVisible());

      const bottomNav = page.locator('nav[aria-label="Navegação móvel"]');
      console.log('Bottom nav visible:', await bottomNav.isVisible());

      // Open mobile sidebar
      if (await mobileMenuBtn.isVisible()) {
        await mobileMenuBtn.click();
        await page.waitForTimeout(300);
        await page.screenshot({ path: path.join(artifactDir, 'ui-test-mobile-sidebar.png'), fullPage: true });
        console.log('Mobile sidebar opened');

        // Close mobile sidebar
        await page.click('body', { position: { x: 50, y: 100 } });
        await page.waitForTimeout(300);
      }

      // Test 8: Theme toggle
      console.log('\n=== Testing Theme Toggle ===');
      const themeToggle = page.locator('button[aria-label*="tema" i], button[aria-label*="Tema" i]');
      console.log('Theme toggle visible:', await themeToggle.isVisible());

      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(artifactDir, 'ui-test-after-toggle.png'), fullPage: true });
        console.log('Theme toggled');
      }
    }

    console.log('\n=== ALL TESTS COMPLETED ===');

  } catch(e) {
    console.error('Error:', e);
  } finally {
    await browser.close();
  }
})();
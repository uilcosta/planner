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

    // Enable console logging
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.text().includes('instant')) {
        console.log('BROWSER:', msg.text());
      }
    });
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    // Login first
    console.log('=== Login ===');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    console.log('On login page');

    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    console.log('Clicked submit');

    // Wait for navigation to dashboard
    await page.waitForURL('**/', { timeout: 15000 });
    console.log('URL after submit:', page.url());

    // Wait for dashboard to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Screenshot
    await page.screenshot({ path: path.join(artifactDir, 'dashboard-after-login.png'), fullPage: true });

    // Check for dashboard elements - look for the actual content, not dev overlay
    const aside = page.locator('aside[aria-label="Menu principal"]');
    console.log('Aside visible:', await aside.isVisible().catch(() => false));

    const main = page.locator('main');
    console.log('Main visible:', await main.isVisible().catch(() => false));

    // Check for sidebar collapse button
    const collapseBtn = page.locator('button[aria-label="Colapsar menu"], button[aria-label="Expandir menu"]');
    console.log('Collapse button visible:', await collapseBtn.isVisible().catch(() => false));

    // Check for month selector in header
    const monthSelector = page.locator('header button[aria-label="Mês anterior"], header button[aria-label="Próximo mês"]');
    console.log('Month selector visible:', await monthSelector.first().isVisible().catch(() => false));

    // Check for theme toggle
    const themeToggle = page.locator('button[aria-label*="tema" i], button[aria-label*="theme" i]');
    console.log('Theme toggle visible:', await themeToggle.isVisible().catch(() => false));

    // Get dashboard text content
    const dashboardText = await page.locator('main').textContent();
    console.log('Dashboard text (first 1500):', dashboardText?.substring(0, 1500));

    // Test sidebar collapse/expand
    console.log('\n=== Testing sidebar collapse ===');
    if (await collapseBtn.isVisible().catch(() => false)) {
      await collapseBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(artifactDir, 'dashboard-collapsed.png'), fullPage: true });
      console.log('Sidebar collapsed');

      // Expand again
      const expandBtn = page.locator('button[aria-label="Expandir menu"]');
      if (await expandBtn.isVisible().catch(() => false)) {
        await expandBtn.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(artifactDir, 'dashboard-expanded.png'), fullPage: true });
        console.log('Sidebar expanded');
      }
    }

    // Test theme toggle
    console.log('\n=== Testing theme toggle ===');
    if (await themeToggle.isVisible().catch(() => false)) {
      await themeToggle.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(artifactDir, 'dashboard-dark.png'), fullPage: true });
      console.log('Switched to dark mode');

      // Toggle back
      await themeToggle.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(artifactDir, 'dashboard-light.png'), fullPage: true });
      console.log('Switched to light mode');
    }

    // Test navigation to other pages
    console.log('\n=== Testing navigation ===');
    const navLinks = [
      { name: 'Categorias', href: '/categorias' },
      { name: 'Contas', href: '/contas' },
      { name: 'Caixinhas', href: '/caixinhas' },
      { name: 'Planejamento', href: '/planejamento' },
    ];

    for (const link of navLinks) {
      const navLink = page.locator(`aside a[href="${link.href}"]`);
      if (await navLink.isVisible().catch(() => false)) {
        await navLink.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(artifactDir, `nav-${link.name.toLowerCase()}.png`), fullPage: true });
        console.log(`Navigated to ${link.name}:`, page.url());

        // Go back to dashboard
        await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(500);
      } else {
        console.log(`${link.name} link not visible`);
      }
    }

    console.log('\n=== All tests completed ===');

  } catch(e) {
    console.error('Error:', e);
  } finally {
    await browser.close();
  }
})();
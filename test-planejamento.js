const { chromium } = require('playwright');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join('C:/Users/user/OneDrive/Desenvolvimentos/meu-planner-financeiro', '.env.test') });
const TEST_EMAIL = process.env.TEST_EMAIL || 'uilian_costa@hotmail.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'heyolhaprodj';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });

    // Login
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Go to Planejamento
    await page.goto('http://localhost:3000/planejamento', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Check initial state
    console.log('Page title:', await page.title());
    console.log('URL:', page.url());

    // Find Novo Item button
    const novoItemBtn = page.locator('button:has-text("Novo Item")').first();
    console.log('Novo Item button visible:', await novoItemBtn.isVisible());

    // Click and wait
    await novoItemBtn.click();
    console.log('Clicked Novo Item button');
    await page.waitForTimeout(1000);

    // Check for modal
    const modal = page.locator('.fixed.inset-0.z-50');
    console.log('Modal count:', await modal.count());
    console.log('Modal visible:', await modal.first().isVisible().catch(() => false));

    // Check for form
    const form = page.locator('form');
    console.log('Form count:', await form.count());
    console.log('Form visible:', await form.first().isVisible().catch(() => false));

    // Check for Card in modal
    const card = page.locator('.fixed.inset-0.z-50 .w-full.max-w-md');
    console.log('Modal card count:', await card.count());
    console.log('Modal card visible:', await card.first().isVisible().catch(() => false));

    // Take screenshot
    await page.screenshot({ path: path.join('C:/Users/user/OneDrive/Desenvolvimentos/meu-planner-financeiro/playwright-artifacts', 'planejamento-debug.png'), fullPage: true });

    // Get page content for debugging
    const content = await page.content();
    const hasShowForm = content.includes('showForm') || content.includes('Novo Item Planejado');
    console.log('Page contains form content:', hasShowForm);

  } catch(e) {
    console.error('Error:', e);
  } finally {
    await browser.close();
  }
})();
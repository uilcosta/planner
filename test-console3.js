const { chromium } = require('playwright');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join('C:/Users/user/OneDrive/Desenvolvimentos/meu-planner-financeiro', '.env.test') });
const TEST_EMAIL = process.env.TEST_EMAIL || 'uilian_costa@hotmail.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'heyolhaprodj';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();
  
  const consoleLogs = [];
  const consoleErrors = [];
  
  page.on('console', msg => {
    consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  
  page.on('pageerror', err => {
    consoleErrors.push(err.message);
  });

  // Login
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  // Test Contas modal
  console.log('\n=== Testing Contas Modal ===');
  await page.goto('http://localhost:3000/contas', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  console.log('Console errors after nav:');
  consoleErrors.filter(e => !e.includes('instant')).forEach(e => console.log('  ERROR:', e));
  
  // Get button and click
  const criarContaBtn = page.locator('button:has-text("Nova Conta"), button:has-text("Criar Conta")');
  if (await criarContaBtn.isVisible().catch(() => false)) {
    console.log('Button found, clicking...');
    
    // Add a listener for state changes by evaluating in browser
    await page.evaluate(() => {
      // Try to find React fiber
      const root = document.querySelector('#__next');
      console.log('Root element:', root);
    });
    
    await criarContaBtn.click();
    await page.waitForTimeout(2000);
    
    console.log('Console errors after click:');
    consoleErrors.filter(e => !e.includes('instant')).forEach(e => console.log('  ERROR:', e));
    
    // Check full page HTML for modal
    const bodyHTML = await page.locator('body').innerHTML();
    const hasModal = bodyHTML.includes('fixed inset-0 z-50') || bodyHTML.includes('Nova Conta') || bodyHTML.includes('Editar Conta');
    console.log('Modal HTML found in body:', hasModal);
    
    // Check for any dialog or role=dialog
    const dialogs = await page.locator('[role="dialog"]').count();
    console.log('Dialog elements:', dialogs);
    
    // Check all fixed elements
    const fixed = await page.locator('.fixed').count();
    console.log('Fixed elements:', fixed);
    for (let i = 0; i < Math.min(fixed, 10); i++) {
      const el = page.locator('.fixed').nth(i);
      const classes = await el.getAttribute('class').catch(() => '');
      const visible = await el.isVisible().catch(() => false);
      console.log(`  Fixed ${i}: visible=${visible}, classes="${classes.substring(0, 100)}"`);
    }
  }
  
  await browser.close();
})();

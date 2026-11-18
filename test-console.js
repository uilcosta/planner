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
  
  console.log('=== Console Logs After Login ===');
  consoleLogs.forEach(l => console.log(l));
  console.log('=== Console Errors After Login ===');
  consoleErrors.filter(e => !e.includes('instant')).forEach(e => console.log('  ERROR:', e));
  
  // Test Contas modal
  console.log('\n=== Testing Contas Modal ===');
  await page.goto('http://localhost:3000/contas', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  console.log('Console errors after nav to contas:');
  consoleErrors.filter(e => !e.includes('instant')).forEach(e => console.log('  ERROR:', e));
  
  const criarContaBtn = page.locator('button:has-text("Nova Conta"), button:has-text("Criar Conta")');
  if (await criarContaBtn.isVisible().catch(() => false)) {
    console.log('Clicking Nova Conta button...');
    await criarContaBtn.click();
    await page.waitForTimeout(1000);
    
    console.log('Console errors after click:');
    consoleErrors.filter(e => !e.includes('instant')).forEach(e => console.log('  ERROR:', e));
    
    const modal = page.locator('.fixed.inset-0.z-50');
    const visible = await modal.first().isVisible().catch(() => false);
    console.log('Modal visible:', visible);
    
    if (visible) {
      const inner = page.locator('.fixed.inset-0.z-50 .w-full.max-w-md');
      const innerVisible = await inner.first().isVisible().catch(() => false);
      console.log('Inner modal visible:', innerVisible);
    }
  }
  
  await browser.close();
})();

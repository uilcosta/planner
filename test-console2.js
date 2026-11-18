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
  await page.waitForTimeout(2000);
  
  const criarContaBtn = page.locator('button:has-text("Nova Conta"), button:has-text("Criar Conta")');
  if (await criarContaBtn.isVisible().catch(() => false)) {
    console.log('Clicking Nova Conta button...');
    await criarContaBtn.click();
    await page.waitForTimeout(1500);
    
    // Check DOM for modal
    const modals = await page.locator('.fixed.inset-0.z-50').count();
    console.log('Modal backdrops found:', modals);
    
    for (let i = 0; i < modals; i++) {
      const modal = page.locator('.fixed.inset-0.z-50').nth(i);
      const visible = await modal.isVisible().catch(() => false);
      console.log(`Modal ${i} visible:`, visible);
      
      const children = modal.locator('> *');
      const childCount = await children.count();
      console.log(`Modal ${i} children:`, childCount);
      
      for (let j = 0; j < childCount; j++) {
        const child = children.nth(j);
        const childVisible = await child.isVisible().catch(() => false);
        const box = await child.boundingBox().catch(() => null);
        const className = await child.getAttribute('class').catch(() => '');
        console.log(`  Child ${j}: visible=${childVisible}, box=${JSON.stringify(box)}, class="${className}"`);
      }
    }
    
    // Check for any form elements
    const forms = await page.locator('form').count();
    console.log('Forms on page:', forms);
    
    const inputs = await page.locator('input[id="name"]').count();
    console.log('Name inputs:', inputs);
    
    // Check isFormOpen state via React DevTools equivalent - look for AccountForm in DOM
    const accountForm = await page.locator('h2:has-text("Nova Conta"), h2:has-text("Editar Conta")').count();
    console.log('AccountForm headers:', accountForm);
  }
  
  await browser.close();
})();

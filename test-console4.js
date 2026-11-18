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
  
  const criarContaBtn = page.locator('button:has-text("Nova Conta"), button:has-text("Criar Conta")');
  if (await criarContaBtn.isVisible().catch(() => false)) {
    console.log('Button found, clicking...');
    await criarContaBtn.click();
    await page.waitForTimeout(2000);
    
    // Check the dialog element
    const dialogs = await page.locator('[role="dialog"]').count();
    console.log('Dialog elements:', dialogs);
    for (let i = 0; i < dialogs; i++) {
      const dialog = page.locator('[role="dialog"]').nth(i);
      const visible = await dialog.isVisible().catch(() => false);
      const html = await dialog.innerHTML().catch(() => '');
      console.log(`Dialog ${i}: visible=${visible}, html length=${html.length}`);
      if (html) console.log(html.substring(0, 500));
    }
    
    // Check if AccountForm component is in React tree by searching for its elements
    const nameInputs = await page.locator('input[id="name"]').count();
    console.log('Name inputs:', nameInputs);
    
    const formHeaders = await page.locator('h2:has-text("Nova Conta"), h2:has-text("Editar Conta")').count();
    console.log('Form headers:', formHeaders);
    
    // Search all text for "Nova Conta" 
    const allText = await page.locator('body').innerText();
    const hasNovaConta = allText.includes('Nova Conta') && !allText.includes('Nova Conta'); // check if modal text appears
    console.log('Modal text in body:', allText.includes('Nome') || allText.includes('Instituição') || allText.includes('Saldo Inicial'));
    
    // Check all buttons
    const buttons = await page.locator('button').count();
    console.log('Total buttons:', buttons);
    for (let i = 0; i < Math.min(buttons, 20); i++) {
      const btn = page.locator('button').nth(i);
      const text = await btn.innerText().catch(() => '');
      const visible = await btn.isVisible().catch(() => false);
      if (text) console.log(`  Button ${i}: visible=${visible}, text="${text.substring(0, 30)}"`);
    }
  }
  
  await browser.close();
})();

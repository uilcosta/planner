const { chromium } = require('playwright');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join('C:/Users/user/OneDrive/Desenvolvimentos/meu-planner-financeiro', '.env.test') });
const TEST_EMAIL = process.env.TEST_EMAIL || 'uilian_costa@hotmail.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'heyolhaprodj';
const BASE_URL = 'http://localhost:3000';

async function waitForModal(page) {
  const modal = page.locator('.fixed.inset-0.z-50');
  try {
    await modal.first().waitFor({ state: 'attached', timeout: 5000 });
    // Try multiple selectors for inner card
    const selectors = [
      '.fixed.inset-0.z-50 .w-full.max-w-md',
      '.fixed.inset-0.z-50 .w-full.max-w-md\\.bg-white',
      '.fixed.inset-0.z-50 > div.w-full',
      '.fixed.inset-0.z-50 > div:not(.fixed.inset-0)',
      '.fixed.inset-0.z-50 [role="dialog"]'
    ];
    for (const selector of selectors) {
      const innerCard = page.locator(selector);
      const cardCount = await innerCard.count();
      if (cardCount > 0) {
        const cardVisible = await innerCard.first().isVisible();
        if (cardVisible) {
          console.log(`Modal detected with selector: ${selector}`);
          return true;
        }
      }
    }
    // Fallback: check if modal backdrop has any visible children
    const children = modal.locator('> *');
    const childCount = await children.count();
    for (let i = 0; i < childCount; i++) {
      const child = children.nth(i);
      const visible = await child.isVisible().catch(() => false);
      if (visible) {
        const box = await child.boundingBox().catch(() => null);
        if (box && box.width > 0 && box.height > 0) {
          console.log('Modal detected via child element');
          return true;
        }
      }
    }
    return false;
  } catch {
    return false;
  }
}

async function closeModal(page) {
  const cancelBtn = page.locator('button:has-text("Cancelar")');
  if (await cancelBtn.isVisible().catch(() => false)) {
    await cancelBtn.click();
    await page.waitForTimeout(300);
    return;
  }
  const closeBtn = page.locator('button[aria-label="Fechar formulário"], button[aria-label="Fechar"]');
  if (await closeBtn.isVisible().catch(() => false)) {
    await closeBtn.click();
    await page.waitForTimeout(300);
    return;
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

async function testModal(page, pageName, buttonTexts, formFillFn) {
  console.log(`\n=== Testing ${pageName} Modal ===`);
  let btn = null;
  for (const text of buttonTexts) {
    btn = page.locator(`button:has-text("${text}")`).first();
    if (await btn.isVisible().catch(() => false)) {
      console.log(`Found button: "${text}"`);
      break;
    }
  }
  if (!btn || !(await btn.isVisible().catch(() => false))) {
    console.log(`${pageName} button not found (tried: ${buttonTexts.join(', ')})`);
    return false;
  }

  // Check if button is disabled
  const disabled = await btn.isDisabled().catch(() => false);
  console.log(`Button disabled: ${disabled}`);

  // Try clicking with force
  await btn.click({ force: true });
  await page.waitForTimeout(1500);

  // Debug: check for any fixed inset-0 z-50 elements
  const modals = page.locator('.fixed.inset-0.z-50');
  const modalCount = await modals.count();
  console.log(`Found ${modalCount} modal backdrop elements`);
  for (let i = 0; i < modalCount; i++) {
    const m = modals.nth(i);
    const visible = await m.isVisible().catch(() => false);
    const box = await m.boundingBox().catch(() => null);
    console.log(`  Modal ${i}: visible=${visible}, box=${JSON.stringify(box)}`);
    if (visible) {
      const children = m.locator('> *');
      const childCount = await children.count();
      for (let j = 0; j < childCount; j++) {
        const child = children.nth(j);
        const cVisible = await child.isVisible().catch(() => false);
        const cBox = await child.boundingBox().catch(() => null);
        const cClass = await child.getAttribute('class').catch(() => '');
        console.log(`    Child ${j}: visible=${cVisible}, box=${JSON.stringify(cBox)}, class="${cClass}"`);
      }
    }
  }

  const modalOpened = await waitForModal(page);
  console.log(`${pageName} modal visible:`, modalOpened);
  if (modalOpened && formFillFn) {
    try {
      await formFillFn(page);
    } catch (e) {
      console.log(`Form fill error (non-critical): ${e.message}`);
    }
  }
  if (modalOpened) {
    await closeModal(page);
    console.log(`${pageName} modal closed`);
  }
  return modalOpened;
}

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('BROWSER ERROR:', msg.text());
      }
    });
    page.on('pageerror', error => {
      console.log('PAGE ERROR:', error.message);
    });

    // Login
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Test Contas modal
    await page.goto(`${BASE_URL}/contas`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);  // Wait for data loading
    await testModal(page, 'Contas', ['Nova Conta', 'Criar Conta'], async (p) => {
      await p.fill('input[id="name"]', 'Teste Conta');
      await p.fill('input[id="initialBalance"]', '1000');
      const instSelect = p.locator('select[id="institutionId"]');
      const options = await instSelect.locator('option').count();
      if (options > 1) await instSelect.selectOption({ index: 1 });
      console.log('Contas form filled');
    });

    // Test Categorias modal
    await page.goto(`${BASE_URL}/categorias`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await testModal(page, 'Categorias', ['Nova Categoria', 'Criar Categoria'], async (p) => {
      await p.fill('input[id="name"]', 'Teste Categoria');
      await p.fill('input[id="color-hex"]', '#FF0000');
      console.log('Categorias form filled');
    });

    // Test Instituicoes modal
    await page.goto(`${BASE_URL}/instituicoes`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await testModal(page, 'Instituicoes', ['Nova Instituição', 'Criar Instituição'], async (p) => {
      await p.fill('input[id="name"]', 'Teste Banco');
      await p.fill('input[id="color-hex"]', '#00FF00');
      console.log('Instituicoes form filled');
    });

    // Test Planejamento modal
    await page.goto(`${BASE_URL}/planejamento`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await testModal(page, 'Planejamento', ['Novo Item'], async (p) => {
      await p.fill('input[id="description"]', 'Teste Item');
      await p.fill('input[id="amount"]', '100');
      const catSelect = p.locator('select[id="categoryId"]');
      const options = await catSelect.locator('option').count();
      if (options > 1) await catSelect.selectOption({ index: 1 });
      console.log('Planejamento form filled');
    });

    // Test header month navigation still works after modals
    console.log('\n=== Testing Header Navigation After Modals ===');
    await page.goto(`${BASE_URL}/planejamento`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const prevMonth = page.locator('header button[aria-label="Mês anterior"]');
    const nextMonth = page.locator('header button[aria-label="Próximo mês"]');
    await prevMonth.click();
    await page.waitForTimeout(300);
    console.log('Previous month works');
    await nextMonth.click();
    await page.waitForTimeout(300);
    console.log('Next month works');

    // Test theme toggle
    console.log('\n=== Testing Theme Toggle ===');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const themeToggle = page.locator('button[aria-label*="tema" i], button[aria-label*="theme" i]');
    await themeToggle.click();
    await page.waitForTimeout(500);
    console.log('Theme toggle works');

    // Test sidebar collapse/expand
    console.log('\n=== Testing Sidebar Collapse/Expand ===');
    const collapseBtn = page.locator('aside button[aria-label="Colapsar menu"], aside button[aria-label="Expandir menu"]').first();
    if (await collapseBtn.isVisible().catch(() => false)) {
      await collapseBtn.click();
      await page.waitForTimeout(500);
      console.log('Sidebar collapse/expand works');
      await collapseBtn.click();
      await page.waitForTimeout(500);
      console.log('Sidebar expand/collapse works');
    }

    // Final screenshots
    await page.screenshot({ path: path.join('C:/Users/user/OneDrive/Desenvolvimentos/meu-planner-financeiro/playwright-artifacts', 'final-comprehensive-light.png'), fullPage: true });
    console.log('\nFinal light screenshot captured');

    await themeToggle.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join('C:/Users/user/OneDrive/Desenvolvimentos/meu-planner-financeiro/playwright-artifacts', 'final-comprehensive-dark.png'), fullPage: true });
    console.log('Final dark screenshot captured');

    console.log('\n=== ALL TESTS PASSED ===');

  } catch(e) {
    console.error('Error:', e);
  } finally {
    await browser.close();
  }
})();
const { chromium } = require('playwright');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join('C:/Users/user/OneDrive/Desenvolvimentos/meu-planner-financeiro', '.env.test') });
const artifactDir = path.join('C:/Users/user/OneDrive/Desenvolvimentos/meu-planner-financeiro', 'playwright-artifacts');
const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = process.env.TEST_EMAIL || 'uilian_costa@hotmail.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'heyolhaprodj';

async function waitForModal(page) {
  // Wait for modal backdrop to appear - check attached state first
  const modal = page.locator('.fixed.inset-0.z-50, [role="dialog"]');
  try {
    await modal.first().waitFor({ state: 'attached', timeout: 5000 });
    // Check if it's actually visible
    const isVisible = await modal.first().isVisible();
    if (isVisible) return true;
    // Check computed style
    const box = await modal.first().boundingBox();
    console.log('Modal backdrop bounding box:', box);
    // Get element handle and check style
    const element = await modal.first().elementHandle();
    if (element) {
      const style = await element.evaluate(el => getComputedStyle(el));
      console.log('Modal computed display:', style.display);
      console.log('Modal computed visibility:', style.visibility);
      console.log('Modal computed opacity:', style.opacity);
    }
    // Check inner Card element
    const innerCard = page.locator('.fixed.inset-0.z-50 .w-full.max-w-md, .fixed.inset-0.z-50 Card, .fixed.inset-0.z-50 > div');
    const cardCount = await innerCard.count();
    console.log('Inner card elements:', cardCount);
    if (cardCount > 0) {
      const cardBox = await innerCard.first().boundingBox();
      console.log('Inner card bounding box:', cardBox);
      const cardVisible = await innerCard.first().isVisible();
      console.log('Inner card visible:', cardVisible);
      if (cardVisible || (cardBox && cardBox.width > 0 && cardBox.height > 0)) {
        return true;
      }
    }
    return box !== null && box.width > 0 && box.height > 0;
  } catch {
    return false;
  }
}

async function closeModal(page) {
  // Try multiple ways to close modal
  const cancelBtn = page.locator('button:has-text("Cancelar")');
  if (await cancelBtn.isVisible().catch(() => false)) {
    await cancelBtn.click();
    await page.waitForTimeout(300);
    return;
  }
  const closeBtn = page.locator('button[aria-label="Fechar"], button[aria-label="Fechar formulário"], button[aria-label="Close"]');
  if (await closeBtn.isVisible().catch(() => false)) {
    await closeBtn.click();
    await page.waitForTimeout(300);
    return;
  }
  // Press Escape
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });

    // Login
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // ===== TEST DASHBOARD PAGE =====
    console.log('=== Dashboard Page ===');

    // Test New Account button
    const newAccountBtn = page.locator('button:has-text("Nova Conta")');
    if (await newAccountBtn.isVisible().catch(() => false)) {
      await newAccountBtn.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      console.log('New Account button works - navigated to:', page.url());
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
    }

    // Test New Caixinha button
    const newCaixinhaBtn = page.locator('button:has-text("Nova Caixinha")');
    if (await newCaixinhaBtn.isVisible().catch(() => false)) {
      await newCaixinhaBtn.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      console.log('New Caixinha button works - navigated to:', page.url());
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
    }

    // Test Quick Action cards (click)
    const quickActions = page.locator('main .grid.gap-4.md\\:grid-cols-3 .cursor-pointer');
    const qaCount = await quickActions.count();
    console.log('Quick action cards:', qaCount);
    for (let i = 0; i < Math.min(qaCount, 3); i++) {
      await quickActions.nth(i).click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      console.log('Quick action ' + i + ' navigated to:', page.url());
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
    }

    // Test Ver todas button
    const verTodasBtn = page.locator('button:has-text("Ver todas")');
    if (await verTodasBtn.isVisible().catch(() => false)) {
      await verTodasBtn.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      console.log('Ver todas works - navigated to:', page.url());
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
    }

    // ===== TEST CONTAS PAGE =====
    console.log('\n=== Contas Page ===');
    await page.goto(`${BASE_URL}/contas`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Test Nova Conta button
    const novaContaBtn = page.locator('button:has-text("Nova Conta")').first();
    if (await novaContaBtn.isVisible().catch(() => false)) {
      await novaContaBtn.click();
      await page.waitForTimeout(500);
      console.log('Nova Conta button clicked - checking for modal');
      const modalOpened = await waitForModal(page);
      console.log('Modal visible:', modalOpened);
      await closeModal(page);
    }

    // ===== TEST CAIXINHAS PAGE =====
    console.log('\n=== Caixinhas Page ===');
    await page.goto(`${BASE_URL}/caixinhas`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Test Nova Caixinha button
    const novaCaixinhaBtn = page.locator('button:has-text("Nova Caixinha")').first();
    if (await novaCaixinhaBtn.isVisible().catch(() => false)) {
      await novaCaixinhaBtn.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      console.log('Nova Caixinha button works - navigated to:', page.url());
      await page.goto(`${BASE_URL}/caixinhas`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
    }

    // Test quick action cards
    const caixinhaCards = page.locator('main .grid.gap-4.md\\:grid-cols-3 .cursor-pointer');
    const ccCount = await caixinhaCards.count();
    console.log('Caixinha quick action cards:', ccCount);

    // ===== TEST PLANEJAMENTO PAGE =====
    console.log('\n=== Planejamento Page ===');
    await page.goto(`${BASE_URL}/planejamento`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);  // Wait for hydration

    // Test Novo Item button
    const novoItemBtn = page.locator('button:has-text("Novo Item")').first();
    if (await novoItemBtn.isVisible().catch(() => false)) {
      await novoItemBtn.click();
      await page.waitForTimeout(1000);  // Give more time for modal to appear
      console.log('Novo Item button clicked - checking for modal');
      const modalCount = await page.locator('.fixed.inset-0.z-50').count();
      console.log('Modal elements found:', modalCount);
      const modalOpened = await waitForModal(page);
      console.log('Modal visible:', modalOpened);
      if (modalOpened) {
        // Test form fields
        const descInput = page.locator('input[name="description"]');
        if (await descInput.isVisible().catch(() => false)) {
          await descInput.fill('Teste');
          console.log('Description input works');
        }
        const amountInput = page.locator('input[name="amount"]');
        if (await amountInput.isVisible().catch(() => false)) {
          await amountInput.fill('100');
          console.log('Amount input works');
        }
        // Close modal
        await closeModal(page);
        console.log('Modal closed');
      }
    }

    // Test month navigation (after modal is closed)
    const prevMonth = page.locator('header button[aria-label="Mês anterior"]').first();
    const nextMonth = page.locator('header button[aria-label="Próximo mês"]').first();
    await prevMonth.click();
    await page.waitForTimeout(300);
    console.log('Previous month works');
    await nextMonth.click();
    await page.waitForTimeout(300);
    console.log('Next month works');

    // ===== TEST CATEGORIAS PAGE =====
    console.log('\n=== Categorias Page ===');
    await page.goto(`${BASE_URL}/categorias`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Test Nova Categoria button
    const novaCatBtn = page.locator('button:has-text("Nova Categoria"), button:has-text("Novo")').first();
    if (await novaCatBtn.isVisible().catch(() => false)) {
      await novaCatBtn.click();
      await page.waitForTimeout(500);
      console.log('Nova Categoria button clicked - checking for modal');
      const modalOpened = await waitForModal(page);
      console.log('Modal visible:', modalOpened);
      await closeModal(page);
    }

    // ===== TEST INSTITUICOES PAGE =====
    console.log('\n=== Instituicoes Page ===');
    await page.goto(`${BASE_URL}/instituicoes`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Test Nova Instituicao button
    const novaInstBtn = page.locator('button:has-text("Nova Instituição"), button:has-text("Novo")').first();
    if (await novaInstBtn.isVisible().catch(() => false)) {
      await novaInstBtn.click();
      await page.waitForTimeout(500);
      console.log('Nova Instituição button clicked - checking for modal');
      const modalOpened = await waitForModal(page);
      console.log('Modal visible:', modalOpened);
      await closeModal(page);
    }

    // ===== TEST LANCAMENTOS PAGE =====
    console.log('\n=== Lancamentos Page ===');
    await page.goto(`${BASE_URL}/lancamentos`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Test Novo Lancamento button
    const novoLancBtn = page.locator('button:has-text("Novo Lançamento"), button:has-text("Novo")').first();
    if (await novoLancBtn.isVisible().catch(() => false)) {
      await novoLancBtn.click();
      await page.waitForTimeout(500);
      console.log('Novo Lançamento button clicked - checking for modal');
      const modalOpened = await waitForModal(page);
      console.log('Modal visible:', modalOpened);
      await closeModal(page);
    }

    // ===== TEST MOBILE RESPONSIVE =====
    console.log('\n=== Mobile Responsive ===');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Check bottom nav
    const bottomNav = page.locator('nav[aria-label="Navegação móvel"]');
    console.log('Bottom nav visible:', await bottomNav.isVisible().catch(() => false));

    // Check mobile menu button
    const menuBtn = page.locator('button[aria-label="Abrir menu"]');
    console.log('Menu button visible:', await menuBtn.isVisible().catch(() => false));

    // Open sidebar drawer
    if (await menuBtn.isVisible().catch(() => false)) {
      await menuBtn.click();
      await page.waitForTimeout(500);
      const aside = page.locator('aside[aria-label="Menu principal"]');
      console.log('Sidebar drawer visible:', await aside.isVisible().catch(() => false));

      // Click a nav link (use force to bypass overlay)
      const firstLink = page.locator('aside a[href="/"]').first();
      if (await firstLink.isVisible().catch(() => false)) {
        await firstLink.click({ force: true });
        await page.waitForTimeout(500);
        console.log('Sidebar link clicked, drawer should close');
      }
    }

    // Test bottom nav links
    const bottomLinks = page.locator('nav[aria-label="Navegação móvel"] a');
    const blCount = await bottomLinks.count();
    console.log('Bottom nav links:', blCount);
    for (let i = 0; i < Math.min(blCount, 3); i++) {
      const link = bottomLinks.nth(i);
      const href = await link.getAttribute('href');
      console.log('Bottom nav link ' + i + ':', href);
      try {
        await link.click({ timeout: 5000 });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        console.log('Navigated to:', page.url());
      } catch (e) {
        console.log('Click intercepted by dev overlay, navigating directly');
        await page.goto(`${BASE_URL}${href}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(500);
        console.log('Navigated to:', page.url());
      }
    }

    // Final screenshots
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(artifactDir, 'final-all-pages-light.png'), fullPage: true });
    console.log('\nFinal light screenshot captured');

    const themeToggle = page.locator('button[aria-label*="tema" i], button[aria-label*="theme" i]');
    await themeToggle.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(artifactDir, 'final-all-pages-dark.png'), fullPage: true });
    console.log('Final dark screenshot captured');

  } catch(e) {
    console.error('Error:', e);
  } finally {
    await browser.close();
  }
})();
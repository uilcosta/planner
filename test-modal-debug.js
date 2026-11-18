const { chromium } = require('playwright');
const path = require('path');
const os = require('os');

const targetUrl = 'http://localhost:3000';
const artifactDir = path.join(os.tmpdir(), 'playwright-artifacts');

(async () => {
  const browser = await chromium.launch({ headless: false });
  try {
    const page = await browser.newPage();

    // Capture console messages - filter for errors/warnings
    page.on('console', msg => {
      const text = msg.text();
      const type = msg.type();
      if (type === 'error' || type === 'warning' || text.includes('Error') || text.includes('error') || text.includes('Warning') || text.includes('warning') || text.includes('React') || text.includes('hydrat')) {
        console.log(`CONSOLE [${type}]: ${text}`);
      }
    });
    page.on('pageerror', err => console.log(`PAGE ERROR: ${err.message}`));

    // Login first
    await page.goto(`${targetUrl}/login`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    console.log('=== On login page ===');

    await page.getByLabel('E-mail').fill('uilian_costa@hotmail.com');
    await page.getByLabel('Senha').fill('heyolhaprodj');
    await page.getByRole('button', { name: /entrar/i }).click();

    // Wait for navigation - could go to / then redirect
    await page.waitForURL('**/(dashboard)**', { timeout: 15000 }).catch(() => {});
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const currentUrl = page.url();
    console.log(`Current URL after login: ${currentUrl}`);

    // If not on dashboard, navigate to contas
    if (!currentUrl.includes('/contas')) {
      await page.goto(`${targetUrl}/contas`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    }

    console.log('=== On Contas page ===');
    console.log(`URL: ${page.url()}`);

    // List all buttons
    const buttons = await page.getByRole('button').all();
    for (const btn of buttons) {
      const text = await btn.textContent();
      console.log(`Button: "${text}"`);
    }

    // Click Criar Conta button
    const criarBtn = page.getByRole('button', { name: /criar conta/i });
    await criarBtn.waitFor({ state: 'visible', timeout: 10000 });
    console.log('Criar Conta button found, clicking...');
    await criarBtn.click();

    // Wait for modal
    await page.waitForTimeout(500);

    // Check for modal
    const modals = await page.locator('.fixed.inset-0.z-50').all();
    console.log(`Modals found: ${modals.length}`);

    for (let i = 0; i < modals.length; i++) {
      const modal = modals[i];
      const isVisible = await modal.isVisible();
      const box = await modal.boundingBox();
      console.log(`Modal ${i}: visible=${isVisible}, box=${JSON.stringify(box)}`);

      if (isVisible) {
        const children = await modal.locator('> *').all();
        for (let j = 0; j < children.length; j++) {
          const child = children[j];
          const childVisible = await child.isVisible();
          const childBox = await child.boundingBox();
          const childClass = await child.getAttribute('class');
          console.log(`  Child ${j}: visible=${childVisible}, box=${JSON.stringify(childBox)}, class=${childClass}`);
        }
      }
    }

    // Take screenshot
    await page.screenshot({ path: path.join(artifactDir, 'contas-modal-debug.png'), fullPage: true });
    console.log('Screenshot saved');

  } finally {
    await browser.close();
  }
})();
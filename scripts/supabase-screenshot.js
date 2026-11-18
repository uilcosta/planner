const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const projectUrl = 'https://supabase.com/dashboard/project/cakbrbgnruhzwsqwtxcd';
const artifactDir = '/c/Users/user/OneDrive/Desenvolvimentos/meu-planner-financeiro/playwright-artifacts';

if (!fs.existsSync(artifactDir)) {
  fs.mkdirSync(artifactDir, { recursive: true });
}

(async () => {
  // Conectar ao Chrome existente com remote debugging (porta 9222)
  // Se não tiver Chrome rodando com --remote-debugging-port=9222, lança novo
  let browser;
  try {
    browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    console.log('Conectado ao Chrome existente');
  } catch {
    console.log('Lançando novo Chrome...');
    browser = await chromium.launch({
      headless: false,
      args: ['--remote-debugging-port=9222']
    });
  }

  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages()[0] || await context.newPage();

  try {
    // 1. Página inicial do projeto (Overview) - tem Project URL
    console.log('Acessando Overview...');
    await page.goto(projectUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(artifactDir, 'supabase-overview.png'),
      fullPage: true
    });
    console.log('Screenshot: supabase-overview.png');

    // 2. Settings > API - tem as keys
    console.log('Acessando Settings > API...');
    await page.goto(`${projectUrl}/settings/api`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(artifactDir, 'supabase-settings-api.png'),
      fullPage: true
    });
    console.log('Screenshot: supabase-settings-api.png');

    // 3. Authentication > Providers - para ver Email auth
    console.log('Acessando Authentication > Providers...');
    await page.goto(`${projectUrl}/auth/providers`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(artifactDir, 'supabase-auth-providers.png'),
      fullPage: true
    });
    console.log('Screenshot: supabase-auth-providers.png');

  } catch (err) {
    console.error('Erro:', err.message);
  } finally {
    // Não fecha o browser se conectou a um existente
    if (!browser.isConnected()) {
      await browser.close();
    }
  }
})();
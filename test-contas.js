const { chromium } = require('playwright');
const path = require('path');
const artifactDir = path.join('C:/Users/user/OneDrive/Desenvolvimentos/meu-planner-financeiro', 'playwright-artifacts');
const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'uilian_costa@hotmail.com';
const TEST_PASSWORD = 'heyolhaprodj';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  // Login
  console.log('Logging in...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[name="email"]', TEST_EMAIL);
  await page.fill('input[name="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  console.log('Logged in, at:', page.url());

  // Test contas
  console.log('Going to contas...');
  await page.goto(`${BASE_URL}/contas`, { waitUntil: 'networkidle', timeout: 60000 });
  console.log('URL:', page.url());
  await page.screenshot({ path: path.join(artifactDir, 'contas.png'), fullPage: true });

  await browser.close();
})();
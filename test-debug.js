const { chromium } = require('playwright');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join('C:/Users/user/OneDrive/Desenvolvimentos/meu-planner-financeiro', '.env.test') });
const artifactDir = path.join('C:/Users/user/OneDrive/Desenvolvimentos/meu-planner-financeiro', 'playwright-artifacts');
const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = process.env.TEST_EMAIL;
const TEST_PASSWORD = process.env.TEST_PASSWORD;

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
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

  // Test planejamento
  console.log('Going to planejamento...');
  try {
    await page.goto(`${BASE_URL}/planejamento`, { waitUntil: 'networkidle', timeout: 60000 });
    console.log('URL:', page.url());
    await page.screenshot({ path: path.join(artifactDir, 'planejamento.png'), fullPage: true });
    console.log('Screenshot saved');
  } catch (e) {
    console.error('Error:', e);
    await page.screenshot({ path: path.join(artifactDir, 'planejamento-error.png'), fullPage: true });
  }

  await browser.close();
})();
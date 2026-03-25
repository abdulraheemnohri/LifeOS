const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set viewport to mobile to test the mobile UI specifically
  await page.setViewportSize({ width: 375, height: 812 });

  try {
    await page.goto('http://localhost:5000');

    // Login
    await page.click('button:has-text("Use Locally")');
    await page.fill('#password', 'lifeos');
    await page.click('button:has-text("Login")');

    // Wait for dashboard
    await page.waitForSelector('h1:has-text("Dashboard")');
    console.log("Logged in successfully");

    const modules = ['habits', 'groceries', 'utilities', 'secrets'];
    const screenshotDir = path.join(__dirname, 'verification');
    if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir);

    for (const mod of modules) {
        console.log(`Checking module: ${mod}`);

        // Open More menu
        await page.click('#nav-more');
        await page.waitForSelector('#more-menu', { state: 'visible' });

        // Click the module button inside more-menu
        // Use a more specific selector to avoid desktop nav conflict
        await page.click(`#more-menu button[onclick*="showSection('${mod}')"]`);

        // Wait for section to render
        // Every section has a header or specific class
        await page.waitForTimeout(500);

        await page.screenshot({ path: path.join(screenshotDir, `mobile_${mod}.png`) });
        console.log(`Screenshot saved for ${mod}`);

        // Close more menu if it didn't auto-close (it should auto-close on showSection)
    }

    // Verify FAB
    await page.click('#fab-main');
    await page.waitForSelector('#fab-menu', { state: 'visible' });
    await page.screenshot({ path: path.join(screenshotDir, `mobile_fab.png`) });
    console.log("FAB menu verified");

  } catch (err) {
    console.error('Testing failed:', err);
    await page.screenshot({ path: 'error_screenshot.png' });
  } finally {
    await browser.close();
  }
})();

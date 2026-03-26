const { chromium, devices } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const pixel5 = devices['Pixel 5'];
    const context = await browser.newContext({
        ...pixel5,
        viewport: { width: 390, height: 844 }
    });
    const page = await context.newPage();

    console.log('--- Phase 1: Mode Selection & Login ---');
    await page.goto('http://localhost:3000');
    await page.waitForSelector('#mode-view');
    await page.screenshot({ path: 'v4_01_mode_selection.png' });

    await page.click('button:has-text("Work Locally")');
    await page.waitForSelector('#login-view');
    await page.fill('#password', 'lifeos');
    await page.click('#login-btn');

    console.log('--- Phase 2: Dashboard Redesign ---');
    await page.waitForSelector('#main-view');
    await page.waitForTimeout(1000); // Wait for animations
    await page.screenshot({ path: 'v4_02_dashboard_redesign.png' });

    console.log('--- Phase 3: Tasks with Search & Bulk ---');
    await page.click('#nav-more');
    await page.click('button:has-text("Tasks")'); // It's in more menu or bottom nav if I added it
    // Wait, let's use showSection via evaluate if nav is tricky
    await page.evaluate(() => showSection('tasks'));
    await page.waitForSelector('#task-search');

    // Add a task
    await page.click('button:has-text("+ New Task")');
    await page.fill('#task-title', 'Redesign Verification');
    await page.selectOption('#task-priority', 'High');
    await page.click('button:has-text("Save Task")');
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'v4_03_tasks_module.png' });

    console.log('--- Phase 4: Theme Engine ---');
    await page.evaluate(() => showSection('settings'));
    await page.waitForSelector('h3:has-text("Display Settings")');

    // Change to a blue theme (accent index 1)
    await page.click('div[onclick*="#38bdf8"]');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'v4_04_theme_blue.png' });

    console.log('--- Phase 5: Bills with Archiving ---');
    await page.evaluate(() => showSection('bills'));
    await page.waitForSelector('button:has-text("View Archived")');
    await page.screenshot({ path: 'v4_05_bills_module.png' });

    await browser.close();
    console.log('--- Verification Complete ---');
})();

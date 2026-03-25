import asyncio
from playwright.async_api import async_playwright
import os

async def run_verification():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        # Set viewport to mobile to test adaptive layout and "More" menu
        context = await browser.new_context(viewport={'width': 390, 'height': 844})
        page = await context.new_page()
        page.on("console", lambda msg: print(f"Browser Console: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"Browser Error: {exc}"))

        # Go to app (assuming it's running on 5000)
        await page.goto("http://localhost:5000")

        # Use locally
        await page.click("button:has-text('Work Locally')")
        await page.fill("#password", "lifeos")
        await page.click("#login-btn")

        # Wait for dashboard
        await page.wait_for_selector("h1:has-text('Dashboard')")

        # --- Test Habits ---
        await page.click("#nav-more")
        await page.click("#more-menu button:has-text('Habits')")
        await page.wait_for_selector("h1:has-text('Habit Tracker')")
        # Add a habit
        await page.click("button:has-text('Add Habit')")
        await page.fill("input[placeholder='Exercise, Reading...']", "Test Habit")
        await page.fill("input[placeholder='Daily goal (e.g. 1)']", "1")
        await page.click("button:has-text('Save Habit')")
        await page.wait_for_timeout(500)
        await page.screenshot(path="/home/jules/verification/habits_filled.png")

        # --- Test Groceries ---
        await page.click("#nav-more")
        await page.click("#more-menu button:has-text('Grocery')")
        await page.wait_for_selector("h1:has-text('Grocery List')")
        # Add grocery
        await page.click("button:has-text('Add Item')")
        await page.fill("input[placeholder='Milk, Eggs...']", "Test Milk")
        await page.click("button:has-text('Save Item')")
        await page.wait_for_timeout(500)
        await page.screenshot(path="/home/jules/verification/groceries_filled.png")

        # --- Test Utilities ---
        await page.click("#nav-more")
        await page.click("#more-menu button:has-text('Utility')")
        await page.wait_for_selector("h1:has-text('Utilities & Services')")
        # Add utility
        await page.click("button:has-text('Add Utility')")
        await page.fill("input[placeholder='Electricity, Internet...']", "Test Power")
        await page.click("button:has-text('Save Utility')")
        await page.wait_for_timeout(500)
        await page.screenshot(path="/home/jules/verification/utilities_filled.png")

        # --- Test Secrets ---
        await page.click("#nav-more")
        await page.click("#more-menu button:has-text('Secrets')")
        await page.wait_for_selector("h1:has-text('Secrets Safe')")
        # Add secret
        await page.click("button:has-text('Add Secret')")
        await page.fill("input[placeholder='GitHub, AWS...']", "Test Key")
        await page.fill("input[placeholder='username/email']", "user@test.com")
        await page.fill("input[placeholder='password/key']", "secret123")
        await page.click("button:has-text('Save Secret')")
        await page.wait_for_timeout(500)
        await page.screenshot(path="/home/jules/verification/secrets_filled.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run_verification())

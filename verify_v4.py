import asyncio
from playwright.async_api import async_playwright
import time
import os

async def run_verification():
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1280, "height": 800})

        print("--- Testing Redesign ---")
        await page.goto("http://localhost:3000")

        # Mode Selection
        await page.wait_for_selector("#mode-view")
        await page.click("button:has-text('Work Locally')")

        # Login
        await page.wait_for_selector("#login-view")
        await page.fill("#password", "lifeos")
        await page.click("#login-btn")

        # Dashboard
        await page.wait_for_selector("#main-view")
        time.sleep(1) # wait for animations
        await page.screenshot(path="v4_desktop_dashboard.png")

        # Check for Tasks search/bulk
        await page.evaluate("showSection('tasks')")
        await page.wait_for_selector("#task-search")
        await page.screenshot(path="v4_desktop_tasks.png")

        # Check for Theme Engine
        await page.evaluate("showSection('settings')")
        await page.wait_for_selector("h3:has-text('Display Settings')")
        # Click on blue theme
        await page.click("div[onclick*='#38bdf8']")
        time.sleep(1)
        await page.screenshot(path="v4_desktop_theme_blue.png")

        # Check for Bills Archive
        await page.evaluate("showSection('bills')")
        await page.wait_for_selector("button:has-text('View Archived')")
        await page.screenshot(path="v4_desktop_bills.png")

        await browser.close()
        print("--- Desktop Verification Complete ---")

if __name__ == "__main__":
    asyncio.run(run_verification())

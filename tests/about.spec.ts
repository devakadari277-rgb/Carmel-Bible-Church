import { test, expect } from '@playwright/test';

test('About page navigation', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('link', { name: 'About' }).click();
});
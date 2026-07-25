import { test, expect } from '@playwright/test';

test('Carmel Bible Church Full Website Navigation Test', async ({ page }) => {

    // 1. Open Website
    await page.goto('http://localhost:5173/');

    // 2. Open Menu → About
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('link', { name: 'About' }).click();

    // 3. Open Menu → Ministries
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('link', { name: 'Ministries' }).click();

    // 4. Read More Modal
    await page.getByRole('button', { name: 'Read More' }).click();
    await expect(page.getByRole('button', { name: 'Close modal' })).toBeVisible();
    await page.getByRole('button', { name: 'Close modal' }).click();

    // 5. Upcoming Events
    await page.getByRole('link', { name: 'Upcoming Events' }).click();

    // 6. Sign In
    await page.getByRole('navigation').getByRole('link', { name: 'Sign In' }).click();

});
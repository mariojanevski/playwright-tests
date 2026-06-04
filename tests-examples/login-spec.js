const {test, expect} = require('@playwright/test');
const { LoginPage } = require('../pages/loginPage');



const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/login.page');

test.describe('Login Suite', () => {

    test('Successful Login', async ({ page }) => {
        const loginPage = new LoginPage(page);

        await page.goto('https://example.com/login');
        await loginPage.login('mario', 'secret_pass');

        await expect(page).toHaveURL(/dashboard/);
    });
});
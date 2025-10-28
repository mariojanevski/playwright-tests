const { expect } = require('@playwright/test');
const { CheckoutScreen } = require('../pages/checkoutScreen');

/**
 * Compares a UI product locator object with an API product data object.
 * Fails the test if any key field doesn't match.
 *
 * @param {Object} uiProduct - An object containing locators from the page (from getAllProductItemLocators).
 * @param {Object} apiProduct - An object representing product data from the API.
 */
async function compareUiProductToApiProduct(uiProduct, apiProduct) {
    const uiName = (await uiProduct.name.textContent()).trim();
    const uiPriceText = (await uiProduct.price.textContent()).trim();
    const uiImageSrc = (await uiProduct.image.getAttribute('src')).trim();
    const uIDataProductId = await uiProduct.dataProductId;

    const uiPriceCents = Math.round(parseFloat(uiPriceText.replace('$', '').trim()) * 100);

    console.log(`🔍 Comparing product: UI = "${uiName}" | API = "${apiProduct.name}"
        price: UI = "${uiPriceCents} | API = "${apiProduct.priceCents}"
        Id: UI = "${uIDataProductId} | API = "${apiProduct.id}"`);

    expect(uiName).toBe(apiProduct.name);
    expect(uiPriceCents).toBe(apiProduct.priceCents);
    expect(uiImageSrc).toBe(apiProduct.image);
    expect(uIDataProductId).toBe(apiProduct.id);
}

/**
 * Navigates to the checkout page, removes all items from the cart,
 * and then navigates back to the home page.
 *
 * @param {HomeScreen} homePage - The HomeScreen page object.
 * @param {CheckoutScreen} checkoutPage - The CheckoutScreen page object.
 */
async function navigateToCartAndDeleteAllItems(homePage, checkoutPage) {
    // 1. Go to the checkout page
    await checkoutPage.navigateToCheckoutPage();

    // 2. Remove all items currently in the cart
    await checkoutPage.removeAllProductsFromCart();

    // 3. Navigate back to the home page
    await homePage.navigateToHomePage();
}

module.exports = { compareUiProductToApiProduct, navigateToCartAndDeleteAllItems };
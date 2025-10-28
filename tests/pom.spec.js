const { test, expect } = require('@playwright/test');
const HomePage = require('../pages/HomePage').default; // Adjust path as per your project structure
const { getAndValidateProductContainers } = require('../utils/productHelpers');

test.describe('Home Page Product Tests', () => {
  let homePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigateToHomePage();
    const productContainers = page.locator('.product-container');
    await expect(productContainers.first()).toBeVisible();
  });

  test('Verify home page title and product details for the first product', async ({ page }) => {
    // Step 1: Check the page's main title
    // 'page' is the whole browser tab, so we check its title directly.
    await expect(page).toHaveTitle('Amazon Project');

    // Step 2: Get the total number of products (now we know they are visible because of beforeEach)
    const productsCount = await homePage.getNumberOfProductContainers();
    // Assert that we found more than zero products
    await expect(productsCount).toBeGreaterThan(0);

    // Step 3: Get the "box" for the very first product
    const firstProductContainer = await homePage.getProductContainerByIndex(0);

    // Step 4: Get the "name" label specifically from INSIDE that first product's box
    const productNameLocator = homePage.getProductNameLocator(firstProductContainer);
    // Now, check if that specific "name" label has the correct text
    await expect(productNameLocator).toHaveText('Black and Gray Athletic Cotton Socks - 6 Pairs');

    // Step 5: Get the "price" label specifically from INSIDE that first product's box
    const productPriceLocator = homePage.getProductPriceLocator(firstProductContainer); // Use getProductPriceLocator
    // Now, check if that specific "price" label has the correct text
    await expect(productPriceLocator).toHaveText('$10.90');

    // You could also add a check for the entire container's text if you want,
    // but typically you check specific elements within it for clarity.
    // await expect(firstProductContainer).toContainText('Black and Gray Athletic Cotton Socks - 6 Pairs');
    // await expect(firstProductContainer).toContainText('$10.90');
  });

  test('should loop through all containers and check if they have name and price', async () => {
    const allProducts = await homePage.getAllProductItemLocators();

    expect(allProducts.length).toBeGreaterThan(0);

    for (let i = 0; i < allProducts.length; i++) {
      const product = allProducts[i]; 

      await expect(product.name).toBeVisible();
      await expect(product.name).not.toBeEmpty();

      await expect(product.price).toBeVisible();
      await expect(product.price).not.toBeEmpty();
      await expect(product.price).toContainText('$');

      const nameText = await product.name.textContent();
      const priceText = await product.price.textContent();
      console.log(`Product ${i + 1}: Name: "${nameText}", Price: "${priceText}"`);

      await expect(product.addToCartButton).toBeVisible();
      await expect(product.rating).toBeVisible();
      await expect(product.quantityContainer).toBeVisible();
    }
    console.log('Successfully validated name and price for all product containers.');
  });

  test('check what products contain Instructions and Waranty links', async ({page}) => {
    const productsCount = await homePage.getNumberOfProductContainers();
    expect(productsCount).toBeGreaterThan(0);
    console.log(`Found ${productsCount} product containers.`);

    const allProducts = await homePage.getAllProductItemLocators();

    const expectedWarrantyUrl = 'http://localhost:50823/images/appliance-warranty.png';
    const expectedInstructionsUrl = 'http://localhost:50823/images/appliance-instructions.png';

    for (let i = 0; i < allProducts.length; i++) {
      const product = allProducts[i];

      const hasWarrantyLink = await product.warrantyLink.isVisible();
      const hasInstructionsLink = await product.instructionLink.isVisible();
      const nameText = await product.name.textContent();

      if (hasWarrantyLink && hasInstructionsLink) {
        console.log(`Product "${nameText}" Has Warranty and Instructions links.`);

        const warrantyPagePromise = page.context().waitForEvent('page'); 
        await product.warrantyLink.click();
        const warrantyPage = await warrantyPagePromise;
        await warrantyPage.waitForLoadState();
        const warrantyUrl = warrantyPage.url();
        expect(warrantyUrl).toBe(expectedWarrantyUrl);
        await warrantyPage.close();

        const instructionsPagePromise = page.context().waitForEvent('page');
        await product.instructionLink.click();
        const instructionsPage = await instructionsPagePromise;
        await instructionsPage.waitForLoadState();
        const instructionsUrl = instructionsPage.url();
        expect(instructionsUrl).toBe(expectedInstructionsUrl);
        await instructionsPage.close();
      }
    }
  });

  test('should add the first product to cart and verify cart count', async () => {
    const initialCartCountText = await homePage.getCartQuantitity().textContent();
    // Convert to number, handle initial empty state (e.g., if it shows "0" or is empty string)
    const initialCartCount = parseInt(initialCartCountText);

    // Get the first product container and its add-to-cart button
    const firstProductContainer = await homePage.getProductContainerByIndex(0);
    const addToCartButton = homePage.getProductAddToCartButton(firstProductContainer);

    // Click the add to cart button
    await addToCartButton.click();

    // Wait for the cart count to update (Playwright's expect will retry)
    const cartCountLocator = homePage.getCartQuantitity();
    await expect(cartCountLocator).toHaveText(String(4));

    console.log(`Successfully added a product to cart. New cart count: ${await cartCountLocator.textContent()}`);
  });

  test('Check price of Intermediate Size Basketball', async () => {
    const allProducts = await homePage.getAllProductItemLocators();

    expect(allProducts.length).toBeGreaterThan(0);

    for (let i = 0; i < allProducts.length; i++) {
      const product = allProducts[i];
      const nameText = (await product.name.textContent())?.trim();
      const priceText = (await product.price.textContent())?.trim();

      if (nameText === 'Intermediate Size Basketball') {
        console.log(`Found it! Price: ${priceText}`);
        expect(priceText).toBe('$20.95');
      }
    }
  });

});
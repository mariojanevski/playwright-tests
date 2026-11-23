import { test, expect, defineConfig } from '@playwright/test'
import { compareUiProductToApiProduct, navigateToCartAndDeleteAllItems } from '../utils/productHelpers.js';
import { HomeScreen } from '../pages/homeScreen.js';
import { CheckoutScreen } from '../pages/checkoutScreen.js';
import { assert } from 'console';

test.describe('Home Page Product Tests', () => {
  /** @type {import('../pages/homeScreen.js').HomeScreen} */
  let homePage;
  let checkoutPage;
  let uiProducts;
  let apiProducts;

  test.beforeEach(async ({ page }) => {
    homePage = new HomeScreen(page);
    checkoutPage = new CheckoutScreen(page);
    // Navigate to home page
    await homePage.navigateToHomePage();

    // Define the main locator for the containers, and assert at least 1 container is visible
    const productContainers = page.locator('.product-container');
    await expect(productContainers.first()).toBeVisible();
  });

  test('Verify home page title and product details for the first product', async ({ page }) => {
    // Assert that the page title is as expected
    await expect(page).toHaveTitle('Amazon Project');

    // Take all the products and assert that the number is > than 0
    const productsCount = await homePage.getNumberOfProductContainers();
    await expect(productsCount).toBeGreaterThan(0);

    // Take the first product from the list
    const firstProductContainer = await homePage.getProductContainerByIndex(0);
    const productNameLocator = homePage.getProductNameLocator(firstProductContainer); // Take the products name
    await expect(productNameLocator).toHaveText('Black and Gray Athletic Cotton Socks - 6 Pairs'); // Assert the name of the first product is as expected
    const productPriceLocator = homePage.getProductPriceLocator(firstProductContainer); // Get the products price
    await expect(productPriceLocator).toHaveText('$10.90'); // Assert that the products price is as expected
  });

  test('Loop through all containers and check if they have name and price', async ({ }) => {
    // Get all products and their locators and assert there number of products is not 0
    const allProducts = await homePage.getAllProductItemLocators();
    await expect(allProducts.length).toBeGreaterThan(0);

    const numberOfContainers = await homePage.getNumberOfProductContainers();
    console.log(`Number of containers found ${numberOfContainers}`);

    // Loop through the products and assert they have name and price
    for (let i = 0; i < allProducts.length; i++) {
      const product = allProducts[i];
      await expect(product.name).toBeVisible();
      await expect(product.name).not.toBeEmpty();

      await expect(product.price).toBeVisible();
      await expect(product.price).not.toBeEmpty();
      await expect(product.price).toContainText('$');

      const nameText = (await product.name.textContent()).trim();
      const priceText = (await product.price.textContent()).trim();
      console.log(`Product ${i + 1}: Name: "${nameText}", Price: "${priceText}"`);
    }
  });

  test('Loop through all containers and check if all locators are present', async ({ }) => {
    // Get all products and their locators and assert there number of products is not 0
    const allProducts = await homePage.getAllProductItemLocators();
    await expect(allProducts.length).toBeGreaterThan(0);

    // Loop through the products and check if they have their locators
    for (let i = 0; i < allProducts.length; i++) {
      const product = allProducts[i];
      const hasWarrantyLink = await product.warrantyLink.isVisible();
      const hasInstructionsLink = await product.instructionLink.isVisible();
      const sizeChartLink = await product.sizeChartLink.isVisible();
      const nameText = (await product.name.textContent()).trim();

      await expect(product.name).toBeVisible();
      await expect(product.name).not.toBeEmpty();

      await expect(product.price).toBeVisible();
      await expect(product.price).not.toBeEmpty();
      await expect(product.price).toContainText('$');

      await expect(product.addToCartButton).toBeVisible();

      await expect(product.rating).toBeVisible();

      // If the product has Warranty and Instructions link - print them out
      if (hasWarrantyLink && hasInstructionsLink) {
        console.log(`Product "${nameText}" Has Warranty and Instructions links.`);
      } else if (sizeChartLink) {
        console.log(`Product "${nameText}" Has Size chart link.`);
      }
    }
  });

  test('Warranty and Instructions links open the correct files', async ({ baseURL }) => {
    // new URL() joins the parts safely, so we never end up with a double slash like "...50874//images"
    const expectedWarrantyUrl = new URL('images/appliance-warranty.png', baseURL).href;
    const expectedInstructionsUrl = new URL('images/appliance-instructions.png', baseURL).href;

    // Only the products that have a Warranty link
    const appliances = homePage.getProductsWithWarrantyLink();

    // If the links disappear from the site, the test must FAIL here (the old version silently passed)
    await expect(appliances).not.toHaveCount(0);

    const count = await appliances.count();
    for (let i = 0; i < count; i++) {
      const product = appliances.nth(i);
      const name = (await homePage.getProductNameLocator(product).textContent()).trim();

      // A product with a Warranty link must also have an Instructions link (the old version skipped it if not)
      const instructionsLink = homePage.getProductInstructionLink(product);
      await expect(instructionsLink, `"${name}" is missing the Instructions link`).toBeVisible();

      // Open each link in its new tab and check where it goes
      const warrantyTab = await homePage.openLinkInNewTab(homePage.getProductWarrantyLink(product));
      await expect(warrantyTab, `"${name}" Warranty link goes to the wrong place`).toHaveURL(expectedWarrantyUrl);
      await warrantyTab.close();

      const instructionsTab = await homePage.openLinkInNewTab(instructionsLink);
      await expect(instructionsTab, `"${name}" Instructions link goes to the wrong place`).toHaveURL(expectedInstructionsUrl);
      await instructionsTab.close();
    }
  });

  test('Check if Size chart link navigates to correct URL', async ({ page, baseURL }) => {
    // Get all products
    const allProducts = await homePage.getAllProductItemLocators();

    // Define the expected URL for the size chart link
    const expectedSizeChartUrl = new URL('images/clothing-size-chart.png', baseURL).href;

    // Loop through the products and if they have Size chart link, open it and assert the URL is correct
    for (let i = 0; i < allProducts.length; i++) {
      const product = allProducts[i];

      const hasSizeChartLink = await product.sizeChartLink.isVisible();


      if (hasSizeChartLink) {

        const sizeChartPromise = page.context().waitForEvent('page');
        await product.sizeChartLink.click();
        const sizeChartPage = await sizeChartPromise;
        await sizeChartPage.waitForLoadState();
        const sizeChartUrl = sizeChartPage.url();
        expect(sizeChartUrl).toBe(expectedSizeChartUrl);
        await sizeChartPage.close();
      }
    }
  });

  test('Check the price of a random product', async ({ }) => {
    // Get a random product and its name
    const { container, name } = await homePage.getRandomProductWithName();
    const price = (await homePage.getProductPriceText(container)).trim();

    // Print out the random products name and price
    console.log(`Random Product Picked: ${name} - ${price}`);
  });

  test('Product data on UI matches API data', async ({ request }) => {
    // Store the API products in a variable
    const apiProducts = await homePage.fetchProductsFromApi(request);

    // Store the UI products in a variable
    const uiProducts = await homePage.getAllProductItemLocators();
    expect(uiProducts.length).toBe(apiProducts.length);

    // Loop through the products and check if UI products match the API products
    for (let i = 0; i < apiProducts.length; i++) {
      const apiProduct = apiProducts[i];
      const uiProduct = uiProducts[i];

      const uiName = await uiProduct.name.textContent();
      const uiPriceText = await uiProduct.price.textContent();
      const uiImageSrc = await uiProduct.image.getAttribute('src');
      const uiProductId = await uiProduct.dataProductId;

      const apiName = apiProduct.name;
      const apiPriceCents = apiProduct.priceCents;
      const apiImage = apiProduct.image;
      const apiProductId = apiProduct.id;

      const uiPriceCents = Math.round(parseFloat(uiPriceText.replace('$', '').trim()) * 100);

      expect(uiName.trim()).toBe(apiName);
      expect(uiPriceCents).toBe(apiPriceCents);
      expect(uiImageSrc).toBe(apiImage);
      expect(uiProductId).toBe(apiProductId);
    }
  });

  test('Compare UI products to API products', async ({ request }) => {
    // Store the API products in a variable
    const apiProducts = await homePage.fetchProductsFromApi(request);

    // Store the UI products in a variable
    const uiProducts = await homePage.getAllProductItemLocators();

    // Assert that the number of UI products matches the number of API products
    expect(uiProducts.length).toBe(apiProducts.length);

    // Loop through the products and compare them
    for (let i = 0; i < apiProducts.length; i++) {
      await compareUiProductToApiProduct(uiProducts[i], apiProducts[i]);
    }
  });

  test('Add some random items to the Cart and check their names and price and ID', async ({ request }) => {
    // Add random products to the cart
    await homePage.addMultipleRandomProductsToCart(10);

    // Navigate to the cart
    await homePage.navigateToCart();

    // Get all the items that are in the cart and assert there is at least 1 item
    const cartItems = await checkoutPage.getAllCartItemLocators();
    expect(cartItems.length).toBeGreaterThan(0);

    // Store API products in a variable
    const apiProducts = await homePage.fetchProductsFromApi(request);

    // Loop through the products on the cart and check if the product ID matches the API products ID
    for (let i = 0; i < cartItems.length; i++) {
      const cartItem = cartItems[i];
      const { name, price, id } = cartItem;

      const apiProduct = apiProducts.find(product => product.id === id);

      const nameText = await name.textContent();
      const priceText = await price.textContent();

      const expectedPrice = `$${(apiProduct.priceCents / 100).toFixed(2)}`;

      expect(nameText.trim()).toBe(apiProduct.name);
      expect(priceText.trim()).toBe(expectedPrice);


      console.log(`✅ Verified: Product ID ${id} - Name: ${nameText.trim()}, Price: ${priceText.trim()}`);
    }

  });

  test('Add random product to cart with ammout of 4', async ({ page }) => {
    await page.goto('/amazon.html');
    await page.getByRole('link', { name: 'Cart' }).click();
    // Make sure the cart is empty
    await navigateToCartAndDeleteAllItems(homePage, checkoutPage);

    // Get a random product, its container and name
    const { container, name } = await homePage.getRandomProductWithName();
    // Get the random products quantity selector and select 4
    await homePage.setProductQuantity(container, 4);

    // Assert that the selected value is 4
    await expect(await homePage.getProductQuantityValue(container)).toBe('4');

    // Add the product to the cart
    await homePage.getProductAddToCartButton(container).click();

    // Assert cart quantity on home screen shows correct number of items in the cart
    await expect(await homePage.getCartQuantity()).toBe('4');

    // Print out the randomly selected product name
    console.log(`Added ${name} with quantity of 4 to Cart!`)

    // Navigate to cart
    await homePage.navigateToCart();

    // Assert the quantity for the added product is shown correctly
    const cartItems = await checkoutPage.getAllCartItemLocators();
    const quantity = (cartItems[0].quantity)
    expect(quantity).toBe('4');

    const priceString = await cartItems[0].price.textContent();
    const actualPrice = parseFloat(priceString.replace('$', ''));
    const expectedTotalPrice = actualPrice * 4;
    const priceShownString = await checkoutPage.getCheckoutProductsPrice().textContent()
    const priceShown = parseFloat(priceShownString.trim().replace('$', ''));

    await expect(expectedTotalPrice).toBe(priceShown);
  });

  test('test', async ({ }) => {
    await homePage.navigateToCart();

    const cartItems = await checkoutPage.getAllCartItemLocators()
    const deliveryOptions = cartItems[0].deliveryOptions;

    await deliveryOptions[2].click();
    await expect(deliveryOptions[2].locator('input[type="radio"]')).toBeChecked();

  });

  test('testtest', async ({ }) => {
    await homePage.navigateToCart();

    await expect(checkoutPage.getOrderTotalPrice()).toContainText('52.51');

  });

  test('Add 3 random products to cart and verify the total price', async ({ }) => {
    // Clear the cart first, then come back to the home page
    await checkoutPage.navigateToCheckoutPage();
    await checkoutPage.removeAllProductsFromCart();
    await homePage.navigateToHomePage();

    let expectedTotalCents = 0;

    // Add 3 random products and track their prices
    for (let i = 0; i < 3; i++) {
      const { container, name } = await homePage.getRandomProductWithName();
      const priceText = (await homePage.getProductPriceText(container)).trim();

      // Convert to cents to avoid floating-point rounding issues
      const priceCents = Math.round(parseFloat(priceText.replace('$', '')) * 100);
      expectedTotalCents += priceCents;

      await homePage.getProductAddToCartButton(container).click();
      console.log(`Added product ${i + 1}: "${name}" - ${priceText}`);
    }

    // Navigate to the cart
    await homePage.navigateToCart();

    // Get the products subtotal from the payment summary and verify it matches
    const productsPriceLocator = checkoutPage.getCheckoutProductsPrice();
    await expect(productsPriceLocator).toBeVisible();

    const displayedPriceText = (await productsPriceLocator.textContent()).trim();
    const displayedPriceCents = Math.round(parseFloat(displayedPriceText.replace('$', '')) * 100);

    console.log(`Expected total: $${(expectedTotalCents / 100).toFixed(2)} | Displayed total: ${displayedPriceText}`);
    expect(displayedPriceCents).toBe(expectedTotalCents);
  });
});
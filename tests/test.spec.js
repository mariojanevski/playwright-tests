import { test, expect } from '@playwright/test';
import { getAndValidateProductContainers } from '../utils/productHelpers';

test('first test', async ({ page }) => {
  await page.goto('http://localhost:60558/amazon.html')
  await expect(page).toHaveTitle('Amazon Project')

  const productContainers = page.locator('.product-container');

  await expect(productContainers).not.toHaveCount(0);
  await expect(productContainers.first()).toBeVisible();
  const firstProduct = productContainers.first()
  await expect(firstProduct.locator('.product-name')).toHaveText('Black and Gray Athletic Cotton Socks - 6 Pairs');
  await expect(firstProduct.locator('.product-price')).toHaveText('$10.90');
});

test('loop through all containers and check if they have name and price', async ({ page }) => {
  await page.goto('http://localhost:60558/amazon.html')
  await expect(page).toHaveTitle('Amazon Project')

  const { productContainers, numberOfProducts } = await getAndValidateProductContainers(page);

  for (let i = 0; i < numberOfProducts; i++) {
    const currentProductContainer = productContainers.nth(i);

    const productNameLocator = currentProductContainer.locator('.product-name');
    const productPriceLocator = currentProductContainer.locator('.product-price');
    const productAddToCartButton = currentProductContainer.locator('.js-add-to-cart');
    const productRating = currentProductContainer.locator('.product-rating-stars');
    const productQuantityContainer = currentProductContainer.locator('.product-quantity-container');

    await expect(productNameLocator).toBeVisible();

    await expect(productNameLocator).not.toBeEmpty();

    await expect(productPriceLocator).toBeVisible();

    await expect(productPriceLocator).not.toBeEmpty();
    await expect(productPriceLocator).toContainText('$')

    await expect(productAddToCartButton).toBeVisible();

    await expect(productRating).toBeVisible();

    await expect(productQuantityContainer).toBeVisible();

    const nameText = await productNameLocator.textContent();
    const priceText = await productPriceLocator.textContent();
    console.log(`  Product ${i + 1}: Name found: "${nameText}", Price found: "${priceText}", Product rating available, Add to cart button available, Product quantity container available.`);
  }

  console.log('All product containers successfully checked for name, price, rating, quantity container and add to cart button.');
});

test('check what products contain Instructions and Waranty links', async ({ page }) => {
  await page.goto('http://localhost:60558/amazon.html')

  const { productContainers, numberOfProducts } = await getAndValidateProductContainers(page);
  console.log(`Found ${numberOfProducts} product containers.`);

  for (let i = 0; i < numberOfProducts; i++) {
    const currentProductContainer = productContainers.nth(i);

    const productNameLocator = currentProductContainer.locator('.product-name');
    const productWarantyLink = currentProductContainer.getByRole('link', { name: 'Warranty' });
    const productInstructionLink = currentProductContainer.getByRole('link', { name: 'Instructions' });

    const hasWarrantyLink = await productWarantyLink.isVisible();
    const hasInstructionsLink = await productInstructionLink.isVisible();

    const nameText = await productNameLocator.textContent();

    if (hasWarrantyLink && hasInstructionsLink) {
      console.log(`Product "${nameText}" has Warranty and Instructions links.`);
    }
  }
});
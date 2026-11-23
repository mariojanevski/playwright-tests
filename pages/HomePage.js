// pages/HomePage.js
class HomePage {
    constructor(page) {
        this.page = page;
        this.productContainers = page.locator('.product-container');
    }

    async navigateToHomePage() {
        await this.page.goto('/amazon.html');
    }

    async getNumberOfProductContainers() {
    await this.productContainers.first().waitFor({ state: 'visible', timeout: 10000 }); 
    return await this.productContainers.count();
    }


    async getProductContainerByIndex(index) {
        return this.productContainers.nth(index);
    }

    getProductNameLocator(productContainer) {
        return productContainer.locator('.product-name');
    }

    getProductPriceLocator(productContainer) {
        return productContainer.locator('.product-price');
    }

    getProductAddToCartButton(productContainer) {
        return productContainer.locator('.js-add-to-cart');
    }

    getCartQuantitity() {
      return this.page.locator('.js-cart-quantity')
    }

    getProductRating(productContainer) {
        return productContainer.locator('.product-rating-stars');
    }

    getProductQuantityContainer(productContainer) {
        return productContainer.locator('.product-quantity-container');
    }

    getProductWarrantyLink(productContainer) {
        return productContainer.getByRole('link', { name: 'Warranty' });
    }

    getProductInstructionLink(productContainer) {
        return productContainer.getByRole('link', { name: 'Instructions' });
    }

    /**
     * Returns an array of objects, where each object contains all locators for a single product.
     * This is ideal for iterating through all products in tests.
     * @returns {Promise<Array<Object>>} An array where each element is an object with product-specific locators.
     */
    async getAllProductItemLocators() {
        const allProductItemLocators = [];
        const numberOfProducts = await this.getNumberOfProductContainers();

        for (let i = 0; i < numberOfProducts; i++) {
            const currentProductContainer = await this.getProductContainerByIndex(i);

            const productLocators = {
                container: currentProductContainer, // The main product container
                name: this.getProductNameLocator(currentProductContainer),
                price: this.getProductPriceLocator(currentProductContainer),
                addToCartButton: this.getProductAddToCartButton(currentProductContainer),
                rating: this.getProductRating(currentProductContainer),
                quantityContainer: this.getProductQuantityContainer(currentProductContainer),
                warrantyLink: this.getProductWarrantyLink(currentProductContainer),
                instructionLink: this.getProductInstructionLink(currentProductContainer),
            };
            allProductItemLocators.push(productLocators);
        }
        return allProductItemLocators;
    }
}
module.exports = HomePage;
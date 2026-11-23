class HomeScreen {
  constructor(page, baseURL) {
    this.page = page;
    this.baseURL = baseURL;
    this.productContainers = page.locator('.product-container');
  }

  getProductNameLocator(productContainer) {
    return productContainer.locator('.product-name');
  }

  getProductImageLocatr(productContainer) {
    return productContainer.locator('.product-image')
  }

  getProductPriceLocator(productContainer) {
    return productContainer.locator('.product-price');
  }

  getProductAddToCartButton(productContainer) {
    return productContainer.locator('.js-add-to-cart');
  }

  async getCartQuantity() {
    const cartQuantityLocator = this.page.locator('.js-cart-quantity');
    return await cartQuantityLocator.textContent();
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

  getSizeChartLink(productContainer) {
    return productContainer.getByRole('link', { name: 'Size chart' });
  }

  // Only the product boxes that contain a Warranty link (the appliances)
  getProductsWithWarrantyLink() {
    return this.productContainers.filter({ has: this.page.getByRole('link', { name: 'Warranty' }) });
  }

  // Clicks a link that opens in a new tab and returns that new tab
  async openLinkInNewTab(link) {
    const newTabPromise = this.page.waitForEvent('popup');
    await link.click();
    const newTab = await newTabPromise;
    await newTab.waitForLoadState();
    return newTab;
  }

  getDataProductId(productContainer) {
    const button = this.getProductAddToCartButton(productContainer);
    return button.getAttribute('data-product-id');
  }

  getProductQuantitySelector(productContainer) {
    return productContainer.locator('.js-quantity-selector');
  }

  async setProductQuantity(productContainer, quantity) {
    const quantitySelector = this.getProductQuantitySelector(productContainer);
    await quantitySelector.selectOption(quantity.toString());
  }

  async getProductQuantityValue(productContainer) {
    const quantitySelector = this.getProductQuantitySelector(productContainer);
    return await quantitySelector.inputValue();
  }

  async navigateToHomePage() {
    await this.page.goto('/amazon.html');
  }

  async navigateToCart() {
    await this.page.locator('.cart-icon').click();
  }

  async getNumberOfProductContainers() {
    await this.productContainers.first().waitFor({ state: 'visible', timeout: 10000 });
    return await this.productContainers.count();
  }

  getProductContainerByIndex(index) {
    return this.productContainers.nth(index);
  }

  async getAllProductItemLocators() {
    const allProductItemLocators = [];
    const numberOfProducts = await this.getNumberOfProductContainers();

    for (let i = 0; i < numberOfProducts; i++) {
      const currentProductContainer = await this.getProductContainerByIndex(i);

      const productLocators = {
        container: currentProductContainer,
        name: this.getProductNameLocator(currentProductContainer),
        image: this.getProductImageLocatr(currentProductContainer),
        price: this.getProductPriceLocator(currentProductContainer),
        addToCartButton: this.getProductAddToCartButton(currentProductContainer),
        rating: this.getProductRating(currentProductContainer),
        quantityContainer: this.getProductQuantityContainer(currentProductContainer),
        warrantyLink: this.getProductWarrantyLink(currentProductContainer),
        instructionLink: this.getProductInstructionLink(currentProductContainer),
        sizeChartLink: this.getSizeChartLink(currentProductContainer),
        dataProductId: this.getDataProductId(currentProductContainer)
      };
      allProductItemLocators.push(productLocators);
    }
    return allProductItemLocators;
  }

  async getProductPriceText(productContainer) {
    const priceLocator = this.getProductPriceLocator(productContainer);
    const priceText = priceLocator.textContent();
    return priceText;
  }

  async getRandomProductWithName() {
    const count = await this.getNumberOfProductContainers();

    const randomIndex = Math.floor(Math.random() * count);
    const container = this.getProductContainerByIndex(randomIndex);

    const nameLocator = this.getProductNameLocator(container);
    const nameText = await nameLocator.textContent();

    return {
      container,
      name: nameText.trim()
    };
  }

  async addRandomProductToCart() {
    const randomProduct = await this.getRandomProductWithName();
    const addToCartButton = this.getProductAddToCartButton(randomProduct.container);
    await addToCartButton.click();
  }

  async addMultipleRandomProductsToCart(numberOfProducts) {
    for (let i = 0; i < numberOfProducts; i++) {
      await this.addRandomProductToCart();
    }
  }

  async fetchProductsFromApi(request) {
    const response = await request.get('https://supersimplebackend.dev/products');
    if (!response.ok()) {
      throw new Error(`Failed to fetch products: ${response.status()}`);
    }
    const data = await response.json();
    return data;
  }

}

export { HomeScreen };
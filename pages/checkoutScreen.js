class CheckoutScreen {
  constructor(page, baseURL) {
    this.page = page;
    this.baseURL = baseURL;
    this.cartContainers = page.locator('.cart-item-container')
    this.paymentSummary = page.locator('.payment-summary')
  }

  getCartContainerNameLocator(cartContainer) {
    return cartContainer.locator('.product-name');
  }

  getCartContainerPriceLocator(cartContainer) {
    return cartContainer.locator('.product-price');
  }

  getCartContainerDeleteButton(cartContainer) {
    return cartContainer.locator('.js-delete-link');
  }

  getCheckoutProductsPrice() {
    return this.paymentSummary.locator('.js-products-money')
  }

  getShippingProductsPrice() {
    return this.paymentSummary.locator('.js-shipping-money')
  }

  getBeforeTaxPrice() {
    return this.paymentSummary.locator('.js-before-tax-money')
  }

  getTaxPrice() {
    return this.paymentSummary.locator('.js-tax-money')
  }

  getOrderTotalPrice() {
    return this.paymentSummary.locator('.js-total-money')
  }

  async getDeliveryOptionsLocators(cartContainer) {
    const deliveryOptionLocators = await cartContainer.locator('.js-delivery-option').all();
    return deliveryOptionLocators;
  }

  async getQuantityLocator(cartContainer) {
    const quantityLocator = cartContainer.locator('.quantity-label');
    return await quantityLocator.textContent();
  }

  async removeProductFromCart(productId) {
    const cartContainers = await this.getAllCartItemLocators();
    const productToDelete = cartContainers.find(product => product.id === productId);

    if (productToDelete) {
      await productToDelete.deleteButton.click();
    } else {
      console.error(`Product with ID ${productId} not found in cart.`);
    }
  }

  async removeAllProductsFromCart() {
    const cartItems = await this.getAllCartItemLocators();

    for (const item of cartItems) {
      await this.removeProductFromCart(item.id);
    }
  }

  async getNumberOfCartContainers() {
    await this.cartContainers.first().waitFor({ state: 'visible', timeout: 10000 });
    return await this.cartContainers.count();
  }

  // async getAllCartItemLocators() {
  //   const allCartItemLocators = [];
  //   const numberOfItems = await this.getNumberOfCartContainers();

  //   for (let i = 0; i < numberOfItems; i++) {
  //     const currentCartContainer = this.cartContainers.nth(i);

  //     const cartProductLocators = {
  //       container: currentCartContainer,
  //       name: this.getCartContainerNameLocator(currentCartContainer),
  //       price: this.getCartContainerPriceLocator(currentCartContainer),
  //     };
  //     allCartItemLocators.push(cartProductLocators);
  //   }
  //   return allCartItemLocators;
  // }

  async getAllCartItemLocators() {
    const allCartItemLocators = [];
    const numberOfItems = await this.getNumberOfCartContainers();

    for (let i = 0; i < numberOfItems; i++) {
      const currentCartContainer = this.cartContainers.nth(i);

      const containerClasses = await currentCartContainer.getAttribute('class');
      const idMatch = containerClasses.match(/js-cart-item-container-([a-f0-9-]+)/);

      const uiProductId = idMatch ? idMatch[1] : null;

      const cartProductLocators = {
        container: currentCartContainer,
        name: this.getCartContainerNameLocator(currentCartContainer),
        price: this.getCartContainerPriceLocator(currentCartContainer),
        id: uiProductId,
        deleteButton: this.getCartContainerDeleteButton(currentCartContainer),
        quantity: await this.getQuantityLocator(currentCartContainer),
        deliveryOptions: await this.getDeliveryOptionsLocators(currentCartContainer),
      };
      allCartItemLocators.push(cartProductLocators);
    }
    return allCartItemLocators;
  }

  async navigateToCheckoutPage() {
    await this.page.goto('/checkout.html');
  }
}

export { CheckoutScreen };
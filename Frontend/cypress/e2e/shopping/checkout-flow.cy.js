/// <reference types="cypress" />

describe('E2E: Complete Checkout Flow', () => {
  
  let userEmail;
  let userPassword;

  before(() => {
    // Register a test user for checkout tests
    const timestamp = Date.now();
    userEmail = `checkout${timestamp}@test.com`;
    userPassword = 'CheckoutPass123!';
    
    cy.visit('/');
    cy.register('Checkout Test User', userEmail, userPassword);
  });

  beforeEach(() => {
    // Login before each test
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.login(userEmail, userPassword);
    cy.visit('/');
  });

  it('TC_E2E_CHECKOUT_001: Complete purchase journey from browse to order confirmation', () => {
    // ===== PART 1: BROWSE PRODUCTS =====
    
    // Step 1: Verify homepage loaded
    cy.waitForPageLoad();
    cy.url().should('include', Cypress.config().baseUrl);
    
    // Step 2: Browse products (correct class is .item)
    cy.get('.item', { timeout: 10000 })
      .should('have.length.greaterThan', 0);
    
    // Step 3: Click "Xem chi tiết" button on first product
    cy.get('.item').first().find('.view-details-btn').click();
    
    // Step 4: Verify product detail page
    cy.url().should('include', '/product/');
    
    // Store product name for later verification
    cy.get('.product-name, .item-name, h1, h2').first().invoke('text').as('productName');
    
    // ===== PART 2: ADD TO CART =====
    
    // Step 5: Keep default quantity (1) - no need to change
    // Just verify the default quantity is set
    cy.get('input[type="number"], .quantity-input').should('have.value', '1');
    
    // Step 6: Add to cart
    cy.contains('button', /Thêm vào giỏ|Add to cart/i).click();
    
    // Step 7: Verify success toast (message includes quantity and unit)
    cy.contains(/Đã thêm.*vào giỏ hàng|Added to cart|thêm.*giỏ/i, { timeout: 5000 })
      .should('be.visible');
    
    // ===== PART 3: VIEW CART =====
    
    // Step 8: Go to cart
    cy.get('.cart-icon, [data-testid="cart-icon"], a[href*="cart"]').first().click();
    
    // Step 9: Verify URL
    cy.url().should('include', '/cart');
    
    // Step 10: Verify product in cart
    cy.get('@productName').then((productName) => {
      cy.contains(productName).should('be.visible');
    });
    
    // Verify quantity is 1 (default)
    cy.get('input.quantity-input, input[type="number"]').first().should('have.value', '1');
    
    // ===== PART 4: CHECKOUT =====
    
    // Step 11: Proceed to checkout
    cy.contains('button', /Thanh toán|Proceed|Checkout/i).click();
    
    // Step 12: Verify on order/checkout page
    cy.url().should('match', /\/(order|checkout|place-order)/);
    
    // Step 13: Fill delivery information (actual form fields from PlaceOrder component)
    cy.get('input[name="firstName"]').first().clear().type('Nguyễn');
    cy.get('input[name="lastName"]').first().clear().type('Văn A');
    cy.get('input[name="address"], textarea[name="address"]').first().type('123 Nguyễn Huệ, Quận 1, TP.HCM');
    cy.get('input[name="contactNumber1"]').first().type('0901234567');
    
    // contactNumber2 is optional, skip it
    
    // Step 14: Select payment method (COD/test)
    cy.get('input[value="COD"], input[value="test"], input[type="radio"]').first().check({ force: true });
    
    // Step 15: Place order
    cy.contains('button', /Đặt hàng|Place Order/i).click();
    
    // ===== PART 5: VERIFY ORDER SUCCESS =====
    
    // Step 16: Verify redirected to verify success page
    cy.url({ timeout: 15000 }).should('include', '/verify');
    cy.url().should('include', 'success=true');
    cy.url().should('include', 'orderId=');
    
    // Step 17: Verify success message or page content
    cy.contains(/thành công|success|successfully|đặt hàng/i, { timeout: 10000 })
      .should('be.visible');
    
    // Alternative: Can navigate to orders page to verify order exists
    // cy.visit('/orders');
    // cy.url().should('include', '/orders');
  });

  it('TC_E2E_CHECKOUT_002: Should add multiple products to cart', () => {
    cy.visit('/');
    
    // Add first product using "Thêm vào giỏ" button directly from homepage
    cy.get('.item').first().find('.add-to-cart-btn, button').contains(/Thêm|Add|🛒/i).click();
    cy.wait(1000);
    
    // Add second product
    cy.get('.item').eq(1).find('.add-to-cart-btn, button').contains(/Thêm|Add|🛒/i).click();
    cy.wait(1000);
    
    // Go to cart
    cy.get('.cart-icon, [data-testid="cart-icon"], .navbar-cart').first().click();
    
    // Verify 2 products in cart
    cy.get('.cart-items-item').should('have.length', 2);
  });

  it('TC_E2E_CHECKOUT_003: Should update quantity in cart', () => {
    // Add product via UI (more reliable than API)
    cy.visit('/');
    cy.get('.item').first().find('.add-to-cart-btn, button').contains(/Thêm|Add|🛒/i).click();
    cy.wait(1000);
    
    // Visit cart
    cy.visit('/cart');
    
    // Increase quantity
    cy.get('button').contains(/\+|Tăng/i).first().click();
    
    // Wait for update
    cy.wait(500);
    
    // Verify quantity changed to 3
    cy.get('input[type="number"], .quantity-input').first().should('have.value', '3');
  });

  it('TC_E2E_CHECKOUT_004: Should remove item from cart', () => {
    // Add 2 products via UI
    cy.visit('/');
    cy.get('.item').first().find('.add-to-cart-btn, button').contains(/Thêm|Add|🛒/i).click();
    cy.wait(1000);
    cy.get('.item').eq(1).find('.add-to-cart-btn, button').contains(/Thêm|Add|🛒/i).click();
    cy.wait(1000);
    
    cy.visit('/cart');
    
    // Count initial items
    cy.get('.cart-items-item').should('have.length', 2);
    
    // Remove first item (click cross button)
    cy.get('.cross').first().click();
    
    // Confirm deletion (if there's a confirmation dialog)
    cy.contains('button', /Xóa|Delete|Confirm/i).click();
    
    // Wait for removal
    cy.wait(1000);
    
    // Verify only 1 item left
    cy.get('.cart-items-item').should('have.length', 1);
  });

  it('TC_E2E_CHECKOUT_005: Should show empty cart message when no items', () => {
    // Don't add any product, just visit cart with empty state
    cy.visit('/cart');
    
    // Should show empty cart message
    cy.contains(/Giỏ hàng.*trống|Cart is empty|đang trống/i).should('be.visible');
    
    // Checkout button should be disabled or not exist
    cy.get('body').then($body => {
      const checkoutBtn = $body.find('button:contains("Thanh toán"), button:contains("Checkout")');
      if (checkoutBtn.length > 0) {
        cy.wrap(checkoutBtn).first().should('be.disabled');
      }
    });
  });

  it('TC_E2E_CHECKOUT_006: Should validate delivery information', () => {
    // Add product via UI
    cy.visit('/');
    cy.get('.item').first().find('.add-to-cart-btn, button').contains(/Thêm|Add|🛒/i).click();
    cy.wait(1000);
    
    cy.visit('/cart');
    cy.contains('button', /Thanh toán/i).click();
    
    // Try to place order without filling required fields
    cy.contains('button', /Đặt hàng/i).click();
    
    // Should stay on order page (not redirect) or show validation warning
    cy.url().should('match', /\/(order|checkout|place-order)/);
    
    // HTML5 validation: Check for invalid input field or warning message
    cy.get('input[name="firstName"], input[name="lastName"], input[name="address"]')
      .first()
      .then($input => {
        // Check if field is marked as invalid (HTML5 validation)
        expect($input[0].validity.valid).to.be.false;
      });
  });
});

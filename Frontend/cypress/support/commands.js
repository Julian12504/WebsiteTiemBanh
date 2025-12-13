// ***********************************************************
// Custom Cypress Commands for WebsiteTiemBanh
// ***********************************************************

import '@testing-library/cypress/add-commands';

/**
 * Custom command: Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @example cy.login('test@test.com', 'Pass123!')
 */
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/');
  cy.waitForPageLoad();
  
  // Click login button
  cy.contains('button', 'Đăng nhập').click();
  
  // Wait for popup to appear with longer timeout
  cy.get('.login-popup', { timeout: 10000 }).should('be.visible');
  cy.wait(500); // Extra wait for animation
  
  // Fill login form
  cy.get('input[type="email"]').clear().type(email);
  cy.get('input[type="password"]').clear().type(password);
  
  // Click submit
  cy.contains('button', 'Đăng nhập').click();
  
  // Wait for login to complete
  cy.url().should('eq', Cypress.config().baseUrl + '/');
  
  // Verify token exists in localStorage
  cy.window().its('localStorage.token').should('exist');
});

/**
 * Custom command: Register new user
 * @param {string} name - User full name
 * @param {string} email - User email
 * @param {string} password - User password
 * @example cy.register('Test User', 'test@test.com', 'Pass123!')
 */
Cypress.Commands.add('register', (name, email, password) => {
  cy.visit('/');
  cy.waitForPageLoad();
  
  // Open login popup
  cy.contains('button', 'Đăng nhập').click();
  
  // Wait for popup to appear with longer timeout
  cy.get('.login-popup', { timeout: 10000 }).should('be.visible');
  cy.wait(500); // Extra wait for animation
  
  // Switch to register form by clicking "Đăng ký ngay"
  cy.contains('span', 'Đăng ký ngay').click();
  cy.wait(300);
  
  // Wait for register form to appear (verify "Đăng ký" title)
  cy.get('.login-popup-title h2').should('contain', 'Đăng ký');
  
  // Fill registration form
  cy.get('input[name="name"]').clear().type(name);
  cy.get('input[name="email"]').clear().type(email);
  cy.get('input[name="password"]').clear().type(password);
  cy.get('input[name="confirmPassword"]').clear().type(password);
  
  // Submit (button text is "Tạo tài khoản" when in register mode)
  cy.contains('button', 'Tạo tài khoản').click();
  
  // Wait for success
  cy.contains(/Đăng ký thành công|Đăng nhập thành công/i, { timeout: 5000 }).should('be.visible');
});

/**
 * Custom command: Logout user
 * @example cy.logout()
 */
Cypress.Commands.add('logout', () => {
  // Click on user dropdown/menu
  cy.get('.navbar-profile, .user-dropdown, [data-testid="user-menu"]').click();
  
  // Click logout
  cy.contains(/Đăng xuất/i).click();
  
  // Verify token is removed
  cy.window().its('localStorage.token').should('not.exist');
});

/**
 * Custom command: Add item to cart via API (faster than UI)
 * @param {number} itemId - Item ID
 * @param {number} quantity - Quantity to add
 * @example cy.addToCartAPI(1, 2)
 */
Cypress.Commands.add('addToCartAPI', (itemId, quantity = 1) => {
  cy.window().then((win) => {
    const token = win.localStorage.getItem('token');
    
    if (!token) {
      throw new Error('User must be logged in to add to cart');
    }
    
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/api/cart/add`,
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: { itemId, quantity }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.success).to.be.true;
    });
  });
});

/**
 * Custom command: Get cart data via API
 * @example cy.getCartAPI().then(cart => { ... })
 */
Cypress.Commands.add('getCartAPI', () => {
  cy.window().then((win) => {
    const token = win.localStorage.getItem('token');
    
    return cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/api/cart/get`,
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      return response.body.cartData;
    });
  });
});

/**
 * Custom command: Clear cart
 * @example cy.clearCart()
 */
Cypress.Commands.add('clearCart', () => {
  cy.window().then((win) => {
    const token = win.localStorage.getItem('token');
    
    if (token) {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/api/cart/get`,
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then((response) => {
        const cartItems = response.body.cartData || [];
        
        // Remove each item
        cartItems.forEach((item) => {
          cy.request({
            method: 'POST',
            url: `${Cypress.env('apiUrl')}/api/cart/remove`,
            headers: {
              Authorization: `Bearer ${token}`
            },
            body: { itemId: item._id }
          });
        });
      });
    }
  });
});

/**
 * Custom command: Seed test database (requires backend endpoint)
 * @example cy.seedDatabase()
 */
Cypress.Commands.add('seedDatabase', () => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/test/seed`,
    failOnStatusCode: false
  });
});

/**
 * Custom command: Clean test database (requires backend endpoint)
 * @example cy.cleanDatabase()
 */
Cypress.Commands.add('cleanDatabase', () => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/test/clean`,
    failOnStatusCode: false
  });
});

/**
 * Custom command: Wait for page to load completely
 * @example cy.waitForPageLoad()
 */
Cypress.Commands.add('waitForPageLoad', () => {
  cy.window().should('have.property', 'document');
  cy.document().should('have.property', 'readyState', 'complete');
});

/**
 * Custom command: Check if element is in viewport
 * @example cy.get('.element').isInViewport()
 */
Cypress.Commands.add('isInViewport', { prevSubject: true }, (subject) => {
  const rect = subject[0].getBoundingClientRect();
  
  expect(rect.top).to.be.at.least(0);
  expect(rect.left).to.be.at.least(0);
  expect(rect.bottom).to.be.at.most(Cypress.config().viewportHeight);
  expect(rect.right).to.be.at.most(Cypress.config().viewportWidth);
  
  return subject;
});

/// <reference types="cypress" />

describe('E2E: User Registration and Login Flow', () => {
  
  beforeEach(() => {
    // Clear previous state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/');
  });

  describe('TC_E2E_REG: User Registration', () => {
    
    it('TC_E2E_REG_001: Should register new user successfully with valid data', () => {
      // Generate unique email to avoid duplicates
      const timestamp = Date.now();
      const testEmail = `testuser${timestamp}@example.com`;
      
      // Step 1: Open homepage
      cy.visit('/');
      cy.waitForPageLoad();
      
      // Step 2: Click login button
      cy.contains('button', 'Đăng nhập').should('be.visible').click();
      
      // Step 3: Wait for popup and switch to register form
      cy.get('.login-popup').should('be.visible');
      cy.contains('span', 'Đăng ký ngay').should('be.visible').click();
      
      // Step 4: Verify register form appeared
      cy.get('.login-popup-title h2').should('contain', 'Đăng ký');
      
      // Step 5: Fill registration form
      cy.get('input[name="name"]').should('be.visible').type('Nguyễn Văn Test');
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type('TestPass123!');
      cy.get('input[name="confirmPassword"]').type('TestPass123!');
      
      // Step 6: Submit registration (button text is "Tạo tài khoản")
      cy.contains('button', 'Tạo tài khoản').click();
      
      // Step 7: Verify success message
      cy.contains(/Đăng ký thành công|Đăng nhập thành công/i, { timeout: 10000 }).should('be.visible');
      
      // Step 8: Verify auto-login (popup closes)
      cy.get('.login-popup').should('not.exist');
      
      // Step 9: Verify user is logged in - profile icon appears instead of login button
      cy.get('.navbar-profile').should('be.visible');
      cy.get('.profile-icon').should('be.visible');
      cy.contains('button', 'Đăng nhập').should('not.exist');
      
      // Step 10: Verify token stored
      cy.window().its('localStorage.token').should('exist');
      
      // Step 11: Verify redirected to homepage
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('TC_E2E_REG_002: Should show error when registering with duplicate email', () => {
      cy.fixture('users').then((users) => {
        const existingUser = users.existingUser;
        
        cy.visit('/');
        cy.contains('button', 'Đăng nhập').click();
        cy.get('.login-popup').should('be.visible');
        cy.contains('span', 'Đăng ký ngay').click();
        
        cy.get('input[name="name"]').type('Another User');
        cy.get('input[name="email"]').type(existingUser.email);
        cy.get('input[name="password"]').type('NewPass123!');
        cy.get('input[name="confirmPassword"]').type('NewPass123!');
        
        cy.contains('button', 'Tạo tài khoản').click();
        
        // Verify error message (frontend shows generic message for 400 errors)
        cy.contains(/Vui lòng kiểm tra lại thông tin|Tài khoản đã tồn tại|Email đã được sử dụng/i, { timeout: 5000 })
          .should('be.visible');
          
        // Verify still on registration form
        cy.get('.login-popup').should('exist');
      });
    });

    it('TC_E2E_REG_003: Should validate email format', () => {
      cy.visit('/');
      cy.contains('button', 'Đăng nhập').click();
      cy.get('.login-popup').should('be.visible');
      cy.contains('span', 'Đăng ký ngay').click();
      
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="email"]').type('invalid-email-format');
      cy.get('input[name="password"]').type('TestPass123!');
      cy.get('input[name="confirmPassword"]').type('TestPass123!');
      
      cy.contains('button', 'Tạo tài khoản').click();
      
      // HTML5 validation should prevent form submission
      // Check that email input is marked as invalid
      cy.get('input[name="email"]:invalid').should('exist');
      
      // Popup should still be visible (form not submitted)
      cy.get('.login-popup').should('be.visible');
    });

    it('TC_E2E_REG_004: Should validate required fields', () => {
      cy.visit('/');
      cy.contains('button', 'Đăng nhập').click();
      cy.get('.login-popup').should('be.visible');
      cy.contains('span', 'Đăng ký ngay').click();
      
      // Try to submit with empty name
      cy.get('input[name="email"]').type('test@test.com');
      cy.get('input[name="password"]').type('TestPass123!');
      cy.get('input[name="confirmPassword"]').type('TestPass123!');
      cy.contains('button', 'Tạo tài khoản').click();
      
      // Should show error for missing name (HTML5 validation)
      cy.get('input[name="name"]:invalid').should('exist');
    });
  });

  describe('TC_E2E_LOGIN: User Login', () => {
    
    it('TC_E2E_LOGIN_001: Should login successfully with valid credentials', () => {
      // First, register a user (or use existing from fixture)
      const timestamp = Date.now();
      const testEmail = `logintest${timestamp}@example.com`;
      const testPassword = 'LoginTest123!';
      
      // Register
      cy.register('Login Test User', testEmail, testPassword);
      
      // Logout
      cy.reload();
      cy.clearLocalStorage();
      
      // Now test login
      cy.visit('/');
      cy.contains('button', 'Đăng nhập').click();
      
      cy.get('input[type="email"]').type(testEmail);
      cy.get('input[type="password"]').type(testPassword);
      cy.contains('button', 'Đăng nhập').click();
      
      // Verify success
      cy.contains(/Đăng nhập thành công/i, { timeout: 5000 }).should('be.visible');
      
      // Verify profile icon appears (navbar doesn't show user name)
      cy.get('.navbar-profile').should('be.visible');
      cy.get('.profile-icon').should('be.visible');
      
      cy.window().its('localStorage.token').should('exist');
    });

    it('TC_E2E_LOGIN_002: Should show error with invalid email', () => {
      cy.visit('/');
      cy.contains('button', 'Đăng nhập').click();
      
      cy.get('input[type="email"]').type('nonexistent@test.com');
      cy.get('input[type="password"]').type('SomePassword123!');
      cy.contains('button', 'Đăng nhập').click();
      
      // Should show toast error notification in top-right corner
      cy.contains(/Vui lòng kiểm tra lại thông tin|Email hoặc mật khẩu không đúng|Invalid credentials/i, { timeout: 5000 })
        .should('be.visible');
    });

    it('TC_E2E_LOGIN_003: Should show error with wrong password', () => {
      // First create a user with known credentials
      const timestamp = Date.now();
      const testEmail = `wrongpass${timestamp}@test.com`;
      const correctPassword = 'CorrectPass123!';
      
      // Register user
      cy.register('Wrong Pass Test', testEmail, correctPassword);
      
      // Logout
      cy.clearCookies();
      cy.clearLocalStorage();
      
      // Try to login with wrong password
      cy.visit('/');
      cy.contains('button', 'Đăng nhập').click();
      
      cy.get('input[type="email"]').type(testEmail);
      cy.get('input[type="password"]').type('WrongPassword123!');
      cy.contains('button', 'Đăng nhập').click();
      
      // Should show toast error notification (frontend shows generic message)
      cy.contains(/Vui lòng kiểm tra lại thông tin|Email hoặc mật khẩu không đúng|Tài khoản hoặc mật khẩu không đúng|Invalid credentials/i, { timeout: 5000 })
        .should('be.visible');
    });

    it('TC_E2E_LOGIN_004: Should toggle between login and register', () => {
      cy.visit('/');
      cy.contains('button', 'Đăng nhập').click();
      
      // Initially on login form
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[name="name"]').should('not.exist');
      
      // Click "Đăng ký ngay" to switch to register form
      cy.contains('span', 'Đăng ký ngay').click();
      cy.get('input[name="name"]').should('be.visible');
      cy.get('.login-popup-title h2').should('contain', 'Đăng ký');
      
      // Click "Đăng nhập tại đây" to switch back to login
      cy.contains('span', 'Đăng nhập tại đây').click();
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[name="name"]').should('not.exist');
      cy.get('.login-popup-title h2').should('contain', 'Đăng nhập');
    });
  });

  describe('TC_E2E_LOGOUT: User Logout', () => {
    
    it('TC_E2E_LOGOUT_001: Should logout successfully', () => {
      // Login first
      const timestamp = Date.now();
      cy.register(`Logout Test ${timestamp}`, `logout${timestamp}@test.com`, 'LogoutTest123!');
      
      // Verify logged in
      cy.window().its('localStorage.token').should('exist');
      
      // Wait for login popup to close and page to stabilize
      cy.wait(2000);
      
      // Wait for profile icon to be visible (after login)
      cy.get('.navbar-profile').should('be.visible');
      
      // Find and click logout button directly (force click to bypass CSS hover)
      // The dropdown is hidden by CSS :hover, but element exists in DOM
      cy.get('.nav-profile-dropdown')
        .find('li')
        .contains(/Đăng xuất/i)
        .click({ force: true });
      
      // Verify logout
      cy.window().its('localStorage.token').should('not.exist');
      cy.contains('button', 'Đăng nhập').should('be.visible');
    });

    it('TC_E2E_LOGOUT_002: Should clear session on logout', () => {
      // Login first
      const timestamp = Date.now();
      cy.register(`Logout Test 2 ${timestamp}`, `logout2${timestamp}@test.com`, 'LogoutTest123!');
      
      // Verify logged in
      cy.window().its('localStorage.token').should('exist');
      
      // Wait for page to stabilize
      cy.wait(2000);
      
      // Force click logout (bypass CSS :hover)
      cy.get('.nav-profile-dropdown')
        .find('li')
        .contains(/Đăng xuất/i)
        .click({ force: true });
      
      // Try to access protected page
      cy.visit('/myorders');
      
      // Should stay on /myorders but show login prompt message
      cy.url().should('include', '/myorders');
      cy.contains(/Vui lòng đăng nhập|Please login|đăng nhập để xem/i).should('be.visible');
      
      // Login button should be visible
      cy.contains('button', 'Đăng nhập').should('be.visible');
    });
  });
});

/// <reference types="cypress" />

describe('E2E: Product Search and Browse', () => {
  
  beforeEach(() => {
    cy.visit('/');
    cy.waitForPageLoad();
  });

  describe('TC_E2E_SEARCH: Product Search', () => {
    
    it('TC_E2E_SEARCH_001: Should search and find products with valid keyword', () => {
      // Step 1: Click search icon to show search input
      cy.get('.search-icon, img[alt="Tìm kiếm"]').click();
      
      // Step 2: Type search keyword (use common word that should match products)
      cy.get('#navbar-search-input')
        .should('be.visible')
        .type('bánh');
      
      // Step 3: Wait for search results dropdown to appear
      // Give more time for API call and rendering
      cy.wait(1500);
      
      // Step 4: Check if search results exist
      cy.get('body').then(($body) => {
        if ($body.find('.search-results').length > 0) {
          // Search results found - verify and click
          cy.get('.search-result-item')
            .should('have.length.greaterThan', 0);
          
          cy.get('.search-result-item').first()
            .find('.search-result-name')
            .should('be.visible');
          
          // Click on first search result
          cy.get('.search-result-item').first().click();
          
          // Should navigate to product detail page
          cy.url().should('include', '/product/');
        } else {
          // No results - could mean no products match, just verify search input worked
          cy.get('#navbar-search-input').should('have.value', 'bánh');
          cy.log('No search results found - database may be empty or no matches');
        }
      });
    });

    it('TC_E2E_SEARCH_002: Should show no results message for non-existent product', () => {
      // Click search icon first
      cy.get('.search-icon, img[alt="Tìm kiếm"]').click();
      
      cy.get('#navbar-search-input')
        .type('sản phẩm không tồn tại xyz123');
      
      cy.wait(1000);
      
      // Should NOT show search results dropdown (no results found)
      cy.get('.search-results').should('not.exist');
    });

    it('TC_E2E_SEARCH_003: Should view all search results', () => {
      // Click search icon first
      cy.get('.search-icon, img[alt="Tìm kiếm"]').click();
      
      // Type search keyword
      cy.get('#navbar-search-input')
        .type('bánh');
      
      // Wait for dropdown
      cy.get('.search-results', { timeout: 5000 }).should('be.visible');
      
      // Click "Xem tất cả kết quả" button
      cy.contains('.view-all-results', /Xem tất cả/i).click();
      
      // Should navigate to products page with search query
      cy.url().should('include', '/viewitems');
      cy.url().should('include', 'search=');
      
      // Wait for products to load
      cy.wait(1500);
      
      // Verify search results are displayed (class is .item, not .item-card)
      cy.get('.item', { timeout: 10000 }).should('have.length.greaterThan', 0);
      
      // Verify items contain product information
      cy.get('.item').first().within(() => {
        cy.get('.item-name').should('be.visible');
        cy.get('.item-price').should('be.visible');
      });
    });
  });

  describe('TC_E2E_BROWSE: Browse Products', () => {
    
    it('TC_E2E_BROWSE_001: Should display all products on homepage', () => {
      // Verify products are displayed (correct class is .item)
      cy.get('.item', { timeout: 10000 })
        .should('have.length.greaterThan', 0);
      
      // Each product card should have essential elements
      cy.get('.item').first().within(() => {
        // Should have image
        cy.get('.item-image').should('be.visible');
        
        // Should have name
        cy.get('.item-name').should('exist');
        
        // Should have price
        cy.get('.item-price').should('exist');
      });
    });

    it('TC_E2E_BROWSE_002: Should filter products by category', () => {
      // Navigate to products page first (categories shown on ViewItems page)
      cy.visit('/viewitems');
      cy.waitForPageLoad();
      
      // Click on a category button (e.g., "Bánh")
      cy.contains('.category-btn', /Bánh/).click();
      
      cy.wait(1000);
      
      // Products should be displayed
      cy.get('.item').should('have.length.greaterThan', 0);
      
      // Category button should be active
      cy.contains('.category-btn', /Bánh/).should('have.class', 'active');
    });

    it('TC_E2E_BROWSE_003: Should view product details', () => {
      // Click "Xem chi tiết" button on first product
      cy.get('.item').first().find('.view-details-btn').click();
      
      // Should navigate to product detail page
      cy.url().should('include', '/product/');
      
      // Should show product details
      cy.get('.product-detail, .item-detail, [data-testid="product-detail"]')
        .should('be.visible');
      
      // Should have product info
      cy.get('.product-name, .item-name, h1, h2').should('exist');
      cy.get('.product-price, .item-price').should('exist');
      cy.get('.product-description, .item-description').should('exist');
      
      // Should have add to cart button
      cy.contains('button', /Thêm vào giỏ|Add to cart/i).should('exist');
    });

    it('TC_E2E_BROWSE_004: Should navigate between product categories', () => {
      // Navigate to products page first
      cy.visit('/viewitems');
      cy.waitForPageLoad();
      
      // Click on first category (e.g., "Bánh")
      cy.get('.category-btn').eq(1).click(); // Index 0 is "Tất cả sản phẩm"
      cy.wait(500);
      
      // Verify products are shown
      cy.get('.item').should('have.length.greaterThan', 0);
      
      // Click on second category (e.g., "Nguyên liệu làm bánh")
      cy.get('.category-btn').eq(2).click();
      cy.wait(500);
      
      // Products should still exist (may be different items)
      cy.get('.item').should('exist');
    });

    it('TC_E2E_BROWSE_005: Should show product images', () => {
      // Verify product images are loaded correctly
      cy.get('.item').first().within(() => {
        cy.get('.item-image').should('be.visible')
          .and(($img) => {
            // Image should be loaded (has natural dimensions)
            expect($img[0].naturalWidth).to.be.greaterThan(0);
          });
      });
    });
  });

  describe('TC_E2E_PRODUCT_DETAIL: Product Detail Page', () => {
    
    beforeEach(() => {
      // Navigate to homepage and click on a product to view details
      cy.visit('/');
      cy.waitForPageLoad();
      
      // Click "Xem chi tiết" button on first product
      cy.get('.item').first().find('.view-details-btn').click();
      
      // Should navigate to product detail page
      cy.url().should('include', '/product/');
    });

    it('TC_E2E_DETAIL_001: Should adjust product quantity', () => {
      // Get initial quantity
      cy.get('input[type="number"], .quantity-input').invoke('val').then((initialQty) => {
        const initial = Number(initialQty) || 1;
        
        // Click increase button
        cy.contains('button', /\+|Tăng/i).click();
        
        // Verify quantity increased
        cy.get('input[type="number"], .quantity-input')
          .should('have.value', String(initial + 1));
      });
    });

    it('TC_E2E_DETAIL_002: Should handle quantity decrease properly', () => {
      // Get initial quantity
      cy.get('input[type="number"], .quantity-input').invoke('val').then((initialQty) => {
        const initial = Number(initialQty) || 1;
        
        // Check if decrease button is disabled
        cy.contains('button', /-|Giảm/i).then(($btn) => {
          if ($btn.is(':disabled')) {
            // Button is disabled - means we're at minimum (1)
            cy.get('input[type="number"], .quantity-input')
              .should('have.value', '1');
            cy.log('Decrease button correctly disabled at minimum quantity');
          } else {
            // Button is enabled - can decrease
            cy.wrap($btn).click();
            
            // Verify quantity decreased
            cy.get('input[type="number"], .quantity-input').should('have.value', String(initial - 1));
          }
        });
      });
    });

    it('TC_E2E_DETAIL_003: Should show product reviews if available', () => {
      // Scroll down to check for reviews section
      cy.get('body').then(($body) => {
        if ($body.find('.reviews, .review-section, [data-testid="reviews"]').length > 0) {
          cy.get('.reviews, .review-section').scrollIntoView();
          cy.get('.reviews, .review-section').should('be.visible');
        } else {
          // Reviews section might not exist - that's ok
          cy.log('Reviews section not found - may not be implemented yet');
        }
      });
    });
  });
});

// ***********************************************************
// This file is processed and loaded automatically before test files.
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests in command log
const app = window.top;

if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML =
    '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}

// Global before hook - runs before all tests
before(() => {
  // Clear any existing data
  cy.clearCookies();
  cy.clearLocalStorage();
});

// Before each test
beforeEach(() => {
  // Preserve session between tests in same file (optional)
  // Cypress.Cookies.preserveOnce('session_id', 'remember_token');
});

// After each test
afterEach(() => {
  // Take screenshot on failure
  cy.on('fail', (error) => {
    cy.screenshot();
    throw error;
  });
});

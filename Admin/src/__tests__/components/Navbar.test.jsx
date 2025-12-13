import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import Navbar from '../../Components/Navbar/Navbar';

describe('Navbar Component', () => {
  const mockLogout = vi.fn();
  const mockUser = { firstName: 'Admin', lastName: 'User', role: 'admin' };

  const renderNavbar = () => {
    return render(
      <BrowserRouter>
        <AdminAuthContext.Provider value={{ logout: mockLogout, user: mockUser }}>
          <Navbar />
        </AdminAuthContext.Provider>
      </BrowserRouter>
    );
  };

  it('TC_ADMIN_NAVBAR_001: Should render navbar container', () => {
    renderNavbar();
    // Navbar has an img with alt 'BakeShop' which indicates it rendered
    const logo = screen.getByAltText(/BakeShop/i);
    expect(logo).toBeInTheDocument();
  });

  it('TC_ADMIN_NAVBAR_002: Should display logo', () => {
    renderNavbar();
    const logo = screen.getByAltText(/BakeShop/i);
    expect(logo).toBeInTheDocument();
  });

  it('TC_ADMIN_NAVBAR_003: Should display profile section', () => {
    renderNavbar();
    // The Navbar should show the admin name provided by context
    const profileName = screen.getByText(/Admin User/i);
    expect(profileName).toBeInTheDocument();
  });
});

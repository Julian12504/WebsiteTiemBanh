import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StoreContext } from '../../context/StoreContext';
import LoginPopup from '../../components/LoginPopup/LoginPopup';
import axios from 'axios';

vi.mock('axios');

describe('LoginPopup Component', () => {
  const mockSetShowLogin = vi.fn();
  const mockSetToken = vi.fn();
  const mockUrl = 'http://localhost:4000';

  const renderLoginPopup = () => {
    return render(
      <StoreContext.Provider value={{ url: mockUrl, setToken: mockSetToken }}>
        <LoginPopup setShowLogin={mockSetShowLogin} />
      </StoreContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('TC_FE_LOGIN_001: Should render login form by default', () => {
    renderLoginPopup();
    expect(screen.getByRole('heading', { name: /Đăng nhập/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Mật khẩu')).toBeInTheDocument();
  });

  it('TC_FE_LOGIN_002: Should switch to register form', () => {
    renderLoginPopup();
    const registerLink = screen.getByText(/Đăng ký ngay/i);
    fireEvent.click(registerLink);
    expect(screen.getByRole('heading', { name: /Đăng ký/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Họ và tên')).toBeInTheDocument();
  });

  it('TC_FE_LOGIN_003: Should update input values on change', () => {
    renderLoginPopup();
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Mật khẩu');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('TC_FE_LOGIN_004: Should validate password confirmation on register', async () => {
    renderLoginPopup();
    
    // Switch to register
    const registerLink = screen.getByText(/Đăng ký ngay/i);
    fireEvent.click(registerLink);

    // Fill form with non-matching passwords
    fireEvent.change(screen.getByPlaceholderText('Họ và tên'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Mật khẩu'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Xác nhận mật khẩu'), { target: { value: 'password456' } });

    // Button text is "Tạo tài khoản" not "Đăng ký"
    const submitButton = screen.getByRole('button', { name: /Tạo tài khoản/i });
    fireEvent.click(submitButton);

    // Should show error for password mismatch
    await waitFor(() => {
      expect(axios.post).not.toHaveBeenCalled();
    });
  });

  it('TC_FE_LOGIN_005: Should close popup when close button is clicked', () => {
    renderLoginPopup();
    const closeButton = screen.getByAltText(/Đóng/i);
    fireEvent.click(closeButton);
    expect(mockSetShowLogin).toHaveBeenCalledWith(false);
  });
});

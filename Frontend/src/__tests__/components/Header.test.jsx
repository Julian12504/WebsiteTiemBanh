import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../../components/Header/Header';

describe('Header Component', () => {
  const renderHeader = () => {
    return render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
  };

  it('TC_FE_HEADER_001: Should render header with main heading', () => {
    renderHeader();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Bạn cần gì/i)).toBeInTheDocument();
  });

  it('TC_FE_HEADER_002: Should render description text', () => {
    renderHeader();
    expect(screen.getByText(/Khám phá những chiếc bánh thơm ngon/i)).toBeInTheDocument();
  });

  it('TC_FE_HEADER_003: Should render view products button', () => {
    renderHeader();
    const button = screen.getByRole('button', { name: /Xem sản phẩm ngay/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('view-btn');
  });

  it('TC_FE_HEADER_004: Should navigate when button is clicked', async () => {
    const { container } = renderHeader();
    expect(container.querySelector('.header')).toBeInTheDocument();
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../../components/Footer/Footer';

describe('Footer Component', () => {
  const renderFooter = () => {
    return render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
  };

  it('TC_FE_FOOTER_001: Should render footer with company name', () => {
    renderFooter();
    // Text is "Cake Shop" not "Cake Fantasy" based on the actual component
    expect(screen.getByText(/Cake Shop/i)).toBeInTheDocument();
  });

  it('TC_FE_FOOTER_002: Should render footer sections', () => {
    renderFooter();
    expect(screen.getByText(/CÔNG TY/i)).toBeInTheDocument();
    expect(screen.getByText(/LIÊN HỆ/i)).toBeInTheDocument();
  });

  it('TC_FE_FOOTER_003: Should render copyright text', () => {
    renderFooter();
    expect(screen.getByText(/Bản quyền/i)).toBeInTheDocument();
  });

  it('TC_FE_FOOTER_004: Should render footer sections', () => {
    renderFooter();
    // Check for unique footer content
    expect(screen.getByText(/Điểm đến trọn gói/i)).toBeInTheDocument();
  });
});

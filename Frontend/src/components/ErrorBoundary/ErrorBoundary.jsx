import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Cập nhật state để lần render tiếp theo hiển thị giao diện thay thế
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Ghi log lỗi (hoặc gửi về server nếu muốn)
    console.error("Lỗi được bắt bởi ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Giao diện hiển thị khi có lỗi
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Đã xảy ra lỗi.</h2>
          <p>Vui lòng thử lại sau.</p>
        </div>
      );
    }

    // Nếu không có lỗi thì hiển thị nội dung con bình thường
    return this.props.children;
  }
}

export default ErrorBoundary;

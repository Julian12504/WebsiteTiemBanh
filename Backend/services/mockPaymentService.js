// Mock Payment Service for testing
// This service simulates successful payments without calling external APIs

class MockPaymentService {
  constructor() {
    this.name = 'Mock Payment Service';
  }

  // Simulate successful payment
  async createPaymentSession(orderData) {
    const {
      orderId,
      amount,
      orderInfo,
      items
    } = orderData;

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Always return success
    return {
      success: true,
      paymentId: `MOCK_${orderId}_${Date.now()}`,
      message: 'Payment session created successfully (Mock)'
    };
  }

  // Simulate payment verification
  async verifyPayment(paymentId, orderId) {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Always return successful verification
    return {
      success: true,
      status: 'completed',
      message: 'Payment verified successfully (Mock)'
    };
  }

  // Get payment status
  async getPaymentStatus(paymentId) {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      success: true,
      status: 'completed',
      message: 'Payment completed successfully (Mock)'
    };
  }
}

export default new MockPaymentService();

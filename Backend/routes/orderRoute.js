import express from 'express';
import { Order } from '../models/orderModel.js';
import authMiddleware from '../middleware/auth.js';
import { listOrders, placeOrder, userOrders, verifyOrder, momoWebhook, momoReturn } from '../controllers/orderController.js';
import adminMiddleware from '../middleware/admin.js';

const router = express.Router();

// Place order (checkout)
router.post("/place", authMiddleware, placeOrder, (req, res, next) => {
  next();
}, placeOrder);

// Verify payment (for payment gateways)
router.post("/verify", verifyOrder);

// Momo payment routes
router.post("/momo/webhook", momoWebhook);
router.get("/momo/return", momoReturn);

// Get order history (simple list)
router.get("/history", authMiddleware, userOrders, async (req, res) => {
    try {
        const orders = await Order.findByUserId(req.user.id);
        res.json({ 
            success: true, 
            data: orders
        });
    } catch (error) {
        console.error("Order history error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to get order history"
        });
    }
});

// Get user orders with full details
router.get("/user/orders", authMiddleware, userOrders);

// Confirm order received by customer
router.post("/confirm-received", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required"
      });
    }

    // Verify order belongs to user
    const order = await Order.findById(orderId);
    if (!order || order.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập đơn hàng này"
      });
    }

    // Check if order is in delivery status
    if (order.status !== 'Out for Delivery') {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể xác nhận đơn hàng đang giao"
      });
    }

    // Update status to Delivered
    await Order.updateStatus(orderId, 'Delivered');
    
    res.json({
      success: true,
      message: "Đã xác nhận nhận hàng thành công"
    });
  } catch (error) {
    console.error("Error confirming order received:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi xác nhận nhận hàng"
    });
  }
});

// Admin routes - move these routes BEFORE the dynamic parameter route
// Get admin order list
router.get("/admin/list", authMiddleware, adminMiddleware(), listOrders);

// Get order details for admin
router.get("/admin/:orderId", authMiddleware, adminMiddleware(), async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        
        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: "Order not found" 
            });
        }
        
        res.json({ 
            success: true, 
            data: order
        });
    } catch (error) {
        console.error("Admin order details error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to get order details"
        });
    }
});

// Get order details for user
router.get("/:orderId", authMiddleware, async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        
        if (!order || order.user_id !== req.user.id) {
            return res.status(404).json({ 
                success: false, 
                message: "Order not found" 
            });
        }
        
        res.json({ 
            success: true, 
            data: order
        });
    } catch (error) {
        console.error("Order details error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to get order details"
        });
    }
});

// Update order status
router.post("/update-status", authMiddleware, adminMiddleware(), async (req, res) => {
  try {
    const { orderId, status } = req.body;
    
    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: "Order ID and status are required"
      });
    }

    await Order.updateStatus(orderId, status);
    
    res.json({
      success: true,
      message: `Order status updated to ${status}`
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status"
    });
  }
});

// Update payment status
router.post("/update-payment", authMiddleware, adminMiddleware(), async (req, res) => {
  try {
    const { orderId, payment } = req.body;
    
    if (!orderId || payment === undefined) {
      return res.status(400).json({
        success: false,
        message: "Order ID and payment status are required"
      });
    }

    await Order.updatePaymentStatus(orderId, payment);
    
    res.json({
      success: true,
      message: `Payment status updated to ${payment ? 'Paid' : 'Unpaid'}`
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment status"
    });
  }
});

export default router;
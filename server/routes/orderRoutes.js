const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrder,
  deleteOrder,
  getMyOrders,
  updateOrderStatus,
  trackOrder,
  getOrdersByStatus,
  getOrderStatistics,
  bulkImportOrders,
  generateOrderInvoice
} = require('../controllers/orderController');

// Customer routes
router.get('/myorders', protect, getMyOrders);
router.get('/track/:trackingNumber', trackOrder); // Public tracking endpoint

// Protected routes (require authentication)
router.route('/')
  .get(protect, authorize('admin', 'dispatcher'), getOrders)
  .post(protect, createOrder);

router.route('/:id')
  .get(protect, getOrder)
  .put(protect, authorize('admin', 'dispatcher'), updateOrder)
  .delete(protect, authorize('admin'), deleteOrder);

// Admin and dispatcher routes
router.put('/:id/status', protect, authorize('admin', 'dispatcher'), updateOrderStatus);
router.get('/status/:status', protect, authorize('admin', 'dispatcher'), getOrdersByStatus);
router.get('/statistics', protect, authorize('admin'), getOrderStatistics);
router.post('/bulk-import', protect, authorize('admin'), bulkImportOrders);
router.get('/:id/invoice', protect, generateOrderInvoice);

module.exports = router;
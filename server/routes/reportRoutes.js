const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDailyOrdersReport,
  getWeeklyOrdersReport,
  getMonthlyOrdersReport,
  getDispatchPerformanceReport,
  getDeliveryTimeReport,
  getExceptionReport,
  getCustomReport,
  exportReportToCSV,
  exportReportToPDF,
  getRevenueReport
} = require('../controllers/reportController');

// All report routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// Order reports
router.get('/orders/daily', getDailyOrdersReport);
router.get('/orders/weekly', getWeeklyOrdersReport);
router.get('/orders/monthly', getMonthlyOrdersReport);

// Performance reports
router.get('/performance/dispatch', getDispatchPerformanceReport);
router.get('/performance/delivery-time', getDeliveryTimeReport);
router.get('/performance/exceptions', getExceptionReport);

// Revenue reports
router.get('/revenue', getRevenueReport);

// Custom reports
router.post('/custom', getCustomReport);

// Export reports
router.get('/export/csv/:reportId', exportReportToCSV);
router.get('/export/pdf/:reportId', exportReportToPDF);

module.exports = router;
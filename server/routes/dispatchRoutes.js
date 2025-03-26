const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createDispatch,
  getDispatches,
  getDispatch,
  updateDispatch,
  deleteDispatch,
  assignCourier,
  updateDispatchStatus,
  getDispatchesByStatus,
  optimizeRoute,
  updateCourierLocation,
  getActiveDispatches,
  getDispatchStatistics
} = require('../controllers/dispatchController');

// Protected routes (require authentication)
router.route('/')
  .get(protect, authorize('admin', 'dispatcher'), getDispatches)
  .post(protect, authorize('admin', 'dispatcher'), createDispatch);

router.route('/:id')
  .get(protect, authorize('admin', 'dispatcher'), getDispatch)
  .put(protect, authorize('admin', 'dispatcher'), updateDispatch)
  .delete(protect, authorize('admin'), deleteDispatch);

// Dispatch management routes
router.put('/:id/assign-courier', protect, authorize('admin', 'dispatcher'), assignCourier);
router.put('/:id/status', protect, authorize('admin', 'dispatcher'), updateDispatchStatus);
router.get('/status/:status', protect, authorize('admin', 'dispatcher'), getDispatchesByStatus);
router.get('/active', protect, authorize('admin', 'dispatcher'), getActiveDispatches);
router.post('/:id/optimize-route', protect, authorize('admin', 'dispatcher'), optimizeRoute);
router.put('/:id/courier-location', protect, authorize('admin', 'dispatcher'), updateCourierLocation);
router.get('/statistics', protect, authorize('admin'), getDispatchStatistics);

module.exports = router;
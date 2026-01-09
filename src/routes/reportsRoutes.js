const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController')
const { authenticateToken } = require('../middlewares/auth')

router.use(authenticateToken);

router.get('/dashboard', reportsController.getDashboardSummary);

router.get('/expenses-by-category', reportsController.getExpensesByCategory);
router.get('/monthly-evolution', reportsController.getMonthlyEvolution);
router.get('/yearly-comparison', reportsController.getYearlyComparison);
router.get('/top-expenses', reportsController.getTopExpenses);

module.exports = router;
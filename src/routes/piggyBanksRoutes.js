const express = require('express');
const router = express.Router();
const piggyBanksController = require('../controllers/piggyBanksController');
const piggyTransactionsController = require('../controllers/piggyTransactionsController');
const { authenticateToken } = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/', piggyBanksController.getAll);
router.get('/total', piggyBanksController.getTotalSavings);
router.get('/:id', piggyBanksController.getById);
router.post('/', piggyBanksController.create);
router.put('/:id', piggyBanksController.update);
router.delete('/:id', piggyBanksController.remove);

router.get('/:piggyBankId/transactions', piggyTransactionsController.getByPiggyBank);
router.post('/transactions', piggyTransactionsController.create);
router.delete('/transactions/:id', piggyTransactionsController.remove);

module.exports = router;
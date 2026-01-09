const express = require('express');
const router = express.Router();
const expensesController = require('../controllers/expensesController');
const { authenticateToken } = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/', expensesController.getAll);
router.post('/', expensesController.create);
router.put('/:id', expensesController.update);
router.delete('/:id', expensesController.remove);

module.exports = router;
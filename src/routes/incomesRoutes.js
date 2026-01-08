const express = require('express');
const router = express.Router();
const incomesController = require('../controllers/incomesController');
const { authenticateToken } = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/', incomesController.getAll);
router.post('/', incomesController.create);
router.put('/:id', incomesController.update);
router.delete('/:id', incomesController.remove);

module.exports = router;
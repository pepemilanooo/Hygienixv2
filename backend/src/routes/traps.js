const express = require('express');
const { authenticate } = require('../middleware/auth');
const router = express.Router();
router.use(authenticate);
router.get('/', async (req, res) => res.json([]));
module.exports = router;

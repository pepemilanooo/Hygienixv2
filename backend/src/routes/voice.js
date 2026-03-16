const express = require('express');
const { authenticate } = require('../middleware/auth');
const router = express.Router();
router.use(authenticate);
router.post('/command', async (req, res) => {
  res.json({ executed: true });
});
module.exports = router;

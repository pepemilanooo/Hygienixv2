const express = require('express');
const { authenticate } = require('../middleware/auth');
const router = express.Router();
router.use(authenticate);
router.post('/webhook', async (req, res) => {
  res.json({ received: true });
});
module.exports = router;

const express = require('express');
const { authenticate } = require('../middleware/auth');
const router = express.Router();
router.use(authenticate);
router.get('/sync', async (req, res) => {
  res.json({ data: [] });
});
module.exports = router;

const express = require('express');
const { authenticate } = require('../middleware/auth');
const router = express.Router();
router.use(authenticate);
router.post('/identify-pest', async (req, res) => {
  res.json({ pestDetected: 'Cimice dei letti', confidenceScore: 0.92, recommendedTreatment: 'Trattamento con insetticida specifico' });
});
module.exports = router;

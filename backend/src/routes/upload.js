const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/image', authenticate, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nessun file caricato' });
  res.json({ url: '/uploads/' + req.file.filename });
});

router.post('/base64', authenticate, (req, res) => {
  try {
    const { image, filename } = req.body;
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const uniqueName = uuidv4() + (filename ? path.extname(filename) : '.png');
    const fs = require('fs');
    fs.writeFileSync('uploads/' + uniqueName, buffer);
    res.json({ url: '/uploads/' + uniqueName });
  } catch (error) {
    res.status(500).json({ error: 'Errore nel salvataggio immagine' });
  }
});

module.exports = router;

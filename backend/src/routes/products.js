const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient();
router.use(authenticate);
router.get('/', async (req, res) => {
  const products = await prisma.product.findMany({ where: { attivo: true }, orderBy: { nomeCommerciale: 'asc' } });
  res.json(products);
});
router.post('/', requireRole('ADMIN', 'OPERATORE'), async (req, res) => {
  const product = await prisma.product.create({ data: req.body });
  res.status(201).json(product);
});
router.put('/:id', requireRole('ADMIN', 'OPERATORE'), async (req, res) => {
  const data = req.body; delete data.id;
  const product = await prisma.product.update({ where: { id: req.params.id }, data });
  res.json(product);
});
module.exports = router;

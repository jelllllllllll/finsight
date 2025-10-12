// backend/routes/goalRoutes.js
import express from 'express';
import Goal from '../models/Goal.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  const goals = await Goal.find({ userId: req.user.id }).sort({ deadline: 1 });
  res.json(goals);
});

router.post('/', async (req, res) => {
  const { name, targetAmount, deadline } = req.body;
  const g = await Goal.create({ userId: req.user.id, name, targetAmount, deadline });
  res.status(201).json(g);
});

router.put('/:id', async (req, res) => {
  const g = await Goal.findById(req.params.id);
  if (!g || g.userId.toString() !== req.user.id) return res.status(404).json({ message: 'Not found' });
  Object.assign(g, req.body);
  await g.save();
  res.json(g);
});

router.delete('/:id', async (req, res) => {
  const g = await Goal.findById(req.params.id);
  if (!g || g.userId.toString() !== req.user.id) return res.status(404).json({ message: 'Not found' });
  // <-- correct object to delete is g (goal), not tx
  await g.deleteOne();
  res.json({ message: 'Deleted' });
});

export default router;

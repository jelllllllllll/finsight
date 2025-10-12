// backend/routes/transactionRoutes.js
import express from 'express';
import Transaction from '../models/Transaction.js';
import Goal from '../models/Goal.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

// Get all transactions
router.get('/', async (req, res) => {
  const transactions = await Transaction.find({ userId: req.user.id }).sort({ date: -1 });
  res.json(transactions);
});

// Add a new transaction
router.post('/', async (req, res) => {
  const { type, category, amount, date, notes } = req.body;
  const t = await Transaction.create({
    userId: req.user.id,
    type,
    category,
    amount,
    date,
    notes
  });

  // ✅ Update goal progress automatically for matching income
  if (type === 'Income') {
    const goal = await Goal.findOne({ userId: req.user.id, name: category });
    if (goal) {
      const added = Number(amount) || 0;
      goal.currentAmount = Number(goal.currentAmount || 0) + added;
      goal.status = goal.currentAmount >= goal.targetAmount ? 'Completed' : 'In Progress';
      await goal.save();
    }
  }

  res.status(201).json(t);
});

// Update transaction
router.put('/:id', async (req, res) => {
  const tx = await Transaction.findById(req.params.id);
  if (!tx || tx.userId.toString() !== req.user.id)
    return res.status(404).json({ message: 'Not found' });

  Object.assign(tx, req.body);
  await tx.save();
  res.json(tx);
});

// Delete transaction
router.delete('/:id', async (req, res) => {
  const tx = await Transaction.findById(req.params.id);
  if (!tx || tx.userId.toString() !== req.user.id)
    return res.status(404).json({ message: 'Not found' });

  // ✅ Reverse goal progress if deleting income
  if (tx.type === 'Income') {
    const goal = await Goal.findOne({ userId: req.user.id, name: tx.category });
    if (goal) {
      const removed = Number(tx.amount) || 0;
      goal.currentAmount = Math.max(0, Number(goal.currentAmount || 0) - removed);
      goal.status = goal.currentAmount >= goal.targetAmount ? 'Completed' : 'In Progress';
      await goal.save();
    }
  }

  await tx.deleteOne();
  res.json({ message: 'Deleted' });
});

export default router;

import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import React from "react";
import { formatIDR } from '../utils/format';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ type: 'Expense', category: '', amount: '', date: '', notes: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchTransactions = async () => {
    try {
      const { data } = await api.get('/transactions');
      setTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      alert('Failed to load transactions. Please make sure you are logged in.');
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update transaction
        await api.put(`/transactions/${editingId}`, { ...form, amount: Number(form.amount) });
      } else {
        // Create new transaction
        await api.post('/transactions', { ...form, amount: Number(form.amount) });
      }

      setForm({ type: 'Expense', category: '', amount: '', date: '', notes: '' });
      setEditingId(null);
      fetchTransactions();
    } catch (err) {
      console.error('Error saving transaction:', err);
      alert('Error saving transaction. Please check your input or token.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      console.error('Error deleting transaction:', err);
      alert('Failed to delete transaction.');
    }
  };

  const handleEdit = (tx) => {
    setEditingId(tx._id);
    setForm({
      type: tx.type,
      category: tx.category,
      amount: tx.amount,
      date: tx.date ? tx.date.slice(0, 10) : '',
      notes: tx.notes || ''
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ type: 'Expense', category: '', amount: '', date: '', notes: '' });
  };

  return (
    <div className="container">
      <header className="top">
        <h1>Transactions</h1>
        <nav>
          <Link to="/dashboard">Dashboard</Link> | <Link to="/goals">Goals</Link>
        </nav>
      </header>

      <section className="card">
        <h3>{editingId ? 'Edit Transaction' : 'Add Transaction'}</h3>
        <form onSubmit={handleSubmit} className="form-inline">
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option>Expense</option>
            <option>Income</option>
          </select>
          <input
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
            placeholder="Category"
            required
          />
          <input
            type="number"
            value={form.amount}
            onChange={e => setForm({ ...form, amount: e.target.value })}
            placeholder="Amount"
            required
          />
          <input
            type="date"
            value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })}
            required
          />
          <input
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder="Notes"
          />
          <button type="submit">{editingId ? 'Update' : 'Add'}</button>
          {editingId && (
            <button type="button" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </form>
      </section>

      <section className="card">
        <h3>All Transactions</h3>
        <table className="tx-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Notes</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx._id}>
                <td>{new Date(tx.date).toLocaleDateString()}</td>
                <td>{tx.type}</td>
                <td>{tx.category}</td>
                <td>{formatIDR(tx.amount)}</td>
                <td>{tx.notes}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEdit(tx)}>Edit</button>
                    <button onClick={() => handleDelete(tx._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import React from "react";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ type: 'Expense', category: '', amount: '', date: '', notes: '' });

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

  const handleAdd = async (e) => {
  e.preventDefault();
  try {
    await api.post('/transactions', { ...form, amount: Number(form.amount) });
    setForm({ type: 'Expense', category: '', amount: '', date: '', notes: '' });
    await fetchTransactions();

    // 🔥 Notify other tabs/pages (like Goals) to refresh live
    window.dispatchEvent(new Event('goalsUpdated'));
  } catch (err) {
    console.error('Error adding transaction:', err);
    alert('Error adding transaction. Please check your token or input.');
  }
};

const handleDelete = async (id) => {
  if (!confirm('Delete this transaction?')) return;
  try {
    await api.delete(`/transactions/${id}`);
    await fetchTransactions();

    // 🔥 Trigger goal refresh as well
    window.dispatchEvent(new Event('goalsUpdated'));
  } catch (err) {
    console.error('Error deleting transaction:', err);
    alert('Failed to delete transaction.');
  }
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
        <h3>Add Transaction</h3>
        <form onSubmit={handleAdd} className="form-inline">
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
          <button type="submit">Add</button>
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
                <td>{tx.amount}</td>
                <td>{tx.notes}</td>
                <td>
                  <button onClick={() => handleDelete(tx._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

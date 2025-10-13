import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import React from "react";
import { formatIDR } from '../utils/format';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({ name: '', targetAmount: '', deadline: '' });
  const [editingGoal, setEditingGoal] = useState(null);

  const fetch = async () => {
    const { data } = await api.get('/goals');
    setGoals(data);
  };

  useEffect(() => { fetch() }, []);

  const handleAdd = async (e) => {
    e.preventDefault();

    if (editingGoal) {
      await api.put(`/goals/${editingGoal._id}`, { ...form, targetAmount: Number(form.targetAmount) });
      setEditingGoal(null);
    } else {
      await api.post('/goals', { ...form, targetAmount: Number(form.targetAmount) });
    }

    setForm({ name: '', targetAmount: '', deadline: '' });
    fetch();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this goal?')) return;
    await api.delete(`/goals/${id}`);
    fetch();
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setForm({
      name: goal.name,
      targetAmount: goal.targetAmount,
      deadline: goal.deadline?.split('T')[0] || ''
    });
  };

  return (
    <div className="container">
      <header className="top">
        <h1>Goals</h1>
        <nav>
          <Link to="/dashboard">Dashboard</Link> | <Link to="/transactions">Transactions</Link>
        </nav>
      </header>

      <section className="card">
        <h3>{editingGoal ? 'Edit Goal' : 'Create Goal'}</h3>
        <form onSubmit={handleAdd} className="form-inline">
          <input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Goal name"
          />
          <input
            value={form.targetAmount}
            onChange={e => setForm({ ...form, targetAmount: e.target.value })}
            placeholder="Target amount"
          />
          <input
            type="date"
            value={form.deadline}
            onChange={e => setForm({ ...form, deadline: e.target.value })}
          />
          <button type="submit">{editingGoal ? 'Update' : 'Create'}</button>
          {editingGoal && (
            <button type="button" onClick={() => { setEditingGoal(null); setForm({ name: '', targetAmount: '', deadline: '' }) }}>
              Cancel
            </button>
          )}
        </form>
      </section>

      <section className="card">
        <h3>Your Goals</h3>
        <ul>
          {goals.map(g => (
            <li key={g._id}>
              <strong>{g.name}</strong> — 
              {formatIDR(g.currentAmount)} / {formatIDR(g.targetAmount)} — {g.status}
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button onClick={() => handleEdit(g)}>Edit</button>
                <button onClick={() => handleDelete(g._id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

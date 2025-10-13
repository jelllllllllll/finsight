import { useEffect, useState } from 'react';
import api from '../api/axios';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell,
  Legend, CartesianGrid, ResponsiveContainer
} from 'recharts';
import { Link } from 'react-router-dom';
import React from "react";
import { formatIDR } from '../utils/format';

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/transactions');
        setTransactions(data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // Group by date for line chart
  const daily = {};
  transactions.forEach(t => {
    const d = new Date(t.date).toISOString().slice(0, 10);
    daily[d] = daily[d] || { date: d, income: 0, expense: 0 };
    if (t.type === 'Income') daily[d].income += t.amount;
    else daily[d].expense += t.amount;
  });
  const lineData = Object.values(daily).sort((a, b) => a.date.localeCompare(b.date));

  // Pie data: expenses by category
  const cat = {};
  transactions.forEach(t => {
    if (t.type === 'Expense') {
      cat[t.category] = (cat[t.category] || 0) + t.amount;
    }
  });
  const pieData = Object.entries(cat).map(([name, value]) => ({ name, value }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA336A', '#8855FF'];

  // Summary stats
  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((a, b) => a + b.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((a, b) => a + b.amount, 0);
  const netBalance = totalIncome - totalExpense;

  return (
    <div className="container">
      <header className="top">
        <h1>Dashboard</h1>
        <nav>
          <Link to="/transactions">Transactions</Link> | <Link to="/goals">Goals</Link>
        </nav>
      </header>

      {/* ✅ Summary Cards */}
      <section className="summary" style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <div className="card" style={{ flex: 1, textAlign: 'center' }}>
          <h3>Total Income</h3>
          <p style={{ color: '#00C49F', fontSize: '1.3rem', fontWeight: 'bold' }}>{formatIDR(totalIncome)}</p>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center' }}>
          <h3>Total Expense</h3>
          <p style={{ color: '#FF8042', fontSize: '1.3rem', fontWeight: 'bold' }}>{formatIDR(totalExpense)}</p>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center' }}>
          <h3>Net Balance</h3>
          <p style={{ color: netBalance >= 0 ? '#00C49F' : '#FF3333', fontSize: '1.3rem', fontWeight: 'bold' }}>
            {formatIDR(netBalance)}
          </p>
        </div>
      </section>

      {/* ✅ Charts */}
      <section className="charts" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
        <div className="card" style={{ flex: 2 }}>
          <h3>Income vs Expense Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={v => formatIDR(v).replace('Rp', '')} />
              <Tooltip formatter={(value) => formatIDR(value)} />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#00C49F" strokeWidth={2} name="Income" />
              <Line type="monotone" dataKey="expense" stroke="#FF8042" strokeWidth={2} name="Expense" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ flex: 1 }}>
          <h3>Spending by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.name}: ${formatIDR(entry.value)}`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatIDR(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ✅ Top Categories Table */}
      {pieData.length > 0 && (
        <section className="card" style={{ marginTop: '2rem' }}>
          <h3>Top Expense Categories</h3>
          <table className="tx-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Category</th>
                <th>Total Spent</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {pieData.map((c, i) => {
                const percent = ((c.value / totalExpense) * 100).toFixed(1);
                return (
                  <tr key={i}>
                    <td>{c.name}</td>
                    <td>{formatIDR(c.value)}</td>
                    <td>{percent}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

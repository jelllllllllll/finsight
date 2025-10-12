import { useEffect, useState } from 'react';
import api from '../api/axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import React from "react";

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

  // group by date for line chart (simple)
  const daily = {};
  transactions.forEach(t => {
    const d = new Date(t.date).toISOString().slice(0,10);
    daily[d] = daily[d] || { date: d, income: 0, expense: 0 };
    if (t.type === 'Income') daily[d].income += t.amount;
    else daily[d].expense += t.amount;
  });
  const lineData = Object.values(daily).sort((a,b)=>a.date.localeCompare(b.date));

  // pie data: expenses by category
  const cat = {};
  transactions.forEach(t => {
    if (t.type === 'Expense') {
      cat[t.category] = (cat[t.category] || 0) + t.amount;
    }
  });
  const pieData = Object.entries(cat).map(([name, value])=>({ name, value }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA336A', '#8855FF'];

  return (
    <div className="container">
      <header className="top">
        <h1>Dashboard</h1>
        <nav>
          <Link to="/transactions">Transactions</Link> | <Link to="/goals">Goals</Link>
        </nav>
      </header>

      <section className="charts">
        <div className="card">
          <h3>Income vs Expense</h3>
          <LineChart width={600} height={250} data={lineData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#00C49F" />
            <Line type="monotone" dataKey="expense" stroke="#FF8042" />
          </LineChart>
        </div>

        <div className="card">
          <h3>Spending by Category</h3>
          <PieChart width={350} height={250}>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      </section>

    </div>
  );
}

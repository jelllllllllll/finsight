import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell,
  Legend, CartesianGrid, ResponsiveContainer
} from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import { formatIDR } from '../utils/format';

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ name: 'User' });
  const nav = useNavigate();

  useEffect(() => {
    // Ambil nama user dari localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch(e){}
    }

    (async () => {
      try {
        const { data } = await api.get('/transactions');
        setTransactions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Gagal ambil data", err);
        if(err.response?.status === 401) nav('/login'); 
      } finally {
        setLoading(false);
      }
    })();
  }, [nav]);

  // --- Fungsi Logout ---
  const handleLogout = () => {
    if(window.confirm('Keluar dari aplikasi?')) {
      localStorage.clear();
      nav('/login');
    }
  };

  // --- Data Processing ---
  const daily = {};
  const cat = {};

  transactions.forEach(t => {
    const amount = Number(t.amount) || 0;
    if (!t.date) return; 
    let d;
    try { d = new Date(t.date).toISOString().slice(0, 10); } catch (e) { return; }

    daily[d] = daily[d] || { date: d, income: 0, expense: 0 };
    t.type === 'Income' ? (daily[d].income += amount) : (daily[d].expense += amount);

    if (t.type === 'Expense' && t.category) {
      cat[t.category] = (cat[t.category] || 0) + amount;
    }
  });

  const lineData = Object.values(daily).sort((a, b) => a.date.localeCompare(b.date));
  const pieData = Object.entries(cat).map(([name, value]) => ({ name, value }));
  const COLORS = ['#5da399', '#417b73', '#e0b084', '#d68c8c', '#5f6f8f', '#9b8bc4'];

  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((a, b) => a + (Number(b.amount)||0), 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((a, b) => a + (Number(b.amount)||0), 0);
  const netBalance = totalIncome - totalExpense;

  if (loading) return <div className="container" style={{textAlign:'center', marginTop:'100px'}}>Loading FinSight...</div>;

  return (
    <div className="container">
      {/* --- HEADER SERAGAM (Updated) --- */}
      <header className="top">
        <div>
          {/* Eyebrow Text */}
          <span className="eyebrow" style={{ display:'block', marginBottom:'4px', fontSize:'11px', fontWeight:700, color:'#6B7280', letterSpacing:'0.1em' }}>WELCOME BACK,</span>
          <h1>{user.name}</h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Navigasi Kapsul */}
          <nav className="nav-group" style={{ display:'flex', gap:'4px', background:'#fff', padding:'4px', borderRadius:'50px', border:'1px solid #E5E7EB' }}>
            <Link to="/transactions" style={{ padding:'8px 16px', textDecoration:'none', color:'#6B7280', fontSize:'13px', fontWeight:500 }}>Transactions</Link>
            <Link to="/goals" style={{ padding:'8px 16px', textDecoration:'none', color:'#6B7280', fontSize:'13px', fontWeight:500 }}>Goals</Link>
          </nav>
          
          {/* Profile Circle (Logout) */}
          <div 
            onClick={handleLogout}
            title="Click to Logout"
            style={{ 
              width:'40px', height:'40px', background:'#2D6A4F', color:'white', 
              borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
              fontWeight:'700', fontSize:'16px', cursor:'pointer', border:'2px solid #E9EFEC'
            }}
          >
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </header>

      {/* Summary Cards */}
      <section className="summary-grid">
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#6B7C7A', letterSpacing: '0.5px' }}>INCOME</span>
            <span style={{ background:'#E9EFEC', padding:'4px 8px', borderRadius:'6px', color:'#5da399', fontSize:'18px' }}>↓</span>
          </div>
          <h2 style={{ margin: 0, color: '#1C2B29', fontSize: '28px' }}>{formatIDR(totalIncome)}</h2>
        </div>

        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#6B7C7A', letterSpacing: '0.5px' }}>EXPENSE</span>
            <span style={{ background:'#FDECEC', padding:'4px 8px', borderRadius:'6px', color:'#E57373', fontSize:'18px' }}>↑</span>
          </div>
          <h2 style={{ margin: 0, color: '#1C2B29', fontSize: '28px' }}>{formatIDR(totalExpense)}</h2>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, #5da399 0%, #417b73 100%)', color: 'white', border: 'none' }}>
           <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.5px' }}>BALANCE</span>
            <span style={{ fontSize:'18px' }}>💰</span>
          </div>
          <h2 style={{ margin: 0, color: 'white', fontSize: '28px' }}>{formatIDR(netBalance)}</h2>
        </div>
      </section>

      {/* Charts Section */}
      <section className="charts-grid">
        <div className="card">
          <h3 style={{ borderBottom:'1px solid #f0f0f0', paddingBottom:'16px', marginTop:0 }}>Cash Flow Trend</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E8E5" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{fontSize: 12, fill: '#6B7C7A'}} dy={10} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={v => (v/1000) + 'k'} tick={{fontSize: 12, fill: '#6B7C7A'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} 
                  formatter={(value) => formatIDR(value)} 
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
                <Line type="monotone" dataKey="income" stroke="#5da399" strokeWidth={3} dot={false} name="Income" />
                <Line type="monotone" dataKey="expense" stroke="#E57373" strokeWidth={3} dot={false} name="Expense" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 style={{ borderBottom:'1px solid #f0f0f0', paddingBottom:'16px', marginTop:0 }}>Spending</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatIDR(value)} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '12px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
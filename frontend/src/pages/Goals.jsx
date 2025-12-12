import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { formatIDR } from '../utils/format';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({ name: '', targetAmount: '', deadline: '' });
  const [depositAmounts, setDepositAmounts] = useState({}); 
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({ name: 'User' });
  const nav = useNavigate();

  // --- Fetch Data ---
  const fetchGoals = async () => {
    try {
      const { data } = await api.get('/goals');
      setGoals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { 
    // Ambil nama user untuk Profile Circle
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchGoals(); 
  }, []);

  const handleLogout = () => {
    if(window.confirm('Keluar dari aplikasi?')) {
      localStorage.clear();
      nav('/login');
    }
  };

  // --- Create New Goal ---
  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/goals', { 
        ...form, 
        targetAmount: Number(form.targetAmount),
        currentAmount: 0 
      });
      setForm({ name: '', targetAmount: '', deadline: '' });
      fetchGoals();
    } catch (err) {
      alert('Gagal membuat goal');
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIKA BARU: Tabung Sekaligus Catat Transaksi ---
  const handleDeposit = async (goalId, goalName, currentTotal, target) => {
    const amountToAdd = Number(depositAmounts[goalId]);
    
    if (!amountToAdd || amountToAdd <= 0) return alert("Masukkan jumlah tabungan!");
    
    // Konfirmasi User
    const confirmMsg = `Tabung ${formatIDR(amountToAdd)} ke goal "${goalName}"?\n\nIni akan otomatis tercatat sebagai Pengeluaran (Savings) di Transaksi.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      // 1. Update Goal (Naikkan Progress)
      const goal = goals.find(g => g._id === goalId);
      await api.put(`/goals/${goalId}`, { 
        ...goal,
        currentAmount: currentTotal + amountToAdd 
      });

      // 2. OTOMATIS Buat Transaksi (Agar Saldo Dashboard Berkurang)
      await api.post('/transactions', {
        type: 'Expense',
        category: 'Savings', // Kategori khusus Tabungan
        amount: amountToAdd,
        date: new Date().toISOString(), // Tanggal hari ini
        notes: `Deposit ke Goal: ${goalName}`
      });

      // 3. Reset & Refresh
      alert('Berhasil menabung! Transaksi telah tercatat.');
      setDepositAmounts({ ...depositAmounts, [goalId]: '' });
      fetchGoals();
      
    } catch (err) {
      alert('Terjadi kesalahan saat memproses tabungan.');
      console.error(err);
    }
  };

  // --- Delete Goal ---
  const handleDelete = async (id) => {
    if (!window.confirm('Hapus goal ini? Uang yang sudah terkumpul tidak akan kembali ke saldo transaksi otomatis.')) return;
    try {
      await api.delete(`/goals/${id}`);
      fetchGoals();
    } catch (err) {
      alert('Gagal menghapus');
    }
  };

  return (
    <div className="container">
      {/* --- HEADER SERAGAM (Updated) --- */}
      <header className="top">
        <div>
          <span className="eyebrow" style={{ display:'block', marginBottom:'4px', fontSize:'11px', fontWeight:700, color:'#6B7280', letterSpacing:'0.1em' }}>PLANNING</span>
          <h1>Financial Goals</h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>
            Atur target impianmu. Menabung di sini akan otomatis tercatat di Transaksi.
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Navigasi Kapsul */}
          <nav className="nav-group" style={{ display:'flex', gap:'4px', background:'#fff', padding:'4px', borderRadius:'50px', border:'1px solid #E5E7EB' }}>
            <Link to="/dashboard" style={{ padding:'8px 16px', textDecoration:'none', color:'#6B7280', fontSize:'13px', fontWeight:500 }}>Dashboard</Link>
            <Link to="/transactions" style={{ padding:'8px 16px', textDecoration:'none', color:'#6B7280', fontSize:'13px', fontWeight:500 }}>Transactions</Link>
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

      {/* --- Form Buat Goal Baru --- */}
      <section className="card" style={{ marginBottom: '40px' }}>
        <h3>Create New Goal</h3>
        <form onSubmit={handleCreate} className="form-inline">
          <input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Goal Name (e.g. Rumah Impian)"
            required
            style={{ flex: 2 }}
          />
          <input
            type="number"
            value={form.targetAmount}
            onChange={e => setForm({ ...form, targetAmount: e.target.value })}
            placeholder="Target Amount (Rp)"
            required
            style={{ flex: 1 }}
          />
          <input
            type="date"
            value={form.deadline}
            onChange={e => setForm({ ...form, deadline: e.target.value })}
            style={{ flex: 1 }}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : '+ Create Goal'}
          </button>
        </form>
      </section>

      {/* --- Daftar Goals --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {goals.map(g => {
            const current = g.currentAmount || 0;
            const target = g.targetAmount || 1;
            const progress = Math.min((current / target) * 100, 100).toFixed(1);
            const isCompleted = current >= target;

            return (
              <div key={g._id} className="card" style={{ padding: '24px', position: 'relative' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                   <div>
                     <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>{g.name}</h3>
                     <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                       Deadline: {g.deadline ? new Date(g.deadline).toLocaleDateString() : 'No Deadline'}
                     </span>
                   </div>
                   <span style={{ 
                     background: isCompleted ? '#ECFDF5' : '#F3F4F6', 
                     color: isCompleted ? '#059669' : '#6B7280', 
                     padding:'4px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:700, height:'fit-content' 
                   }}>
                     {isCompleted ? 'COMPLETED' : 'IN PROGRESS'}
                   </span>
                </div>
                
                {/* Info Angka */}
                <div style={{ marginBottom: '16px' }}>
                   <div style={{ display:'flex', justifyContent:'space-between', fontSize:'14px', marginBottom:'6px' }}>
                      <span style={{ color:'#6B7280' }}>Terkumpul</span>
                      <span style={{ fontWeight:600, color:'#111827' }}>{formatIDR(current)}</span>
                   </div>
                   <div style={{ display:'flex', justifyContent:'space-between', fontSize:'14px', marginBottom:'8px' }}>
                      <span style={{ color:'#6B7280' }}>Target</span>
                      <span style={{ fontWeight:600, color:'#111827' }}>{formatIDR(target)}</span>
                   </div>

                   {/* Progress Bar */}
                   <div style={{ width: '100%', background: '#F3F4F6', height: '10px', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${progress}%`, 
                        background: isCompleted ? '#059669' : '#5da399', 
                        height: '100%',
                        transition: 'width 0.5s ease' 
                      }}></div>
                   </div>
                   <div style={{ textAlign: 'right', fontSize: '11px', color: '#5da399', marginTop: '6px', fontWeight:600 }}>
                     {progress}% Achieved
                   </div>
                </div>

                {/* AREA DEPOSIT */}
                {!isCompleted && (
                  <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '12px', marginTop: '16px', border:'1px solid #E5E7EB' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                      Alokasikan Dana (Tabung)
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="number" 
                        placeholder="Rp 0"
                        value={depositAmounts[g._id] || ''}
                        onChange={(e) => setDepositAmounts({...depositAmounts, [g._id]: e.target.value})}
                        style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '8px', background:'white' }}
                      />
                      <button 
                        onClick={() => handleDeposit(g._id, g.name, current, target)}
                        style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '8px', whiteSpace:'nowrap' }}
                      >
                        Tabung
                      </button>
                    </div>
                    <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '8px', marginBottom: 0, fontStyle:'italic' }}>
                      *Akan otomatis tercatat di Transaksi
                    </p>
                  </div>
                )}

                <button 
                  onClick={() => handleDelete(g._id)} 
                  style={{ 
                    background: 'transparent', color: '#EF4444', border: 'none', 
                    fontSize: '11px', marginTop: '16px', padding: 0, 
                    boxShadow: 'none', cursor: 'pointer', textDecoration: 'underline'
                  }}
                >
                  Delete Goal
                </button>
              </div>
            );
        })}
      </div>
    </div>
  );
}
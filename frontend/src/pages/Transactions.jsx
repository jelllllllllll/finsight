import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { formatIDR } from '../utils/format';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTx, setFilteredTx] = useState([]); // State untuk hasil search
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ type: 'Expense', category: '', amount: '', date: '', notes: '' });
  const [editingId, setEditingId] = useState(null);
  const [user, setUser] = useState({ name: 'User' }); // Untuk Profile Initial
  const nav = useNavigate();

  // --- 1. Fetch Data & User ---
  const fetchTransactions = async () => {
    try {
      const { data } = await api.get('/transactions');
      const dataArray = Array.isArray(data) ? data : [];
      setTransactions(dataArray);
      setFilteredTx(dataArray); // Init filtered data
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchTransactions();
  }, []);

  // --- 2. Fitur Search Logic ---
  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    const results = transactions.filter(t => 
      t.category.toLowerCase().includes(lower) || 
      (t.notes && t.notes.toLowerCase().includes(lower))
    );
    setFilteredTx(results);
  }, [searchTerm, transactions]);

  // --- 3. Fitur Export to CSV (Laporan) ---
  const handleExport = () => {
    if (transactions.length === 0) return alert('Tidak ada data untuk diexport');
    
    // Header CSV
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Type,Category,Amount,Notes\n";

    // Isi Data
    transactions.forEach(row => {
      const date = row.date ? row.date.slice(0, 10) : '';
      csvContent += `${date},${row.type},${row.category},${row.amount},${row.notes || '-'}\n`;
    });

    // Download Logic
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "finsight_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- CRUD Logic (DENGAN PERBAIKAN TYPO OTOMATIS) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // LOGIKA PERBAIKAN HURUF:
      // Ubah input kategori menjadi: Huruf Depan Besar + sisanya kecil
      // Contoh: "food" -> "Food", "FOOD" -> "Food", "makanAN" -> "Makanan"
      const cleanCategory = form.category
        ? form.category.charAt(0).toUpperCase() + form.category.slice(1).toLowerCase()
        : 'General';

      const payload = { 
        ...form, 
        category: cleanCategory, // Pakai kategori yang sudah rapi
        amount: Number(form.amount) 
      };

      if (editingId) await api.put(`/transactions/${editingId}`, payload);
      else await api.post('/transactions', payload);
      
      setForm({ type: 'Expense', category: '', amount: '', date: '', notes: '' });
      setEditingId(null);
      fetchTransactions();
    } catch (err) { alert('Gagal menyimpan data'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus transaksi ini?')) return;
    try { await api.delete(`/transactions/${id}`); fetchTransactions(); } 
    catch (err) { alert('Gagal menghapus'); }
  };

  const handleEdit = (tx) => {
    setEditingId(tx._id);
    setForm({
      type: tx.type, category: tx.category, amount: tx.amount,
      date: tx.date ? tx.date.slice(0, 10) : '', notes: tx.notes || ''
    });
  };

  const handleLogout = () => {
    if(window.confirm('Logout?')) {
      localStorage.clear();
      nav('/login');
    }
  };

  return (
    <div className="container">
      {/* --- HEADER SERAGAM (Unified UI) --- */}
      <header className="top">
        <div>
          <span className="eyebrow" style={{ display:'block', marginBottom:'4px', fontSize:'11px', fontWeight:700, color:'#6B7280', letterSpacing:'0.1em' }}>MANAGEMENT</span>
          <h1>Transactions</h1>
        </div>
        
        {/* Right Side: Nav + Profile Circle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <nav className="nav-group" style={{ display:'flex', gap:'4px', background:'#fff', padding:'4px', borderRadius:'50px', border:'1px solid #E5E7EB' }}>
            <Link to="/dashboard" style={{ padding:'8px 16px', textDecoration:'none', color:'#6B7280', fontSize:'13px', fontWeight:500 }}>Dashboard</Link>
            <Link to="/goals" style={{ padding:'8px 16px', textDecoration:'none', color:'#6B7280', fontSize:'13px', fontWeight:500 }}>Goals</Link>
          </nav>
          
          {/* Profile Circle with Logout Tooltip Logic */}
          <div 
            onClick={handleLogout}
            title="Click to Logout"
            style={{ 
              width:'40px', height:'40px', background:'#2D6A4F', color:'white', 
              borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
              fontWeight:'700', fontSize:'16px', cursor:'pointer', border:'2px solid #E9EFEC'
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* --- FORM SECTION --- */}
      <section className="card" style={{ marginBottom: '32px' }}>
        <h3 style={{marginBottom: '20px'}}>{editingId ? 'Edit Transaction' : 'Add New Transaction'}</h3>
        <form onSubmit={handleSubmit} className="form-inline">
          <select 
            value={form.type} 
            onChange={e => setForm({ ...form, type: e.target.value })}
            style={{ minWidth: '120px' }}
          >
            <option value="Expense">Expense</option>
            <option value="Income">Income</option>
          </select>
          <input
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
            placeholder="Category (e.g. Food)"
            required
            style={{ flex: 2 }}
          />
          <input
            type="number"
            value={form.amount}
            onChange={e => setForm({ ...form, amount: e.target.value })}
            placeholder="Amount (Rp)"
            required
            style={{ flex: 1 }}
          />
          <input
            type="date"
            value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })}
            required
            style={{ flex: 1 }}
          />
          <input
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder="Notes (optional)"
            style={{ flex: 2 }}
          />
          <button type="submit" style={{height: '42px'}}>{editingId ? 'Update' : 'Add'}</button>
          {editingId && (
            <button type="button" className="secondary" onClick={() => { setEditingId(null); setForm({ type: 'Expense', category: '', amount: '', date: '', notes: '' }); }}>
              Cancel
            </button>
          )}
        </form>
      </section>

      {/* --- TABLE CONTROLS (Search & Export) --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <input 
          type="text" 
          placeholder="Search category or notes..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: '300px', padding: '10px 16px' }}
        />
        <button 
          onClick={handleExport} 
          className="secondary" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
        >
          Export CSV
        </button>
      </div>

      {/* --- TABLE SECTION --- */}
      <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
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
              {filteredTx.length > 0 ? filteredTx.map(tx => (
                <tr key={tx._id}>
                  <td>{tx.date ? new Date(tx.date).toLocaleDateString() : '-'}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: tx.type === 'Income' ? '#ECFDF5' : '#FEF2F2',
                      color: tx.type === 'Income' ? '#059669' : '#EF4444',
                      border: `1px solid ${tx.type === 'Income' ? '#A7F3D0' : '#FECACA'}`
                    }}>
                      {tx.type.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{tx.category}</td>
                  <td style={{ fontWeight: 600, color: '#111827' }}>{formatIDR(tx.amount)}</td>
                  <td style={{ color: '#6B7280', fontSize:'13px' }}>{tx.notes || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleEdit(tx)}
                        className="secondary"
                        style={{ padding: '6px 12px', fontSize: '11px' }}
                      >Edit</button>
                      <button 
                        onClick={() => handleDelete(tx._id)}
                        style={{ padding: '6px 12px', fontSize: '11px', background: '#EF4444', color: 'white', border:'none', boxShadow:'none' }}
                      >Delete</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#9CA3AF' }}>
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
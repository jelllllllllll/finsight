import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      // Simpan token & user
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      nav('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Email atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Header Login */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', color: '#1C2B29', marginBottom: '8px' }}>Welcome Back</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="form">
          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#417b73', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Email Address</label>
            <input 
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
              placeholder="name@example.com" 
              type="email"
              required
              style={{ background: '#F8FAFC' }}
            />
          </div>
          
          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#417b73', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              placeholder="••••••••" 
              required
              style={{ background: '#F8FAFC' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              marginTop: '16px', 
              height: '48px', 
              fontSize: '16px', 
              boxShadow: '0 4px 12px rgba(93, 163, 153, 0.3)' 
            }}
          >
            {loading ? 'Processing...' : 'Sign In'}
          </button>
        </form>
        
        <div style={{ marginTop: '32px', borderTop: '1px solid #E0E8E5', paddingTop: '24px' }}>
          <p style={{ fontSize: '14px', margin: 0 }}>
            Belum punya akun? <Link to="/register" style={{ fontWeight: 'bold' }}>Daftar Sekarang</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
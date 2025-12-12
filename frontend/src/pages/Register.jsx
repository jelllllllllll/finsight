import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      // Simpan token & user agar langsung login
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      nav('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Create Account</h1>
        <p style={{ marginBottom: '32px' }}>Join FinSight to track your wealth.</p>
        
        <form onSubmit={handleSubmit} className="form">
          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7C7A', marginBottom: '4px', display: 'block' }}>Full Name</label>
            <input 
              value={name} 
              onChange={e=>setName(e.target.value)} 
              placeholder="John Doe" 
              required
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7C7A', marginBottom: '4px', display: 'block' }}>Email Address</label>
            <input 
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
              placeholder="name@company.com" 
              type="email"
              required
            />
          </div>
          
          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7C7A', marginBottom: '4px', display: 'block' }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              placeholder="••••••••" 
              required
            />
          </div>

          <button type="submit" style={{ marginTop: '16px' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <p style={{ marginTop: '24px', fontSize: '14px' }}>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
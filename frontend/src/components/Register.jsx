import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Background from './Background';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/auth/register`;

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'username', label: 'Username', type: 'text', placeholder: 'Choose a unique username', id: 'reg-username' },
    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com', id: 'reg-email' },
    { name: 'password', label: 'Password', type: 'password', placeholder: 'Min. 8 characters', id: 'reg-password' },
    { name: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: 'Re-enter your password', id: 'reg-confirm' },
  ];

  return (
    <div className="page-wrapper" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <Background />

      <div className="animate-fadeInUp" style={{ width: '100%', maxWidth: 460 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div className="animate-bounce-in" style={{
            fontSize: 52,
            marginBottom: 10,
            filter: 'drop-shadow(0 0 20px rgba(167,139,250,0.6))'
          }}>
            🏆
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.5 }}>
            <span className="text-gradient">Join the Battle</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: 14 }}>
            Create your account and start competing
          </p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: '32px 36px' }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 24,
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <span>✨</span> Create Account
          </h2>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 20 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {fields.map((field) => (
              <div key={field.name} className="form-group">
                <label className="form-label" htmlFor={field.id}>{field.label}</label>
                <input
                  id={field.id}
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder={field.placeholder}
                />
              </div>
            ))}

            {/* Password strength hints */}
            {formData.password && (
              <div style={{
                display: 'flex',
                gap: 6,
                marginTop: -12,
                marginBottom: 16
              }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{
                    height: 3,
                    flex: 1,
                    borderRadius: 2,
                    background: i < (formData.password.length >= 12 ? 4 :
                                     formData.password.length >= 8 ? 3 :
                                     formData.password.length >= 5 ? 2 : 1)
                      ? (formData.password.length >= 12 ? '#10b981' :
                         formData.password.length >= 8 ? '#f59e0b' : '#ef4444')
                      : 'rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease'
                  }} />
                ))}
              </div>
            )}

            <button
              id="reg-submit"
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 8 }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                  Creating account...
                </>
              ) : (
                '🚀 Create Account'
              )}
            </button>
          </form>

          <div className="divider">already a player?</div>

          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
            <Link
              to="/login"
              style={{
                color: 'var(--primary-light)',
                fontWeight: 700,
                borderBottom: '1px solid rgba(168,85,247,0.4)',
                paddingBottom: 1
              }}
            >
              Sign in to your account →
            </Link>
          </p>
        </div>

        {/* Feature list */}
        <div className="glass-card" style={{
          padding: '16px 24px',
          marginTop: 16,
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: 12
        }}>
          {['🎯 Live Battles', '🏅 Leaderboard', '⚡ Instant Join'].map((feat) => (
            <span key={feat} style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              fontWeight: 500
            }}>
              {feat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Register;

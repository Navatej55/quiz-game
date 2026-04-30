import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Background from './Background';
import { API_BASE_URL } from '../config';

const Room = () => {
  const { roomCode } = useParams();
  const [room, setRoom] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchRoomDetails();
    const interval = setInterval(fetchRoomDetails, 2000);
    return () => clearInterval(interval);
  }, [roomCode, navigate]);

  const fetchRoomDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const response = await fetch(`${API_BASE_URL}/api/rooms/${roomCode}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setRoom(data);
        setIsHost(data.host === userId);
        setLoading(false);
      } else {
        setError(data.message || 'Failed to load room');
        setLoading(false);
      }
    } catch (err) {
      setError('Server error. Please try again.');
      setLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/quiz/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ roomCode }),
      });
      const data = await response.json();
      if (response.ok) {
        navigate(`/quiz/${roomCode}`);
      } else {
        setError(data.message || 'Failed to start quiz');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    }
  };

  const handleLeaveRoom = () => navigate('/');

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <Background />
        <div className="spinner" style={{ width: 56, height: 56, borderWidth: 4 }} />
        <p>Loading room…</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="page-wrapper">
        <Background />
        <div className="glass-card" style={{ padding: 40, textAlign: 'center', maxWidth: 400 }}>
          <span style={{ fontSize: 48 }}>😕</span>
          <h2 style={{ marginTop: 16, marginBottom: 8 }}>Room Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>This room may have expired or the code is incorrect.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>← Back to Lobby</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '24px 16px', position: 'relative' }}>
      <Background />

      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 50,
        padding: '14px 28px',
        backdropFilter: 'blur(20px)',
        background: 'rgba(10, 10, 26, 0.7)',
        borderBottom: '1px solid var(--border-glass)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>🎮</span>
          <span style={{ fontWeight: 800, fontSize: 18 }}>
            <span className="text-gradient">Quiz Battle</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isHost && <span className="badge badge-gold">👑 Host</span>}
          <button
            id="room-leave-header"
            className="btn btn-secondary btn-sm"
            onClick={handleLeaveRoom}
          >
            ← Leave
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 680, margin: '0 auto', paddingTop: 100, paddingBottom: 40 }}>

        {/* Room code banner */}
        <div className="glass-card animate-fadeInUp" style={{
          padding: '28px',
          marginBottom: 20,
          textAlign: 'center',
          background: 'rgba(124, 58, 237, 0.08)',
          border: '1px solid rgba(124, 58, 237, 0.25)'
        }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>
            Room Code — Share with friends
          </p>
          <div style={{
            fontSize: 46,
            fontWeight: 900,
            letterSpacing: 8,
            color: 'var(--primary-light)',
            textShadow: 'var(--shadow-glow)',
            marginBottom: 16
          }}>
            {roomCode}
          </div>
          <button
            id="room-copy-code"
            className={`btn ${copied ? 'btn-success' : 'btn-secondary'} btn-sm`}
            onClick={copyRoomCode}
          >
            {copied ? '✅ Copied!' : '📋 Copy Code'}
          </button>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>
        )}

        {/* Status banner */}
        <div className="glass-card" style={{
          padding: '16px 24px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <div style={{
            width: 10, height: 10,
            borderRadius: '50%',
            background: room.status === 'waiting' ? '#f59e0b' : '#10b981',
            boxShadow: `0 0 8px ${room.status === 'waiting' ? '#f59e0b' : '#10b981'}`,
            animation: 'pulse 2s ease-in-out infinite'
          }} />
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 15 }}>
            {room.status === 'waiting'
              ? '⏳ Waiting for host to start the quiz…'
              : '🎮 Quiz in progress!'}
          </span>
        </div>

        {/* Players list */}
        <div className="glass-card" style={{ padding: '0', marginBottom: 20, overflow: 'hidden' }}>
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-glass)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
              👥 Players
            </h3>
            <span className="badge badge-purple">{room.players?.length || 0} joined</span>
          </div>

          <div style={{ padding: '8px 0' }}>
            {room.players?.length === 0 ? (
              <p style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: 14 }}>
                No players yet. Share the room code!
              </p>
            ) : (
              room.players?.map((player, i) => (
                <div
                  key={player._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 24px',
                    borderBottom: i < (room.players.length - 1) ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36,
                      borderRadius: '50%',
                      background: `hsl(${(i * 60) % 360}, 70%, 55%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 800,
                      color: 'white'
                    }}>
                      {player.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>
                      {player.username}
                    </span>
                  </div>
                  {player._id === room.host && (
                    <span className="badge badge-gold">👑 Host</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          {isHost ? (
            <button
              id="room-start-quiz"
              className="btn btn-primary btn-lg"
              onClick={handleStartQuiz}
              disabled={room.players?.length < 1}
              style={{ flex: 1 }}
            >
              🚀 Start Quiz Battle
            </button>
          ) : (
            <button
              className="btn btn-secondary btn-lg"
              disabled
              style={{ flex: 1, opacity: 0.5, cursor: 'not-allowed' }}
            >
              ⏳ Waiting for host to start…
            </button>
          )}
          <button
            id="room-leave-btn"
            className="btn btn-danger btn-lg"
            onClick={handleLeaveRoom}
            style={{ minWidth: 120 }}
          >
            🚪 Leave
          </button>
        </div>
      </div>
    </div>
  );
};

export default Room;
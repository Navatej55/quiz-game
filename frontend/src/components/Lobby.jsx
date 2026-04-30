import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Background from "./Background";
import { API_BASE_URL } from "../config";

const Lobby = () => {
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [roomCode, setRoomCode] = useState("");
  const [roomName, setRoomName] = useState("");
  const [createdRoomCode, setCreatedRoomCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState("create");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/rooms/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName, hostName: username }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreatedRoomCode(data.room.code);
      } else {
        alert(data.message || "Failed to create room");
      }
    } catch (err) {
      console.error(err);
      alert("Server error while creating room");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!roomCode || !username) return alert("Please enter Room Code and Username");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/rooms/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode, username }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate(`/quiz/${roomCode}`, { state: { username } });
      } else {
        alert(data.message || "Invalid room code");
      }
    } catch (err) {
      console.error("Join Room Error:", err);
      alert("Server error while joining room");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(createdRoomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnterRoom = () => {
    navigate(`/quiz/${createdRoomCode}`, { state: { username } });
  };

  return (
    <div style={{ minHeight: "100vh", padding: "24px 16px", position: "relative" }}>
      <Background />

      {/* Top Navbar */}
      <header style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 28px",
        backdropFilter: "blur(20px)",
        background: "rgba(10, 10, 26, 0.7)",
        borderBottom: "1px solid var(--border-glass)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 26 }}>🎮</span>
          <span style={{
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: -0.5
          }}>
            <span className="text-gradient">Quiz Battle</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {username && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: "var(--radius-full)",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid var(--border-glass)",
              fontSize: 14,
              color: "var(--text-secondary)"
            }}>
              <span>👤</span>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{username}</span>
            </div>
          )}
          <button
            id="lobby-logout"
            className="btn btn-danger btn-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div style={{
        maxWidth: 560,
        margin: "0 auto",
        paddingTop: 100,
        paddingBottom: 40
      }}>

        {/* Hero */}
        <div className="animate-fadeInUp" style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            fontSize: 64,
            marginBottom: 12,
            filter: "drop-shadow(0 0 30px rgba(167,139,250,0.7))",
            animation: "pulse 3s ease-in-out infinite"
          }}>⚔️</div>
          <h1 style={{
            fontSize: 40,
            fontWeight: 900,
            letterSpacing: -1,
            lineHeight: 1.15
          }}>
            <span className="text-gradient text-glow">Ready to Battle?</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: 10, fontSize: 16 }}>
            Create a room or join an existing one to compete
          </p>
        </div>

        {/* Username input */}
        <div className="glass-card animate-fadeInUp" style={{
          padding: "20px 24px",
          marginBottom: 20,
          animationDelay: "0.1s",
          opacity: 0,
          animation: "fadeInUp 0.5s 0.1s ease forwards"
        }}>
          <label className="form-label">Your Nickname</label>
          <input
            id="lobby-username"
            type="text"
            placeholder="Enter your battle name…"
            className="form-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        {/* Mode Toggle */}
        <div style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          opacity: 0,
          animation: "fadeInUp 0.5s 0.2s ease forwards"
        }}>
          {[
            { id: "create", label: "🚀 Create Room", icon: "" },
            { id: "join",   label: "🔗 Join Room",   icon: "" },
          ].map(({ id, label }) => (
            <button
              key={id}
              id={`mode-${id}`}
              className={mode === id ? "btn btn-primary" : "btn btn-secondary"}
              onClick={() => setMode(id)}
              style={{ flex: 1, fontWeight: 700, fontSize: 15 }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Form Card */}
        <div className="glass-card" style={{
          padding: "28px",
          opacity: 0,
          animation: "fadeInUp 0.5s 0.3s ease forwards"
        }}>
          {mode === "create" ? (
            <>
              <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 20, color: "var(--text-primary)" }}>
                🏠 Create a New Room
              </h3>
              <form onSubmit={handleCreateRoom}>
                <div className="form-group">
                  <label className="form-label">Room Name</label>
                  <input
                    id="create-room-name"
                    type="text"
                    placeholder="Give your room a cool name…"
                    className="form-input"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    required
                  />
                </div>
                <button
                  id="create-room-btn"
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg"
                  style={{ width: "100%" }}
                >
                  {loading ? (
                    <><div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> Creating…</>
                  ) : "🚀 Create Room"}
                </button>
              </form>

              {/* Created room code display */}
              {createdRoomCode && (
                <div className="animate-bounce-in" style={{
                  marginTop: 24,
                  padding: "20px",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  textAlign: "center"
                }}>
                  <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 8 }}>
                    ✅ Room created! Share this code:
                  </p>
                  <div style={{
                    fontSize: 38,
                    fontWeight: 900,
                    letterSpacing: 6,
                    color: "#6ee7b7",
                    marginBottom: 16,
                    textShadow: "0 0 20px rgba(16,185,129,0.5)"
                  }}>
                    {createdRoomCode}
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      id="copy-room-code"
                      className={`btn ${copied ? "btn-success" : "btn-secondary"}`}
                      onClick={handleCopyCode}
                      style={{ flex: 1 }}
                    >
                      {copied ? "✅ Copied!" : "📋 Copy Code"}
                    </button>
                    <button
                      id="enter-room-btn"
                      className="btn btn-cyan"
                      onClick={handleEnterRoom}
                      style={{ flex: 1 }}
                    >
                      Enter Room →
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 20, color: "var(--text-primary)" }}>
                🎯 Join an Existing Room
              </h3>
              <form onSubmit={handleJoinRoom}>
                <div className="form-group">
                  <label className="form-label">Room Code</label>
                  <input
                    id="join-room-code"
                    type="text"
                    placeholder="Enter the 6-digit room code…"
                    className="form-input"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    required
                    style={{ textAlign: "center", letterSpacing: 4, fontSize: 20, fontWeight: 700 }}
                  />
                </div>
                <button
                  id="join-room-btn"
                  type="submit"
                  disabled={loading}
                  className="btn btn-cyan btn-lg"
                  style={{ width: "100%" }}
                >
                  {loading ? (
                    <><div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> Joining…</>
                  ) : "🔗 Join Room"}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Stats strip */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: 32,
          marginTop: 32,
          opacity: 0,
          animation: "fadeInUp 0.5s 0.4s ease forwards"
        }}>
          {[
            { label: "Players Online", value: "🟢 Live" },
            { label: "Questions", value: "50+" },
            { label: "Categories", value: "10+" },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>{value}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Lobby;

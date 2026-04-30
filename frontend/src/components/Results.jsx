import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../config';
import Background from "./Background";

const medal = ["🥇", "🥈", "🥉"];
const medalColors = ["#fcd34d", "#d1d5db", "#cd7f32"];
const medalGlows = [
  "rgba(252,211,77,0.25)",
  "rgba(209,213,219,0.15)",
  "rgba(205,127,50,0.2)"
];

const Results = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = localStorage.getItem("username");

  useEffect(() => {
    const fetchResults = () => {
      fetch(`${API_BASE_URL}/api/results/${roomCode}`)
        .then((res) => res.json())
        .then((data) => {
          const sorted = data.sort((a, b) => b.score - a.score);
          setResults(sorted);
          setLoading(false);
        })
        .catch(console.error);
    };

    fetchResults();
    const interval = setInterval(fetchResults, 3000);
    return () => clearInterval(interval);
  }, [roomCode]);

  const myResult = results.find((r) => r.username === currentUser);
  const myRank = myResult ? results.indexOf(myResult) + 1 : null;

  return (
    <div style={{ minHeight: "100vh", padding: "24px 16px", position: "relative" }}>
      <Background />

      {/* Top bar */}
      <header style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 50,
        padding: "14px 28px",
        backdropFilter: "blur(20px)",
        background: "rgba(10, 10, 26, 0.7)",
        borderBottom: "1px solid var(--border-glass)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}>🏆</span>
          <span style={{ fontWeight: 800, fontSize: 18 }}>
            <span className="text-gradient">Final Results</span>
          </span>
        </div>
        <span style={{
          padding: "6px 14px",
          borderRadius: "var(--radius-full)",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid var(--border-glass)",
          fontSize: 13,
          color: "var(--text-secondary)",
          fontWeight: 600,
          letterSpacing: 2
        }}>
          Room: {roomCode}
        </span>
      </header>

      <div style={{
        maxWidth: 640,
        margin: "0 auto",
        paddingTop: 100,
        paddingBottom: 40
      }}>

        {/* Hero banner */}
        <div className="animate-fadeInUp" style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            fontSize: 72,
            marginBottom: 12,
            filter: "drop-shadow(0 0 30px rgba(252,211,77,0.6))",
            animation: "pulse 2s ease-in-out infinite"
          }}>
            🏆
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1 }}>
            <span className="text-gradient">Battle Complete!</span>
          </h1>
          {myRank && (
            <p style={{ color: "var(--text-secondary)", marginTop: 8, fontSize: 16 }}>
              You placed{" "}
              <span style={{ fontWeight: 700, color: "var(--primary-light)" }}>
                #{myRank}
              </span>
              {myRank === 1 ? " 🎉 Champion!" : myRank <= 3 ? " 🌟 Great job!" : " Keep battling!"}
            </p>
          )}
        </div>

        {/* My score card (if logged in and in results) */}
        {myResult && (
          <div className="glass-card animate-bounce-in" style={{
            padding: "20px 28px",
            marginBottom: 24,
            border: "1px solid rgba(124, 58, 237, 0.35)",
            background: "rgba(124, 58, 237, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 32 }}>
                {myRank <= 3 ? medal[myRank - 1] : `#${myRank}`}
              </span>
              <div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.8 }}>Your Result</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>{myResult.username}</p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.8 }}>Score</p>
              <p style={{ fontSize: 32, fontWeight: 900, color: "var(--primary-light)" }}>{myResult.score}</p>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="glass-card" style={{ padding: "8px 0", marginBottom: 24 }}>
          {/* Header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "60px 1fr 80px",
            padding: "12px 24px",
            borderBottom: "1px solid var(--border-glass)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            color: "var(--text-muted)"
          }}>
            <span>Rank</span>
            <span>Player</span>
            <span style={{ textAlign: "right" }}>Score</span>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <div className="spinner" style={{ margin: "0 auto 12px", width: 36, height: 36, borderWidth: 3 }} />
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Waiting for players…</p>
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <span style={{ fontSize: 40 }}>⏳</span>
              <p style={{ color: "var(--text-secondary)", marginTop: 12 }}>No results yet. Be the first!</p>
            </div>
          ) : (
            results.map((r, index) => {
              const isMe = r.username === currentUser;
              const isTop3 = index < 3;
              return (
                <div
                  key={r._id}
                  className="animate-fadeInUp"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px 1fr 80px",
                    padding: "16px 24px",
                    alignItems: "center",
                    borderBottom: index < results.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    background: isMe
                      ? "rgba(124, 58, 237, 0.12)"
                      : isTop3
                      ? `rgba(${medalGlows[index].replace("rgba(", "").replace(")", "")}`
                      : "transparent",
                    transition: "background 0.2s ease",
                    animationDelay: `${index * 0.07}s`,
                    opacity: 0,
                    animation: `fadeInUp 0.4s ${index * 0.07}s ease forwards`
                  }}
                  onMouseEnter={(e) => { if (!isMe) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={(e) => { if (!isMe) e.currentTarget.style.background = isTop3 ? `rgba(${medalGlows[index].replace("rgba(", "").replace(")", "")}` : "transparent"; }}
                >
                  <span style={{
                    fontSize: isTop3 ? 26 : 16,
                    fontWeight: 800,
                    color: isTop3 ? medalColors[index] : "var(--text-muted)"
                  }}>
                    {isTop3 ? medal[index] : `#${index + 1}`}
                  </span>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      fontWeight: isMe ? 700 : 500,
                      fontSize: 15,
                      color: isMe ? "var(--primary-light)" : "var(--text-primary)"
                    }}>
                      {r.username}
                    </span>
                    {isMe && <span className="badge badge-purple" style={{ fontSize: 10 }}>You</span>}
                  </div>

                  <span style={{
                    textAlign: "right",
                    fontWeight: 800,
                    fontSize: 18,
                    color: isTop3 ? medalColors[index] : "var(--text-secondary)"
                  }}>
                    {r.score}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            id="results-back-btn"
            className="btn btn-primary btn-lg"
            onClick={() => navigate("/")}
            style={{ flex: 1, minWidth: 160 }}
          >
            🔙 Play Again
          </button>
          <button
            id="results-share-btn"
            className="btn btn-secondary btn-lg"
            onClick={() => {
              const text = `I just played Quiz Battle! Room: ${roomCode}${myResult ? ` — Scored ${myResult.score} pts!` : ""}`;
              navigator.clipboard.writeText(text);
              alert("Result copied to clipboard!");
            }}
            style={{ flex: 1, minWidth: 160 }}
          >
            📤 Share Result
          </button>
        </div>

        {/* Auto-refresh note */}
        <p style={{
          textAlign: "center",
          marginTop: 20,
          fontSize: 12,
          color: "var(--text-muted)"
        }}>
          🔄 Leaderboard refreshes every 3 seconds
        </p>
      </div>
    </div>
  );
};

export default Results;

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../config";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Background from "./Background";

const Quiz = () => {
  const { roomCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const username = location.state?.username || "Guest";

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/quiz/questions`);
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setQuestions(data);
        } else {
          alert("No questions found or format incorrect.");
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
        alert("Cannot connect to backend server!");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleSelect = (index) => {
    if (!animating) setSelected(index);
  };

  const handleNext = () => {
    if (selected === null) {
      alert("Please select an answer!");
      return;
    }

    const updatedAnswers = [...answers];
    updatedAnswers[current] = selected;
    setAnswers(updatedAnswers);

    if (current + 1 < questions.length) {
      setAnimating(true);
      setTimeout(() => {
        setCurrent(current + 1);
        setSelected(updatedAnswers[current + 1] ?? null);
        setAnimating(false);
      }, 300);
    } else {
      handleFinish(updatedAnswers);
    }
  };

  const handleFinish = async (finalAnswers) => {
    let score = 0;
    questions.forEach((q, i) => {
      const correctIndex =
        typeof q.correctAnswer === "number"
          ? q.correctAnswer
          : q.options.findIndex(
              (opt) =>
                opt.trim().toLowerCase() ===
                q.correctAnswer?.trim().toLowerCase()
            );
      if (finalAnswers[i] === correctIndex) score++;
    });

    try {
      await fetch(`${API_BASE_URL}/api/results/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode, username, userId: username, score }),
      });
      navigate(`/results/${roomCode}`);
    } catch (err) {
      console.error("Error saving result:", err);
      alert("Error saving your result!");
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <Background />
        <div className="spinner" style={{ width: 56, height: 56, borderWidth: 4 }} />
        <p>Loading questions…</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="loading-screen">
        <Background />
        <span style={{ fontSize: 48 }}>😕</span>
        <p>No questions found for this room.</p>
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          Back to Lobby
        </button>
      </div>
    );
  }

  const q = questions[current];
  const progress = ((current) / questions.length) * 100;
  const optionLabels = ["A", "B", "C", "D"];

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
        justifyContent: "space-between",
        gap: 16
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}>🎮</span>
          <span style={{ fontWeight: 800, fontSize: 18 }}>
            <span className="text-gradient">Quiz Battle</span>
          </span>
        </div>

        {/* Progress text */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "6px 16px",
          borderRadius: "var(--radius-full)",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid var(--border-glass)",
          fontSize: 14
        }}>
          <span style={{ color: "var(--text-muted)" }}>Question</span>
          <span style={{ fontWeight: 800, color: "var(--primary-light)" }}>
            {current + 1}
          </span>
          <span style={{ color: "var(--text-muted)" }}>of {questions.length}</span>
        </div>

        <div style={{
          padding: "6px 14px",
          borderRadius: "var(--radius-full)",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid var(--border-glass)",
          fontSize: 13,
          color: "var(--text-secondary)"
        }}>
          👤 {username}
        </div>
      </header>

      {/* Main content */}
      <div style={{
        maxWidth: 680,
        margin: "0 auto",
        paddingTop: 100,
        paddingBottom: 40
      }}>

        {/* Progress bar */}
        <div style={{
          height: 6,
          borderRadius: "var(--radius-full)",
          background: "rgba(255,255,255,0.08)",
          marginBottom: 32,
          overflow: "hidden"
        }}>
          <div style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, var(--primary), var(--secondary))",
            borderRadius: "var(--radius-full)",
            transition: "width 0.5s ease"
          }} />
        </div>

        {/* Question card */}
        <div
          className="glass-card"
          style={{
            padding: "36px",
            marginBottom: 20,
            opacity: animating ? 0 : 1,
            transform: animating ? "translateY(10px)" : "translateY(0)",
            transition: "opacity 0.3s ease, transform 0.3s ease"
          }}
        >
          {/* Question number badge */}
          <div style={{ marginBottom: 20 }}>
            <span className="badge badge-purple">Question {current + 1}</span>
          </div>

          <h2 style={{
            fontSize: 22,
            fontWeight: 700,
            lineHeight: 1.4,
            color: "var(--text-primary)",
            marginBottom: 32
          }}>
            {q.question}
          </h2>

          {/* Options */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {q.options.map((opt, i) => {
              const isSelected = selected === i;
              return (
                <button
                  key={i}
                  id={`option-${i}`}
                  onClick={() => handleSelect(i)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "16px 20px",
                    borderRadius: "var(--radius-md)",
                    border: isSelected
                      ? "2px solid rgba(16,185,129,0.7)"
                      : "1px solid var(--border-glass)",
                    background: isSelected
                      ? "rgba(16, 185, 129, 0.15)"
                      : "rgba(255, 255, 255, 0.04)",
                    color: "var(--text-primary)",
                    fontSize: 15,
                    fontWeight: isSelected ? 600 : 400,
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.22s ease",
                    transform: isSelected ? "scale(1.02)" : "scale(1)",
                    boxShadow: isSelected ? "0 0 20px rgba(16,185,129,0.25)" : "none"
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.09)";
                      e.currentTarget.style.borderColor = "rgba(124,58,237,0.4)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                      e.currentTarget.style.borderColor = "var(--border-glass)";
                    }
                  }}
                >
                  <span style={{
                    minWidth: 32,
                    height: 32,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 800,
                    background: isSelected
                      ? "rgba(16, 185, 129, 0.3)"
                      : "rgba(255,255,255,0.08)",
                    color: isSelected ? "#6ee7b7" : "var(--text-muted)",
                    border: isSelected ? "1px solid rgba(16,185,129,0.5)" : "1px solid var(--border-glass)",
                    transition: "all 0.22s ease"
                  }}>
                    {optionLabels[i]}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Next button */}
        <button
          id="quiz-next-btn"
          className={`btn btn-lg ${selected !== null ? "btn-primary" : "btn-secondary"}`}
          onClick={handleNext}
          style={{ width: "100%", fontSize: 16 }}
        >
          {current + 1 === questions.length ? "Finish Quiz ✅" : "Next Question →"}
        </button>

        {/* Dots progress */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          marginTop: 24,
          flexWrap: "wrap"
        }}>
          {questions.map((_, i) => (
            <div key={i} style={{
              width: i === current ? 24 : 8,
              height: 8,
              borderRadius: "var(--radius-full)",
              background: i < current
                ? "var(--success)"
                : i === current
                ? "var(--primary-light)"
                : "rgba(255,255,255,0.15)",
              transition: "all 0.3s ease"
            }} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Quiz;

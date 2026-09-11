import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";

export default function FeedHistoryView({ onTestNew }) {
  const { token } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);

  const [history, setHistory] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchHistoryData();
    }
  }, [token]);

  const fetchHistoryData = async () => {
    setLoading(true);
    try {
      const [resHist, resTrend] = await Promise.all([
        fetch("/api/feed/history", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/feed/trends", { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const dataHist = await resHist.json();
      const dataTrend = await resTrend.json();

      if (dataHist.success) setHistory(dataHist.samples || []);
      if (dataTrend.success) setTrends(dataTrend.trends || []);
    } catch (e) {
      console.warn("Failed to load feed testing history", e);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeStyle = (cat) => {
    if (cat === "GOOD") return { bg: "#dcfce7", color: "#15803d", label: "🟢 GOOD" };
    if (cat === "MODERATE") return { bg: "#fef9c3", color: "#a16207", label: "🟡 MODERATE" };
    return { bg: "#fee2e2", color: "#b91c1c", label: "🔴 POOR" };
  };

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.3rem", color: "var(--text-dark)", fontWeight: 800, margin: 0 }}>
            📜 Feed & Silage Testing History ({history.length})
          </h2>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            SIH26111 Quality Trend Log & Sample Archive
          </span>
        </div>

        <button className="btn btn-primary" onClick={onTestNew}>
          + Test New Sample
        </button>
      </div>

      {/* Quality Trend Graph Summary */}
      {trends.length > 0 && (
        <div className="panel-box" style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ fontSize: "0.95rem", color: "var(--text-dark)", fontWeight: 800, marginBottom: "0.75rem" }}>
            📈 Feed Quality Trend Scores
          </h4>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end", height: "120px", padding: "0.5rem 0", borderBottom: "1px solid var(--card-border)" }}>
            {trends.slice(-10).map((tItem, idx) => (
              <div key={idx} style={{ flex: 1, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, marginBottom: "0.2rem" }}>
                  {tItem.score}%
                </div>
                <div
                  style={{
                    width: "100%",
                    maxWidth: "28px",
                    height: `${Math.max(15, tItem.score)}%`,
                    background: tItem.category === "GOOD" ? "#16a34a" : tItem.category === "MODERATE" ? "#eab308" : "#ef4444",
                    borderRadius: "4px 4px 0 0"
                  }}
                />
                <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                  {tItem.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Cards List */}
      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading feed sample logs...</p>
      ) : history.length === 0 ? (
        <div className="panel-box" style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ fontSize: "0.95rem", color: "var(--text-dark)", marginBottom: "1rem" }}>
            No feed samples tested yet. Take a photo of your silage or feed to start tracking quality!
          </p>
          <button className="btn btn-primary" onClick={onTestNew}>
            📷 Test Silage / Feed Now
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {history.map((s) => {
            const badge = getBadgeStyle(s.qualityCategory);
            return (
              <div key={s._id} className="panel-box" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.85rem", padding: "1rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                    <span style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-dark)" }}>
                      {s.sampleTag}
                    </span>
                    <span style={{ fontSize: "0.78rem", background: "rgba(59,130,246,0.15)", color: "#2563eb", padding: "0.15rem 0.5rem", borderRadius: "10px", fontWeight: 700 }}>
                      {s.feedType}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                    Tested on: {new Date(s.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Quality Score</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 900, color: badge.color }}>{s.qualityScore}%</div>
                  </div>
                  <span style={{ background: badge.bg, color: badge.color, fontWeight: 800, fontSize: "0.8rem", padding: "0.35rem 0.75rem", borderRadius: "8px" }}>
                    {badge.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";

export default function HistoryChart({ animalId, onBack }) {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/mastitis/history/${animalId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setHistoryData(data.history || []);
        } else {
          setError(data.error || "Failed to load history");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [animalId]);

  return (
    <div className="card">
      <h2 className="card-title">📈 Risk History Log — {animalId}</h2>

      {loading ? (
        <p>Loading history records...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : historyData.length === 0 ? (
        <p>No prior risk records found for {animalId}. Complete analysis to log risk over time.</p>
      ) : (
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
            {historyData.map((item, idx) => {
              const dateStr = new Date(item.timestamp).toLocaleString();
              const level = (item.riskLevel || "low").toLowerCase();
              const badgeSymbol = level === "high" ? "🔴" : level === "medium" ? "🟡" : "🟢";

              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.85rem 1.25rem",
                    borderRadius: "8px",
                    background: "#f8fafc",
                    borderLeft: `4px solid ${level === "high" ? "#dc2626" : level === "medium" ? "#d97706" : "#16a34a"}`
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "700", color: "#1e293b" }}>Day {idx + 1} ({dateStr})</div>
                    <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                      Factors: {item.contributingFactors?.join(", ") || "None"}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span className={`risk-badge ${level}`} style={{ fontSize: "0.9rem", padding: "0.25rem 0.75rem" }}>
                      {badgeSymbol} {item.riskScore}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button className="btn btn-secondary" onClick={onBack}>
        ← Back to Observations
      </button>
    </div>
  );
}

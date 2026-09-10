import React, { useState, useEffect } from "react";

export default function PlatformStatsHeader() {
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalDoctors: 0,
    totalAnimals: 0,
    totalAssessments: 0,
    mlAccuracy: "92.4%"
  });

  useEffect(() => {
    fetch("/api/doctors/stats/overview")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stats) {
          setStats(data.stats);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      {/* Hero Welcome Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(3,105,161,0.08) 0%, rgba(34,197,94,0.08) 100%)",
          border: "1px solid var(--card-border)",
          borderRadius: "14px",
          padding: "1.5rem 1.75rem",
          boxShadow: "var(--box-shadow)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
              <span style={{ background: "rgba(34,197,94,0.2)", color: "#16a34a", padding: "0.2rem 0.6rem", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 800 }}>
                ✓ AI-POWERED BOVINE HEALTHCARE
              </span>
              <span style={{ background: "rgba(59,130,246,0.2)", color: "#2563eb", padding: "0.2rem 0.6rem", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 800 }}>
                🌾 NO LAB EQUIPMENT NEEDED
              </span>
            </div>

            <h1 style={{ fontSize: "1.6rem", color: "var(--text-dark)", margin: 0, fontWeight: 800, letterSpacing: "-0.01em" }}>
              Early Mastitis Risk Forecasting & Local Vet Network
            </h1>

            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "0.4rem", maxWidth: "680px", margin: "0.4rem 0 0 0" }}>
              Empowering farmers to detect subclinical & clinical mastitis risk in cows and buffaloes using 100% non-laboratory visual and physical observations.
            </p>
          </div>

          <div style={{ textAlign: "right", background: "var(--card-bg)", padding: "0.85rem 1.25rem", borderRadius: "10px", border: "1px solid var(--card-border)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>AI MODEL ACCURACY</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--primary)" }}>{stats.mlAccuracy || "92.4%"}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Random Forest & Decision Tree</div>
          </div>
        </div>

        {/* Live Platform Impact Stats Counter */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: "0.85rem",
            marginTop: "1.25rem",
            paddingTop: "1rem",
            borderTop: "1px dashed var(--card-border)"
          }}
        >
          <div style={{ background: "var(--card-bg)", padding: "0.75rem", borderRadius: "10px", border: "1px solid var(--card-border)", textAlign: "center" }}>
            <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--primary)" }}>🧑‍🌾 {stats.totalFarmers}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Registered Farmers</div>
          </div>

          <div style={{ background: "var(--card-bg)", padding: "0.75rem", borderRadius: "10px", border: "1px solid var(--card-border)", textAlign: "center" }}>
            <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "#16a34a" }}>🩺 {stats.totalDoctors}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Verified Vets</div>
          </div>

          <div style={{ background: "var(--card-bg)", padding: "0.75rem", borderRadius: "10px", border: "1px solid var(--card-border)", textAlign: "center" }}>
            <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "#d97706" }}>🐄 {stats.totalAnimals}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Registered Cattle</div>
          </div>

          <div style={{ background: "var(--card-bg)", padding: "0.75rem", borderRadius: "10px", border: "1px solid var(--card-border)", textAlign: "center" }}>
            <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "#9333ea" }}>🔬 {stats.totalAssessments}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>AI Risk Analyses</div>
          </div>
        </div>
      </div>
    </div>
  );
}

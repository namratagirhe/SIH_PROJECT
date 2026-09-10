import React from "react";
import VeterinaryAssistance from "./VeterinaryAssistance";

export default function RiskReport({ result, onReset, onViewHistory, onOpenAuth }) {
  if (!result) return null;

  const { animalId, risk_score, risk_level, contributing_factors, recommendation, disclaimer, model_version } = result;

  const levelClass = (risk_level || "low").toLowerCase();
  const badgeSymbol = levelClass === "high" ? "🔴" : levelClass === "medium" ? "🟡" : "🟢";

  return (
    <div className="card" style={{ borderTop: `6px solid ${levelClass === "high" ? "#dc2626" : levelClass === "medium" ? "#d97706" : "#16a34a"}` }}>
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.5rem", color: "#1e293b", marginBottom: "0.25rem" }}>
          🐄 MASTITIS RISK ANALYSIS
        </h2>
        <span style={{ fontSize: "0.9rem", color: "#64748b" }}>Animal Tag: <strong>{animalId}</strong> | Model Version: v{model_version || "1.0.0"}</span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-around", alignItems: "center", background: "#f8fafc", padding: "1.25rem", borderRadius: "10px", marginBottom: "1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
          <div style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "#64748b", fontWeight: "700" }}>Risk Level</div>
          <div className={`risk-badge ${levelClass}`} style={{ marginTop: "0.25rem" }}>
            {badgeSymbol} {risk_level ? risk_level.toUpperCase() : "LOW"} RISK
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
          <div style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "#64748b", fontWeight: "700" }}>Mastitis Risk Score</div>
          <div style={{ fontSize: "2.2rem", fontWeight: "800", color: levelClass === "high" ? "#b91c1c" : levelClass === "medium" ? "#b45309" : "#15803d" }}>
            {risk_score}%
          </div>
        </div>
      </div>

      {contributing_factors && contributing_factors.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: "700", marginBottom: "0.5rem", color: "#334155" }}>
            Possible Contributing Factors (Explainable AI):
          </h3>
          <ul className="factors-list">
            {contributing_factors.map((factor, idx) => (
              <li key={idx}>
                <span style={{ color: "#16a34a", fontWeight: "700" }}>✓</span> {factor}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "1.25rem", borderRadius: "8px", marginBottom: "1.25rem" }}>
        <h4 style={{ fontSize: "1rem", color: "#166534", fontWeight: "700", marginBottom: "0.35rem" }}>
          Recommendation:
        </h4>
        <p style={{ fontSize: "0.95rem", color: "#15803d", fontWeight: "600" }}>
          {recommendation}
        </p>
      </div>

      <div className="disclaimer-box">
        <strong>⚠️ VETERINARY SAFETY DISCLAIMER:</strong> {disclaimer || "This model estimates risk based on farmer observations and is NOT a medical diagnosis. Consult a qualified veterinarian for diagnosis and treatment plans."}
      </div>

      {/* Recommended Verified Local Veterinarians for High/Medium Risk */}
      {(risk_level === "high" || risk_level === "medium" || risk_score > 35) && (
        <VeterinaryAssistance
          farmerLocation={result.farmerLocation}
          predictionResult={result}
          animalId={animalId}
          observations={result.observations || result.inputData}
          onOpenAuth={onOpenAuth}
        />
      )}

      <div className="btn-row" style={{ marginTop: "1.5rem" }}>
        <button className="btn btn-secondary" onClick={onReset}>
          + New Observation
        </button>
        <button className="btn btn-primary" onClick={onViewHistory}>
          View History for {animalId} →
        </button>
      </div>
    </div>
  );
}

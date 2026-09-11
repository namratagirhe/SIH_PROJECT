import React, { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";

export default function FeedResultCard({ result, onTestNew }) {
  const { lang, t } = useContext(LanguageContext);
  if (!result) return null;

  const sample = result.sample || {};
  const analysis = result.analysis || {};
  const alert = result.alert;

  const category = analysis.category || sample.qualityCategory || "GOOD";
  const score = analysis.quality_score || sample.qualityScore || 85;
  const recommendation = lang === "hi" ? (sample.recommendationHi || analysis.recommendation_hi || analysis.recommendation) : (sample.recommendation || analysis.recommendation);

  const getBadgeStyle = () => {
    if (category === "GOOD") return { bg: "#dcfce7", color: "#15803d", border: "#86efac", icon: "🟢", label: t("good_quality") };
    if (category === "MODERATE") return { bg: "#fef9c3", color: "#a16207", border: "#fde047", icon: "🟡", label: t("moderate_quality") };
    return { bg: "#fee2e2", color: "#b91c1c", border: "#fca5a5", icon: "🔴", label: t("poor_quality") };
  };

  const badge = getBadgeStyle();

  return (
    <div className="card" style={{ maxWidth: "680px", margin: "0 auto", padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1.25rem", color: "var(--text-dark)", fontWeight: 800 }}>
          {t("result_title")}
        </h3>
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          Tag: {sample.sampleTag}
        </span>
      </div>

      {/* Main Quality Category Badge */}
      <div style={{ background: badge.bg, border: `2px solid ${badge.border}`, borderRadius: "12px", padding: "1.25rem", textAlign: "center", marginBottom: "1.25rem" }}>
        <div style={{ fontSize: "2rem", marginBottom: "0.2rem" }}>{badge.icon}</div>
        <h2 style={{ fontSize: "1.6rem", color: badge.color, margin: 0, fontWeight: 900 }}>
          {badge.label}
        </h2>
        <div style={{ marginTop: "0.5rem", fontSize: "1.1rem", fontWeight: 700, color: "var(--text-dark)" }}>
          {t("score_label")}: <span style={{ fontSize: "1.3rem", color: badge.color }}>{score}%</span>
        </div>
      </div>

      {/* Sample Image Preview if uploaded */}
      {sample.sampleImage && (
        <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
          <img
            src={sample.sampleImage}
            alt="Sample Preview"
            style={{ maxHeight: "200px", borderRadius: "10px", border: "1px solid var(--card-border)", objectFit: "cover" }}
          />
        </div>
      )}

      {/* Visual Indicators Checklist */}
      <div className="panel-box" style={{ marginBottom: "1.25rem" }}>
        <h4 style={{ fontSize: "0.95rem", color: "var(--text-dark)", marginBottom: "0.5rem", fontWeight: 800 }}>
          🔍 Visual Screening Breakdown
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.6rem", fontSize: "0.85rem" }}>
          <div><strong>Feed Type:</strong> {sample.feedType}</div>
          <div><strong>Moisture:</strong> {sample.moistureLevel}</div>
          <div><strong>Color:</strong> {sample.colorObs}</div>
          <div><strong>Odor / Smell:</strong> {sample.smellRating}</div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="panel-box" style={{ background: "var(--card-bg)", borderColor: badge.border, marginBottom: "1.25rem" }}>
        <h4 style={{ fontSize: "0.95rem", color: "var(--text-dark)", marginBottom: "0.4rem", fontWeight: 800 }}>
          💡 {t("recommendation_title")}
        </h4>
        <p style={{ fontSize: "0.9rem", color: "var(--text-dark)", lineHeight: 1.5, margin: 0 }}>
          {recommendation}
        </p>
      </div>

      {/* Salesforce Poor Quality Alert Notification Banner */}
      {category === "POOR" && (
        <div style={{ background: "#fef2f2", border: "1px solid #ef4444", borderRadius: "10px", padding: "1rem", marginBottom: "1.25rem" }}>
          <div style={{ fontWeight: 800, color: "#991b1b", fontSize: "0.95rem", marginBottom: "0.3rem" }}>
            🚨 {t("sf_alert_created")}
          </div>
          <div style={{ fontSize: "0.82rem", color: "#7f1d1d" }}>
            Salesforce Record ID: <strong>{alert?.salesforceRecordId || "SF-VETALERT-PENDING"}</strong> | Assigned Officer: <strong>{alert?.assignedVet || "Regional Field Officer"}</strong>
          </div>
        </div>
      )}

      {/* Laboratory Disclaimer */}
      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center", marginBottom: "1.25rem", fontStyle: "italic" }}>
        {t("disclaimer")}
      </p>

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
        <button className="btn btn-primary" style={{ padding: "0.65rem 1.5rem", fontSize: "0.95rem" }} onClick={onTestNew}>
          🔄 Test Another Sample
        </button>
      </div>
    </div>
  );
}

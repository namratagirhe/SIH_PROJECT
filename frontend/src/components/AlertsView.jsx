import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function AlertsView() {
  const { token } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchAlerts();
    }
  }, [token]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/feed/alerts", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAlerts(data.alerts || []);
      }
    } catch (e) {
      console.warn("Failed to load alerts", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.3rem", color: "var(--text-dark)", fontWeight: 800, margin: 0 }}>
          🚨 Feed Quality Alerts & Salesforce CRM Sync ({alerts.length})
        </h2>
        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Automated Field Officer / Vet Dispatch for Poor Quality Feed Samples
        </span>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading alert logs...</p>
      ) : alerts.length === 0 ? (
        <div className="panel-box" style={{ textAlign: "center", padding: "2rem" }}>
          <span style={{ fontSize: "2rem" }}>✅</span>
          <p style={{ fontSize: "0.95rem", color: "var(--text-dark)", marginTop: "0.5rem" }}>
            No poor quality feed alerts recorded. All tested silage and feed samples met quality standards!
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {alerts.map((a) => (
            <div key={a._id} style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "10px", padding: "1.15rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontWeight: 800, fontSize: "1rem", color: "#991b1b" }}>
                  🚨 CRITICAL POOR QUALITY ALERT — {a.sampleId}
                </span>
                <span className="risk-badge high" style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem" }}>
                  {a.status || "PENDING REVIEW"}
                </span>
              </div>

              <div style={{ fontSize: "0.85rem", color: "#7f1d1d", marginBottom: "0.75rem" }}>
                <div><strong>Feed Type:</strong> {a.feedType} | <strong>Score:</strong> {a.qualityScore}%</div>
                <div><strong>Farmer:</strong> {a.farmerName} ({a.farmerPhone})</div>
                <div><strong>Location:</strong> {a.location?.city}, {a.location?.district}, {a.location?.state}</div>
                <div><strong>Assigned Officer:</strong> {a.assignedVet}</div>
              </div>

              <div style={{ background: "#ffffff", padding: "0.5rem 0.75rem", borderRadius: "6px", fontSize: "0.78rem", border: "1px solid #fecaca", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>☁️ <strong>Salesforce CRM Object:</strong> Vet_Alert__c</span>
                <span style={{ color: "#16a34a", fontWeight: 700 }}>
                  Record ID: {a.salesforceRecordId || "SF-VETALERT-SYNCED"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

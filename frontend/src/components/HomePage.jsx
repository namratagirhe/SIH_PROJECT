import React, { useState, useEffect, useContext } from "react";
import PlatformStatsHeader from "./PlatformStatsHeader";
import { AuthContext } from "../context/AuthContext";
import DoctorCard from "./DoctorCard";
import DoctorProfileModal from "./DoctorProfileModal";

export default function HomePage({ onNavigate, onOpenAuth }) {
  const { user } = useContext(AuthContext);
  const [realDoctors, setRealDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    fetch("/api/doctors?verifiedOnly=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRealDoctors(data.doctors || []);
        }
      })
      .catch(() => {});
  }, []);

  const handleStartAnalysis = () => {
    if (!user) {
      onOpenAuth();
    } else {
      onNavigate("analyze");
    }
  };

  const handleFindVet = () => {
    if (!user) {
      onOpenAuth();
    } else {
      onNavigate("find-vet");
    }
  };

  return (
    <div>
      {/* Live Real Platform Stats & Impact Header */}
      <PlatformStatsHeader />

      {/* Main Home Hero Call to Action Panel */}
      <div className="card" style={{ marginBottom: "1.5rem", textAlign: "center", padding: "2rem 1.5rem" }}>
        <h2 style={{ fontSize: "1.6rem", color: "var(--text-dark)", fontWeight: 800, marginBottom: "0.5rem" }}>
          Early Forecasting of Bovine Mastitis
        </h2>
        <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", maxWidth: "680px", margin: "0 auto 1.5rem auto", lineHeight: 1.5 }}>
          Predict mastitis risk in dairy cows and buffaloes early using non-laboratory farmer observations. No expensive sensors, milk analyzers, or lab testing equipment needed.
        </p>

        {!user ? (
          <div style={{ background: "var(--panel-bg)", padding: "1.25rem", borderRadius: "12px", border: "1px solid var(--card-border)", maxWidth: "520px", margin: "0 auto 1.5rem auto" }}>
            <p style={{ fontSize: "0.9rem", color: "var(--text-dark)", fontWeight: 700, marginBottom: "0.75rem" }}>
              🔒 Login or Register to Access AI Features
            </p>
            <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
              Registered farmers can perform AI risk analysis, track animal history, and consult verified local veterinarians.
            </p>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn btn-primary" onClick={onOpenAuth} style={{ padding: "0.6rem 1.25rem", fontSize: "0.9rem" }}>
                🔑 Login / Register Account
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "1.5rem" }}>
            <button className="btn btn-primary" onClick={handleStartAnalysis} style={{ padding: "0.65rem 1.35rem", fontSize: "0.95rem" }}>
              🔬 Start AI Risk Analysis →
            </button>
            <button className="btn btn-secondary" onClick={handleFindVet} style={{ padding: "0.65rem 1.35rem", fontSize: "0.95rem" }}>
              👨‍⚕️ Find Local Veterinarian →
            </button>
          </div>
        )}

        {/* Feature Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", textAlign: "left", marginTop: "1rem" }}>
          <div className="panel-box" style={{ background: "var(--card-bg)" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>🌾</div>
            <h3 style={{ fontSize: "1rem", color: "var(--text-dark)", fontWeight: 700, margin: "0 0 0.3rem 0" }}>
              100% Non-Laboratory Inputs
            </h3>
            <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
              Requires only basic farmer observations: milk yield drop, abnormal milk, clots, udder swelling, heat, redness, and hardness.
            </p>
          </div>

          <div className="panel-box" style={{ background: "var(--card-bg)" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>⚡</div>
            <h3 style={{ fontSize: "1rem", color: "var(--text-dark)", fontWeight: 700, margin: "0 0 0.3rem 0" }}>
              Instant AI Risk Forecasting
            </h3>
            <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
              Machine Learning Random Forest pipeline computes mastitis risk percentage and pinpoints specific contributing symptoms.
            </p>
          </div>

          <div className="panel-box" style={{ background: "var(--card-bg)" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>🩺</div>
            <h3 style={{ fontSize: "1rem", color: "var(--text-dark)", fontWeight: 700, margin: "0 0 0.3rem 0" }}>
              Verified Vet Network & Reviews
            </h3>
            <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
              Connect directly with verified local bovine veterinarians matched by Pincode, City, or District with farmer star reviews.
            </p>
          </div>
        </div>
      </div>

      {/* Real Verified Doctors Database Showcase */}
      {realDoctors.length > 0 && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div>
              <h3 style={{ fontSize: "1.2rem", color: "var(--text-dark)", fontWeight: 800, margin: 0 }}>
                🩺 Real Verified Local Veterinarians ({realDoctors.length})
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0.2rem 0 0 0" }}>
                Registered bovine specialists currently available in the database.
              </p>
            </div>
            <button className="btn btn-secondary" onClick={handleFindVet} style={{ fontSize: "0.85rem", padding: "0.35rem 0.75rem" }}>
              Search All Doctors →
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            {realDoctors.map((doc, idx) => (
              <DoctorCard
                key={doc.id || idx}
                doctor={doc}
                onViewProfile={(d) => setSelectedDoctor(d)}
                onRequestConsultation={() => {
                  if (!user) {
                    onOpenAuth();
                  } else {
                    onNavigate("find-vet");
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}

      {selectedDoctor && (
        <DoctorProfileModal
          doctor={selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
          onRequestConsultation={() => {
            setSelectedDoctor(null);
            if (!user) {
              onOpenAuth();
            } else {
              onNavigate("find-vet");
            }
          }}
          onOpenAuth={onOpenAuth}
        />
      )}
    </div>
  );
}

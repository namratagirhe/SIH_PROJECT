import React from "react";

export default function DoctorCard({ doctor, onViewProfile, onRequestConsultation }) {
  const isVerified = doctor.verificationStatus === "VERIFIED";
  const isDemo = doctor.isDemo;

  return (
    <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "10px", padding: "1.25rem", boxShadow: "var(--box-shadow)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", color: "var(--text-dark)", margin: 0, fontWeight: 700 }}>
              👨‍⚕️ {doctor.name || doctor.clinicName}
            </h3>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{doctor.qualification} ({doctor.experienceYears || 5} yrs exp)</span>

            <div style={{ fontSize: "0.825rem", color: "#d97706", fontWeight: 700, marginTop: "0.2rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <span>⭐ {doctor.averageRating || 5.0} / 5</span>
              <span style={{ color: "var(--text-muted)", fontWeight: 500, fontSize: "0.75rem" }}>({doctor.reviewCount || (doctor.reviews ? doctor.reviews.length : 0)} reviews)</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.2rem" }}>
            {isVerified ? (
              <span className="risk-badge low" style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}>
                ✓ Verified
              </span>
            ) : (
              <span className="risk-badge medium" style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}>
                ⏳ Pending
              </span>
            )}

            {isDemo && (
              <span style={{ background: "var(--panel-bg)", color: "var(--text-muted)", fontSize: "0.65rem", padding: "0.15rem 0.4rem", borderRadius: "4px", fontWeight: 600 }}>
                [DEMO DATA]
              </span>
            )}
          </div>
        </div>

        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.75rem", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
          <div><strong style={{ color: "var(--text-dark)" }}>Specialization:</strong> {doctor.specialization}</div>
          <div><strong style={{ color: "var(--text-dark)" }}>Clinic:</strong> {doctor.clinicName}</div>
          <div><strong style={{ color: "var(--text-dark)" }}>Location:</strong> {doctor.location?.city}, {doctor.location?.district}, {doctor.location?.state} - {doctor.location?.pincode}</div>
          <div><strong style={{ color: "var(--text-dark)" }}>Reg. No:</strong> {doctor.registrationNumber}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
        {doctor.phone && (
          <a
            href={`tel:${doctor.phone}`}
            className="btn btn-secondary"
            style={{ fontSize: "0.8rem", padding: "0.4rem 0.6rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.2rem" }}
          >
            📞 Call Doctor
          </a>
        )}

        <button
          className="btn btn-secondary"
          style={{ fontSize: "0.8rem", padding: "0.4rem 0.6rem" }}
          onClick={() => onViewProfile(doctor)}
        >
          View Profile
        </button>

        <button
          className="btn btn-primary"
          style={{ fontSize: "0.8rem", padding: "0.4rem 0.6rem" }}
          onClick={() => onRequestConsultation(doctor)}
        >
          Request Consultation
        </button>
      </div>
    </div>
  );
}

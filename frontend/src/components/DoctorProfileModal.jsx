import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function DoctorProfileModal({ doctor, onClose, onRequestConsultation, onOpenAuth }) {
  const { user, token } = useContext(AuthContext);
  const [reviews, setReviews] = useState(doctor?.reviews || []);
  const [averageRating, setAverageRating] = useState(doctor?.averageRating || 5.0);
  const [reviewCount, setReviewCount] = useState(doctor?.reviewCount || (doctor?.reviews ? doctor.reviews.length : 0));

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  if (!doctor) return null;

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if (!comment.trim()) {
      setMsg({ success: false, text: "Please enter your review text." });
      return;
    }

    setSubmitting(true);
    setMsg(null);

    try {
      const docId = doctor.id || doctor._id;
      const res = await fetch(`/api/doctors/${docId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating: Number(rating), comment })
      });

      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating);
        setReviewCount(data.reviewCount);
        setComment("");
        setMsg({ success: true, text: "✓ Your rating & review has been published!" });
      } else {
        setMsg({ success: false, text: data.error || "Failed to submit review" });
      }
    } catch (err) {
      setMsg({ success: false, text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <div>
            <h2 style={{ fontSize: "1.35rem", color: "var(--text-dark)", margin: 0 }}>👨‍⚕️ {doctor.name || doctor.clinicName}</h2>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{doctor.qualification} • {doctor.experienceYears || 5} Years Experience</span>

            <div style={{ fontSize: "0.9rem", color: "#d97706", fontWeight: 700, marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span>⭐ {averageRating} / 5</span>
              <span style={{ color: "var(--text-muted)", fontWeight: 500, fontSize: "0.8rem" }}>({reviewCount} Farmer Reviews)</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--text-dark)" }}>×</button>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <span className="risk-badge low" style={{ fontSize: "0.8rem", padding: "0.25rem 0.6rem" }}>
            ✓ Verified Veterinary Professional
          </span>
        </div>

        {/* Doctor Details Box */}
        <div className="panel-box" style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
          <div><strong>Reg. No:</strong> {doctor.registrationNumber}</div>
          <div><strong>Specialization:</strong> {doctor.specialization}</div>
          <div><strong>Clinic / Hospital:</strong> {doctor.clinicName}</div>
          <div><strong>Address:</strong> {doctor.address}</div>
          <div><strong>Location:</strong> {doctor.location?.city}, {doctor.location?.district}, {doctor.location?.state} ({doctor.location?.pincode})</div>
          <div><strong>Working Hours:</strong> {doctor.workingHours} ({doctor.workingDays})</div>
          <div><strong>Emergency Consultation:</strong> {doctor.emergencyConsultation ? "Yes (24/7 Available)" : "Regular Hours Only"}</div>
        </div>

        {/* Farmer Reviews Section */}
        <div style={{ marginBottom: "1.25rem", borderTop: "1px dashed var(--card-border)", paddingTop: "1rem" }}>
          <h3 style={{ fontSize: "1.05rem", color: "var(--text-dark)", fontWeight: 700, marginBottom: "0.75rem" }}>
            ⭐ Farmer Reviews & Ratings ({reviews.length})
          </h3>

          {reviews.length === 0 ? (
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic" }}>
              No reviews published yet for this veterinarian. Be the first farmer to share your feedback!
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1rem" }}>
              {reviews.map((rev, idx) => (
                <div key={idx} className="panel-box" style={{ padding: "0.65rem 0.85rem", background: "var(--card-bg)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-dark)" }}>🧑‍🌾 {rev.farmerName}</span>
                    <span style={{ color: "#d97706", fontWeight: 700, fontSize: "0.8rem" }}>
                      {"⭐".repeat(rev.rating)} ({rev.rating}/5)
                    </span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>"{rev.comment}"</p>
                </div>
              ))}
            </div>
          )}

          {/* Add Review Form */}
          <div className="panel-box" style={{ background: "var(--panel-bg)", padding: "0.85rem", marginTop: "0.85rem" }}>
            <h4 style={{ fontSize: "0.9rem", color: "var(--text-dark)", fontWeight: 700, marginBottom: "0.5rem" }}>
              ✍️ Write a Farmer Review
            </h4>

            {msg && (
              <div style={{ background: msg.success ? "var(--risk-low-bg)" : "var(--risk-high-bg)", color: msg.success ? "var(--risk-low-text)" : "var(--risk-high-text)", padding: "0.5rem", borderRadius: "6px", fontSize: "0.8rem", marginBottom: "0.6rem" }}>
                {msg.text}
              </div>
            )}

            {!user ? (
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Please <button type="button" style={{ background: "none", border: "none", color: "var(--primary)", textDecoration: "underline", cursor: "pointer", fontWeight: 700 }} onClick={() => { onClose(); if (onOpenAuth) onOpenAuth(); }}>Login as Farmer</button> to submit a review for Dr. {doctor.name || doctor.clinicName}.
              </div>
            ) : (
              <form onSubmit={handleAddReview} style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700 }}>Select Rating:</label>
                  <select value={rating} onChange={(e) => setRating(e.target.value)} style={{ padding: "0.25rem 0.5rem", borderRadius: "6px" }}>
                    <option value="5">⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                    <option value="4">⭐⭐⭐⭐ (4 - Very Good)</option>
                    <option value="3">⭐⭐⭐ (3 - Average)</option>
                    <option value="2">⭐⭐ (2 - Poor)</option>
                    <option value="1">⭐ (1 - Very Bad)</option>
                  </select>
                </div>

                <textarea
                  rows="2"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience regarding diagnosis, response time, or advice..."
                  style={{ fontSize: "0.8rem", padding: "0.5rem", borderRadius: "6px" }}
                />

                <button className="btn btn-primary" type="submit" disabled={submitting} style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem", alignSelf: "flex-end" }}>
                  {submitting ? "Publishing..." : "Submit Farmer Review"}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="btn-row" style={{ marginTop: "1rem" }}>
          {doctor.phone && (
            <a href={`tel:${doctor.phone}`} className="btn btn-secondary" style={{ textDecoration: "none", fontSize: "0.85rem" }}>
              📞 Call Doctor
            </a>
          )}
          <button className="btn btn-primary" onClick={() => { onClose(); onRequestConsultation(doctor); }} style={{ fontSize: "0.85rem" }}>
            Request Consultation →
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState, useContext } from "react";
import DoctorCard from "./DoctorCard";
import DoctorProfileModal from "./DoctorProfileModal";
import { AuthContext } from "../context/AuthContext";

export default function VeterinaryAssistance({ farmerLocation, predictionResult, animalId, observations, onOpenAuth }) {
  const { user, token } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null);
  const [reqLoading, setReqLoading] = useState(false);

  const loc = farmerLocation || (user?.profile?.location) || { state: "", district: "", city: "", pincode: "" };

  useEffect(() => {
    fetchDoctors(loc);
  }, [loc.pincode, loc.city, loc.district, loc.state]);

  const fetchDoctors = (locationObj) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (locationObj.pincode) params.append("pincode", locationObj.pincode);
    if (locationObj.city) params.append("city", locationObj.city);
    if (locationObj.district) params.append("district", locationObj.district);
    if (locationObj.state) params.append("state", locationObj.state);
    params.append("verifiedOnly", "true");

    fetch(`/api/doctors?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDoctors(data.doctors || []);
        }
      })
      .catch((err) => console.warn("Failed to fetch local doctors", err))
      .finally(() => setLoading(false));
  };

  const handleRequestConsultation = async (doc) => {
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      return;
    }

    setReqLoading(true);
    setRequestStatus(null);
    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: doc.id || doc._id,
          animalId: animalId || "MY-ANIMAL",
          predictionResult: predictionResult || {},
          observations: observations || {},
          farmerLocation: loc
        })
      });

      const data = await res.json();
      if (data.success) {
        setRequestStatus({ success: true, message: `Consultation request sent to Dr. ${doc.name || doc.clinicName}! The doctor will contact you shortly.` });
      } else {
        setRequestStatus({ success: false, message: data.error || "Failed to send consultation request" });
      }
    } catch (err) {
      setRequestStatus({ success: false, message: err.message });
    } finally {
      setReqLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "2rem", borderTop: "2px dashed #cbd5e1", paddingTop: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <h3 style={{ fontSize: "1.25rem", color: "#0f172a", fontWeight: 800 }}>
            🩺 VETERINARY ASSISTANCE NEAR YOU
          </h3>
          <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
            Based on your location: <strong>{loc.city || "Local"}, {loc.district}, {loc.state} ({loc.pincode})</strong>
          </p>
        </div>

        <button
          className="btn btn-secondary"
          style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem" }}
          onClick={() => fetchDoctors({ state: loc.state, district: loc.district })}
        >
          🌐 Expand Search to District
        </button>
      </div>

      {requestStatus && (
        <div style={{ background: requestStatus.success ? "#dcfce7" : "#fee2e2", color: requestStatus.success ? "#15803d" : "#b91c1c", padding: "0.85rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.9rem", fontWeight: 600 }}>
          {requestStatus.success ? "✓ " : "⚠️ "}{requestStatus.message}
        </div>
      )}

      {loading ? (
        <p style={{ fontSize: "0.9rem", color: "#64748b" }}>Searching for verified local veterinarians...</p>
      ) : doctors.length === 0 ? (
        <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>
          <p style={{ fontSize: "0.95rem", color: "#475569", fontWeight: 600 }}>
            No verified veterinarian found in your immediate area.
          </p>
          <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.25rem" }}>
            Try expanding your search to <strong>{loc.district}</strong> or <strong>{loc.state}</strong> state directory.
          </p>
          <button
            className="btn btn-primary"
            style={{ marginTop: "0.75rem", fontSize: "0.85rem" }}
            onClick={() => fetchDoctors({ state: loc.state })}
          >
            Search State Directory
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: "1rem" }}>
          {doctors.map((doc, idx) => (
            <DoctorCard
              key={doc.id || idx}
              doctor={doc}
              onViewProfile={(d) => setSelectedDoctor(d)}
              onRequestConsultation={handleRequestConsultation}
            />
          ))}
        </div>
      )}

      {selectedDoctor && (
        <DoctorProfileModal
          doctor={selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
          onRequestConsultation={handleRequestConsultation}
        />
      )}
    </div>
  );
}

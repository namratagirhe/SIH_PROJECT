import React, { useState, useEffect, useContext } from "react";
import DoctorCard from "../components/DoctorCard";
import DoctorProfileModal from "../components/DoctorProfileModal";
import { AuthContext } from "../context/AuthContext";

export default function DoctorSearchPage({ onOpenAuth }) {
  const { user, token } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null);

  const [filters, setFilters] = useState({
    state: user?.profile?.location?.state || "",
    district: user?.profile?.location?.district || "",
    city: user?.profile?.location?.city || "",
    pincode: user?.profile?.location?.pincode || "",
    specialization: "",
    verifiedOnly: "false"
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDoctors();
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [filters]);

  const fetchDoctors = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.state) params.append("state", filters.state);
    if (filters.district) params.append("district", filters.district);
    if (filters.city) params.append("city", filters.city);
    if (filters.pincode) params.append("pincode", filters.pincode);
    if (filters.specialization) params.append("specialization", filters.specialization);
    if (filters.verifiedOnly) params.append("verifiedOnly", filters.verifiedOnly);

    fetch(`/api/doctors?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDoctors(data.doctors || []);
        }
      })
      .catch((err) => console.error("Failed to load doctors", err))
      .finally(() => setLoading(false));
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleRequestConsultation = async (doc) => {
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      return;
    }

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
          animalId: user?.profile?.animals?.[0]?.animalTag || "MY-ANIMAL",
          predictionResult: { riskScore: 84, riskLevel: "high", recommendation: "Veterinary examination recommended." },
          farmerLocation: { city: filters.city, district: filters.district, state: filters.state, pincode: filters.pincode }
        })
      });

      const data = await res.json();
      if (data.success) {
        setRequestStatus({ success: true, message: `Consultation request submitted to Dr. ${doc.name || doc.clinicName}!` });
      } else {
        setRequestStatus({ success: false, message: data.error || "Failed to submit request" });
      }
    } catch (err) {
      setRequestStatus({ success: false, message: err.message });
    }
  };

  return (
    <div className="card">
      <div style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "1.35rem", color: "var(--text-dark)", fontWeight: 800 }}>
          👨‍⚕️ Find Verified Local Veterinarians
        </h2>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
          Search for trusted bovine healthcare professionals near your farm location.
        </p>
      </div>

      {requestStatus && (
        <div style={{ background: requestStatus.success ? "var(--risk-low-bg)" : "var(--risk-high-bg)", color: requestStatus.success ? "var(--risk-low-text)" : "var(--risk-high-text)", padding: "0.85rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.9rem", fontWeight: 600 }}>
          {requestStatus.success ? "✓ " : "⚠️ "}{requestStatus.message}
        </div>
      )}

      {/* Filter Form Panel */}
      <div className="panel-box" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.85rem" }}>
          <div className="form-group">
            <label style={{ fontSize: "0.8rem" }}>State</label>
            <input type="text" name="state" value={filters.state} onChange={handleFilterChange} placeholder="e.g. Maharashtra" />
          </div>
          <div className="form-group">
            <label style={{ fontSize: "0.8rem" }}>District</label>
            <input type="text" name="district" value={filters.district} onChange={handleFilterChange} placeholder="e.g. Buldhana" />
          </div>
          <div className="form-group">
            <label style={{ fontSize: "0.8rem" }}>City / Village</label>
            <input type="text" name="city" value={filters.city} onChange={handleFilterChange} placeholder="e.g. Khamgaon" />
          </div>
          <div className="form-group">
            <label style={{ fontSize: "0.8rem" }}>Pincode</label>
            <input type="text" name="pincode" value={filters.pincode} onChange={handleFilterChange} placeholder="e.g. 444303" />
          </div>
          <div className="form-group">
            <label style={{ fontSize: "0.8rem" }}>Specialization</label>
            <input type="text" name="specialization" value={filters.specialization} onChange={handleFilterChange} placeholder="e.g. Mastitis / Surgery" />
          </div>
        </div>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading veterinarians...</p>
      ) : doctors.length === 0 ? (
        <div className="panel-box" style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ fontWeight: 600, color: "var(--text-dark)" }}>No verified veterinarian found matching this filter.</p>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            Try clearing the Pincode or City filter to expand your search across the district.
          </p>
          <button
            className="btn btn-primary"
            style={{ marginTop: "0.75rem", fontSize: "0.85rem" }}
            onClick={() => setFilters({ ...filters, city: "", pincode: "" })}
          >
            Expand Search to District Level
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
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
          onOpenAuth={onOpenAuth}
        />
      )}
    </div>
  );
}

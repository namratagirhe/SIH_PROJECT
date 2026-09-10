import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useContext(AuthContext);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [role, setRole] = useState("FARMER");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    farmName: "",
    country: "India",
    state: "Maharashtra",
    district: "Buldhana",
    city: "Khamgaon",
    pincode: "444303",
    qualification: "B.V.Sc & A.H.",
    registrationNumber: "",
    experienceYears: "5",
    specialization: "Bovine Medicine",
    clinicName: "",
    address: ""
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
          const data = await res.json();
          if (data && data.address) {
            setFormData((prev) => ({
              ...prev,
              state: data.address.state || prev.state,
              district: data.address.county || data.address.state_district || prev.district,
              city: data.address.city || data.address.town || data.address.village || prev.city,
              pincode: data.address.postcode || prev.pincode
            }));
          }
        } catch (e) {
          console.warn("Reverse geocode warning:", e);
        } finally {
          setLocLoading(false);
        }
      },
      (err) => {
        setError("Unable to retrieve device location permission.");
        setLocLoading(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isRegisterMode) {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
      const res = await register({ ...formData, role });
      if (res.success) {
        onClose();
      } else {
        setError(res.error);
      }
    } else {
      const res = await login(formData.email, formData.password);
      if (res.success) {
        onClose();
      } else {
        setError(res.error);
      }
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: "520px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.3rem", color: "var(--text-dark)", margin: 0 }}>
            {isRegisterMode ? `Register as ${role}` : "Login to Account"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--text-dark)" }}>×</button>
        </div>

        {error && (
          <div style={{ background: "var(--risk-high-bg)", color: "var(--risk-high-text)", padding: "0.75rem", borderRadius: "6px", fontSize: "0.85rem", marginBottom: "1rem" }}>
            ⚠️ {error}
          </div>
        )}

        {isRegisterMode && (
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            <button
              type="button"
              className={`btn ${role === "FARMER" ? "btn-primary" : "btn-secondary"}`}
              style={{ flex: 1, fontSize: "0.85rem", padding: "0.4rem" }}
              onClick={() => setRole("FARMER")}
            >
              🧑‍🌾 FARMER
            </button>
            <button
              type="button"
              className={`btn ${role === "DOCTOR" ? "btn-primary" : "btn-secondary"}`}
              style={{ flex: 1, fontSize: "0.85rem", padding: "0.4rem" }}
              onClick={() => setRole("DOCTOR")}
            >
              👨‍⚕️ VETERINARIAN
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {isRegisterMode && (
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. Ramesh Patil" />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="farmer@domain.com" />
          </div>

          {isRegisterMode && (
            <div className="form-group">
              <label>Mobile Number</label>
              <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="+91 98230 XXXXX" />
            </div>
          )}

          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" required value={formData.password} onChange={handleChange} placeholder="••••••••" />
          </div>

          {isRegisterMode && (
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" />
            </div>
          )}

          {isRegisterMode && (
            <div className="panel-box" style={{ padding: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)" }}>Structured Location Info</span>
                <button
                  type="button"
                  style={{ background: "rgba(3,105,161,0.15)", color: "var(--primary)", border: "none", padding: "0.25rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", cursor: "pointer", fontWeight: 600 }}
                  onClick={handleUseCurrentLocation}
                  disabled={locLoading}
                >
                  {locLoading ? "Locating..." : "📍 Use My Current Location"}
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                <div className="form-group">
                  <label style={{ fontSize: "0.75rem" }}>State</label>
                  <input type="text" name="state" required value={formData.state} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: "0.75rem" }}>District</label>
                  <input type="text" name="district" required value={formData.district} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: "0.75rem" }}>City / Village</label>
                  <input type="text" name="city" required value={formData.city} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: "0.75rem" }}>Pincode</label>
                  <input type="text" name="pincode" required value={formData.pincode} onChange={handleChange} />
                </div>
              </div>
            </div>
          )}

          {isRegisterMode && role === "DOCTOR" && (
            <div className="panel-box" style={{ padding: "0.85rem" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--primary)", display: "block", marginBottom: "0.5rem" }}>Veterinary Professional Information</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                <div className="form-group">
                  <label style={{ fontSize: "0.75rem" }}>Qualification</label>
                  <input type="text" name="qualification" required value={formData.qualification} onChange={handleChange} placeholder="B.V.Sc & A.H." />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: "0.75rem" }}>Registration No.</label>
                  <input type="text" name="registrationNumber" required value={formData.registrationNumber} onChange={handleChange} placeholder="MSVC-1234" />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: "0.75rem" }}>Experience (Years)</label>
                  <input type="number" name="experienceYears" required value={formData.experienceYears} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: "0.75rem" }}>Clinic Name</label>
                  <input type="text" name="clinicName" value={formData.clinicName} onChange={handleChange} placeholder="Khamgaon Vet Clinic" />
                </div>
              </div>
            </div>
          )}

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: "0.5rem" }}>
            {loading ? "Processing..." : isRegisterMode ? `Complete ${role} Registration` : "Login"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button
            type="button"
            style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: "0.85rem", textDecoration: "underline" }}
            onClick={() => setIsRegisterMode(!isRegisterMode)}
          >
            {isRegisterMode ? "Already have an account? Login here" : "Don't have an account? Register here"}
          </button>
        </div>
      </div>
    </div>
  );
}

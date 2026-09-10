import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function FarmerDashboard({ onAnalyzeAnimal }) {
  const { user, token } = useContext(AuthContext);
  const [animals, setAnimals] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addError, setAddError] = useState("");

  const [newAnimal, setNewAnimal] = useState({
    animalTag: "",
    species: "Cow",
    age: 4,
    breed: "Holstein-Friesian",
    previousMastitis: "No",
    lactation: 1
  });

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resAnim, resCons] = await Promise.all([
        fetch("/api/animals", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/consultations", { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const dataAnim = await resAnim.json();
      const dataCons = await resCons.json();

      if (dataAnim.success) setAnimals(dataAnim.animals || []);
      if (dataCons.success) setConsultations(dataCons.consultations || []);
    } catch (e) {
      console.warn("Failed to load farmer dashboard data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnimal = async (e) => {
    e.preventDefault();
    setAddError("");
    try {
      const res = await fetch("/api/animals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newAnimal)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowAddModal(false);
        setNewAnimal({
          animalTag: "",
          species: "Cow",
          age: 4,
          breed: "Holstein-Friesian",
          previousMastitis: "No",
          lactation: 1
        });
        fetchData();
      } else {
        setAddError(data.error || data.message || "Failed to save animal. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setAddError("Network error. Please try again.");
    }
  };

  const handleDeleteAnimal = async (id) => {
    try {
      await fetch(`/api/animals/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", color: "var(--text-dark)", fontWeight: 800 }}>
            🧑‍🌾 Farmer Dashboard — {user?.name}
          </h2>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Location: {user?.profile?.location?.city}, {user?.profile?.location?.district}, {user?.profile?.location?.state} ({user?.profile?.location?.pincode})
          </span>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          + Add New Animal
        </button>
      </div>

      <h3 style={{ fontSize: "1.1rem", color: "var(--text-dark)", marginBottom: "0.75rem", fontWeight: 700 }}>
        🐄 Registered Animals ({animals.length})
      </h3>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading your livestock records...</p>
      ) : animals.length === 0 ? (
        <div className="panel-box" style={{ marginBottom: "1.5rem" }}>
          <p style={{ fontSize: "0.9rem", color: "var(--text-dark)" }}>No registered animals yet. Click "+ Add New Animal" to start tracking individual cows or buffaloes.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {animals.map((anim) => (
            <div key={anim._id} style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "10px", padding: "1rem", boxShadow: "var(--box-shadow)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--text-dark)" }}>{anim.animalTag}</span>
                <span style={{ background: anim.species === "Cow" ? "var(--risk-low-bg)" : "rgba(59,130,246,0.2)", color: anim.species === "Cow" ? "var(--risk-low-text)" : "#2563eb", fontSize: "0.75rem", padding: "0.2rem 0.5rem", borderRadius: "12px", fontWeight: 700 }}>
                  {anim.species}
                </span>
              </div>

              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.85rem" }}>
                <div><strong>Breed:</strong> {anim.breed}</div>
                <div><strong>Age:</strong> {anim.age} yrs | <strong>Lactation:</strong> Stage {anim.lactation}</div>
                <div><strong>Past Mastitis:</strong> {anim.previousMastitis}</div>
              </div>

              <div style={{ display: "flex", gap: "0.4rem" }}>
                <button
                  className="btn btn-primary"
                  style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem", flex: 1 }}
                  onClick={() => onAnalyzeAnimal(anim)}
                >
                  🔬 Analyze Risk
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem", color: "#ef4444" }}
                  onClick={() => handleDeleteAnimal(anim._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h3 style={{ fontSize: "1.1rem", color: "var(--text-dark)", marginBottom: "0.75rem", fontWeight: 700 }}>
        📋 Consultation Requests ({consultations.length})
      </h3>

      {consultations.length === 0 ? (
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>No active consultation requests.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {consultations.map((c) => (
            <div key={c._id} className="panel-box" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem" }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-dark)" }}>Animal Tag: {c.animalId}</span>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>
                  (Risk: {c.predictionResult?.riskScore}% - {c.predictionResult?.riskLevel?.toUpperCase()})
                </span>
              </div>
              <span className={`risk-badge ${(c.status || "pending").toLowerCase() === "accepted" ? "low" : (c.status || "pending").toLowerCase() === "rejected" ? "high" : "medium"}`} style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem" }}>
                {c.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Add Animal Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: "450px" }}>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem", color: "var(--text-dark)" }}>+ Add New Animal</h3>
            {addError && (
              <div style={{ background: "#fee2e2", border: "1px solid #f87171", color: "#991b1b", padding: "0.5rem 0.75rem", borderRadius: "6px", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                ⚠️ {addError}
              </div>
            )}
            <form onSubmit={handleAddAnimal} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div className="form-group">
                <label>Animal Tag / ID</label>
                <input type="text" required value={newAnimal.animalTag} onChange={(e) => setNewAnimal({ ...newAnimal, animalTag: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Species</label>
                <select value={newAnimal.species} onChange={(e) => setNewAnimal({ ...newAnimal, species: e.target.value })}>
                  <option value="Cow">Cow</option>
                  <option value="Buffalo">Buffalo</option>
                </select>
              </div>
              <div className="form-group">
                <label>Breed</label>
                <input type="text" value={newAnimal.breed} onChange={(e) => setNewAnimal({ ...newAnimal, breed: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Age (Years)</label>
                <input type="number" value={newAnimal.age} onChange={(e) => setNewAnimal({ ...newAnimal, age: parseInt(e.target.value) || 1 })} />
              </div>
              <div className="form-group">
                <label>Lactation Stage</label>
                <input type="number" value={newAnimal.lactation} onChange={(e) => setNewAnimal({ ...newAnimal, lactation: parseInt(e.target.value) || 1 })} />
              </div>
              <div className="btn-row" style={{ marginTop: "1rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Animal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React from "react";

export default function UdderObservationForm({ formData, updateFormData, onSubmit, onPrev, isLoading }) {
  const handleImageFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateFormData("udder_image", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">3. Udder Observations</h2>
      <div className="form-grid">
        <div className="form-group">
          <label>Udder Swelling?</label>
          <select
            value={formData.udder_swelling ? "Yes" : "No"}
            onChange={(e) => updateFormData("udder_swelling", e.target.value === "Yes")}
          >
            <option value="No">No</option>
            <option value="Yes">Yes (Swollen Quarter)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Udder Heat (Warm to Touch)?</label>
          <select
            value={formData.udder_heat}
            onChange={(e) => updateFormData("udder_heat", e.target.value)}
          >
            <option value="No">No</option>
            <option value="Yes">Yes (Warm / Hot)</option>
            <option value="Don't Know">Don't Know</option>
          </select>
        </div>

        <div className="form-group">
          <label>Udder Pain / Sensitivity?</label>
          <select
            value={formData.udder_pain}
            onChange={(e) => updateFormData("udder_pain", e.target.value)}
          >
            <option value="No">No</option>
            <option value="Yes">Yes (Sensitive to Touch / Milking)</option>
            <option value="Don't Know">Don't Know</option>
          </select>
        </div>

        <div className="form-group">
          <label>Udder Skin Redness?</label>
          <select
            value={formData.udder_redness ? "Yes" : "No"}
            onChange={(e) => updateFormData("udder_redness", e.target.value === "Yes")}
          >
            <option value="No">No</option>
            <option value="Yes">Yes (Reddened Skin)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Udder Hardness / Firmness?</label>
          <select
            value={formData.udder_hardness ? "Yes" : "No"}
            onChange={(e) => updateFormData("udder_hardness", e.target.value === "Yes")}
          >
            <option value="No">No (Soft / Normal)</option>
            <option value="Yes">Yes (Hard / Firm Quarter)</option>
          </select>
        </div>
      </div>

      {/* Udder Visual Image Capture / Upload Section */}
      <div className="panel-box" style={{ marginTop: "1.25rem", padding: "1rem" }}>
        <label style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-dark)", display: "block", marginBottom: "0.35rem" }}>
          📷 Udder Photo (Optional Visual Record)
        </label>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
          Upload or click a photo of the affected udder area to assist consulting veterinarians.
        </p>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
          <label className="btn btn-secondary" style={{ fontSize: "0.825rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            📁 Upload Udder Photo
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageFile} />
          </label>

          <label className="btn btn-secondary" style={{ fontSize: "0.825rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            📸 Click Picture (Camera)
            <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleImageFile} />
          </label>

          {formData.udder_image && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: "0.825rem", color: "#ef4444" }}
              onClick={() => updateFormData("udder_image", null)}
            >
              🗑️ Remove Photo
            </button>
          )}
        </div>

        {formData.udder_image && (
          <div style={{ marginTop: "0.85rem" }}>
            <img
              src={formData.udder_image}
              alt="Udder Observation Preview"
              style={{ maxHeight: "180px", borderRadius: "8px", border: "1px solid var(--card-border)", objectFit: "cover" }}
            />
          </div>
        )}
      </div>

      <div className="btn-row" style={{ marginTop: "1.5rem" }}>
        <button className="btn btn-secondary" onClick={onPrev} disabled={isLoading}>
          ← Back
        </button>
        <button className="btn btn-primary" onClick={onSubmit} disabled={isLoading}>
          {isLoading ? "Analyzing Risk..." : "🐄 ANALYZE MASTITIS RISK"}
        </button>
      </div>
    </div>
  );
}

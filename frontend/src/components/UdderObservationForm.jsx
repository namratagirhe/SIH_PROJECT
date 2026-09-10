import React from "react";

export default function UdderObservationForm({ formData, updateFormData, onSubmit, onPrev, isLoading }) {
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

      <div className="btn-row">
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

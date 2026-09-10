import React from "react";

export default function MilkObservationForm({ formData, updateFormData, onNext, onPrev }) {
  return (
    <div className="card">
      <h2 className="card-title">2. Milk Observations</h2>
      <div className="form-grid">
        <div className="form-group">
          <label>Milk Production Status</label>
          <select
            value={formData.milk_production}
            onChange={(e) => updateFormData("milk_production", e.target.value)}
          >
            <option value="normal">Normal Yield</option>
            <option value="decreased">Decreased / Drop in Yield</option>
          </select>
        </div>

        <div className="form-group">
          <label>Abnormal Milk Appearance?</label>
          <select
            value={formData.abnormal_milk ? "Yes" : "No"}
            onChange={(e) => updateFormData("abnormal_milk", e.target.value === "Yes")}
          >
            <option value="No">No (Normal)</option>
            <option value="Yes">Yes (Abnormal)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Clots / Flakes Observed in Milk?</label>
          <select
            value={formData.clots_flakes ? "Yes" : "No"}
            onChange={(e) => updateFormData("clots_flakes", e.target.value === "Yes")}
          >
            <option value="No">No</option>
            <option value="Yes">Yes (Clots / Flakes Present)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Watery / Thin Milk?</label>
          <select
            value={formData.watery_milk ? "Yes" : "No"}
            onChange={(e) => updateFormData("watery_milk", e.target.value === "Yes")}
          >
            <option value="No">No</option>
            <option value="Yes">Yes (Watery / Serous)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Color Change in Milk?</label>
          <select
            value={formData.color_change ? "Yes" : "No"}
            onChange={(e) => updateFormData("color_change", e.target.value === "Yes")}
          >
            <option value="No">No (White / Normal)</option>
            <option value="Yes">Yes (Yellowish / Reddish / Brownish)</option>
          </select>
        </div>
      </div>

      <div className="btn-row">
        <button className="btn btn-secondary" onClick={onPrev}>
          ← Back
        </button>
        <button className="btn btn-primary" onClick={onNext}>
          Next: Udder Observation →
        </button>
      </div>
    </div>
  );
}

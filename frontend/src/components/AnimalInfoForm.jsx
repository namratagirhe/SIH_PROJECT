import React from "react";

export default function AnimalInfoForm({ formData, updateFormData, onNext }) {
  const breedsList =
    formData.species === "Buffalo"
      ? ["Murrah", "Nili-Ravi", "Jafarabadi", "Bhadawari", "Surti", "Local"]
      : ["Holstein-Friesian", "Jersey", "Gir", "Sahiwal", "Red Sindhi", "Crossbred", "Local"];

  return (
    <div className="card">
      <h2 className="card-title">1. Animal Information</h2>
      <div className="form-grid">
        <div className="form-group">
          <label>Animal Tag / ID</label>
          <input
            type="text"
            value={formData.animal_id}
            onChange={(e) => updateFormData("animal_id", e.target.value)}
            placeholder="e.g. COW-102"
          />
        </div>

        <div className="form-group">
          <label>Species</label>
          <select
            value={formData.species}
            onChange={(e) => updateFormData("species", e.target.value)}
          >
            <option value="Cow">Cow</option>
            <option value="Buffalo">Buffalo</option>
          </select>
        </div>

        <div className="form-group">
          <label>Age (Years)</label>
          <input
            type="number"
            min="1"
            max="20"
            value={formData.age}
            onChange={(e) => updateFormData("age", parseInt(e.target.value) || 1)}
          />
        </div>

        <div className="form-group">
          <label>Breed</label>
          <select
            value={formData.breed}
            onChange={(e) => updateFormData("breed", e.target.value)}
          >
            {breedsList.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Previous Mastitis History?</label>
          <select
            value={formData.previous_mastitis}
            onChange={(e) => updateFormData("previous_mastitis", e.target.value)}
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
            <option value="Don't Know">Don't Know</option>
          </select>
        </div>

        <div className="form-group">
          <label>Lactation Stage / Number</label>
          <input
            type="number"
            min="1"
            max="12"
            value={formData.lactation}
            onChange={(e) => updateFormData("lactation", parseInt(e.target.value) || 1)}
          />
        </div>
      </div>

      <div className="btn-row">
        <div></div>
        <button className="btn btn-primary" onClick={onNext}>
          Next: Milk Observation →
        </button>
      </div>
    </div>
  );
}

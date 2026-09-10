import React, { useState } from "react";
import AnimalInfoForm from "./components/AnimalInfoForm";
import MilkObservationForm from "./components/MilkObservationForm";
import UdderObservationForm from "./components/UdderObservationForm";
import RiskReport from "./components/RiskReport";
import HistoryChart from "./components/HistoryChart";

const initialForm = {
  animal_id: "BOV-102",
  species: "Cow",
  age: 6,
  breed: "Jersey",
  previous_mastitis: "No",
  lactation: 3,
  milk_production: "normal",
  abnormal_milk: false,
  clots_flakes: false,
  watery_milk: false,
  color_change: false,
  udder_swelling: false,
  udder_heat: "No",
  udder_pain: "No",
  udder_redness: false,
  udder_hardness: false
};

export default function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateFormData = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/mastitis/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || "Failed to compute mastitis risk");
      }

      const data = await response.json();
      setResult(data);
      setStep(4); // Show report
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(initialForm);
    setResult(null);
    setStep(1);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🐄 AI Bovine Mastitis Early Warning System</h1>
        <p>
          Non-Laboratory Early Risk Forecasting for Cows & Buffaloes (Farmer Observation Based)
        </p>
      </div>

      <div className="stepper">
        <button className={`step-btn ${step === 1 ? "active" : ""}`} onClick={() => setStep(1)}>
          1. Animal Info
        </button>
        <button className={`step-btn ${step === 2 ? "active" : ""}`} onClick={() => setStep(2)}>
          2. Milk Obs
        </button>
        <button className={`step-btn ${step === 3 ? "active" : ""}`} onClick={() => setStep(3)}>
          3. Udder Obs
        </button>
        <button className={`step-btn ${step === 4 || step === 5 ? "active" : ""}`} disabled={!result} onClick={() => result && setStep(4)}>
          4. AI Risk Report
        </button>
      </div>

      {error && (
        <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}>
          ⚠️ <strong>Error:</strong> {error}
        </div>
      )}

      {step === 1 && (
        <AnimalInfoForm
          formData={formData}
          updateFormData={updateFormData}
          onNext={handleNext}
        />
      )}

      {step === 2 && (
        <MilkObservationForm
          formData={formData}
          updateFormData={updateFormData}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}

      {step === 3 && (
        <UdderObservationForm
          formData={formData}
          updateFormData={updateFormData}
          onSubmit={handleSubmit}
          onPrev={handlePrev}
          isLoading={loading}
        />
      )}

      {step === 4 && result && (
        <RiskReport
          result={result}
          onReset={handleReset}
          onViewHistory={() => setStep(5)}
        />
      )}

      {step === 5 && (
        <HistoryChart
          animalId={formData.animal_id}
          onBack={() => setStep(4)}
        />
      )}
    </div>
  );
}

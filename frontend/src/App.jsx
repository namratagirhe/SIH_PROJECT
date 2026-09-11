import React, { useState, useContext } from "react";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { ThemeProvider, ThemeContext } from "./context/ThemeContext";
import { LanguageProvider, LanguageContext } from "./context/LanguageContext";

import Navbar from "./components/Navbar";
import AuthModal from "./components/AuthModal";

import FeedTester from "./components/FeedTester";
import FeedHistoryView from "./components/FeedHistoryView";
import AlertsView from "./components/AlertsView";

import AnimalInfoForm from "./components/AnimalInfoForm";
import MilkObservationForm from "./components/MilkObservationForm";
import UdderObservationForm from "./components/UdderObservationForm";
import RiskReport from "./components/RiskReport";
import HistoryChart from "./components/HistoryChart";

import DoctorSearchPage from "./pages/DoctorSearchPage";
import FarmerDashboard from "./pages/FarmerDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import PlatformStatsHeader from "./components/PlatformStatsHeader";
import HomePage from "./components/HomePage";

import AIChatWidget from "./components/AIChatWidget";

const initialForm = {
  animal_id: "",
  species: "Cow",
  age: 4,
  breed: "Holstein-Friesian",
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

function MainContent() {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState("home"); // 'home', 'feed-test', 'feed-history', 'feed-alerts', 'analyze', 'find-vet', 'farmer-dash', 'doctor-dash'
  const [authModalOpen, setAuthModalOpen] = useState(false);

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

    const farmerLocation = user?.profile?.location || {
      state: "Maharashtra",
      district: "Buldhana",
      city: "Khamgaon",
      pincode: "444303"
    };

    try {
      const response = await fetch("/api/mastitis/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, farmerLocation })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || "Failed to compute mastitis risk");
      }

      const data = await response.json();
      setResult({ ...data, farmerLocation, observations: formData });
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

  const handleAnalyzeSelectedAnimal = (anim) => {
    setFormData((prev) => ({
      ...prev,
      animal_id: anim.animalTag,
      species: anim.species,
      age: anim.age,
      breed: anim.breed,
      previous_mastitis: anim.previousMastitis,
      lactation: anim.lactation
    }));
    setActiveTab("analyze");
    setStep(1);
  };

  return (
    <div className="container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Floating Bottom-Left Mistral AI Help Widget */}
      <AIChatWidget />

      {/* SIH26111 MAIN TABS */}

      {activeTab === "home" && (
        <HomePage
          onNavigate={(tab) => setActiveTab(tab)}
          onOpenAuth={() => setAuthModalOpen(true)}
        />
      )}

      {activeTab === "feed-test" && (
        !user ? (
          <HomePage
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        ) : (
          <FeedTester />
        )
      )}

      {activeTab === "feed-history" && (
        !user ? (
          <HomePage
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        ) : (
          <FeedHistoryView onTestNew={() => setActiveTab("feed-test")} />
        )
      )}

      {activeTab === "feed-alerts" && (
        !user ? (
          <HomePage
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        ) : (
          <AlertsView />
        )
      )}

      {activeTab === "find-vet" && (
        !user ? (
          <HomePage
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        ) : (
          <DoctorSearchPage onOpenAuth={() => setAuthModalOpen(true)} />
        )
      )}

      {activeTab === "farmer-dash" && (
        <FarmerDashboard onAnalyzeAnimal={handleAnalyzeSelectedAnimal} />
      )}

      {activeTab === "doctor-dash" && (
        <DoctorDashboard />
      )}

      {activeTab === "analyze" && (
        !user ? (
          <HomePage
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        ) : (
          <>
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
              onOpenAuth={() => setAuthModalOpen(true)}
            />
          )}

          {step === 5 && (
            <HistoryChart
              animalId={formData.animal_id}
              onBack={() => setStep(4)}
            />
          )}
          </>
        )
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <MainContent />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

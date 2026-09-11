import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import FeedResultCard from "./FeedResultCard";

export default function FeedTester() {
  const { token } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);

  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const [formData, setFormData] = useState({
    feedType: "Corn Silage",
    moistureLevel: "Optimal (60-70%)",
    smellRating: "Pleasant Fruity / Acidic",
    colorObs: "Olive Green / Golden Yellow",
    moldVisible: false
  });

  const handleImageChange = (e) => {
    setImageError("");
    const file = e.target.files?.[0];
    if (!file) return;

    // Image Validation Check
    if (!file.type.startsWith("image/")) {
      setImageError("Please upload a valid image file (JPG, PNG, WEBP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setImageError("File size is too large. Please select an image smaller than 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setImageError("");

    if (!imagePreview) {
      setImageError("Please upload or take a clear photo of your feed/silage sample for AI visual screening.");
      return;
    }

    setLoading(true);
    setAnalysisResult(null);

    try {
      const res = await fetch("/api/feed/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          sampleImage: imagePreview
        })
      });

      const data = await res.json();
      if (data.success) {
        setAnalysisResult(data);
      } else {
        setImageError(data.error || "Failed to analyze feed sample. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setImageError("Network connection error. Please check backend service.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setAnalysisResult(null);
    setImageError("");
    setFormData({
      feedType: "Corn Silage",
      moistureLevel: "Optimal (60-70%)",
      smellRating: "Pleasant Fruity / Acidic",
      colorObs: "Olive Green / Golden Yellow",
      moldVisible: false
    });
  };

  if (analysisResult) {
    return <FeedResultCard result={analysisResult} onTestNew={handleReset} />;
  }

  return (
    <div className="card" style={{ maxWidth: "650px", margin: "0 auto", padding: "1.5rem" }}>
      <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "1.35rem", color: "var(--text-dark)", fontWeight: 900 }}>
          {t("test_now")}
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0.2rem 0 0 0" }}>
          AI-Powered Visual Screening for Cattle Feed, Forage & Silage Quality
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {/* Upload / Camera Dropzone Box */}
        <div
          style={{
            border: "2px dashed var(--primary)",
            borderRadius: "12px",
            padding: "1.5rem",
            textAlign: "center",
            background: "var(--card-bg)",
            cursor: "pointer",
            position: "relative"
          }}
        >
          {imagePreview ? (
            <div>
              <img
                src={imagePreview}
                alt="Feed Sample Preview"
                style={{ maxHeight: "220px", maxWidth: "100%", borderRadius: "8px", objectFit: "cover", marginBottom: "0.75rem" }}
              />
              <div>
                <button type="button" className="btn btn-secondary" style={{ fontSize: "0.8rem", padding: "0.3rem 0.75rem" }} onClick={() => setImagePreview(null)}>
                  {t("retake")}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📷</div>
              <h3 style={{ fontSize: "1.05rem", color: "var(--text-dark)", fontWeight: 800, marginBottom: "0.3rem" }}>
                {t("take_photo")}
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                Upload or capture a clear photo showing the color, moisture, and texture of your silage or feed sample.
              </p>
              <label className="btn btn-primary" style={{ display: "inline-block", padding: "0.6rem 1.25rem", cursor: "pointer", fontSize: "0.9rem" }}>
                🖼️ Select Photo / Camera
                <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleImageChange} />
              </label>
            </div>
          )}
        </div>

        {/* Validation Error Alert */}
        {imageError && (
          <div style={{ background: "#fee2e2", border: "1px solid #f87171", color: "#991b1b", padding: "0.6rem 0.85rem", borderRadius: "8px", fontSize: "0.85rem" }}>
            ⚠️ {imageError}
          </div>
        )}

        {/* Manual Observation Inputs */}
        <div className="panel-box" style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          <h4 style={{ fontSize: "0.95rem", color: "var(--text-dark)", fontWeight: 800 }}>
            📝 Observation Details (Optional)
          </h4>

          <div className="form-group">
            <label>{t("feed_type")}</label>
            <select value={formData.feedType} onChange={(e) => setFormData({ ...formData, feedType: e.target.value })}>
              <option value="Corn Silage">Corn Silage (मक्का साइलेज)</option>
              <option value="Alfalfa Forage">Alfalfa / Lucerne Forage (रिजका)</option>
              <option value="Mixed Grass Silage">Mixed Grass Silage (मिश्रित घास)</option>
              <option value="Concentrated Feed">Concentrated Cattle Feed (पशु आहार दाना)</option>
              <option value="Crop Residue Straw">Crop Residue Straw / Stover (कड़बी/भूसा)</option>
            </select>
          </div>

          <div className="form-group">
            <label>{t("moisture_level")}</label>
            <select value={formData.moistureLevel} onChange={(e) => setFormData({ ...formData, moistureLevel: e.target.value })}>
              <option value="Optimal (60-70%)">Optimal 60-70% (उपयुक्त नमी)</option>
              <option value="Too Wet / Soggy (>75%)">Too Wet / Soggy &gt;75% (अत्यधिक गीला)</option>
              <option value="Dry (<50%)">Dry &lt;50% (सूखा)</option>
            </select>
          </div>

          <div className="form-group">
            <label>{t("smell_rating")}</label>
            <select value={formData.smellRating} onChange={(e) => setFormData({ ...formData, smellRating: e.target.value })}>
              <option value="Pleasant Fruity / Acidic">Pleasant Fruity / Mild Acidic (सुगंधित/हल्का खट्टा)</option>
              <option value="Sharp Vinegar / Sour">Sharp Vinegar / Sour (तीखा सिरका जैसी गंध)</option>
              <option value="Foul / Putrid / Rancid">Foul / Putrid / Rancid (दुर्गंधित/सड़ा हुआ)</option>
            </select>
          </div>

          <div className="form-group">
            <label>{t("color_obs")}</label>
            <select value={formData.colorObs} onChange={(e) => setFormData({ ...formData, colorObs: e.target.value })}>
              <option value="Olive Green / Golden Yellow">Olive Green / Golden Yellow (हरा/सुनहरा पीला)</option>
              <option value="Pale Yellow / Browning">Pale Yellow / Browning (हल्का पीला/भूरापन)</option>
              <option value="Black / Dark Brown Mold">Black / Dark Brown Mold Spots (काला/गहरा भूरा फफूंद)</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              id="moldCheck"
              checked={formData.moldVisible}
              onChange={(e) => setFormData({ ...formData, moldVisible: e.target.checked })}
              style={{ width: "18px", height: "18px" }}
            />
            <label htmlFor="moldCheck" style={{ fontSize: "0.88rem", cursor: "pointer", color: "var(--text-dark)" }}>
              {t("mold_visible")}
            </label>
          </div>
        </div>

        {/* Big Mobile Touchable Submit Button */}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ padding: "0.85rem", fontSize: "1.05rem", fontWeight: 800, width: "100%" }}
        >
          {loading ? t("analyzing") : `🔬 ${t("save_and_next")}`}
        </button>
      </form>
    </div>
  );
}

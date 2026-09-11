import React, { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { LanguageContext } from "../context/LanguageContext";

export default function Navbar({ activeTab, setActiveTab, onOpenAuth }) {
  const authContext = useContext(AuthContext) || {};
  const user = authContext.user;
  const logout = authContext.logout || (() => {});

  const themeContext = useContext(ThemeContext) || {};
  const theme = themeContext.theme || "light";
  const toggleTheme = themeContext.toggleTheme || (() => {});

  const langContext = useContext(LanguageContext) || {};
  const { lang, changeLanguage, t } = langContext;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);

  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", padding: "0.75rem 1.5rem", marginBottom: "1.5rem", borderRadius: "12px", boxShadow: "var(--box-shadow)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" }} onClick={() => setActiveTab("home")}>
          <img src="/favicon.svg" alt="DairyGuard Logo" style={{ width: "36px", height: "36px", borderRadius: "8px" }} />
          <div>
            <h2 style={{ fontSize: "1.15rem", color: "var(--primary)", margin: 0, fontWeight: 800, letterSpacing: "-0.01em" }}>
              {t("brand_title")}
            </h2>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>
              {t("brand_sub")}
            </span>
          </div>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          style={{ background: "none", border: "1px solid var(--card-border)", borderRadius: "6px", padding: "0.4rem 0.6rem", fontSize: "1.2rem", cursor: "pointer", color: "var(--text-dark)", display: "none" }}
          className="mobile-nav-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>

        {/* Navigation Tabs & Options */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }} className={`nav-links ${mobileMenuOpen ? "open" : ""}`}>
          <button
            className={`btn ${activeTab === "home" ? "btn-primary" : "btn-secondary"}`}
            style={{ fontSize: "0.85rem", padding: "0.45rem 0.85rem" }}
            onClick={() => { setActiveTab("home"); setMobileMenuOpen(false); }}
          >
            {t("home")}
          </button>

          <button
            className={`btn ${activeTab === "feed-test" ? "btn-primary" : "btn-secondary"}`}
            style={{ fontSize: "0.85rem", padding: "0.45rem 0.85rem", fontWeight: 800 }}
            onClick={() => {
              if (!user) {
                onOpenAuth();
              } else {
                setActiveTab("feed-test");
              }
              setMobileMenuOpen(false);
            }}
          >
            {t("test_feed")}
          </button>

          <button
            className={`btn ${activeTab === "feed-history" ? "btn-primary" : "btn-secondary"}`}
            style={{ fontSize: "0.85rem", padding: "0.45rem 0.85rem" }}
            onClick={() => {
              if (!user) {
                onOpenAuth();
              } else {
                setActiveTab("feed-history");
              }
              setMobileMenuOpen(false);
            }}
          >
            {t("history")}
          </button>

          <button
            className={`btn ${activeTab === "feed-alerts" ? "btn-primary" : "btn-secondary"}`}
            style={{ fontSize: "0.85rem", padding: "0.45rem 0.85rem" }}
            onClick={() => {
              if (!user) {
                onOpenAuth();
              } else {
                setActiveTab("feed-alerts");
              }
              setMobileMenuOpen(false);
            }}
          >
            {t("alerts")}
          </button>

          {/* 3-Dots Options Menu Dropdown Container */}
          <div style={{ position: "relative" }} ref={dropdownRef}>
            <button
              className="three-dots-btn"
              title="Profile & Options Menu"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              ⋮
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu">
                {/* User Header Info inside 3-dots */}
                {user ? (
                  <div style={{ borderBottom: "1px solid var(--card-border)", paddingBottom: "0.6rem", marginBottom: "0.4rem" }}>
                    <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text-dark)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>{user.name}</span>
                      <span style={{ fontSize: "0.7rem", background: "rgba(34,197,94,0.15)", color: "#16a34a", padding: "0.15rem 0.5rem", borderRadius: "10px", fontWeight: 700 }}>
                        {user.role}
                      </span>
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", wordBreak: "break-all" }}>
                      {user.email}
                    </span>
                  </div>
                ) : (
                  <div style={{ borderBottom: "1px solid var(--card-border)", paddingBottom: "0.5rem", marginBottom: "0.4rem" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Guest User</span>
                  </div>
                )}

                {/* Choose Language Option inside 3-dots */}
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setShowLangModal(true);
                    setDropdownOpen(false);
                  }}
                  style={{ fontWeight: 700, color: "var(--primary)" }}
                >
                  🌐 {t("choose_language")}
                </button>

                {/* Theme Toggle Button inside 3-dots */}
                <button className="dropdown-item" onClick={toggleTheme}>
                  {theme === "dark" ? "☀️ Switch to Light Mode" : "🌙 Switch to Dark Mode"}
                </button>

                {user && (
                  <button className="dropdown-item" onClick={() => { setActiveTab("farmer-dash"); setDropdownOpen(false); }}>
                    📊 My Dashboard
                  </button>
                )}

                {user ? (
                  <button
                    className="dropdown-item"
                    style={{ color: "#ef4444", fontWeight: 700 }}
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                      setActiveTab("home");
                    }}
                  >
                    🚪 {t("logout")}
                  </button>
                ) : (
                  <button
                    className="dropdown-item"
                    style={{ color: "var(--primary)", fontWeight: 700 }}
                    onClick={() => {
                      onOpenAuth();
                      setDropdownOpen(false);
                    }}
                  >
                    {t("login_btn")}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Language Selection Modal */}
      {showLangModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: "400px", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "1.15rem", color: "var(--text-dark)", margin: 0, fontWeight: 800 }}>
                🌐 Choose Language / भाषा चुनें
              </h3>
              <button onClick={() => setShowLangModal(false)} style={{ background: "none", border: "none", fontSize: "1.4rem", cursor: "pointer", color: "var(--text-dark)" }}>×</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
              <button
                className={`btn ${lang === "en" ? "btn-primary" : "btn-secondary"}`}
                style={{ padding: "0.75rem", fontSize: "1rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                onClick={() => {
                  changeLanguage("en");
                  setShowLangModal(false);
                }}
              >
                🇬🇧 English
              </button>

              <button
                className={`btn ${lang === "hi" ? "btn-primary" : "btn-secondary"}`}
                style={{ padding: "0.75rem", fontSize: "1rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                onClick={() => {
                  changeLanguage("hi");
                  setShowLangModal(false);
                }}
              >
                🇮🇳 हिंदी (Hindi)
              </button>

              <button
                className={`btn ${lang === "mr" ? "btn-primary" : "btn-secondary"}`}
                style={{ padding: "0.75rem", fontSize: "1rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                onClick={() => {
                  changeLanguage("mr");
                  setShowLangModal(false);
                }}
              >
                🚩 मराठी (Marathi)
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

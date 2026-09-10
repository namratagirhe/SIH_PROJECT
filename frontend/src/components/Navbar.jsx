import React, { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

export default function Navbar({ activeTab, setActiveTab, onOpenAuth }) {
  const authContext = useContext(AuthContext) || {};
  const user = authContext.user;
  const logout = authContext.logout || (() => {});

  const themeContext = useContext(ThemeContext) || {};
  const theme = themeContext.theme || "light";
  const toggleTheme = themeContext.toggleTheme || (() => {});

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              DairyGuard AI
            </h2>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>
              Bovine Mastitis & Tele-Vet Network
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

        {/* Navigation Tabs & 3-Dots Menu */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }} className={`nav-links ${mobileMenuOpen ? "open" : ""}`}>
          <button
            className={`btn ${activeTab === "home" ? "btn-primary" : "btn-secondary"}`}
            style={{ fontSize: "0.85rem", padding: "0.45rem 0.85rem" }}
            onClick={() => { setActiveTab("home"); setMobileMenuOpen(false); }}
          >
            🏠 Home
          </button>

          <button
            className={`btn ${activeTab === "analyze" ? "btn-primary" : "btn-secondary"}`}
            style={{ fontSize: "0.85rem", padding: "0.45rem 0.85rem" }}
            onClick={() => {
              if (!user) {
                onOpenAuth();
              } else {
                setActiveTab("analyze");
              }
              setMobileMenuOpen(false);
            }}
          >
            🔬 Risk Analyzer
          </button>

          <button
            className={`btn ${activeTab === "find-vet" ? "btn-primary" : "btn-secondary"}`}
            style={{ fontSize: "0.85rem", padding: "0.45rem 0.85rem" }}
            onClick={() => {
              if (!user) {
                onOpenAuth();
              } else {
                setActiveTab("find-vet");
              }
              setMobileMenuOpen(false);
            }}
          >
            👨‍⚕️ Find Veterinarian
          </button>

          {user && user.role === "FARMER" && (
            <button
              className={`btn ${activeTab === "farmer-dash" ? "btn-primary" : "btn-secondary"}`}
              style={{ fontSize: "0.85rem", padding: "0.45rem 0.85rem" }}
              onClick={() => { setActiveTab("farmer-dash"); setMobileMenuOpen(false); }}
            >
              📊 My Dashboard
            </button>
          )}

          {user && user.role === "DOCTOR" && (
            <button
              className={`btn ${activeTab === "doctor-dash" ? "btn-primary" : "btn-secondary"}`}
              style={{ fontSize: "0.85rem", padding: "0.45rem 0.85rem" }}
              onClick={() => { setActiveTab("doctor-dash"); setMobileMenuOpen(false); }}
            >
              🩺 Doctor Dashboard
            </button>
          )}

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
                      <span style={{ fontSize: "0.7rem", background: user.role === "DOCTOR" ? "rgba(59,130,246,0.15)" : "rgba(34,197,94,0.15)", color: user.role === "DOCTOR" ? "#2563eb" : "#16a34a", padding: "0.15rem 0.5rem", borderRadius: "10px", fontWeight: 700 }}>
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

                {/* Theme Toggle Button inside 3-dots */}
                <button className="dropdown-item" onClick={toggleTheme}>
                  {theme === "dark" ? "☀️ Switch to Light Mode" : "🌙 Switch to Dark Mode"}
                </button>

                {user && user.role === "FARMER" && (
                  <button className="dropdown-item" onClick={() => { setActiveTab("farmer-dash"); setDropdownOpen(false); }}>
                    📊 Farmer Dashboard
                  </button>
                )}

                {user && user.role === "DOCTOR" && (
                  <button className="dropdown-item" onClick={() => { setActiveTab("doctor-dash"); setDropdownOpen(false); }}>
                    🩺 Doctor Dashboard
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
                    🚪 Logout
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
                    🔑 Login / Register
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

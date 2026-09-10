import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext({
  user: null,
  token: null,
  loading: false,
  login: async () => ({ success: false, error: "Auth context missing" }),
  register: async () => ({ success: false, error: "Auth context missing" }),
  logout: () => {}
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("mastitis_token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUser(data.user);
          } else {
            logout();
          }
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("mastitis_token", data.token);
        return { success: true };
      }
      return { success: false, error: data.error || data.message || "Invalid email or password." };
    } catch (err) {
      return { success: false, error: "Unable to connect to login service." };
    }
  };

  const register = async (formData) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("mastitis_token", data.token);
        return { success: true };
      }
      return { success: false, error: data.error || data.message || "Registration failed." };
    } catch (err) {
      return { success: false, error: "Unable to connect to registration service." };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("mastitis_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

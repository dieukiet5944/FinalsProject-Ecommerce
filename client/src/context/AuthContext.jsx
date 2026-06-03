// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const API_BASE_URL = "http://localhost:8080";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Restore user session from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
      }
    }
    setAuthLoading(false);
  }, []);

  // User login (for client-side users only)
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/users/login`, {
        email,
        password,
      });

      const { data } = response.data;
      const normalUser = {
        ...data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        role: "user",
      };

      setUser(normalUser);
      localStorage.setItem("user", JSON.stringify(normalUser));
      return { success: true, user: normalUser };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      if (user?.id) {
        await axios.post(`${API_BASE_URL}/users/${user.id}/logout`, {
          userId: user.id,
        });
      }
    } catch (error) {
      console.error("Logout error:", error.message);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, authLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
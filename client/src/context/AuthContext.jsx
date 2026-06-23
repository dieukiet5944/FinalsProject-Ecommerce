import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const API_BASE_URL = "http://localhost:8080";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);


  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/users/login`, {
        email,
        password,
      });

      const result = response.data?.data;
      const normalUser = {
        ...result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        role: "user",
      }

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
export const  useAuth = () => useContext(AuthContext);
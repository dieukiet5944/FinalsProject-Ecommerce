import { createContext, useState, useContext, useEffect } from "react";
import { loginUserApi, logoutUserApi, loginAdminApi, logoutAdminApi } from '../services/authService.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [admin, setAdmin] = useState(() => {
    const savedAdmin = localStorage.getItem("admin");
    return savedAdmin ? JSON.parse(savedAdmin) : null;
  });

  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    setAuthLoading(false);
  }, []);


  const loginUser = async (email, password) => {
    setLoading(true);
    try {
      const response = await loginUserApi(email, password);
      const result = response?.data?.data || response?.data || response;

      const userData = result.user || result;

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      if (result.accessToken) localStorage.setItem("token", result.accessToken);
      if (result.refreshToken) localStorage.setItem("refreshToken", result.refreshToken);

      return { success: true, user: userData };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogleContext = (result) => {
    setLoading(true);
    try {
      const userData = result.user || result;
      setUser(userData);

      localStorage.setItem("user", JSON.stringify(userData));
      if (result.accessToken) localStorage.setItem("token", result.accessToken);
      if (result.refreshToken) localStorage.setItem("refreshToken", result.refreshToken);

      return { success: true, user: userData };
    } catch (error) {
      console.error("Context Google Login Error:", error);
    } finally {
      setLoading(false);
    }
  };


  const loginAdmin = async (email, password) => {
    setLoading(true);
    try {
      const response = await loginAdminApi(email, password);
      const result = response?.data?.data || response?.data || response;

      const adminData = result.admin || result;

      setAdmin(adminData);
      localStorage.setItem("admin", JSON.stringify(adminData));
      if (result.accessToken) localStorage.setItem("token", result.accessToken);
      if (result.refreshToken) localStorage.setItem("refreshToken", result.refreshToken);

      return { success: true, admin: adminData };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  };


  const logoutUser = async () => {
    const targetId = user?._id || user?.id;
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");

    try {
      if (targetId) await logoutUserApi(targetId);
    } catch (error) {
      console.error("User logout backend error:", error.message);
    } finally {
      window.location.href = "/login";
    }
  };


  const logoutAdmin = async () => {
    const targetId = admin?._id || admin?.id;
    setAdmin(null);
    localStorage.removeItem("admin");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");

    try {
      if (targetId) await logoutAdminApi(targetId);
    } catch (error) {
      console.error("Admin logout backend error:", error.message);
    } finally {
      window.location.href = "/admin-login";
    }
  };

  const updateUserLocal = (newUserData) => {
    try {

      const currentLocalUser = localStorage.getItem("user");

      if (currentLocalUser) {
        const parsedUser = JSON.parse(currentLocalUser);

        const updatedUser = { ...parsedUser, ...newUserData };

        setUser(updatedUser);

        localStorage.setItem("user", JSON.stringify(updatedUser));

      } else {
        setUser(prev => ({ ...prev, ...newUserData }));
      }
    } catch (error) {
      console.error("Error updating local user information:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user, admin,
        loginUser, loginAdmin,
        logoutUser, logoutAdmin,
        loading, authLoading, updateUserLocal, loginWithGoogleContext
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


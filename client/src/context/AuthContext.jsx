// src/context/AuthContext.jsx
import { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const [resCustomer, resAdmin] = await Promise.all([
        fetch("https://69cfba0fa4647a9fc675e215.mockapi.io/users"),
        fetch("https://mindx-mockup-server.vercel.app/api/resources/APT-Project-Ecomerce?apiKey=69bc8f883d77cdfa59f97d31")
      ]);
      
      const users = await resCustomer.json();
      const admins = await resAdmin.json();

      // Kiểm tra Admin
      const foundAdmin = admins.find(u => u.username === username && u.password_display === password);
      if (foundAdmin) {
        const data = { ...foundAdmin, role: 'admin' };
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
        return { success: true, role: 'admin' };
      }

      // Kiểm tra User
      const foundUser = users.find(u => u.username === username && u.password_display === password);
      if (foundUser) {
        const data = { ...foundUser, role: 'customer' };
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
        return { success: true, role: 'customer' };
      }

      throw new Error("Tên đăng nhập hoặc mật khẩu không đúng");
    } catch (error) {
      throw new Error(error.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
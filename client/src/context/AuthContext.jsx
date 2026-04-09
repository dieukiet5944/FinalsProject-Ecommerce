// src/context/AuthContext.jsx
import { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch("https://69cfba0fa4647a9fc675e215.mockapi.io/users");
      const users = await res.json();

      // Tìm user theo email và password_display
      const foundUser = users.find(u =>
        u.email === email && u.password_display === password
      );

      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem("user", JSON.stringify(foundUser));
        return { success: true, user: foundUser };
      } else {
        throw new Error("Email hoặc mật khẩu không đúng");
      }
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

  // Tự động load user khi refresh trang
  // useEffect(() => {
  //   const savedUser = localStorage.getItem("user");
  //   if (savedUser) setUser(JSON.parse(savedUser));
  // }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
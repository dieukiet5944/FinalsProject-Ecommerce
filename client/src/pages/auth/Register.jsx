// src/pages/auth/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login } = useAuth(); // Sau khi register sẽ tự động login
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Kiểm tra mật khẩu khớp nhau
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    // Kiểm tra độ dài mật khẩu
    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);

    try {
      // Tạo user mới để gửi lên MockAPI
      const newUser = {
        username: formData.username,
        full_name: formData.full_name,
        email: formData.email,
        password_display: formData.password,     // MockAPI dùng password_display
        phone: formData.phone || "",
        role: "user",
        status: "online",
        avatar: "default-avatar.jpg",
        created_at: new Date().toISOString(),
        last_active: "Vừa xong",
        order: 0,
        cart: [],
        history_orders: []
      };

      // Gửi lên MockAPI để tạo user mới
      const res = await fetch("https://69cfba0fa4647a9fc675e215.mockapi.io/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!res.ok) throw new Error("Đăng ký thất bại");

      const createdUser = await res.json();

      // Tự động đăng nhập sau khi đăng ký thành công
      alert("Đăng ký thành công! Đang đăng nhập...");

      // Gọi hàm login từ AuthContext
      await login(createdUser.username, createdUser.password_display);

      navigate('/');

    } catch (err) {
      setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 py-12 bg-zinc-950">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white">Đăng ký</h1>
          <p className="mt-2 text-zinc-400">Tạo tài khoản mới để bắt đầu mua sắm</p>
        </div>

        <div className="p-8 shadow-xl bg-zinc-900 rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 text-sm text-red-400 bg-red-500/20 rounded-2xl">
                {error}
              </div>
            )}

            <div>
              <label className="block mb-2 text-sm text-zinc-400">Tên đăng nhập *</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-5 py-4 text-white border bg-zinc-800 border-zinc-700 rounded-2xl focus:outline-none focus:border-emerald-500"
                placeholder="Nhập tên đăng nhập"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-zinc-400">Họ và tên *</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-5 py-4 text-white border bg-zinc-800 border-zinc-700 rounded-2xl focus:outline-none focus:border-emerald-500"
                placeholder="Nhập họ và tên đầy đủ"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-zinc-400">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-5 py-4 text-white border bg-zinc-800 border-zinc-700 rounded-2xl focus:outline-none focus:border-emerald-500"
                placeholder="example@email.com"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-zinc-400">Số điện thoại</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-5 py-4 text-white border bg-zinc-800 border-zinc-700 rounded-2xl focus:outline-none focus:border-emerald-500"
                placeholder="0123456789"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-zinc-400">Mật khẩu *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-5 py-4 text-white border bg-zinc-800 border-zinc-700 rounded-2xl focus:outline-none focus:border-emerald-500"
                  placeholder="Nhập mật khẩu"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute -translate-y-1/2 right-5 top-1/2 text-zinc-400 hover:text-white"
                >
                  {showPassword ? "Ẩn" : "Hiện"}
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm text-zinc-400">Xác nhận mật khẩu *</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-5 py-4 text-white border bg-zinc-800 border-zinc-700 rounded-2xl focus:outline-none focus:border-emerald-500"
                  placeholder="Nhập lại mật khẩu"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute -translate-y-1/2 right-5 top-1/2 text-zinc-400 hover:text-white"
                >
                  {showConfirmPassword ? "Ẩn" : "Hiện"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-4 text-lg font-semibold text-white transition-colors bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 rounded-2xl"
            >
              {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
            </button>
          </form>

          <div className="mt-6 text-center text-zinc-400">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-emerald-500 hover:underline">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
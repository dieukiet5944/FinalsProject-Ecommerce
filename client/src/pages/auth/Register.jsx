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

  const { login } = useAuth();
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

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);

    try {
      const newUser = {
        username: formData.username,
        full_name: formData.full_name,
        email: formData.email,
        password_display: formData.password,
        phone: formData.phone || "",
        role: "customer",
        status: "online",
        avatar: "default-avatar.jpg",
        created_at: new Date().toISOString(),
        last_active: "Vừa xong",
        order: 0,
        cart: [],
        history_orders: []
      };

      const res = await fetch("https://69cfba0fa4647a9fc675e215.mockapi.io/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!res.ok) throw new Error("Đăng ký thất bại");

      const createdUser = await res.json();

      alert("Đăng ký thành công! Đang tự động đăng nhập...");

      // Tự động đăng nhập bằng email + password
      await login(createdUser.email, createdUser.password_display);

      navigate('/');

    } catch (err) {
      console.error(err);
      setError(err.message || "Đăng ký thất bại. Email hoặc username có thể đã tồn tại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side */}
      <div className="hidden lg:flex w-1/2 bg-[#3f0a1c] relative overflow-hidden flex-col justify-center items-center text-white p-12">
        <div className="absolute top-8 left-8">
          <h1 className="text-3xl font-bold tracking-wider">THE CRUMB & BEAN</h1>
        </div>

        <div className="relative z-10 max-w-md text-center">
          <h2 className="mb-6 text-6xl font-bold leading-tight">
            BECOME A<br />MEMBER
          </h2>
          <p className="text-lg text-white/80">
            Join our exclusive club and enjoy special perks, early access, and more.
          </p>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex items-center justify-center flex-1 p-6 bg-white lg:p-12">
        <div className="w-full max-w-md">
          <h2 className="mb-2 text-4xl font-bold text-gray-900">Create Account</h2>
          <p className="mb-8 text-gray-600">Join the Crumb Club today</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-4 text-red-600 bg-red-50 rounded-2xl">{error}</div>}

            <div>
              <label className="block mb-2 text-xs font-semibold text-gray-500">USERNAME</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 text-gray-900 bg-gray-100 border border-gray-200 rounded-2xl focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-xs font-semibold text-gray-500">FULL NAME</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 text-gray-900 bg-gray-100 border border-gray-200 rounded-2xl focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-xs font-semibold text-gray-500">EMAIL ADDRESS</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 text-gray-900 bg-gray-100 border border-gray-200 rounded-2xl focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-xs font-semibold text-gray-500">PHONE NUMBER</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-5 py-4 text-gray-900 bg-gray-100 border border-gray-200 rounded-2xl focus:border-pink-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-xs font-semibold text-gray-500">PASSWORD</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-4 text-gray-900 bg-gray-100 border border-gray-200 rounded-2xl focus:border-pink-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute text-gray-500 -translate-y-1/2 right-5 top-1/2 hover:text-gray-700"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-xs font-semibold text-gray-500">CONFIRM PASSWORD</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-4 text-gray-900 bg-gray-100 border border-gray-200 rounded-2xl focus:border-pink-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute text-gray-500 -translate-y-1/2 right-5 top-1/2 hover:text-gray-700"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-6 text-lg font-semibold text-white bg-pink-600 hover:bg-pink-700 disabled:bg-pink-400 rounded-2xl"
            >
              {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-pink-600 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
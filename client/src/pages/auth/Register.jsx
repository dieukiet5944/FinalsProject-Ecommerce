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
      setError("Passwords do not match!");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
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
        last_active: "Just now",
        order: 0,
        cart: [],
        history_orders: []
      };

      const res = await fetch("https://69cfba0fa4647a9fc675e215.mockapi.io/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!res.ok) throw new Error("Registration failed");

      const createdUser = await res.json();

      alert("Account created successfully! Logging you in...");

      // Auto login after registration
      await login(createdUser.email, createdUser.password_display);

      navigate('/');

    } catch (err) {
      console.error(err);
      setError(err.message || "Registration failed. Email or username may already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[90vh]">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-[#3f0a1c] relative overflow-hidden flex-col justify-center items-center text-white p-8">

        <div className="relative z-10 max-w-md text-center">
          <div className="inline-block px-4 py-1 mb-6 text-sm rounded-full bg-white/10 backdrop-blur-md">
            JOIN OUR COMMUNITY
          </div>

          <h2 className="mb-6 text-6xl font-bold leading-tight">
            BECOME A<br />MEMBER
          </h2>
          <p className="text-lg text-white/80">
            Join The Crumb Club and enjoy exclusive rewards, early access to new menus,
            and special offers crafted just for you.
          </p>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex justify-center flex-1 pt-8 pb-4 px-6 bg-white lg:px-8 lg:pt-10 lg:pb-6">
        <div className="w-full max-w-md">
          <h2 className="mb-2 text-4xl font-bold text-gray-900">Create Account</h2>
          <p className="mb-6 text-gray-600">Join The Crumb & Bean today</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-red-600 bg-red-50 rounded-2xl">
                {error}
              </div>
            )}

            <div>
              <label className="block mb-1 text-xs font-semibold tracking-widest text-gray-500">USERNAME</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-gray-900 bg-gray-100 border border-gray-200 rounded-2xl focus:border-primary-500"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-semibold text-gray-500">FULL NAME</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-gray-900 bg-gray-100 border border-gray-200 rounded-2xl focus:border-primary-500"
                placeholder="Your full name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-500">EMAIL ADDRESS</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-gray-900 bg-gray-100 border border-gray-200 rounded-2xl focus:border-primary-500"
                  placeholder="hello@thecrumbandbean.com"
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-500">PHONE NUMBER</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-gray-900 bg-gray-100 border border-gray-200 rounded-2xl focus:border-primary-500"
                  placeholder="Your phone number"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-500">PASSWORD</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-gray-900 bg-gray-100 border border-gray-200 rounded-2xl focus:border-primary-500"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2 hover:text-gray-700 text-sm"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-500">CONFIRM PASSWORD</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-gray-900 bg-gray-100 border border-gray-200 rounded-2xl focus:border-primary-500"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2 hover:text-gray-700 text-sm"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-4 text-lg font-semibold text-white bg-primary-500 hover:bg-primary-600 disabled:bg-primary-400 rounded-2xl transition-all"
            >
              {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-500 hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
// src/pages/auth/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);   // Bây giờ dùng email + password
      navigate('/');
    } catch (err) {
      setError(err.message || "Email hoặc mật khẩu không đúng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-[#3f0a1c] relative overflow-hidden flex-col justify-center items-center text-white p-12">
        <div className="absolute top-8 left-8">
          <h1 className="text-3xl font-bold tracking-wider">THE CRUMB & BEAN</h1>
        </div>

        <div className="relative z-10 max-w-md text-center">
          <div className="inline-block px-4 py-1 mb-6 text-sm rounded-full bg-white/10 backdrop-blur-md">
            MEMBER EXCLUSIVE
          </div>

          <h2 className="mb-6 text-6xl font-bold leading-tight">
            JOIN THE<br />CRUMB CLUB
          </h2>

          <p className="mb-8 text-lg text-white/80">
            Unlock artisanal rewards, early access to seasonal blends,
            and a complimentary treat on your birthday.
          </p>

          <div className="flex items-center justify-center gap-2 text-sm">
            <span>★</span>
            <span className="tracking-widest">CRAFTED WITH PRECISION</span>
          </div>
        </div>

        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a9c')] bg-cover bg-center opacity-20" />
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center flex-1 p-6 bg-white lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-4xl font-bold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-gray-600">Please enter your credentials to access your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 text-sm text-red-600 border border-red-200 bg-red-50 rounded-2xl">
                {error}
              </div>
            )}

            <div>
              <label className="block mb-2 text-xs font-semibold tracking-widest text-gray-500">EMAIL ADDRESS</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 text-gray-900 bg-gray-100 border border-gray-200 rounded-2xl focus:outline-none focus:border-pink-500"
                placeholder="hello@velvetcrumb.com"
                required
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-xs font-semibold tracking-widest text-gray-500">PASSWORD</label>
                <span className="text-sm text-pink-600 cursor-pointer hover:underline">Forgot?</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 text-gray-900 bg-gray-100 border border-gray-200 rounded-2xl focus:outline-none focus:border-pink-500"
                  placeholder="••••••••"
                  required
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

            <div className="flex items-center">
              <input type="checkbox" className="w-4 h-4 accent-pink-600" />
              <label className="ml-2 text-sm text-gray-600">Keep me signed in</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-lg font-semibold tracking-widest text-white transition-all bg-pink-600 hover:bg-pink-700 disabled:bg-pink-400 rounded-2xl"
            >
              {loading ? "SIGNING IN..." : "SIGN IN →"}
            </button>
          </form>

          <div className="mt-8 text-center space-y-3">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-pink-600 hover:underline">
                Create an account
              </Link>
            </p>

            <p className="text-sm text-gray-400">
              Are you an administrator?{' '}
              <Link to="/admin-login" className="text-gray-500 hover:text-pink-600 transition-colors font-medium">
                Access Admin Console
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
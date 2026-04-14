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
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[90vh]">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-[#3f0a1c] relative overflow-hidden flex-col justify-center items-center text-white p-12">

        <div className="relative z-10 max-w-md text-center">
          <div className="inline-block px-4 py-1 mb-6 text-sm rounded-full bg-white/10 backdrop-blur-md">
            MEMBER EXCLUSIVE
          </div>

          <h2 className="mb-6 text-6xl font-bold leading-tight">
            WELCOME BACK
          </h2>

          <p className="mb-8 text-lg text-white/80">
            Sign in to access your account, track your orders, and enjoy
            exclusive rewards from The Crumb & Bean.
          </p>

          <div className="flex items-center justify-center gap-2 text-sm">
            <span>★</span>
            <span className="tracking-widest">CRAFTED WITH PRECISION</span>
          </div>
        </div>

        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a9c')] bg-cover bg-center opacity-20" />
      </div>

      {/* Right Side - Login Form */}
      <div className="flex items-center justify-center flex-1 p-6 bg-white lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-4xl font-bold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-gray-600">
              Please enter your credentials to access your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 text-sm text-red-600 border border-red-200 bg-red-50 rounded-2xl">
                {error}
              </div>
            )}

            <div>
              <label className="block mb-2 text-xs font-semibold tracking-widest text-gray-500">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 text-gray-900 bg-gray-100 border border-gray-200 rounded-2xl focus:outline-none focus:border-primary-500"
                placeholder="hello@thecrumbandbean.com"
                required
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-xs font-semibold tracking-widest text-gray-500">
                  PASSWORD
                </label>
                <Link to="/forgot-password" className="text-sm text-primary-500 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 text-gray-900 bg-gray-100 border border-gray-200 rounded-2xl focus:outline-none focus:border-primary-500"
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
              <input type="checkbox" className="w-4 h-4 accent-primary-500" />
              <label className="ml-2 text-sm text-gray-600">Keep me signed in</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-lg font-semibold tracking-widest text-white transition-all bg-primary-500 hover:bg-primary-600 disabled:bg-primary-400 rounded-2xl"
            >
              {loading ? "SIGNING IN..." : "SIGN IN"}
            </button>
          </form>

          <div className="mt-8 text-center space-y-3">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary-500 hover:underline">
                Create an account
              </Link>
            </p>

            <p className="text-sm text-gray-400">
              Are you an administrator?{' '}
              <Link to="/admin-login" className="text-gray-500 hover:text-primary-500 transition-colors font-medium">
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
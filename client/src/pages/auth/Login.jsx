// src/pages/auth/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(username, password);
      alert("Đăng nhập thành công!");
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 bg-zinc-950">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white">Đăng nhập</h1>
          <p className="mt-2 text-zinc-400">Chào mừng bạn quay trở lại</p>
        </div>

        <div className="p-8 shadow-xl bg-zinc-900 rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 text-sm text-red-400 bg-red-500/20 rounded-2xl">
                {error}
              </div>
            )}

            <div>
              <label className="block mb-2 text-sm text-zinc-400">Tên đăng nhập</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-5 py-4 text-white border bg-zinc-800 border-zinc-700 rounded-2xl focus:outline-none focus:border-emerald-500"
                placeholder="Nhập tên đăng nhập"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-zinc-400">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-lg font-semibold text-white transition-colors bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 rounded-2xl"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="mt-6 text-center text-zinc-400">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-emerald-500 hover:underline">
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
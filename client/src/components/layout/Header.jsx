// src/components/layout/Header.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Header = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b bg-zinc-950 border-zinc-800">
      <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
        <Link to="/" className="text-3xl font-bold tracking-tight text-white">
          Shop<span className="text-emerald-500">.</span>
        </Link>

        <nav className="flex items-center gap-8 text-sm font-medium">
          <Link to="/" className="transition-colors hover:text-emerald-500">Trang chủ</Link>
          <Link to="/products" className="transition-colors hover:text-emerald-500">Sản phẩm</Link>
          <Link to="/cart" className="flex items-center gap-1 transition-colors hover:text-emerald-500">
            Giỏ hàng
            {cart.length > 0 && (
              <span className="ml-1 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-400">
                Xin chào, {user.username || user.full_name || 'User'}
              </span>
              <button
                onClick={logout}
                className="px-5 py-2 text-sm transition-colors border rounded-lg border-zinc-700 hover:border-red-500 hover:text-red-400"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-5 py-2 text-sm transition-colors border rounded-lg border-zinc-700 hover:border-white"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 text-sm font-medium text-black transition-colors bg-white rounded-lg hover:bg-zinc-200"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
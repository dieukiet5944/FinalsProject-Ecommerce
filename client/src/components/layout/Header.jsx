// src/components/layout/Header.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Header = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();

  return (
    <header className="bg-[#2a0614] border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto">  
        <div className="flex items-center justify-between px-4 lg:px-8 h-20">

          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-3xl font-bold tracking-wider text-white">THE CRUMB</span>
            <span className="font-light text-pink-500">&</span>
            <span className="text-3xl font-bold tracking-wider text-white">BEAN</span>
          </Link>

          <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-white/90">
            <Link to="/" className="hover:text-white transition-colors">HOME</Link>
            <Link to="/products" className="hover:text-white transition-colors">SHOP</Link>
            <Link to="/cart" className="flex items-center gap-1.5 hover:text-white transition-colors">
              CART
              {cart.length > 0 && (
                <span className="ml-1 bg-pink-600 text-white text-xs px-2 py-0.5 rounded-full min-w-4.5 h-4.5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Link>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="hidden text-sm text-white/80 md:block">
                  Hi, {user.full_name?.split(' ')[0] || user.username}
                </span>
                <button
                  onClick={logout}
                  className="px-5 py-2 text-sm border border-white/30 hover:border-white/60 rounded-full transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-6 py-2.5 text-sm border border-white/30 hover:border-white/60 rounded-full transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 text-sm bg-white text-[#2a0614] font-semibold rounded-full hover:bg-white/90 transition-colors"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>

          <button className="md:hidden text-2xl text-white">☰</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
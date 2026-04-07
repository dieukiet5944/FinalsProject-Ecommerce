// src/components/layout/UserLayout.jsx   (hoặc src/layout/UserLayout.jsx)
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const UserLayout = () => {
  return (
    <div className="flex flex-col min-h-screen text-white bg-zinc-950">
      <Header />

      <main className="flex-1">
        <Outlet />          {/* ← Dòng này cực kỳ quan trọng */}
      </main>

      <Footer />
    </div>
  );
};

export default UserLayout;
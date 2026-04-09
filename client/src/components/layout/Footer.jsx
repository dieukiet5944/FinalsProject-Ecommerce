// src/components/layout/Footer.jsx
const Footer = () => {
  return (
    <footer className="bg-[#2a0614] border-t border-white/10 py-12">
      <div className="px-6 mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div>
            <h2 className="mb-2 text-2xl font-bold tracking-wider text-white">
              THE CRUMB & BEAN
            </h2>
            <p className="text-sm text-white/60">
              Artisanal coffee & pastry club since 2024
            </p>
          </div>

          <div className="flex gap-8 text-sm text-white/70">
            <a href="#" className="transition-colors hover:text-white">Shop</a>
            <a href="#" className="transition-colors hover:text-white">Membership</a>
            <a href="#" className="transition-colors hover:text-white">About Us</a>
            <a href="#" className="transition-colors hover:text-white">Contact</a>
          </div>

          <div className="text-xs text-center text-white/50 md:text-right">
            © 2026 THE CRUMB & BEAN<br />
            Crafted with precision
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
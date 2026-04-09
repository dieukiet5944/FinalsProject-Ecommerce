import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-dark-bg text-dark-text">
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative flex items-center h-screen hero-bg">
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 max-w-5xl px-6 mx-auto text-center">
          <p className="text-warm-400 tracking-[6px] text-sm mb-4 font-medium">
            EST. 2024
          </p>

          <h1 className="text-7xl md:text-[92px] leading-none font-bold mb-6 tracking-tight">
            Artisanal<br />Perfection
          </h1>

          <p className="max-w-2xl mx-auto mb-12 text-xl text-dark-text-secondary">
            Experience the harmonious blend of specialty roasts and delicate
            pâtisserie crafted with meticulous precision.
          </p>

          <div className="flex flex-col justify-center gap-5 sm:flex-row">
            <Link
              to="/products"
              className="px-10 py-4 text-lg font-semibold text-white transition-all duration-300 shadow-lg bg-primary-500 hover:bg-primary-600 rounded-2xl shadow-primary-500/30"
            >
              EXPLORE MENU
            </Link>

            <Link
              to="/story"
              className="px-10 py-4 text-lg font-semibold text-white transition-all duration-300 border-2 border-white/70 hover:border-white rounded-2xl"
            >
              OUR STORY
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute flex flex-col items-center -translate-x-1/2 bottom-10 left-1/2">
          <p className="mb-3 text-xs tracking-widest text-dark-text-secondary">SCROLL</p>
          <div className="flex items-start justify-center w-6 h-10 p-1 border-2 rounded-full border-white/60 scroll-indicator">
            <div className="w-1 h-2 bg-white rounded-full" />
          </div>
        </div>
      </section>

      {/* ==================== THE ART OF THE BREW ==================== */}
      <section className="py-24 bg-dark-surface">
        <div className="grid items-center gap-16 px-6 mx-auto max-w-7xl md:grid-cols-2">
          {/* Text side */}
          <div className="space-y-8">
            <div className="w-16 h-1 bg-primary-500" />

            <h2 className="text-5xl font-semibold leading-tight md:text-6xl">
              The Art of the Brew
            </h2>

            <p className="text-lg leading-relaxed text-dark-text-secondary">
              Every cup at The Crumb & Bean begins with ethically sourced beans,
              roasted in small batches to preserve their unique terroir and character.
            </p>

            <Link
              to="/process"
              className="inline-flex items-center gap-3 text-lg font-medium text-primary-500 hover:text-primary-600 group"
            >
              LEARN ABOUT OUR PROCESS
              <span className="transition-transform group-hover:translate-x-2">→</span>
            </Link>
          </div>

          {/* Image side */}
          <div className="overflow-hidden border shadow-2xl rounded-3xl border-white/10">
            <img
              src="https://picsum.photos/id/1016/800/600"
              alt="Barista brewing coffee"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* Bạn có thể thêm các section khác sau: Featured Products, Categories... */}
    </div>
  );
};

export default Home;
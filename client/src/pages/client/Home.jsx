// src/pages/client/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-light-bg text-light-text">
      {/* Hero Section */}
      <section className="relative flex items-center h-screen hero-bg-white">
        <div className="absolute inset-0 bg-black/45" />

        <div className="relative z-10 max-w-5xl px-6 mx-auto text-center">
          <p className="text-warm-400 tracking-[6px] text-sm mb-4 font-medium">
            EST. 2024
          </p>

          <h1 className="text-7xl md:text-[92px] leading-none font-bold mb-6 tracking-tight text-white">
            Artisanal<br />Perfection
          </h1>

          <p className="max-w-2xl mx-auto mb-12 text-xl text-white/90">
            Experience the harmonious blend of specialty roasts and delicate
            pâtisserie crafted with meticulous precision.
          </p>

          <div className="flex justify-center">
            <Link
              to="/products"
              className="px-12 py-4 text-lg font-semibold text-white bg-primary-500 hover:bg-primary-600 
                         rounded-2xl shadow-lg shadow-primary-500/30 transition-all"
            >
              EXPLORE MENU
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <p className="mb-3 text-xs tracking-widest text-white/80">SCROLL</p>
          <div className="flex items-start justify-center w-6 h-10 p-1 border-2 border-white/70 rounded-full scroll-indicator">
            <div className="w-1 h-2 bg-white rounded-full" />
          </div>
        </div>
      </section>

      {/* The Art of the Brew Section */}
      <section className="py-24 bg-light-surface">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="h-1 w-16 bg-primary-500" />

            <h2 className="text-5xl md:text-6xl font-semibold leading-tight">
              The Art of the Brew
            </h2>

            <p className="text-lg text-light-text-secondary leading-relaxed">
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

          <div className="overflow-hidden rounded-3xl shadow-xl">
            <img
              src="https://picsum.photos/id/1016/800/600"
              alt="Barista brewing coffee"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
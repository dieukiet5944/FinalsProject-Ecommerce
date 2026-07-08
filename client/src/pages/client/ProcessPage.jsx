import React from 'react';
import { Link } from 'react-router-dom';

const ProcessPage = () => {
  const steps = [
    {
      id: "01",
      title: "Sourcing Excellence",
      subtitle: "Ingredient selection",
      description: "We partner with local and international farms to source top-quality specialty coffee beans, premium tea leaves, and the purest flour, butter, and dairy products. There is no room for compromise on quality.",
      image: "https://picsum.photos/id/490/600/450" 
    },
    {
      id: "02",
      title: "The Craft of Baking & Brewing",
      subtitle: "Handicrafts",
      description: "Every morning, before you even wake up, our ovens are already blazing, churning out batches of crisp croissants and tarts. Behind the bar, our baristas meticulously adjust every second of extraction and water temperature to ensure every drink, from coffee and fruit teas to smoothies, achieves a perfectly balanced flavor.",
      image: "https://picsum.photos/id/1060/600/450" 
    },
    {
      id: "03",
      title: "Mindful Serving",
      subtitle: "The complete experience",
      description: "A delicious drink and a perfect pastry are only truly complete when served with care. At The Crumb & Bean, we pay attention to everything from the ambiance and the platter to the welcoming smile we give you.",
      image: "https://picsum.photos/id/312/600/450" 
    }
  ];

  return (
    <div className="bg-neutral-50 min-h-screen text-neutral-800">
      <section className="relative bg-neutral-900 text-white py-24 px-6 text-center">
        <div className="absolute inset-0 opacity-40 bg-[url('https://picsum.photos/id/225/1920/600')] bg-cover bg-center" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="text-primary-400 tracking-[4px] text-xs font-semibold uppercase mb-3">Behind The Scenes</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">The Process of Creating Flavor</h1>
          <p className="text-neutral-300 text-lg font-light">
            Discover the meticulous journey from raw ingredients to refined culinary experiences at The Crumb & Bean. 
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20 flex flex-col gap-24">
        {steps.map((step, index) => (
          <div 
            key={step.id} 
            className={`flex flex-col md:flex-row items-center gap-12 ${
              index % 2 === 1 ? 'md:flex-row-reverse' : ''
            }`}
          >
            <div className="flex-1 w-full">
              <div className="   group overflow-hidden rounded-3xl shadow-md">
                <img 
                  src={step.image} 
                  alt={step.title} 
                  className="w-full h-87.5 object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-primary-500">
                {step.subtitle}
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
                {step.title}
              </h2>
              <p className="text-neutral-600 leading-relaxed font-light text-base md:text-lg">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </section>    

      <section className="bg-neutral-100 py-16 px-6 text-center">
        <div className="max-w-xl mx-auto space-y-6">
          <h3 className="text-2xl font-bold">Are you ready to enjoy it?</h3>
          <p className="text-neutral-600 font-light">Let us accompany you throughout your day with refreshing drinks and delicious pastries.</p>
          <div>
            <Link   
              to="/products" 
              className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3 rounded-xl shadow-md shadow-primary-500/20 transition-all"
            >
                EXPLORE THE MENU NOW
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProcessPage;

import React, { useState } from 'react';

const FAQ: React.FC = () => {
  const faqs = [
    {
      q: "Are C.I SKIN CARE products safe for sensitive skin?",
      a: "All our formulations undergo rigorous dermatological testing under clinical supervision. We exclusively use bio-compatible ingredients that respect the skin's natural barrier. For extremely reactive skin, we recommend performing a patch test on the inner forearm 24 hours before full facial application."
    },
    {
      q: "What is the typical shelf life of the botanical serums?",
      a: "Our serums have a shelf life of 24 months unopened. Once opened, we recommend using them within 6-9 months to ensure the bio-actives remain at peak potency. Keep in a cool, dark place for optimal stability."
    },
    {
      q: "Do you use synthetic fragrances in your rituals?",
      a: "No. Our scents are derived naturally from botanical extracts and essential oils. We avoid all synthetic perfumes, parabens, and sulfates to ensure your skin receives only the purest care."
    },
    {
      q: "How do I verify the authenticity of my product?",
      a: "Every C.I Skin Care product comes with a unique authentication seal on the outer box. You can verify this code through our mobile app or website to ensure you are receiving a genuine formulation."
    },
    {
      q: "Are the packaging materials recyclable?",
      a: "Yes. Sustainability is a pillar of our brand. Our glass bottles are 100% recyclable, and our outer packaging is made from FSC-certified paper with soy-based inks. We also offer a refill program for select products."
    }
  ];

  return (
    <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
      <header className="text-center mb-20">
        <span className="text-xs uppercase tracking-[0.5em] text-primary mb-4 block font-bold">Concierge Support</span>
        <h1 className="font-display text-5xl md:text-6xl text-secondary dark:text-white mb-6">Frequently Asked Questions</h1>
        <p className="text-lg font-light opacity-60 leading-relaxed">
          Discover everything you need to know about our luxury skincare rituals, premium sourcing, and concierge delivery services.
        </p>
      </header>

      <div className="space-y-4 mb-24">
        {faqs.map((faq, idx) => (
          <details key={idx} className="group border-b border-primary/10 py-8" open={idx === 0}>
            <summary className="flex justify-between items-center cursor-pointer list-none">
              <span className="font-display text-xl md:text-2xl text-secondary dark:text-primary group-hover:text-primary transition-colors">
                {faq.q}
              </span>
              <span className="material-icons-outlined text-primary text-3xl group-open:rotate-45 transition-transform duration-300">add</span>
            </summary>
            <div className="mt-6 pr-12 text-lg font-light leading-relaxed opacity-60">
              {faq.a}
            </div>
          </details>
        ))}
      </div>

      <div className="bg-primary/5 rounded-3xl p-12 text-center border border-primary/10">
        <h3 className="font-display text-3xl mb-4">Still have questions?</h3>
        <p className="text-sm opacity-60 mb-10 max-w-md mx-auto leading-relaxed">
          Our skincare specialists are available for personalized consultations and support Monday through Friday.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="gold-gradient text-white px-10 py-4 rounded-lg font-bold uppercase tracking-widest text-xs shadow-xl">
            Send an Inquiry
          </button>
          <button className="border border-primary/30 px-10 py-4 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-primary/5 transition-all">
            Live Chat
          </button>
        </div>
      </div>
    </main>
  );
};

export default FAQ;

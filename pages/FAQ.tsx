import React from 'react';
import { useFAQs } from '../context/FAQContext';

const FAQ: React.FC = () => {
  const { faqs, loading } = useFAQs();
  const publicFaqs = faqs.filter(f => f.status === 'Public');

  if (loading) return <div className="min-h-screen pt-40 text-center opacity-30 uppercase tracking-[0.2em]">Consulting Archives...</div>;


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
        {publicFaqs.length > 0 ? publicFaqs.map((faq, idx) => (
          <details key={faq.id} className="group border-b border-primary/10 py-8" open={idx === 0}>
            <summary className="flex justify-between items-center cursor-pointer list-none">
              <span className="font-display text-xl md:text-2xl text-secondary dark:text-primary group-hover:text-primary transition-colors">
                {faq.question}
              </span>
              <span className="material-icons-outlined text-primary text-3xl group-open:rotate-45 transition-transform duration-300">add</span>
            </summary>
            <div className="mt-6 pr-12 text-lg font-light leading-relaxed opacity-60">
              {faq.answer}
            </div>
          </details>
        )) : (
          <div className="py-20 text-center opacity-30 italic"> No FAQs available at the moment. </div>
        )}
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

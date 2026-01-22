
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const RITUALS = [
    {
        title: "The 5D Gluta Luminescence Ritual",
        collection: "5D Gluta Miracle",
        image: "/products/5d-gluta-diamond-box.jpg",
        steps: [
            { name: "Double Cleanse", desc: "Start with the SPA Exfoliating Gel to remove impurities and prep the canvas." },
            { name: "The Miracle Base", desc: "Apply 3-4 drops of the 5D Gluta Serum to damp skin, pressing gently into the face." },
            { name: "Seal the Glow", desc: "Layer with the 5D Gluta Moisturizer to lock in active whitening agents and hydration." }
        ]
    },
    {
        title: "The Bel Eclat Golden Hour",
        collection: "BEL ECLAT Tumeric",
        image: "/products/bel-eclat-hero.jpg",
        steps: [
            { name: "Prep & Calm", desc: "Use the Tumeric Cleanser to soothe inflammation and even skin tone." },
            { name: "Hydrate & Tint", desc: "Apply the Tumeric Face Cream for a natural, sun-kissed radiance." },
            { name: "Protect", desc: "Finish with the Bel Eclat Body Lotion for full-body luminescence." }
        ]
    }
];

const RitualGuide: React.FC = () => {
    return (
        <main className="min-h-screen pt-32 pb-24 bg-background-light dark:bg-background-dark px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <h1 className="font-display text-4xl md:text-6xl text-secondary dark:text-primary mb-6 italic uppercase tracking-widest">
                        The Art of the Ritual
                    </h1>
                    <div className="w-24 h-1 bg-gold mx-auto mb-8" />
                    <p className="max-w-2xl mx-auto text-stone-500 font-light leading-relaxed uppercase tracking-[0.2em] text-xs">
                        Discover the precise sequences engineered to reveal your most radiant self. Every application is an act of transformation.
                    </p>
                </div>

                <div className="space-y-32">
                    {RITUALS.map((ritual, idx) => (
                        <section key={idx} className={`flex flex-col lg:flex-row gap-16 items-center ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                            <div className="lg:w-1/2">
                                <div className="relative group overflow-hidden rounded-3xl">
                                    <img
                                        src={ritual.image}
                                        alt={ritual.title}
                                        className="w-full h-full object-cover aspect-[4/5] transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-luxury-brown/20 group-hover:bg-luxury-brown/10 transition-colors" />
                                </div>
                            </div>

                            <div className="lg:w-1/2">
                                <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">
                                    {ritual.collection}
                                </span>
                                <h2 className="font-display text-3xl md:text-4xl mb-12 text-secondary dark:text-white leading-tight">
                                    {ritual.title}
                                </h2>

                                <div className="space-y-10 relative">
                                    <div className="absolute left-4 top-0 bottom-0 w-px bg-primary/10" />

                                    {ritual.steps.map((step, sIdx) => (
                                        <motion.div
                                            key={sIdx}
                                            initial={{ opacity: 0, x: 20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: sIdx * 0.2 }}
                                            className="relative pl-12"
                                        >
                                            <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-luxury-brown flex items-center justify-center text-[10px] font-bold text-gold border border-gold/20 shadow-xl">
                                                {sIdx + 1}
                                            </div>
                                            <h4 className="font-display text-lg mb-2 text-primary">{step.name}</h4>
                                            <p className="text-sm text-stone-500 dark:text-stone-400 font-light leading-relaxed">
                                                {step.desc}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="mt-16">
                                    <Link
                                        to={`/shop?brand=${ritual.collection}`}
                                        className="inline-block bg-luxury-brown text-gold px-10 py-5 rounded font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-gold hover:text-white transition-all shadow-2xl border border-gold/20"
                                    >
                                        Shop the Full Ritual
                                    </Link>
                                </div>
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </main>
    );
};

export default RitualGuide;


import React from 'react';
import { motion } from 'framer-motion';

const FEED_ITEMS = [
    { id: 1, img: "/products/bel-eclat-hero.jpg", owner: "@sophia.beauty", tag: "Radiance Ritual" },
    { id: 2, img: "/products/5d-gluta-diamond-box.jpg", owner: "@marcus_luxe", tag: "Daily Discipline" },
    { id: 3, img: "/products/spa-gels.jpg", owner: "@elena_ritual", tag: "Evening Glow" },
    { id: 4, img: "/products/gluta-master-set.jpg", owner: "@skin_philosopher", tag: "Miracle Base" },
    { id: 5, img: "/products/bel-eclat-tumericSet.jpg", owner: "@the_glow_edit", tag: "Nature X Science" },
    { id: 6, img: "/products/shelf-display.jpg", owner: "@clara_ci", tag: "Ritual Corner" },
];

const UserGallery: React.FC = () => {
    return (
        <section className="py-32 bg-background-light dark:bg-background-dark border-y border-primary/5">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div className="max-w-xl text-left">
                        <h2 className="font-display text-4xl md:text-5xl text-secondary dark:text-white mb-6 uppercase tracking-widest leading-tight">
                            Community <br /> <span className="gold-gradient italic">Luminescence</span>
                        </h2>
                        <p className="text-stone-500 font-light uppercase tracking-[0.2em] text-[10px] leading-relaxed">
                            Explore how the global C.I collective masters the art of the skin ritual. Share your journey with #CIRitual.
                        </p>
                    </div>
                    <button className="px-10 py-5 bg-luxury-brown text-gold font-bold uppercase tracking-[0.3em] text-[10px] rounded hover:bg-gold hover:text-white transition-all shadow-xl border border-gold/20">
                        View the Full Gallery
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {FEED_ITEMS.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="group relative aspect-square overflow-hidden rounded-xl cursor-pointer"
                        >
                            <img
                                src={item.img}
                                alt={item.tag}
                                className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-luxury-brown/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4">
                                <p className="text-gold font-black text-[8px] uppercase tracking-widest mb-1">{item.owner}</p>
                                <p className="text-white text-[9px] font-light uppercase tracking-[0.2em]">{item.tag}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default UserGallery;

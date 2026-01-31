import React, { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { motion } from 'framer-motion';

const SkinQuizResults: React.FC = () => {
    const location = useLocation();
    const { products } = useProducts();
    const queryParams = new URLSearchParams(location.search);

    // Get parameters from URL (e.g. ?type=Dry&concern=Aging)
    const skinType = queryParams.get('type') || 'Custom';
    const concern = queryParams.get('concern') || 'Overall Radiance';

    const recommendedProducts = useMemo(() => {
        // Find products that match skinType OR concern OR have relevant tags
        return products.filter(p =>
            p.status === 'Active' && (
                p.skinTypes?.includes(skinType) ||
                p.concerns?.includes(concern) ||
                p.tags?.some(t => t.toLowerCase().includes(concern.toLowerCase()))
            )
        ).slice(0, 3);
    }, [products, skinType, concern]);

    return (
        <main className="min-h-screen pt-32 pb-24 bg-background-light dark:bg-background-dark px-6">
            <div className="max-w-4xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16"
                >
                    <span className="text-[10px] uppercase tracking-[0.4em] font-black text-primary mb-4 block">Your Personalized Ritual</span>
                    <h1 className="font-display text-4xl md:text-6xl text-secondary dark:text-white mb-6">Results for {skinType} Skin</h1>
                    <p className="text-sm opacity-60 max-w-xl mx-auto leading-relaxed">
                        Based on our analysis, we've identified <span className="text-secondary dark:text-white font-bold">{concern}</span> as your primary objective. Below is your bespoke ritual curated specifically for your skin's unique identity.
                    </p>
                </motion.div>

                {recommendedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 px-4">
                        {recommendedProducts.map((product, idx) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group"
                            >
                                <Link to={`/product/${product.id}`}>
                                    <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-6 relative shadow-lg group-hover:shadow-2xl transition-all duration-500">
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-[10px] font-bold text-white uppercase tracking-widest border border-white/30 px-4 py-2 rounded-full backdrop-blur-md">View Ritual</span>
                                        </div>
                                    </div>
                                    <h3 className="font-display text-xl text-secondary dark:text-white mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
                                    <p className="text-[10px] uppercase tracking-widest text-primary/60 font-bold">{product.category}</p>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="mb-16 p-12 bg-primary/5 rounded-3xl border border-primary/10">
                        <p className="text-sm opacity-60 italic">We couldn't find exact matches for your profile, but our full collection offers solutions for every skin journey.</p>
                    </div>
                )}

                <div className="pt-12 border-t border-primary/10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-8">Refine Your Journey</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/quiz" className="px-10 py-5 border border-primary/20 text-[10px] font-bold uppercase tracking-widest hover:bg-white dark:hover:bg-stone-900 hover:border-primary transition-all rounded-full shadow-sm">Retake Quiz</Link>
                        <Link to="/shop" className="px-10 py-5 bg-secondary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all rounded-full shadow-md shadow-secondary/20">Shop All Rituals</Link>
                    </div>
                </div>
            </div>

            {/* Decorative Branding */}
            <div className="fixed bottom-12 left-12 opacity-5 pointer-events-none hidden lg:block">
                <img src="/logo.jpg" alt="" className="h-24 grayscale" />
            </div>
        </main>
    );
};

export default SkinQuizResults;

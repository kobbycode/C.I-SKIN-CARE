
import { useSiteConfig } from '../context/SiteConfigContext';

const Story: React.FC = () => {
    const { siteConfig } = useSiteConfig();
    const { story } = siteConfig;
    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark pt-40 pb-24">
            {/* Hero Section - About Us */}
            <section className="max-w-7xl mx-auto px-6 mb-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="order-2 lg:order-1">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-primary mb-6 block font-black">About Us</span>
                        <h1 className="font-display text-5xl md:text-7xl text-secondary dark:text-primary mb-8 leading-[1.1]">
                            {story.aboutTitle}
                        </h1>
                        <p className="text-lg text-stone-500 font-light leading-relaxed mb-8">
                            {story.aboutText}
                        </p>
                        <div className="flex gap-12 pt-8 border-t border-stone-100 dark:border-zinc-800">
                            <div className="max-w-md">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Our Mission</h4>
                                <p className="text-sm font-light text-stone-500 italic">
                                    "{story.mission}"
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="order-1 lg:order-2 relative">
                        <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
                            <img
                                src="/assets/brand-ethos.png"
                                alt="Brand Ethos"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10"></div>
                    </div>
                </div>
            </section>

            {/* Vision Section */}
            <section className="bg-[#221C1D] py-32 mb-32 relative overflow-hidden">
                <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
                    <span className="text-[10px] uppercase tracking-[0.5em] text-primary mb-10 block font-black">Our Vision</span>
                    <h2 className="font-display text-4xl md:text-5xl mb-12 italic leading-relaxed text-white">
                        "{story.vision}"
                    </h2>
                    <div className="w-24 h-px bg-primary mx-auto mb-10"></div>
                    <p className="text-stone-400 font-light max-w-2xl mx-auto leading-relaxed">
                        {story.visionSub}
                    </p>
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
            </section>

            {/* Core Values Section */}
            <section className="max-w-7xl mx-auto px-6 mb-32">
                <div className="text-center mb-20">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-primary mb-6 block font-black">Our Foundation</span>
                    <h2 className="font-display text-4xl text-secondary dark:text-primary">Core Values</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {story.coreValues.map((value, i) => (
                        <div key={i} className="bg-white dark:bg-zinc-900 p-10 rounded-[2rem] border border-stone-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all group">
                            <span className="material-symbols-outlined text-primary text-4xl mb-6 font-light group-hover:scale-110 transition-transform">{value.icon}</span>
                            <h4 className="font-display text-xl mb-4 text-secondary dark:text-primary">{value.title}</h4>
                            <p className="text-sm font-light text-stone-500 leading-relaxed">
                                {value.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Founder's Letter Section */}
            <section className="max-w-7xl mx-auto px-6 mb-32">
                <div className="bg-luxury-brown text-white rounded-[4rem] p-12 md:p-24 overflow-hidden relative border border-gold/20 shadow-2xl">
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="order-2 lg:order-1">
                            <span className="text-[10px] uppercase tracking-[0.5em] text-gold mb-8 block font-black">A Personal Note</span>
                            <h2 className="font-display text-4xl md:text-5xl mb-10 leading-tight">{story.founderTitle}</h2>
                            <div className="space-y-6 text-stone-300 font-light leading-relaxed text-lg italic">
                                {story.founderText.map((text, i) => (
                                    <p key={i}>"{text}"</p>
                                ))}
                            </div>
                            <div className="mt-12 pt-8 border-t border-white/10">
                                <p className="font-display text-2xl text-gold mb-1">Comfort I. <span className="text-stone-400 font-sans text-[10px] uppercase tracking-widest ml-4">Creative Director & Founder</span></p>
                                <div className="text-3xl font-display opacity-40 select-none">Comfort I.</div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <div className="relative aspect-square rounded-[2rem] overflow-hidden group shadow-2xl border-4 border-gold/10">
                                <img
                                    src="/assets/founder.png"
                                    alt="Comfort I. - Founder"
                                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                                />
                            </div>
                        </div>
                    </div>
                    {/* Decorative Watermark */}
                    <div className="absolute -left-20 -bottom-20 opacity-5 pointer-events-none">
                        <img src="/logo.jpg" alt="" className="h-96 grayscale invert" />
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="text-center px-6">
                <h3 className="font-display text-3xl text-secondary dark:text-primary mb-10">Discover Our Products</h3>
                <p className="text-stone-400 font-light mb-12 max-w-lg mx-auto italic">
                    We deliver quality and safety from raw materials to finished products.
                </p>
                <a href="/shop" className="inline-block bg-[#221C1D] text-white px-12 py-5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all shadow-2xl">
                    Explore the Collection
                </a>
            </section>
        </main>
    );
};

export default Story;

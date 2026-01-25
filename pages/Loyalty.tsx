import { Link } from 'react-router-dom';
import React from 'react';
import { LOYALTY_TIERS } from '../constants';

const Loyalty: React.FC = () => {
    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark pt-40 pb-24">
            {/* Hero */}
            <header className="max-w-4xl mx-auto text-center px-6 mb-24">
                <span className="text-[10px] uppercase tracking-[0.4em] text-primary mb-6 block font-black">Loyalty Program</span>
                <h1 className="font-display text-5xl md:text-7xl text-secondary dark:text-primary mb-8 leading-tight">
                    The Ritual Rewards
                </h1>
                <p className="text-lg text-stone-500 font-light leading-relaxed max-w-2xl mx-auto">
                    Your journey to radiant skin is celebrated with exclusive access and luxury perks designed to elevate every aspect of your routine.
                </p>
            </header>

            {/* Tiers Grid */}
            <section className="max-w-7xl mx-auto px-6 mb-32">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {LOYALTY_TIERS.map((tier) => (
                        <div key={tier.name} className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-10 md:p-14 border border-stone-100 dark:border-zinc-800 shadow-[0_10px_40px_rgba(0,0,0,0.02)] flex flex-col h-full hover:shadow-xl transition-shadow duration-500 relative group overflow-hidden">
                            {/* Tier Header */}
                            <div className="mb-12">
                                <div className={`w-12 h-1 bg-${tier.color} mb-8 rounded-full`}></div>
                                <h3 className="font-display text-3xl text-secondary dark:text-primary mb-2">{tier.name}</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">{tier.threshold}</p>
                            </div>

                            {/* Benefits */}
                            <ul className="space-y-6 flex-grow">
                                {tier.benefits.map((benefit, idx) => (
                                    <li key={idx} className="flex items-start gap-4 group/li">
                                        <span className="material-symbols-outlined text-[18px] text-primary font-light mt-0.5 group-hover/li:scale-125 transition-transform">auto_awesome</span>
                                        <p className="text-sm text-stone-500 font-light leading-relaxed">{benefit}</p>
                                    </li>
                                ))}
                            </ul>

                            {/* Tier Foot */}
                            <div className="mt-16 pt-8 border-t border-stone-50 dark:border-zinc-800">
                                <button className="w-full text-center text-[10px] font-black uppercase tracking-[0.3em] py-4 rounded-xl border border-stone-100 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-all">
                                    View Tier Details
                                </button>
                            </div>

                            {/* Pattern overlay */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full transform translate-x-8 -translate-y-8 blur-2xl group-hover:translate-x-4 transition-transform duration-1000"></div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Points Breakdown */}
            <section className="max-w-5xl mx-auto px-6 mb-32">
                <div className="bg-secondary text-white rounded-[3rem] p-12 md:p-20 shadow-2xl overflow-hidden relative">
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="font-display text-4xl mb-8 leading-tight">Elevate Your Rituals <br /> Effortlessly</h2>
                            <p className="text-stone-400 font-light leading-relaxed mb-10">
                                Earn ritual points for every luxury purchase, referral, and anniversary. These points unlock higher tiers of exclusivity and direct savings on our elite formulations.
                            </p>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-primary text-xl font-display mb-1">GH₵1 Spent</h4>
                                    <p className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Earns 1 Point</p>
                                </div>
                                <div>
                                    <h4 className="text-primary text-xl font-display mb-1">Refer a Peer</h4>
                                    <p className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Earn 100 Points</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-10 rounded-[2rem] backdrop-blur-sm">
                            <h4 className="text-[10px] uppercase tracking-[0.3em] text-primary font-black mb-8">Points Calculator</h4>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-500 mb-3">Planned Investment (GH₵)</label>
                                    <input type="number" placeholder="500" className="w-full bg-transparent border-b border-white/20 py-2 text-xl font-display outline-none focus:border-primary transition-colors text-white" />
                                </div>
                                <div className="pt-6">
                                    <p className="text-[10px] uppercase tracking-widest text-stone-500 mb-1">Potential Points Earned</p>
                                    <p className="text-4xl font-display text-primary">500 PTS</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
                </div>
            </section>

            {/* FAQ Link */}
            <section className="text-center px-6">
                <p className="text-stone-400 font-light italic mb-8">Questions about your status?</p>
                <Link to="/faq" className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary dark:text-primary border-b-2 border-primary pb-2 hover:opacity-70 transition-all">
                    View Loyalty FAQ
                </Link>
            </section>
        </main>
    );
};

export default Loyalty;

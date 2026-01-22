
import React from 'react';
import { MOCK_JOURNAL_POSTS } from '../constants';

const Journal: React.FC = () => {
    return (
        <main className="min-h-screen bg-[#FDFCFB] pt-40 pb-24">
            {/* Header */}
            <header className="max-w-4xl mx-auto text-center px-6 mb-24">
                <span className="text-[10px] uppercase tracking-[0.5em] text-[#A68966] mb-6 block font-black">The Skin Journal</span>
                <h1 className="font-display text-5xl md:text-7xl text-[#221C1D] mb-8 leading-tight">
                    Rituals & Radiance
                </h1>
                <p className="text-lg text-stone-500 font-light leading-relaxed max-w-2xl mx-auto">
                    Insights from our laboratory, expert skin education, and carefully curated rituals for the modern beauty enthusiast.
                </p>
            </header>

            {/* Featured Post */}
            <section className="max-w-7xl mx-auto px-6 mb-32">
                <div className="relative group cursor-pointer overflow-hidden rounded-[3rem] shadow-2xl border border-stone-100 bg-white">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="aspect-[4/3] lg:aspect-auto overflow-hidden">
                            <img
                                src={MOCK_JOURNAL_POSTS[0].image}
                                alt="Featured Post"
                                className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
                            />
                        </div>
                        <div className="p-12 lg:p-20 flex flex-col justify-center">
                            <div className="flex items-center gap-4 mb-8 text-[10px] font-black uppercase tracking-widest text-[#A68966]">
                                <span>{MOCK_JOURNAL_POSTS[0].category}</span>
                                <span className="w-1 h-1 bg-stone-300 rounded-full"></span>
                                <span className="text-stone-400">{MOCK_JOURNAL_POSTS[0].readTime}</span>
                            </div>
                            <h2 className="font-display text-4xl md:text-5xl text-[#221C1D] mb-8 leading-tight hover:text-[#A68966] transition-colors line-clamp-2">
                                {MOCK_JOURNAL_POSTS[0].title}
                            </h2>
                            <p className="text-stone-500 font-light leading-relaxed mb-10 text-lg">
                                {MOCK_JOURNAL_POSTS[0].excerpt}
                            </p>
                            <button className="w-fit text-[10px] font-black uppercase tracking-[0.3em] text-[#221C1D] border-b-2 border-[#A68966] pb-2 hover:opacity-70 transition-all">
                                Read the Feature
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Latest Feed */}
            <section className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-end mb-16 px-4">
                    <div>
                        <h3 className="font-display text-3xl text-[#221C1D] mb-2">Latest Insights</h3>
                        <div className="w-12 h-1 bg-[#A68966]"></div>
                    </div>
                    <div className="flex gap-12 hidden md:flex text-[10px] font-black uppercase tracking-widest text-stone-400">
                        <button className="text-[#221C1D]">All</button>
                        <button className="hover:text-[#221C1D]">Education</button>
                        <button className="hover:text-[#221C1D]">Formulation</button>
                        <button className="hover:text-[#221C1D]">Rituals</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {MOCK_JOURNAL_POSTS.slice(1).map((post) => (
                        <article key={post.id} className="group cursor-pointer">
                            <div className="aspect-[3/2] overflow-hidden rounded-[2rem] mb-8 shadow-lg border border-stone-50">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                                />
                            </div>
                            <div className="px-2">
                                <div className="flex items-center gap-3 mb-4 text-[9px] font-black uppercase tracking-widest text-[#A68966]">
                                    <span>{post.category}</span>
                                    <span className="w-1 h-px bg-stone-300"></span>
                                    <span className="text-stone-400 font-bold">{post.readTime}</span>
                                </div>
                                <h4 className="font-display text-2xl text-[#221C1D] mb-4 group-hover:text-[#A68966] transition-colors leading-tight">
                                    {post.title}
                                </h4>
                                <p className="text-stone-500 text-sm font-light leading-relaxed mb-6 line-clamp-3">
                                    {post.excerpt}
                                </p>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#221C1D] flex items-center gap-2 group-hover:gap-4 transition-all">
                                    Read Article <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </span>
                            </div>
                        </article>
                    ))}
                </div>

                <div className="mt-24 text-center">
                    <button className="px-12 py-5 border-2 border-stone-200 text-[#221C1D] text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-[#221C1D] hover:text-white hover:border-[#221C1D] transition-all">
                        View All Articles
                    </button>
                </div>
            </section>

            {/* Newsletter Teaser */}
            <section className="max-w-5xl mx-auto px-6 mt-40">
                <div className="bg-[#221C1D] rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
                    <div className="relative z-10">
                        <span className="text-[10px] uppercase tracking-[0.5em] text-[#A68966] mb-8 block font-black">Le Cercle</span>
                        <h3 className="font-display text-4xl md:text-5xl mb-8 italic">Join our inner circle <br /> of beauty enthusiasts.</h3>
                        <p className="text-stone-400 font-light mb-12 max-w-lg mx-auto leading-relaxed">
                            Receive exclusive formulation reveals, skincare masterclasses, and private event invitations directly in your inbox.
                        </p>
                        <div className="max-w-sm mx-auto flex gap-4">
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-[#A68966] transition-colors"
                            />
                            <button className="bg-[#A68966] text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all">
                                Join
                            </button>
                        </div>
                    </div>
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                </div>
            </section>
        </main>
    );
};

export default Journal;

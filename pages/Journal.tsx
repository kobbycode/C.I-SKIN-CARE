import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useJournal } from '../context/JournalContext';
import { JournalSkeleton } from '../components/Skeletons';

const Journal: React.FC = () => {
    const { posts, loading } = useJournal();
    const [activeCategory, setActiveCategory] = useState('All');

    const filteredPosts = posts.filter(post =>
        activeCategory === 'All' || post.category === activeCategory
    );

    if (loading) return <JournalSkeleton />;
    if (posts.length === 0) return <div className="min-h-screen bg-[#FDFCFB] pt-40 text-center font-display text-xl uppercase tracking-widest opacity-30">No rituals found.</div>;

    const featuredPost = filteredPosts[0] || posts[0];
    const feedPosts = filteredPosts.length > 1 ? filteredPosts.slice(1) : (filteredPosts.length === 1 && activeCategory !== 'All' ? [] : posts.slice(1));

    return (
        <main className="min-h-screen bg-[#FDFCFB] dark:bg-background-dark pt-40 pb-24 transition-colors duration-300">
            {/* Header */}
            <header className="max-w-4xl mx-auto text-center px-6 mb-24">
                <span className="text-[10px] uppercase tracking-[0.5em] text-[#A68966] mb-6 block font-black">Skin Blog</span>
                <h1 className="font-display text-5xl md:text-7xl text-[#221C1D] dark:text-white mb-8 leading-tight transition-colors">
                    Tips & Insights
                </h1>
                <p className="text-lg text-stone-500 dark:text-stone-400 font-light leading-relaxed max-w-2xl mx-auto transition-colors">
                    Expert skincare advice and education for your daily routine.
                </p>
            </header>

            {/* Featured Post */}
            <section className="max-w-7xl mx-auto px-6 mb-32">
                <Link to={`/journal/${featuredPost.id}`} className="relative group cursor-pointer overflow-hidden rounded-[3rem] shadow-2xl border border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 block transition-colors">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="aspect-[4/3] lg:aspect-auto overflow-hidden">
                            <img
                                src={featuredPost.image}
                                alt="Featured Post"
                                className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
                            />
                        </div>
                        <div className="p-12 lg:p-20 flex flex-col justify-center">
                            <div className="flex items-center gap-4 mb-8 text-[10px] font-black uppercase tracking-widest text-[#A68966]">
                                <span>{featuredPost.category}</span>
                                <span className="w-1 h-1 bg-stone-300 dark:bg-stone-600 rounded-full"></span>
                                <span className="text-stone-400 dark:text-stone-500">{featuredPost.readTime}</span>
                            </div>
                            <h2 className="font-display text-4xl md:text-5xl text-[#221C1D] dark:text-white mb-8 leading-tight hover:text-[#A68966] dark:hover:text-[#A68966] transition-colors line-clamp-2">
                                {featuredPost.title}
                            </h2>
                            <p className="text-stone-500 dark:text-stone-400 font-light leading-relaxed mb-10 text-lg transition-colors">
                                {featuredPost.excerpt}
                            </p>
                            <span className="w-fit text-[10px] font-black uppercase tracking-[0.3em] text-[#221C1D] dark:text-white border-b-2 border-[#A68966] pb-2 hover:opacity-70 transition-all">
                                Read the Feature
                            </span>
                        </div>
                    </div>
                </Link>
            </section>

            {/* Latest Feed */}
            <section className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-end mb-16 px-4">
                    <div>
                        <h3 className="font-display text-3xl text-[#221C1D] dark:text-white mb-2 transition-colors">Latest Insights</h3>
                        <div className="w-12 h-1 bg-[#A68966]"></div>
                    </div>
                    <div className="flex gap-12 hidden md:flex text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-600 transition-colors">
                        {['All', 'Rituals', 'Science', 'Lifestyle', 'Botany'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`transition-all ${activeCategory === cat ? 'text-[#221C1D] dark:text-white' : 'hover:text-[#221C1D] dark:hover:text-white'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {feedPosts.length > 0 ? feedPosts.map((post) => (
                        <Link key={post.id} to={`/journal/${post.id}`} className="group cursor-pointer">
                            <div className="aspect-[3/2] overflow-hidden rounded-[2rem] mb-8 shadow-lg border border-stone-50 dark:border-stone-800">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                                />
                            </div>
                            <div className="px-2">
                                <div className="flex items-center gap-3 mb-4 text-[9px] font-black uppercase tracking-widest text-[#A68966]">
                                    <span>{post.category}</span>
                                    <span className="w-1 h-px bg-stone-300 dark:bg-stone-700"></span>
                                    <span className="text-stone-400 dark:text-stone-500 font-bold">{post.readTime}</span>
                                </div>
                                <h4 className="font-display text-2xl text-[#221C1D] dark:text-white mb-4 group-hover:text-[#A68966] transition-colors leading-tight">
                                    {post.title}
                                </h4>
                                <p className="text-stone-500 dark:text-stone-400 text-sm font-light leading-relaxed mb-6 line-clamp-3 transition-colors">
                                    {post.excerpt}
                                </p>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#221C1D] dark:text-white flex items-center gap-2 group-hover:gap-4 transition-all">
                                    Read Article <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </span>
                            </div>
                        </Link>
                    )) : (
                        <div className="col-span-full py-20 text-center opacity-30 italic dark:text-stone-400">No additional insights in this category yet.</div>
                    )}
                </div>

                <div className="mt-24 text-center">
                    <button className="px-12 py-5 border-2 border-stone-200 dark:border-stone-700 text-[#221C1D] dark:text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-[#221C1D] dark:hover:bg-white hover:text-white dark:hover:text-black hover:border-[#221C1D] dark:hover:border-white transition-all">
                        View All Articles
                    </button>
                </div>
            </section>

            {/* Newsletter Teaser */}
            <section className="max-w-5xl mx-auto px-6 mt-40">
                <div className="bg-[#221C1D] rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
                    <div className="relative z-10">
                        <span className="text-[10px] uppercase tracking-[0.5em] text-[#A68966] mb-8 block font-black">Community</span>
                        <h3 className="font-display text-4xl md:text-5xl mb-8 italic">Join our community <br /> of beauty enthusiasts.</h3>
                        <p className="text-stone-400 font-light mb-12 max-w-lg mx-auto leading-relaxed">
                            Receive skincare tips and exclusive offers directly in your inbox.
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

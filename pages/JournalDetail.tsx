import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useJournal } from '../context/JournalContext';

const JournalDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { posts, loading } = useJournal();
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FDFCFB] pt-40 text-center font-display text-xl uppercase tracking-widest opacity-30">
                Loading Article...
            </div>
        );
    }

    const post = posts.find(p => p.id === id);

    if (!post) {
        return (
            <div className="min-h-screen bg-[#FDFCFB] pt-40 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="font-display text-4xl text-[#221C1D] mb-8">Article Not Found</h1>
                    <Link to="/journal" className="text-[#A68966] hover:underline">
                        Return to Journal
                    </Link>
                </div>
            </div>
        );
    }

    const relatedPosts = posts
        .filter(p => p.id !== id && p.category === post.category && p.status === 'Published')
        .slice(0, 3);

    return (
        <main className="min-h-screen bg-[#FDFCFB] dark:bg-background-dark pt-32 pb-24 transition-colors duration-300">
            {/* Back Button */}
            <div className="max-w-4xl mx-auto px-6 mb-8">
                <button
                    onClick={() => navigate('/journal')}
                    className="flex items-center gap-2 text-stone-400 hover:text-[#221C1D] dark:hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
                >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Back to Journal
                </button>
            </div>

            {/* Article Header */}
            <article className="max-w-4xl mx-auto px-6">
                <header className="mb-16">
                    <div className="flex items-center gap-4 mb-8 text-[10px] font-black uppercase tracking-widest text-[#A68966]">
                        <span>{post.category}</span>
                        <span className="w-1 h-1 bg-stone-300 dark:bg-stone-600 rounded-full"></span>
                        <span className="text-stone-400 dark:text-stone-500">{post.date}</span>
                        <span className="w-1 h-1 bg-stone-300 dark:bg-stone-600 rounded-full"></span>
                        <span className="text-stone-400 dark:text-stone-500">{post.readTime}</span>
                    </div>
                    <h1 className="font-display text-5xl md:text-6xl text-[#221C1D] dark:text-white mb-8 leading-tight transition-colors">
                        {post.title}
                    </h1>
                    <p className="text-xl text-stone-500 dark:text-stone-400 font-light leading-relaxed mb-8 transition-colors">
                        {post.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-stone-400 dark:text-stone-500">
                        <span>By {post.author}</span>
                    </div>
                </header>

                {/* Featured Image */}
                <div className="aspect-video rounded-3xl overflow-hidden mb-16 shadow-2xl border border-stone-100 dark:border-stone-800">
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Article Content */}
                <div className="prose prose-lg max-w-none mb-24 dark:prose-invert">
                    <div className="text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line text-lg font-light transition-colors">
                        {post.content}
                    </div>
                </div>

                {/* Share Section */}
                <div className="border-t border-b border-stone-100 dark:border-stone-800 py-12 mb-24 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2 transition-colors">Share this article</p>
                            <div className="flex gap-4">
                                <button className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-[#A68966] dark:hover:bg-[#A68966] hover:text-white transition-all flex items-center justify-center text-stone-600 dark:text-stone-300">
                                    <span className="material-symbols-outlined text-sm">share</span>
                                </button>
                                <button className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-[#A68966] dark:hover:bg-[#A68966] hover:text-white transition-all flex items-center justify-center text-stone-600 dark:text-stone-300">
                                    <span className="material-symbols-outlined text-sm">bookmark</span>
                                </button>
                            </div>
                        </div>
                        <Link
                            to="/journal"
                            className="px-8 py-4 border-2 border-stone-200 dark:border-stone-700 text-[#221C1D] dark:text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-[#221C1D] dark:hover:bg-white hover:text-white dark:hover:text-black hover:border-[#221C1D] dark:hover:border-white transition-all"
                        >
                            View All Articles
                        </Link>
                    </div>
                </div>

                {/* Related Articles */}
                {relatedPosts.length > 0 && (
                    <section>
                        <h2 className="font-display text-3xl text-[#221C1D] dark:text-white mb-12 transition-colors">Related Insights</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedPosts.map((relatedPost) => (
                                <Link
                                    key={relatedPost.id}
                                    to={`/journal/${relatedPost.id}`}
                                    className="group cursor-pointer"
                                >
                                    <div className="aspect-[3/2] overflow-hidden rounded-2xl mb-6 shadow-lg border border-stone-50 dark:border-stone-800">
                                        <img
                                            src={relatedPost.image}
                                            alt={relatedPost.title}
                                            className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 mb-3 text-[9px] font-black uppercase tracking-widest text-[#A68966]">
                                        <span>{relatedPost.category}</span>
                                        <span className="w-1 h-px bg-stone-300 dark:bg-stone-700"></span>
                                        <span className="text-stone-400 dark:text-stone-500 font-bold">{relatedPost.readTime}</span>
                                    </div>
                                    <h4 className="font-display text-xl text-[#221C1D] dark:text-white mb-3 group-hover:text-[#A68966] transition-colors leading-tight line-clamp-2">
                                        {relatedPost.title}
                                    </h4>
                                    <p className="text-stone-500 dark:text-stone-400 text-sm font-light leading-relaxed line-clamp-2 transition-colors">
                                        {relatedPost.excerpt}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </article>
        </main>
    );
};

export default JournalDetail;

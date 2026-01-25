import React, { useState } from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import { useJournal, JournalPost } from '../../context/JournalContext';
import { useNotification } from '../../context/NotificationContext';

const JournalManager: React.FC = () => {
    const { posts, addPost, updatePost, deletePost, loading } = useJournal();
    const { showNotification } = useNotification();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<JournalPost | null>(null);
    const [formData, setFormData] = useState<Omit<JournalPost, 'id'>>({
        title: '',
        category: 'Rituals',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        author: 'Admin',
        excerpt: '',
        content: '',
        image: '',
        readTime: '5 min',
        status: 'Published'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingPost) {
                await updatePost(editingPost.id, formData);
                showNotification('Post updated successfully', 'success');
            } else {
                await addPost(formData);
                showNotification('Journal post created', 'success');
            }
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            showNotification('Operation failed', 'error');
        }
    };

    const resetForm = () => {
        setEditingPost(null);
        setFormData({
            title: '',
            category: 'Rituals',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            author: 'Admin',
            excerpt: '',
            content: '',
            image: '',
            readTime: '5 min',
            status: 'Published'
        });
    };

    const handleEdit = (post: JournalPost) => {
        setEditingPost(post);
        setFormData({
            title: post.title,
            category: post.category,
            date: post.date,
            author: post.author,
            excerpt: post.excerpt,
            content: post.content || '',
            image: post.image,
            readTime: post.readTime,
            status: post.status
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, title: string) => {
        if (window.confirm(`Delete post "${title}"?`)) {
            try {
                await deletePost(id);
                showNotification('Post deleted', 'success');
            } catch (error) {
                showNotification('Deletion failed', 'error');
            }
        }
    };

    if (loading) return <AdminLayout><div className="p-20 text-center opacity-30">Loading Archives...</div></AdminLayout>;

    return (
        <AdminLayout>
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-[#221C1D]">Skin Journal Manager</h2>
                    <p className="text-stone-500 text-sm md:text-base">Curate editorial content and educational articles for your users.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider bg-[#221C1D] text-white hover:bg-black transition-colors rounded shadow-sm"
                >
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    Create Entry
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {posts.map((post) => (
                    <div key={post.id} className="bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm group hover:shadow-xl transition-all h-fit">
                        <div className="relative aspect-video overflow-hidden">
                            <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${post.status === 'Published' ? 'bg-green-500 text-white' : 'bg-stone-500 text-white'}`}>
                                {post.status}
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">{post.category}</span>
                                <span className="text-[9px] text-stone-400 font-bold uppercase">{post.date}</span>
                            </div>
                            <h3 className="text-lg font-bold text-[#221C1D] mb-3 line-clamp-2">{post.title}</h3>
                            <p className="text-xs text-stone-500 font-light line-clamp-3 mb-6 leading-relaxed">{post.excerpt}</p>
                            <div className="flex justify-between items-center pt-5 border-t border-stone-50">
                                <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">{post.readTime} Read</span>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(post)} className="p-2 text-stone-300 hover:text-[#221C1D] transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                                    <button onClick={() => handleDelete(post.id, post.title)} className="p-2 text-stone-300 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Editor Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="p-8 border-b border-stone-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="text-xl font-bold text-[#221C1D]">{editingPost ? 'Edit Journal Entry' : 'New Journal Entry'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-stone-300 hover:text-stone-600"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Entry Title</label>
                                    <input
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold"
                                        placeholder="Art of the Glow"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm focus:outline-none"
                                    >
                                        <option value="Rituals">Rituals</option>
                                        <option value="Science">Science</option>
                                        <option value="Lifestyle">Lifestyle</option>
                                        <option value="Botany">Botany</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Featured Image URL</label>
                                <input
                                    required
                                    value={formData.image}
                                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                                    className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold"
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Excerpt (Brief Summary)</label>
                                <textarea
                                    required
                                    value={formData.excerpt}
                                    onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                    className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm text-stone-600 min-h-[80px] resize-none focus:outline-none focus:border-gold"
                                    placeholder="Short summary for the card view..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Main Content</label>
                                <textarea
                                    required
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm text-stone-600 min-h-[250px] resize-none focus:outline-none focus:border-gold"
                                    placeholder="Tell your story..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Read Time</label>
                                    <input
                                        value={formData.readTime}
                                        onChange={e => setFormData({ ...formData, readTime: e.target.value })}
                                        className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm focus:outline-none"
                                        placeholder="e.g. 5 min"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Publish Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                        className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm focus:outline-none"
                                    >
                                        <option value="Published">Published</option>
                                        <option value="Draft">Draft</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border border-stone-100 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-stone-50 transition-all">Cancel</button>
                                <button type="submit" className="flex-2 py-4 bg-[#221C1D] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg hover:bg-black transition-all">
                                    {editingPost ? 'Update Entry' : 'Publish Entry'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default JournalManager;

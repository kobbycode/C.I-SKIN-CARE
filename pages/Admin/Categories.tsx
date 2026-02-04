import React, { useState } from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import { AdminSkeleton } from '../../components/Skeletons';
import { useCategories } from '../../context/CategoryContext';
import { useProducts } from '../../context/ProductContext';
import { useNotification } from '../../context/NotificationContext';
import { Category } from '../../types';

const Categories: React.FC = () => {
    const { categories, addCategory, updateCategory, deleteCategory, loading } = useCategories();
    const { products } = useProducts();
    const { showNotification } = useNotification();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        status: 'Active' as 'Active' | 'Seasonal' | 'Draft',
        displayOrder: 0
    });

    const getProductCount = (categoryName: string) => {
        return products.filter(p => p.category === categoryName).length;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, formData);
                showNotification('Category updated', 'success');
            } else {
                await addCategory(formData);
                showNotification('Category created', 'success');
            }
            setIsModalOpen(false);
            setEditingCategory(null);
            setFormData({ name: '', status: 'Active', displayOrder: categories.length + 1 });
        } catch (error) {
            showNotification('Operation failed', 'error');
        }
    };

    const handleEdit = (cat: Category) => {
        setEditingCategory(cat);
        setFormData({ name: cat.name, status: cat.status, displayOrder: cat.displayOrder || 0 });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (getProductCount(name) > 0) {
            showNotification(`Cannot delete "${name}" while products are assigned to it.`, 'error');
            return;
        }

        if (window.confirm(`Delete category "${name}"?`)) {
            try {
                await deleteCategory(id);
                showNotification('Category deleted', 'success');
            } catch (error) {
                showNotification('Deletion failed', 'error');
            }
        }
    };

    if (loading) return (
        <AdminLayout>
            <AdminSkeleton />
        </AdminLayout>
    );

    return (
        <AdminLayout>
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-[#221C1D]">Taxonomy & Hierarchy</h2>
                    <p className="text-stone-500 text-sm md:text-base">Manage collection categories as they appear on the digital storefront.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingCategory(null);
                        setFormData({ name: '', status: 'Active', displayOrder: categories.length + 1 });
                        setIsModalOpen(true);
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider bg-[#221C1D] text-white hover:bg-black transition-colors rounded shadow-sm"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    New Category
                </button>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12">
                {/* Main Categories List */}
                <div className="xl:col-span-8">
                    <div className="bg-white border border-stone-100 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
                        <div className="md:hidden divide-y divide-stone-50">
                            {categories.map((cat) => (
                                <div key={cat.id} className="p-6 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="material-symbols-outlined text-stone-200">drag_indicator</span>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-bold text-[#221C1D] truncate">{cat.name}</span>
                                            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest truncate">
                                                {getProductCount(cat.name)} Products • /{cat.name.toLowerCase().replace(/[^a-z]/g, '-')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${cat.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                            {cat.status}
                                        </span>
                                        <button onClick={() => handleEdit(cat)} className="p-1 text-stone-300 hover:text-[#221C1D] transition-colors">
                                            <span className="material-symbols-outlined text-lg">edit</span>
                                        </button>
                                        <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1 text-stone-300 hover:text-red-500 transition-colors">
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left min-w-[500px]">
                                <thead>
                                    <tr className="bg-stone-50/50">
                                        <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest w-16">Ord</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Category</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-center">Items</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-50">
                                    {categories.map((cat, i) => (
                                        <tr key={cat.id} className="hover:bg-stone-50/50 transition-colors group">
                                            <td className="px-6 py-5">
                                                <span className="text-xs font-bold text-stone-300">{cat.displayOrder || (i + 1)}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-bold text-[#221C1D] truncate">{cat.name}</span>
                                                    <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest truncate">/{cat.name.toLowerCase().replace(/[^a-z]/g, '-')}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-xs text-stone-500 font-bold text-center whitespace-nowrap">
                                                {getProductCount(cat.name)}
                                            </td>
                                            <td className="px-6 py-5 text-right flex justify-end gap-2">
                                                <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest my-auto ${cat.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                                    {cat.status}
                                                </span>
                                                <button onClick={() => handleEdit(cat)} className="p-2 text-stone-200 hover:text-[#221C1D] transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                                                <button onClick={() => handleDelete(cat.id, cat.name)} className="p-2 text-stone-200 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Taxonomy Rules Sidebar */}
                <div className="xl:col-span-4 space-y-8">
                    <section className="bg-white border border-stone-100 rounded-2xl p-6 md:p-8 space-y-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] border-b border-stone-50 pb-4">Display Logic</h3>
                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Total Groups</p>
                                <span className="text-[10px] font-bold text-[#221C1D]">{categories.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Active Nodes</p>
                                <span className="text-[10px] font-bold text-green-600 uppercase">{categories.filter(c => c.status === 'Active').length} Live</span>
                            </div>
                        </div>
                    </section>

                    <section className="p-6 bg-[#221C1D] text-white rounded-2xl shadow-lg border-t-4 border-[#F2A600]">
                        <div className="flex gap-3 mb-4 items-center">
                            <span className="material-symbols-outlined text-[#F2A600]">schema</span>
                            <p className="text-[10px] font-bold uppercase tracking-widest">SEO Tip</p>
                        </div>
                        <p className="text-[10px] text-stone-400 leading-relaxed uppercase tracking-tighter">
                            Hierarchy directly influences breadcrumbs. Logical parent-child relationships improve crawler efficiency and user ritual navigation.
                        </p>
                    </section>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="p-8 border-b border-stone-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-[#221C1D]">{editingCategory ? 'Edit Category' : 'New Category'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-stone-300 hover:text-stone-600"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Category Name</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F2A600]"
                                    placeholder="e.g. Cleansers"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                        className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm focus:outline-none"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Seasonal">Seasonal</option>
                                        <option value="Draft">Draft</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Order</label>
                                    <input
                                        type="number"
                                        value={formData.displayOrder}
                                        onChange={e => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                                        className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm focus:outline-none"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-4 bg-[#221C1D] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg hover:shadow-xl transition-all">
                                {editingCategory ? 'Update Category' : 'Create Category'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default Categories;

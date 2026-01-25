import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import AdminLayout from '../../components/Admin/AdminLayout';
import { db, storage } from '../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, doc, setDoc } from 'firebase/firestore';
import { useProducts } from '../../context/ProductContext';
import { useNotification } from '../../context/NotificationContext';
import { Product } from '../../types';

const AddProduct: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { addProduct, updateProduct, products } = useProducts();
    const { showNotification } = useNotification();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        description: '',
        category: 'Cleansers',
        brand: 'C.I Skin Care',
        price: 0,
        sku: '',
        stock: 0,
        image: '/products/placeholder.jpg',
        skinTypes: [],
        concerns: [],
        status: 'Draft',
        tags: []
    });

    useEffect(() => {
        if (id && products.length > 0) {
            const product = products.find(p => p.id === id);
            if (product) {
                setFormData(product);
            }
        }
    }, [id, products]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (id) {
                await updateProduct(id, formData);
                showNotification('Product updated successfully', 'success');
            } else {
                await addProduct(formData as Omit<Product, 'id'>);
                showNotification('Product created successfully', 'success');
            }
            navigate('/admin/inventory');
        } catch (error) {
            console.error(error);
            showNotification('Operation failed. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: keyof Product, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsSubmitting(true);
        try {
            const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            handleChange('image', downloadURL);
            showNotification('Image uploaded successfully', 'success');
        } catch (error) {
            console.error("Upload error:", error);
            showNotification('Failed to upload image', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleArrayItem = (field: 'skinTypes' | 'concerns', item: string) => {
        setFormData(prev => {
            const array = prev[field] || [];
            if (array.includes(item)) {
                return { ...prev, [field]: array.filter(i => i !== item) };
            }
            return { ...prev, [field]: [...array, item] };
        });
    };

    return (
        <AdminLayout>
            <header className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                    <Link to="/admin/inventory" className="p-2 hover:bg-stone-50 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-stone-400">arrow_back</span>
                    </Link>
                    <div>
                        <h2 className="text-3xl font-bold text-[#221C1D]">{id ? 'Edit Formulation' : 'New Formulation'}</h2>
                        <p className="text-stone-500">{id ? 'Refine an existing clinical-grade botanical.' : 'Add a new clinical-grade botanical to the collection.'}</p>
                    </div>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="max-w-5xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Essential Details */}
                    <div className="lg:col-span-8 space-y-8">
                        <section className="bg-white border border-stone-100 rounded-2xl p-8 space-y-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] border-b border-stone-50 pb-4 mb-6">Core Information</h3>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#221C1D]">Product Signature Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder="e.g. Midnight Radiance Elixir"
                                    className="w-full bg-[#FDFCFB] border border-stone-100 focus:border-[#F2A600] focus:ring-1 focus:ring-[#F2A600] rounded-lg px-4 py-4 outline-none transition-all placeholder:text-stone-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#221C1D]">Product Narrative</label>
                                <textarea
                                    required
                                    rows={5}
                                    value={formData.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    placeholder="Describe the formulation's purpose, key benefits, and sensory experience..."
                                    className="w-full bg-[#FDFCFB] border border-stone-100 focus:border-[#F2A600] focus:ring-1 focus:ring-[#F2A600] rounded-lg px-4 py-4 outline-none transition-all placeholder:text-stone-300 resize-none"
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#221C1D]">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => handleChange('category', e.target.value)}
                                        className="w-full bg-[#FDFCFB] border border-stone-100 focus:border-[#F2A600] focus:ring-1 focus:ring-[#F2A600] rounded-lg px-4 py-4 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option>Cleansers</option>
                                        <option>Serums & Elixirs</option>
                                        <option>Moisturizers</option>
                                        <option>Treatments</option>
                                        <option>Collections</option>
                                        <option>Body Care</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#221C1D]">Brand Line</label>
                                    <select
                                        value={formData.brand}
                                        onChange={(e) => handleChange('brand', e.target.value)}
                                        className="w-full bg-[#FDFCFB] border border-stone-100 focus:border-[#F2A600] focus:ring-1 focus:ring-[#F2A600] rounded-lg px-4 py-4 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option>C.I Skin Care</option>
                                        <option>BEL ECLAT</option>
                                        <option>Gluta Master</option>
                                        <option>5D Gluta</option>
                                        <option>SPA Rituals</option>
                                        <option>Pomegranate Line</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white border border-stone-100 rounded-2xl p-8 space-y-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] border-b border-stone-50 pb-4 mb-6">Inventory & Pricing</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#221C1D]">Base Price (GH₵)</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                                        placeholder="0.00"
                                        className="w-full bg-[#FDFCFB] border border-stone-100 focus:border-[#F2A600] focus:ring-1 focus:ring-[#F2A600] rounded-lg px-4 py-4 outline-none transition-all placeholder:text-stone-300"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#221C1D]">SKU Identifier</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.sku}
                                        onChange={(e) => handleChange('sku', e.target.value)}
                                        placeholder="CI-XXXX-XX"
                                        className="w-full bg-[#FDFCFB] border border-stone-100 focus:border-[#F2A600] focus:ring-1 focus:ring-[#F2A600] rounded-lg px-4 py-4 outline-none transition-all placeholder:text-stone-300 uppercase"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#221C1D]">Initial Stock Level</label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => handleChange('stock', parseInt(e.target.value))}
                                        placeholder="0"
                                        className="w-full bg-[#FDFCFB] border border-stone-100 focus:border-[#F2A600] focus:ring-1 focus:ring-[#F2A600] rounded-lg px-4 py-4 outline-none transition-all placeholder:text-stone-300"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="bg-white border border-stone-100 rounded-2xl p-8 space-y-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] border-b border-stone-50 pb-4 mb-6">Skin Intelligence (Targeting)</h3>

                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Target Skin Types</p>
                                    <div className="flex flex-wrap gap-3">
                                        {['All Skin Types', 'Dry & Dehydrated', 'Oily & Acne-Prone', 'Mature Skin', 'Sensitive', 'Normal'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => toggleArrayItem('skinTypes', type)}
                                                className={`px-5 py-2 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all ${formData.skinTypes?.includes(type)
                                                    ? 'bg-[#F2A600] text-black border-[#F2A600]'
                                                    : 'border-stone-100 hover:border-[#F2A600] hover:text-[#F2A600]'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Primary Skin Concerns</p>
                                    <div className="flex flex-wrap gap-3">
                                        {['Aging', 'Dullness', 'Dehydration', 'Dryness', 'Dark Circles', 'Fine Lines', 'Congestion'].map(concern => (
                                            <button
                                                key={concern}
                                                type="button"
                                                onClick={() => toggleArrayItem('concerns', concern)}
                                                className={`px-5 py-2 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all ${formData.concerns?.includes(concern)
                                                    ? 'bg-[#F2A600] text-black border-[#F2A600]'
                                                    : 'border-stone-100 hover:border-[#F2A600] hover:text-[#F2A600]'
                                                    }`}
                                            >
                                                {concern}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Sidebar Actions & Media */}
                    <div className="lg:col-span-4 space-y-8">
                        <section className="bg-white border border-stone-100 rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] border-b border-stone-50 pb-4 mb-6">Visual Identity</h3>

                            <div className="space-y-4">
                                <label className="aspect-[4/5] bg-[#FDFCFB] border-2 border-dashed border-stone-100 rounded-xl flex flex-col items-center justify-center text-center p-6 group hover:border-[#F2A600]/30 transition-all cursor-pointer relative overflow-hidden">
                                    {formData.image && formData.image !== '/products/placeholder.jpg' ? (
                                        <img src={formData.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                                    ) : null}
                                    <span className="material-symbols-outlined text-4xl text-stone-200 mb-2 group-hover:text-[#F2A600]/30 relative z-10">image</span>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 group-hover:text-[#221C1D] relative z-10">
                                        {formData.image ? 'Change Product Imagery' : 'Upload Product Imagery'}
                                    </p>
                                    <p className="text-[8px] text-stone-300 mt-1 uppercase relative z-10">JPG, PNG, WEBP (Min 1000x1250px)</p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Or Image URL</label>
                                    <input
                                        type="text"
                                        value={formData.image}
                                        onChange={(e) => handleChange('image', e.target.value)}
                                        className="w-full bg-[#FDFCFB] border border-stone-100 rounded px-2 py-2 text-xs"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="aspect-square bg-[#FDFCFB] border border-stone-100 rounded-lg flex items-center justify-center">
                                            <span className="material-symbols-outlined text-stone-200 text-lg">add</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section className="bg-[#221C1D] text-white rounded-2xl p-8 space-y-6 shadow-xl">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 border-b border-white/10 pb-4 mb-4">Publishing Logic</h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold uppercase tracking-widest">Visibility</p>
                                    <select className="bg-transparent border-none focus:ring-0 text-[#F2A600] text-xs font-bold uppercase tracking-widest cursor-pointer">
                                        <option>Public</option>
                                        <option>Private</option>
                                        <option>Archived</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold uppercase tracking-widest">Status</p>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => handleChange('status', e.target.value)}
                                        className="bg-transparent border-none focus:ring-0 text-[#F2A600] text-xs font-bold uppercase tracking-widest cursor-pointer"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Draft">Draft</option>
                                        <option value="Archived">Archived</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[#F2A600] text-[#221C1D] py-4 rounded-lg font-bold uppercase tracking-[0.2em] text-[10px] hover:brightness-110 shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-[#221C1D]/20 border-t-[#221C1D] rounded-full animate-spin"></div>
                                        Establishing...
                                    </>
                                ) : (
                                    <>Authenticating Product</>
                                )}
                            </button>
                            <button type="button" className="w-full text-stone-400 py-2 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">
                                Discard Ritual Draft
                            </button>
                        </section>

                        <section className="p-6 bg-amber-50 border border-amber-100 rounded-2xl">
                            <div className="flex gap-3 mb-2">
                                <span className="material-symbols-outlined text-amber-600 text-lg">info</span>
                                <p className="text-[10px] font-bold text-amber-900 uppercase tracking-widest">Compliance Tip</p>
                            </div>
                            <p className="text-[10px] text-amber-800/80 leading-relaxed uppercase tracking-tighter">
                                Ensure all botanical ingredients are listed per INCI standard. Clinical studies must be cited in the description field for health claims.
                            </p>
                        </section>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
};

export default AddProduct;

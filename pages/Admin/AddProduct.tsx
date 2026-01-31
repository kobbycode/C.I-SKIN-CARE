import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import AdminLayout from '../../components/Admin/AdminLayout';
import { db, storage } from '../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { useProducts } from '../../context/ProductContext';
import { useNotification } from '../../context/NotificationContext';
import { Product, ProductVariant, Coupon } from '../../types';

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
        images: [],
        videoUrl: '',
        variants: [],
        couponCodes: [],
        skinTypes: [],
        concerns: [],
        status: 'Draft',
        tags: []
    });

    const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);

    useEffect(() => {
        if (id && products.length > 0) {
            const product = products.find(p => p.id === id);
            if (product) {
                setFormData({
                    ...product,
                    images: product.images || [],
                    variants: product.variants || [],
                    couponCodes: product.couponCodes || []
                });
            }
        }
    }, [id, products]);

    useEffect(() => {
        const fetchCoupons = async () => {
            const snap = await getDocs(collection(db, 'coupons'));
            const data: Coupon[] = [];
            snap.forEach(doc => data.push({ ...doc.data() as Coupon, id: doc.id }));
            setAvailableCoupons(data);
        };
        fetchCoupons();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const finalData = { ...formData };
            if (formData.variants && formData.variants.length > 0) {
                finalData.stock = formData.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
                // Also ensure variants have default values if needed
                finalData.variants = formData.variants.map(v => ({
                    ...v,
                    price: v.price || formData.price || 0,
                    stock: v.stock || 0
                }));
            }

            if (id) {
                await updateProduct(id, finalData);
                showNotification('Product updated successfully', 'success');
            } else {
                await addProduct(finalData as Omit<Product, 'id'>);
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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsSubmitting(true);
        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                return await getDownloadURL(snapshot.ref);
            });

            const urls = await Promise.all(uploadPromises);

            if (isGallery) {
                setFormData(prev => ({
                    ...prev,
                    images: [...(prev.images || []), ...urls]
                }));
            } else {
                handleChange('image', urls[0]);
            }
            showNotification(`${urls.length} image(s) uploaded successfully`, 'success');
        } catch (error) {
            console.error("Upload error:", error);
            showNotification('Failed to upload image(s)', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsSubmitting(true);
        try {
            const storageRef = ref(storage, `products/videos/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            handleChange('videoUrl', downloadURL);
            showNotification('Video uploaded successfully', 'success');
        } catch (error) {
            console.error("Video upload error:", error);
            showNotification('Failed to upload video', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeGalleryImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: (prev.images || []).filter((_, i) => i !== index)
        }));
    };

    const setAsFeaturedImage = (url: string) => {
        handleChange('image', url);
        showNotification('Featured image updated', 'success');
    };

    const addVariant = () => {
        const newVariant: ProductVariant = {
            id: Date.now().toString(),
            name: '',
            price: formData.price || 0,
            stock: 0,
            sku: `${formData.sku || ''}-${(formData.variants?.length || 0) + 1}`
        };
        setFormData(prev => ({
            ...prev,
            variants: [...(prev.variants || []), newVariant]
        }));
    };

    const removeVariant = (id: string) => {
        setFormData(prev => ({
            ...prev,
            variants: (prev.variants || []).filter(v => v.id !== id)
        }));
    };

    const updateVariant = (id: string, field: keyof ProductVariant, value: any) => {
        setFormData(prev => ({
            ...prev,
            variants: (prev.variants || []).map(v => v.id === id ? { ...v, [field]: value } : v)
        }));
    };

    const toggleCoupon = (code: string) => {
        setFormData(prev => {
            const codes = prev.couponCodes || [];
            if (codes.includes(code)) {
                return { ...prev, couponCodes: codes.filter(c => c !== code) };
            }
            return { ...prev, couponCodes: [...codes, code] };
        });
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
                <div className="flex gap-4">
                    <button
                        type="submit"
                        form="product-form"
                        disabled={isSubmitting}
                        className="bg-[#221C1D] text-white px-6 py-2.5 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </header>

            <form id="product-form" onSubmit={handleSubmit} className="max-w-5xl">
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

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#221C1D]">Unit Cost (GH₵)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.cost || 0}
                                        onChange={(e) => handleChange('cost', parseFloat(e.target.value))}
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
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#221C1D]">
                                        {formData.variants && formData.variants.length > 0 ? 'Total Stock (Auto)' : 'Initial Stock Level'}
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        disabled={formData.variants && formData.variants.length > 0}
                                        value={formData.variants && formData.variants.length > 0
                                            ? formData.variants.reduce((acc, v) => acc + (v.stock || 0), 0)
                                            : formData.stock}
                                        onChange={(e) => handleChange('stock', parseInt(e.target.value))}
                                        placeholder="0"
                                        className={`w-full bg-[#FDFCFB] border border-stone-100 focus:border-[#F2A600] focus:ring-1 focus:ring-[#F2A600] rounded-lg px-4 py-4 outline-none transition-all placeholder:text-stone-300 ${formData.variants && formData.variants.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="bg-white border border-stone-100 rounded-2xl p-8 space-y-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                            <div className="flex justify-between items-center border-b border-stone-50 pb-4 mb-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em]">Product Variants</h3>
                                <button
                                    type="button"
                                    onClick={addVariant}
                                    className="text-[10px] font-bold uppercase tracking-widest text-[#F2A600] flex items-center gap-1 hover:text-black transition-colors"
                                >
                                    <span className="material-symbols-outlined text-sm">add</span>
                                    Add Variant
                                </button>
                            </div>

                            {formData.variants && formData.variants.length > 0 ? (
                                <div className="space-y-4">
                                    {formData.variants.map((variant) => (
                                        <div key={variant.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-[#FDFCFB] border border-stone-100 rounded-xl relative group">
                                            <div className="md:col-span-1 space-y-1">
                                                <label className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Name</label>
                                                <input
                                                    type="text"
                                                    value={variant.name}
                                                    onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                                                    placeholder="e.g. 50ml"
                                                    className="w-full bg-white border border-stone-100 rounded px-2 py-2 text-xs outline-none focus:border-[#F2A600]"
                                                />
                                            </div>
                                            <div className="md:col-span-1 space-y-1">
                                                <label className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Price</label>
                                                <input
                                                    type="number"
                                                    value={variant.price}
                                                    onChange={(e) => updateVariant(variant.id, 'price', parseFloat(e.target.value))}
                                                    placeholder="0.00"
                                                    className="w-full bg-white border border-stone-100 rounded px-2 py-2 text-xs outline-none focus:border-[#F2A600]"
                                                />
                                            </div>
                                            <div className="md:col-span-1 space-y-1">
                                                <label className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Stock</label>
                                                <input
                                                    type="number"
                                                    value={variant.stock}
                                                    onChange={(e) => updateVariant(variant.id, 'stock', parseInt(e.target.value))}
                                                    placeholder="0"
                                                    className="w-full bg-white border border-stone-100 rounded px-2 py-2 text-xs outline-none focus:border-[#F2A600]"
                                                />
                                            </div>
                                            <div className="md:col-span-1 space-y-1">
                                                <label className="text-[9px] font-bold uppercase tracking-widest text-stone-400">SKU</label>
                                                <input
                                                    type="text"
                                                    value={variant.sku}
                                                    onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                                                    placeholder="SKU"
                                                    className="w-full bg-white border border-stone-100 rounded px-2 py-2 text-xs outline-none focus:border-[#F2A600]"
                                                />
                                            </div>
                                            <div className="flex items-end justify-end pb-1">
                                                <button
                                                    type="button"
                                                    onClick={() => removeVariant(variant.id)}
                                                    className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[10px] text-stone-400 uppercase tracking-widest text-center py-4 bg-[#FDFCFB] border border-dashed border-stone-100 rounded-xl">
                                    No variants defined for this ritual.
                                </p>
                            )}
                        </section>

                        <section className="bg-white border border-stone-100 rounded-2xl p-8 space-y-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] border-b border-stone-50 pb-4 mb-6">Coupon Compatibility</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {availableCoupons.map(coupon => (
                                    <button
                                        key={coupon.id}
                                        type="button"
                                        onClick={() => !coupon.isGlobal && toggleCoupon(coupon.code)}
                                        className={`p-3 rounded-xl border text-left transition-all ${formData.couponCodes?.includes(coupon.code) || coupon.isGlobal
                                            ? 'bg-[#221C1D] text-white border-[#221C1D] shadow-md'
                                            : 'bg-[#FDFCFB] text-[#221C1D] border-stone-100 hover:border-[#F2A600]'
                                            } ${coupon.isGlobal ? 'cursor-default ring-1 ring-gold/20' : ''}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <p className="text-[10px] font-black uppercase tracking-widest">{coupon.code}</p>
                                            {coupon.isGlobal && (
                                                <span className="material-symbols-outlined text-[10px] text-gold">public</span>
                                            )}
                                        </div>
                                        <p className={`text-[8px] uppercase tracking-tighter mt-1 ${formData.couponCodes?.includes(coupon.code) || coupon.isGlobal ? 'text-stone-300' : 'text-stone-400'}`}>
                                            {coupon.type === 'percentage' ? `${coupon.value}% Off` : `GH₵${coupon.value} Off`}
                                        </p>
                                        {coupon.isGlobal && (
                                            <p className="text-[7px] font-bold uppercase tracking-tighter text-gold/60 mt-0.5 italic">Global Ritual</p>
                                        )}
                                    </button>
                                ))}
                                {availableCoupons.length === 0 && (
                                    <p className="col-span-full text-[10px] text-stone-400 uppercase text-center py-4">No coupons available to link.</p>
                                )}
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
                                                    } `}
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
                                                    } `}
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

                            <div className="space-y-6">
                                {/* Featured Image */}
                                <div className="space-y-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Featured Image</p>
                                    <label className="aspect-[4/5] bg-[#FDFCFB] border-2 border-dashed border-stone-100 rounded-xl flex flex-col items-center justify-center text-center p-6 group hover:border-[#F2A600]/30 transition-all cursor-pointer relative overflow-hidden">
                                        {formData.image && formData.image !== '/products/placeholder.jpg' ? (
                                            <img src={formData.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-4xl text-stone-200 mb-2 group-hover:text-[#F2A600]/30 relative z-10">image</span>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 group-hover:text-[#221C1D] relative z-10">Upload Featured</p>
                                            </>
                                        )}
                                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, false)} className="hidden" />
                                    </label>
                                </div>

                                {/* Gallery */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Ritual Gallery</p>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#F2A600] cursor-pointer hover:text-black transition-colors">
                                            Add Images
                                            <input type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(e, true)} className="hidden" />
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        {formData.images?.map((url, idx) => (
                                            <div key={idx} className="aspect-square bg-[#FDFCFB] border border-stone-100 rounded-lg relative group overflow-hidden">
                                                <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <button type="button" onClick={() => setAsFeaturedImage(url)} title="Set as featured" className="p-1.5 bg-white rounded-full text-[#221C1D] hover:bg-[#F2A600]">
                                                        <span className="material-symbols-outlined text-sm">star</span>
                                                    </button>
                                                    <button type="button" onClick={() => removeGalleryImage(idx)} title="Remove" className="p-1.5 bg-white rounded-full text-red-500 hover:bg-black">
                                                        <span className="material-symbols-outlined text-sm">delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {[...Array(Math.max(0, 3 - (formData.images?.length || 0)))].map((_, i) => (
                                            <div key={i} className="aspect-square bg-[#FDFCFB] border border-dashed border-stone-100 rounded-lg flex items-center justify-center">
                                                <span className="material-symbols-outlined text-stone-200 text-lg">image</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Video Support */}
                                <div className="space-y-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Cinematic Reveal (Video)</p>
                                    <div className="space-y-3">
                                        <label className="w-full h-12 bg-[#FDFCFB] border border-dashed border-stone-100 rounded-lg flex items-center justify-center gap-2 cursor-pointer hover:bg-stone-50 transition-colors">
                                            <span className="material-symbols-outlined text-stone-400 text-sm">videocam</span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                                                {formData.videoUrl ? 'Change Video' : 'Upload Ritual Video'}
                                            </span>
                                            <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.videoUrl}
                                            onChange={(e) => handleChange('videoUrl', e.target.value)}
                                            placeholder="Or Paste Video URL (Vimeo/YouTube)"
                                            className="w-full bg-[#FDFCFB] border border-stone-100 rounded-lg px-3 py-2 text-[10px] outline-none focus:border-[#F2A600]"
                                        />
                                    </div>
                                    {formData.videoUrl && (
                                        <div className="aspect-video bg-black rounded-xl overflow-hidden mt-2">
                                            <video src={formData.videoUrl} controls className="w-full h-full object-cover" />
                                        </div>
                                    )}
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
                                    <>{id ? 'Save Product Changes' : 'Establish Formulation'}</>
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
        </AdminLayout >
    );
};

export default AddProduct;

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import { db } from '../../firebaseConfig';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useNotification } from '../../context/NotificationContext';
import { Coupon } from '../../types';

const Coupons: React.FC = () => {
    const { showNotification } = useNotification();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<Coupon>>({
        code: '',
        type: 'percentage',
        value: 0,
        minOrderAmount: 0,
        usageLimit: 100,
        status: 'active',
        isGlobal: true
    });

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'coupons'), {
            next: (snap) => {
                const data: Coupon[] = [];
                snap.forEach(doc => {
                    data.push({ ...doc.data(), id: doc.id } as Coupon);
                });
                setCoupons(data);
                setLoading(false);
            },
            error: (error) => {
                console.error("Coupons onSnapshot error:", error);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleOpenModal = () => {
        setFormData({
            code: '',
            type: 'percentage',
            value: 0,
            minOrderAmount: 0,
            usageLimit: 100,
            status: 'active',
            expirationDate: '',
            isGlobal: true
        });
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (!formData.code || !formData.value) throw new Error('Code and Value are required');
            const code = formData.code.toUpperCase().replace(/\s/g, '');

            const newCoupon: Coupon = {
                id: code,
                code: code,
                type: formData.type || 'percentage',
                value: Number(formData.value),
                minOrderAmount: Number(formData.minOrderAmount) || 0,
                usageLimit: Number(formData.usageLimit) || 0,
                usedCount: 0,
                status: formData.status || 'active',
                expirationDate: formData.expirationDate || undefined,
                isGlobal: formData.isGlobal ?? true
            };

            await setDoc(doc(db, 'coupons', code), newCoupon); // Use code as ID for easy lookup
            showNotification('Coupon saved successfully', 'success');
            setIsModalOpen(false);
        } catch (error: any) {
            console.error(error);
            showNotification(error.message || 'Failed to save coupon', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!globalThis.confirm('Delete this coupon?')) return;
        try {
            await deleteDoc(doc(db, 'coupons', id));
            showNotification('Coupon deleted', 'success');
        } catch (e) {
            showNotification('Failed to delete', 'error');
        }
    };

    const toggleStatus = async (coupon: Coupon) => {
        try {
            const newStatus = coupon.status === 'active' ? 'disabled' : 'active';
            await setDoc(doc(db, 'coupons', coupon.id), { status: newStatus }, { merge: true });
            showNotification(`Coupon ${newStatus}`, 'success');
        } catch (e) {
            showNotification('Failed to update status', 'error');
        }
    };

    return (
        <AdminLayout>
            <div className="flex flex-col gap-10">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-[#221C1D] mb-2">Coupons & Offers</h2>
                        <p className="text-stone-500 text-sm">Manage discount codes and promotions.</p>
                    </div>
                    <button
                        onClick={handleOpenModal}
                        className="bg-[#221C1D] text-white px-6 py-3 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        New Coupon
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coupons.map(coupon => (
                        <div key={coupon.id} className="bg-white border border-stone-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                            <div className={`absolute top-0 left-0 w-1 h-full ${coupon.status === 'active' ? 'bg-[#F2A600]' : 'bg-stone-200'}`}></div>

                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-widest text-[#221C1D]">{coupon.code}</h3>
                                    <p className="text-xs text-stone-500 font-bold uppercase tracking-wider mt-1">
                                        {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `GH₵${coupon.value} OFF`}
                                    </p>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => toggleStatus(coupon)}
                                        className="p-2 bg-stone-50 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600"
                                        title={coupon.status === 'active' ? 'Disable' : 'Enable'}
                                    >
                                        <span className="material-symbols-outlined text-lg">
                                            {coupon.status === 'active' ? 'unpublished' : 'check_circle'}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(coupon.id)}
                                        className="p-2 bg-red-50 rounded-full hover:bg-red-100 text-red-400 hover:text-red-600"
                                    >
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                </div>
                            </div>

                            {coupon.isGlobal && (
                                <div className="mb-3">
                                    <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-[8px] font-black uppercase tracking-tighter rounded border border-purple-100 italic">Global Ritual</span>
                                </div>
                            )}

                            <div className="space-y-2 pt-4 border-t border-stone-50">
                                <div className="flex justify-between text-[10px] uppercase font-bold text-stone-400">
                                    <span>Usage</span>
                                    <span>{coupon.usedCount} / {coupon.usageLimit || '∞'}</span>
                                </div>
                                <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className="bg-[#221C1D] h-full rounded-full"
                                        style={{ width: `${Math.min(((coupon.usedCount || 0) / (coupon.usageLimit || 1)) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                {coupon.minOrderAmount ? (
                                    <p className="text-[10px] text-stone-400 mt-2">Min. Order: GH₵{coupon.minOrderAmount}</p>
                                ) : null}
                                {coupon.expirationDate && (
                                    <p className="text-[10px] text-stone-400">Expires: {new Date(coupon.expirationDate).toLocaleDateString()}</p>
                                )}
                            </div>
                        </div>
                    ))}

                    {coupons.length === 0 && !loading && (
                        <div className="col-span-full py-12 text-center border-2 border-dashed border-stone-100 rounded-xl">
                            <p className="text-stone-300 font-bold uppercase tracking-widest text-xs">No active coupons</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                            <h3 className="font-display text-xl text-[#221C1D]">Create Discount</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-8 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1">Coupon Code</label>
                                <input
                                    required
                                    className="w-full bg-stone-50 border border-stone-200 rounded px-4 py-3 text-sm focus:border-black focus:ring-0 outline-none transition-colors uppercase font-bold tracking-widest"
                                    placeholder="e.g. SUMMER20"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1">Type</label>
                                    <select
                                        className="w-full bg-stone-50 border border-stone-200 rounded px-4 py-3 text-sm focus:border-black focus:ring-0 outline-none transition-colors"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (GH₵)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1">Value</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full bg-stone-50 border border-stone-200 rounded px-4 py-3 text-sm focus:border-black focus:ring-0 outline-none transition-colors"
                                        placeholder="0"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1">Min Order (GH₵)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-stone-50 border border-stone-200 rounded px-4 py-3 text-sm focus:border-black focus:ring-0 outline-none transition-colors"
                                        value={formData.minOrderAmount}
                                        onChange={(e) => setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1">Usage Limit</label>
                                    <input
                                        type="number"
                                        className="w-full bg-stone-50 border border-stone-200 rounded px-4 py-3 text-sm focus:border-black focus:ring-0 outline-none transition-colors"
                                        value={formData.usageLimit}
                                        onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1">Expiration Date (Optional)</label>
                                <input
                                    type="date"
                                    className="w-full bg-stone-50 border border-stone-200 rounded px-4 py-3 text-sm focus:border-black focus:ring-0 outline-none transition-colors"
                                    value={formData.expirationDate || ''}
                                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                                />
                            </div>

                            <label className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl border border-stone-100 cursor-pointer group hover:bg-white transition-all">
                                <input
                                    type="checkbox"
                                    checked={formData.isGlobal}
                                    onChange={(e) => setFormData({ ...formData, isGlobal: e.target.checked })}
                                    className="w-4 h-4 rounded text-[#221C1D] shadow-inner"
                                />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#221C1D]">Global Coupon</p>
                                    <p className="text-[9px] text-stone-400 font-bold uppercase tracking-tighter italic">Valid for all products in the catalog</p>
                                </div>
                            </label>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 rounded-lg text-stone-500 font-bold text-xs uppercase tracking-wider hover:bg-stone-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2.5 rounded-lg bg-[#221C1D] text-white font-bold text-xs uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-50"
                                >
                                    {submitting ? 'Creating...' : 'Create Coupon'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default Coupons;

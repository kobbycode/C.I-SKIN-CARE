import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { useOrders } from '../context/OrderContext';
import { useNotification } from '../context/NotificationContext';
import { useState } from 'react';
import { db } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

const REWARDS = [
    { id: 'rev_20', title: 'GH₵20 Ritual Credit', points: 500, value: 20, type: 'fixed' },
    { id: 'rev_50', title: 'GH₵50 Ritual Credit', points: 1000, value: 50, type: 'fixed' },
    { id: 'rev_120', title: 'GH₵120 Ritual Credit', points: 2000, value: 120, type: 'fixed' },
];

const LoyaltyPortal: React.FC = () => {
    const { currentUser, loading, updateProfile } = useUser();
    const { orders } = useOrders();
    const { showNotification } = useNotification();
    const [isRedeeming, setIsRedeeming] = useState<string | null>(null);
    const [generatedCode, setGeneratedCode] = useState<{ id: string, code: string } | null>(null);

    if (loading || !currentUser) return null;

    const userOrderHistory = orders.filter(o => o.customerEmail === currentUser.email);
    const pointsFromOrder = (total: number, status: string) => {
        if (status !== 'Delivered') return 0;
        return Math.round(total);
    };
    const userLoyalty = {
        points: currentUser.points || 0,
        tier: currentUser.pointsTier || 'Bronze',
        nextTier: currentUser.pointsTier === 'Gold Ritual' ? 'Platinum Ritual' : 'Icon',
        pointsToNext: currentUser.pointsToNextTier || 100,
        history: userOrderHistory.map((o) => ({
            id: o.id,
            action: `Order #${o.id.slice(-6).toUpperCase()}`,
            points: pointsFromOrder(o.total, o.status),
            date: o.date
        })).filter(h => h.points > 0)
    };

    const handleRedeem = async (reward: typeof REWARDS[0]) => {
        if (userLoyalty.points < reward.points) {
            showNotification('Insufficient points for this ritual', 'error');
            return;
        }

        try {
            setIsRedeeming(reward.id);
            const code = `LOYAL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

            // 1. Create Coupon in Firestore
            await setDoc(doc(db, 'coupons', code), {
                id: code,
                code,
                type: 'fixed',
                value: reward.value,
                minOrderAmount: reward.value * 2,
                status: 'active',
                usageLimit: 1,
                usedCount: 0,
                isGlobal: true,
                description: `Loyalty Reward: ${reward.title}`
            });

            // 2. Deduct points from user
            await updateProfile({
                points: userLoyalty.points - reward.points
            });

            setGeneratedCode({ id: reward.id, code });
            showNotification(`Ritual Reward Unlocked: ${code}`, 'success');
        } catch (error) {
            console.error(error);
            showNotification('Redemption failed', 'error');
        } finally {
            setIsRedeeming(null);
        }
    };

    const progress = (userLoyalty.points / (userLoyalty.points + userLoyalty.pointsToNext)) * 100;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Overview Card */}
            <div className="bg-luxury-brown p-8 md:p-12 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div>
                        <span className="text-[10px] uppercase tracking-[0.4em] text-gold mb-3 block font-black">Le Cercle Status</span>
                        <h2 className="font-display text-4xl md:text-5xl mb-2">{userLoyalty.tier}</h2>
                        <p className="text-stone-400 text-sm font-light uppercase tracking-widest">Mastering the Art of Radiance</p>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-gold mb-1 block font-black">Total Ritual Points</span>
                        <div className="text-5xl font-display text-white">{userLoyalty.points}</div>
                    </div>
                </div>

                {/* Progress Tracker */}
                <div className="mt-12 relative z-10">
                    <div className="flex justify-between items-center mb-4 text-[10px] uppercase tracking-widest font-bold">
                        <span className="text-gold">Next Tier: {userLoyalty.nextTier}</span>
                        <span className="text-stone-400">{userLoyalty.pointsToNext} PTS to go</span>
                    </div>
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                        />
                    </div>
                </div>

                {/* Decorative Watermark */}
                <div className="absolute -right-20 -bottom-20 opacity-5 pointer-events-none">
                    <img src="/logo.jpg" alt="" className="h-80 grayscale" />
                </div>
            </div>

            {/* Redeem Rewards Catalog */}
            <section className="bg-white dark:bg-stone-900 border border-primary/10 p-8 rounded-[2rem]">
                <h3 className="font-display text-xl mb-8 text-secondary dark:text-white uppercase tracking-widest">Ritual Redemptions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {REWARDS.map((reward) => (
                        <div key={reward.id} className="relative p-6 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col items-center text-center group hover:bg-white dark:hover:bg-stone-800 transition-all duration-500 hover:shadow-xl">
                            <span className="material-symbols-outlined text-3xl text-gold mb-4 group-hover:scale-110 transition-transform">confirmation_number</span>
                            <h4 className="font-bold text-sm text-secondary dark:text-white mb-2 uppercase tracking-wide">{reward.title}</h4>
                            <p className="text-[10px] text-stone-400 uppercase tracking-widest mb-6 font-bold">{reward.points} Points required</p>

                            {generatedCode?.id === reward.id ? (
                                <div className="w-full">
                                    <div className="bg-gold/10 border border-gold/20 p-3 rounded-lg mb-4 flex flex-col items-center">
                                        <p className="text-[8px] uppercase font-black text-gold mb-1">Your Code Unlocked</p>
                                        <code className="text-lg font-black text-secondary dark:text-white tracking-widest">{generatedCode.code}</code>
                                    </div>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(generatedCode.code);
                                            showNotification('Code copied to clipboard', 'success');
                                        }}
                                        className="w-full py-2 bg-[#221C1D] text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-black transition-colors"
                                    >
                                        Copy Code
                                    </button>
                                </div>
                            ) : (
                                <button
                                    disabled={userLoyalty.points < reward.points || isRedeeming !== null}
                                    onClick={() => handleRedeem(reward)}
                                    className={`w-full py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${userLoyalty.points >= reward.points
                                        ? 'bg-[#221C1D] text-white hover:bg-black shadow-lg hover:shadow-black/20'
                                        : 'bg-stone-100 dark:bg-stone-800 text-stone-300 pointer-events-none'
                                        }`}
                                >
                                    {isRedeeming === reward.id ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Unlocking...
                                        </div>
                                    ) : userLoyalty.points >= reward.points ? 'Redeem Ritual' : 'Insufficient Points'}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Grid: Benefits & History */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Tier Benefits */}
                <div className="bg-white dark:bg-stone-900 p-8 rounded-[2rem] border border-primary/5 shadow-sm">
                    <h3 className="font-display text-xl mb-6 text-primary flex items-center gap-3 uppercase tracking-widest">
                        <span className="material-symbols-outlined font-light">verified</span>
                        Status Perks
                    </h3>
                    <ul className="space-y-4">
                        {[
                            "Complimentary Priority Shipping",
                            "Exclusive Access to Private Sales",
                            "Double Points on Birthday Month",
                            "Early Ritual Releases"
                        ].map((perf, i) => (
                            <li key={i} className="flex items-center gap-4 text-sm text-stone-600 dark:text-stone-400 font-light italic">
                                <span className="w-1.5 h-1.5 rounded-full bg-gold/40 shadow-[0_0_5px_rgba(212,175,55,0.3)]" />
                                {perf}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* History */}
                <div className="bg-white dark:bg-stone-900 p-8 rounded-[2rem] border border-primary/5 shadow-sm">
                    <h3 className="font-display text-xl mb-6 text-primary flex items-center gap-3 uppercase tracking-widest">
                        <span className="material-symbols-outlined font-light">history</span>
                        Points Archive
                    </h3>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4 scrollbar-hide">
                        {userLoyalty.history.length > 0 ? userLoyalty.history.map((item) => (
                            <div key={item.id} className="flex justify-between items-center py-4 border-b border-stone-50 dark:border-stone-800 last:border-0">
                                <div className="min-w-0 pr-4">
                                    <p className="text-[10px] font-black text-secondary dark:text-white uppercase tracking-widest truncate">{item.action}</p>
                                    <p className="text-[9px] text-stone-400 uppercase tracking-tighter opacity-60 font-bold">{item.date}</p>
                                </div>
                                <div className="text-gold font-black text-sm shrink-0">+{item.points}</div>
                            </div>
                        )) : (
                            <div className="h-40 flex items-center justify-center text-[10px] uppercase font-bold text-stone-300 italic border-2 border-dashed border-stone-100 rounded-2xl">
                                No point rituals recorded
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoyaltyPortal;

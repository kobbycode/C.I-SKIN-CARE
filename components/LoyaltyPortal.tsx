import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { useOrders } from '../context/OrderContext';


const LoyaltyPortal: React.FC = () => {
    const { currentUser, loading } = useUser();
    const { orders } = useOrders();

    if (loading || !currentUser) return null;

    const userOrderHistory = orders.filter(o => o.customerEmail === currentUser.email);
    const pointsFromOrder = (total: number, status: string) => {
        if (status !== 'Delivered') return 0;
        return Math.round(total);
    };
    const userLoyalty = {
        points: currentUser.points,
        tier: currentUser.pointsTier,
        nextTier: currentUser.pointsTier === 'Gold Ritual' ? 'Platinum Ritual' : 'Icon',
        pointsToNext: currentUser.pointsToNextTier,
        history: userOrderHistory.map((o) => ({
            id: o.id,
            action: `Order #${o.id.slice(-6).toUpperCase()}`,
            points: pointsFromOrder(o.total, o.status),
            date: o.date
        })).filter(h => h.points > 0)
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

            {/* Grid: Benefits & History */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Tier Benefits */}
                <div className="bg-white dark:bg-stone-900 p-8 rounded-[2rem] border border-primary/5 shadow-sm">
                    <h3 className="font-display text-xl mb-6 text-primary flex items-center gap-3">
                        <span className="material-symbols-outlined font-light">verified</span>
                        Current Muse Perks
                    </h3>
                    <ul className="space-y-4">
                        {[
                            "Complimentary Priority Shipping",
                            "Exclusive Access to Private Sales",
                            "Double Points on Birthday Month",
                            "Early Ritual Releases"
                        ].map((perf, i) => (
                            <li key={i} className="flex items-center gap-4 text-sm text-stone-600 dark:text-stone-400 font-light">
                                <span className="w-1.5 h-1.5 rounded-full bg-gold/40 shadow-[0_0_5px_rgba(212,175,55,0.3)]" />
                                {perf}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* History */}
                <div className="bg-white dark:bg-stone-900 p-8 rounded-[2rem] border border-primary/5 shadow-sm">
                    <h3 className="font-display text-xl mb-6 text-primary flex items-center gap-3">
                        <span className="material-symbols-outlined font-light">history</span>
                        Points History
                    </h3>
                    <div className="space-y-4">
                        {userLoyalty.history.map((item) => (
                            <div key={item.id} className="flex justify-between items-center py-3 border-b border-stone-50 dark:border-stone-800 last:border-0">
                                <div>
                                    <p className="text-sm font-bold text-secondary dark:text-white uppercase tracking-wider">{item.action}</p>
                                    <p className="text-[10px] text-stone-400 uppercase tracking-widest">{item.date}</p>
                                </div>
                                <div className="text-gold font-bold text-sm">+{item.points}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoyaltyPortal;

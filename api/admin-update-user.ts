import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminAuth, getAdminFirestore, requireSuperAdmin } from './_firebaseAdmin.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        await requireSuperAdmin(req);

        const { uid, email, password, fullName, username } = (req.body || {}) as any;
        if (!uid) {
            return res.status(400).json({ error: 'Missing uid' });
        }

        const auth = getAdminAuth();
        const db = getAdminFirestore();

        // 1. Update Auth Profile
        const authUpdates: any = {};
        if (email) authUpdates.email = email;
        if (password) authUpdates.password = password;
        if (fullName) authUpdates.displayName = fullName;

        if (Object.keys(authUpdates).length > 0) {
            await auth.updateUser(uid, authUpdates);
        }

        // 2. Update Firestore Profile
        const dbUpdates: any = {};
        if (email) dbUpdates.email = email;
        if (fullName) dbUpdates.fullName = fullName;
        if (username) dbUpdates.username = username;

        if (Object.keys(dbUpdates).length > 0) {
            await db.collection('users').doc(uid).set(dbUpdates, { merge: true });
        }

        return res.status(200).json({ success: true, uid });
    } catch (e: any) {
        console.error('[admin-update-user] Error:', e);
        return res.status(500).json({
            error: e?.message || 'Server error',
            detail: e.toString()
        });
    }
}

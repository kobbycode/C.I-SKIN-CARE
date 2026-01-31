import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminAuth, getAdminFirestore, requireSuperAdmin } from './_firebaseAdmin.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        await requireSuperAdmin(req);
        const { uid } = (req.body || {}) as any;
        if (!uid) return res.status(400).json({ error: 'Missing uid' });

        // Delete from Firebase Auth (ignore if already gone)
        const auth = getAdminAuth();
        try {
            await auth.deleteUser(uid);
        } catch (authError: any) {
            console.warn(`[admin-delete-user] Auth user ${uid} not found or already deleted:`, authError.message);
        }

        // Always delete from Firestore to prevent "ghost" records
        const db = getAdminFirestore();
        await db.collection('users').doc(uid).delete();

        return res.status(200).json({ ok: true });
    } catch (e: any) {
        console.error('[admin-delete-user] Error:', e);
        return res.status(400).json({ error: e?.message || 'Failed' });
    }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminAuth, getAdminFirestore, requireAdmin } from './_firebaseAdmin.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await requireAdmin(req);

    const { email, password, fullName, username, role } = (req.body || {}) as any;
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const normalizedRole = (role || 'manager') as 'super-admin' | 'admin' | 'manager' | 'editor';
    if (!['super-admin', 'admin', 'manager', 'editor'].includes(normalizedRole)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const auth = getAdminAuth();
    const created = await auth.createUser({
      email,
      password,
      displayName: fullName,
    });

    const db = getAdminFirestore();
    await db.collection('users').doc(created.uid).set(
      {
        id: created.uid,
        email,
        fullName,
        username: (username || email.split('@')[0]).toLowerCase(),
        role: normalizedRole,
        statusLabel: normalizedRole === 'super-admin' ? 'Super Admin' : normalizedRole === 'admin' ? 'Admin' : 'Staff',
        joinedDate: new Date().toISOString(),
        points: 0,
        pointsTier: 'Bronze',
        pointsToNextTier: 100,
        skinType: 'Unknown',
        skinTypeDetail: '',
        focusRitual: 'None',
        focusRitualDetail: '',
        avatar: '',
      },
      { merge: true }
    );

    return res.status(200).json({ uid: created.uid });
  } catch (e: any) {
    console.error('[admin-create-user] Error:', e);
    return res.status(500).json({
      error: e?.message || 'Server error',
      detail: e.toString()
    });
  }
}

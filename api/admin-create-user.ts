import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminAuth, getAdminFirestore, requireAdmin } from './_firebaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[admin-create-user] Request starting...');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    console.log('[admin-create-user] Verifying admin status...');
    await requireAdmin(req);
    console.log('[admin-create-user] Admin verified.');

    const { email, password, fullName, username, role } = (req.body || {}) as any;
    if (!email || !password || !fullName) {
      console.warn('[admin-create-user] Missing required fields');
      return res.status(400).json({ error: 'Missing fields' });
    }

    const normalizedRole = (role || 'manager') as 'admin' | 'manager' | 'editor';
    if (!['admin', 'manager', 'editor'].includes(normalizedRole)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const auth = getAdminAuth();
    console.log('[admin-create-user] Creating user in Auth...');
    const created = await auth.createUser({
      email,
      password,
      displayName: fullName,
    });
    console.log('[admin-create-user] User created in Auth. UID:', created.uid);

    const db = getAdminFirestore();
    console.log('[admin-create-user] Creating user profile in Firestore...');
    await db.collection('users').doc(created.uid).set(
      {
        id: created.uid,
        email,
        fullName,
        username: (username || email.split('@')[0]).toLowerCase(),
        role: normalizedRole,
        statusLabel: normalizedRole === 'admin' ? 'Admin' : 'Staff',
        joinedDate: new Date().toISOString(),
        // Customer fields defaults
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
    console.log('[admin-create-user] Profile created.');

    return res.status(200).json({ uid: created.uid });
  } catch (e: any) {
    console.error('[admin-create-user] Fatal Error:', e);
    return res.status(500).json({
      error: e?.message || 'Server error',
      detail: e.toString(),
      stack: e.stack
    });
  }
}


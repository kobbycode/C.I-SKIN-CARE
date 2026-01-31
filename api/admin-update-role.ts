import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminFirestore, requireAdmin } from './_firebaseAdmin.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await requireAdmin(req);
    const { uid, role } = (req.body || {}) as any;
    if (!uid || !role) return res.status(400).json({ error: 'Missing fields' });
    if (!['customer', 'super-admin', 'admin', 'manager', 'editor'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const db = getAdminFirestore();
    await db.collection('users').doc(uid).set(
      {
        role,
        statusLabel: role === 'super-admin' ? 'Super Admin' : role === 'admin' ? 'Admin' : role === 'customer' ? 'Member' : 'Staff',
      },
      { merge: true }
    );

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(400).json({ error: e?.message || 'Failed' });
  }
}


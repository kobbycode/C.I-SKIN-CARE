import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminAuth, getAdminFirestore } from './_firebaseAdmin.js';

/**
 * One-time bootstrap endpoint to create the first admin.
 *
 * Protect with env: BOOTSTRAP_SECRET
 * Call with header: x-bootstrap-secret: <BOOTSTRAP_SECRET>
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const secret = process.env.BOOTSTRAP_SECRET;
    const provided = (req.headers['x-bootstrap-secret'] as string) || '';
    if (!secret || provided !== secret) return res.status(403).json({ error: 'Forbidden' });

    // Desired bootstrap credentials
    const email = 'admin@theciskincare.com';
    const password = 'admin123';
    const username = 'admin';
    const fullName = 'Admin';

    const auth = getAdminAuth();
    let user;
    try {
      user = await auth.getUserByEmail(email);
      // Ensure password is set to the bootstrap password (so you can log in)
      await auth.updateUser(user.uid, { password, displayName: fullName });
    } catch {
      user = await auth.createUser({ email, password, displayName: fullName });
    }

    const db = getAdminFirestore();
    await db.collection('users').doc(user.uid).set(
      {
        id: user.uid,
        email,
        fullName,
        username,
        role: 'admin',
        statusLabel: 'Admin',
        joinedDate: new Date().toISOString(),
        // Defaults
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

    return res.status(200).json({
      ok: true,
      uid: user.uid,
      email,
      username,
      password,
      adminLoginUrl: '/admin/login',
    });
  } catch (e: any) {
    return res.status(400).json({ error: e?.message || 'Failed' });
  }
}


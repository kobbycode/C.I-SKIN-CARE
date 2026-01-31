import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    const cleaned = raw.trim().replace(/^['"]|['"]$/g, '');
    const sa = JSON.parse(cleaned);
    if (sa.private_key) sa.private_key = sa.private_key.replace(/\\n/g, '\n');
    return sa;
  } catch (e) {
    return null;
  }
}

export function getAdminApp() {
  const apps = getApps();
  if (apps.length > 0) return apps[0];

  const sa = getServiceAccount();
  if (!sa) throw new Error('Invalid Service Account JSON');

  return initializeApp({
    credential: cert(sa)
  });
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminFirestore() {
  return getFirestore(getAdminApp());
}

export async function requireAdmin(req: any) {
  const authHeader = (req.headers?.authorization || req.headers?.Authorization || '') as string;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) throw new Error('Unauthorized: Missing token');

  const token = match[1];
  const decoded = await getAdminAuth().verifyIdToken(token);
  const uid = decoded.uid;

  const db = getAdminFirestore();
  const snap = await db.collection('users').doc(uid).get();

  if (!snap.exists) {
    console.warn(`[requireAdmin] User ${uid} not found in Firestore`);
    throw new Error('Forbidden: User record missing');
  }

  const role = snap.data()?.role || 'customer';
  if (role !== 'admin' && role !== 'super-admin') {
    console.warn(`[requireAdmin] User ${uid} has role ${role}, not admin/super-admin`);
    throw new Error('Forbidden: Admin access required');
  }

  return { uid };
}

export async function requireAuth(req: any) {
  const authHeader = (req.headers?.authorization || req.headers?.Authorization || '') as string;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) throw new Error('Unauthorized: Missing token');

  const token = match[1];
  const decoded = await getAdminAuth().verifyIdToken(token);
  return {
    uid: decoded.uid,
    email: decoded.email,
  };
}

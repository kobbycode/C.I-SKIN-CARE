import admin from 'firebase-admin';

function parseServiceAccount() {
  let raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;

  raw = raw.trim();
  if ((raw.startsWith("'") && raw.endsWith("'")) || (raw.startsWith('"') && raw.endsWith('"'))) {
    raw = raw.slice(1, -1);
  }

  try {
    return JSON.parse(raw);
  } catch {
    // Support escaped JSON in env vars
    return JSON.parse(raw.replace(/\\n/g, '\n'));
  }
}

export function getAdminApp() {
  if (admin.apps.length) return admin.app();
  const sa = parseServiceAccount();
  if (!sa) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_JSON');
  }
  return admin.initializeApp({
    credential: admin.credential.cert(sa),
  });
}

export function getAdminFirestore() {
  return getAdminApp().firestore();
}

export function getAdminAuth() {
  return getAdminApp().auth();
}

export async function requireAuth(req: any): Promise<{ uid: string; email?: string }> {
  const authHeader = (req.headers?.authorization || req.headers?.Authorization || '') as string;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) throw new Error('Missing Authorization bearer token');

  const token = match[1];
  const decoded = await getAdminAuth().verifyIdToken(token);
  return { uid: decoded.uid, email: decoded.email };
}

export async function requireAdmin(req: any): Promise<{ uid: string }> {
  const authHeader = (req.headers?.authorization || req.headers?.Authorization || '') as string;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) throw new Error('Missing Authorization bearer token');

  const token = match[1];
  const decoded = await getAdminAuth().verifyIdToken(token);
  const uid = decoded.uid;

  const db = getAdminFirestore();
  const snap = await db.collection('users').doc(uid).get();
  const role = (snap.exists ? (snap.data() as any).role : undefined) || 'customer';
  if (role !== 'admin') throw new Error('Forbidden');

  return { uid };
}


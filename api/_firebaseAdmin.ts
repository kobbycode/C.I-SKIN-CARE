import admin from 'firebase-admin';

function getServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    // Basic cleanup of surrounding quotes
    const cleaned = raw.trim().replace(/^['"]|['"]$/g, '');
    return JSON.parse(cleaned);
  } catch (e) {
    // If that fails, try replacing escaped newlines
    const fixed = raw.trim().replace(/^['"]|['"]$/g, '').replace(/\\n/g, '\n');
    return JSON.parse(fixed);
  }
}

export function getAdminApp(): admin.app.App {
  if (admin.apps.length) return admin.apps[0]!;

  const sa = getServiceAccount();
  if (!sa) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is missing');

  return admin.initializeApp({
    credential: admin.credential.cert(sa)
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
  if (!match) throw new Error('Missing token');

  const token = match[1];
  const decoded = await getAdminAuth().verifyIdToken(token);
  return { uid: decoded.uid, email: decoded.email };
}

export async function requireAdmin(req: any): Promise<{ uid: string }> {
  const authHeader = (req.headers?.authorization || req.headers?.Authorization || '') as string;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) throw new Error('Missing token');

  const token = match[1];
  const decoded = await getAdminAuth().verifyIdToken(token);
  const uid = decoded.uid;

  const db = getAdminFirestore();
  const snap = await db.collection('users').doc(uid).get();
  const role = snap.exists ? (snap.data() as any).role : 'customer';

  if (role !== 'admin') throw new Error('Forbidden');

  return { uid };
}

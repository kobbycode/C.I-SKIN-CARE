import admin from 'firebase-admin';

function parseServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    console.error('[firebaseAdmin] FIREBASE_SERVICE_ACCOUNT_JSON is missing');
    return null;
  }

  let sa: any;
  try {
    // Try direct parse first
    sa = JSON.parse(raw.trim().replace(/^['"]|['"]$/g, ''));
    console.log('[firebaseAdmin] JSON parsed successfully');
  } catch (e: any) {
    console.warn('[firebaseAdmin] Standard JSON parse failed, trying substitution', e.message);
    try {
      // Handle escaped newlines
      const fixed = raw.trim()
        .replace(/^['"]|['"]$/g, '')
        .replace(/\\\\n/g, '\\n')
        .replace(/\\n/g, '\n');
      sa = JSON.parse(fixed);
      console.log('[firebaseAdmin] JSON parsed with fixed newlines');
    } catch (e2: any) {
      console.error('[firebaseAdmin] Failed to parse SA JSON:', e2.message);
      return null;
    }
  }

  // Final check on private key
  if (sa && sa.private_key) {
    sa.private_key = sa.private_key.replace(/\\n/g, '\n');
  }

  return sa;
}

export function getAdminApp(): admin.app.App {
  if (admin.apps.length) {
    return admin.apps[0]!;
  }

  console.log('[firebaseAdmin] Creating new instance...');
  const sa = parseServiceAccount();
  if (!sa) {
    throw new Error('Service Account configuration is invalid or missing');
  }

  try {
    console.log('[firebaseAdmin] Creating credential...');
    const credential = admin.credential.cert(sa);
    console.log('[firebaseAdmin] Credential created. Initializing app...');
    return admin.initializeApp({
      credential
    });
  } catch (e: any) {
    console.error('[firebaseAdmin] CRITICAL INIT ERROR:', e.message);
    throw e;
  }
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

  if (role !== 'admin') {
    console.warn(`[requireAdmin] Access Denied: User ${uid} has role ${role}`);
    throw new Error('Forbidden');
  }

  return { uid };
}

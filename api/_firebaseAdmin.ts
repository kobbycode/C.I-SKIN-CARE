import admin from 'firebase-admin';

// Modular imports can sometimes fail in certain bundler configs, switching to standard for stability
const { initializeApp, cert, getApps } = admin.app ? {
  initializeApp: admin.initializeApp,
  cert: admin.credential.cert,
  getApps: () => admin.apps
} : require('firebase-admin/app');

function parseServiceAccount() {
  let raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    console.error('[firebaseAdmin] FIREBASE_SERVICE_ACCOUNT_JSON is not set');
    return null;
  }

  raw = raw.trim();
  console.log('[firebaseAdmin] Parsing Service Account, length:', raw.length);

  if ((raw.startsWith("'") && raw.endsWith("'")) || (raw.startsWith('"') && raw.endsWith('"'))) {
    console.log('[firebaseAdmin] Removing surrounding quotes from SA JSON');
    raw = raw.slice(1, -1);
  }

  let sa: any;
  try {
    sa = JSON.parse(raw);
  } catch (e: any) {
    console.warn('[firebaseAdmin] Initial JSON parse failed, trying escaped newline replacement');
    try {
      const processed = raw.replace(/\\\\n/g, '\\n').replace(/\\n/g, '\n');
      sa = JSON.parse(processed);
    } catch (e2: any) {
      console.error('[firebaseAdmin] Failed to parse Service Account JSON:', e2.message);
      return null;
    }
  }

  // Ensure private_key has real newlines
  if (sa && sa.private_key && typeof sa.private_key === 'string') {
    if (sa.private_key.includes('\\n')) {
      console.log('[firebaseAdmin] Fixing escaped newlines in private_key');
      sa.private_key = sa.private_key.replace(/\\n/g, '\n');
    }
  }

  return sa;
}

export function getAdminApp() {
  const apps = getApps();
  if (apps.length) {
    return apps[0];
  }

  console.log('[firebaseAdmin] Initializing new app...');
  const sa = parseServiceAccount();
  if (!sa) {
    throw new Error('Missing or invalid FIREBASE_SERVICE_ACCOUNT_JSON');
  }

  try {
    // We use a separate constant to avoid any weird binding issues during init
    const config = {
      credential: cert(sa)
    };
    return initializeApp(config);
  } catch (e: any) {
    console.error('[firebaseAdmin] initializeApp failed:', e.message);
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
  const userData = snap.exists ? snap.data() : null;
  const role = userData?.role || 'customer';

  if (role !== 'admin') {
    console.warn(`[requireAdmin] Access denied for user ${uid}. Role: ${role}`);
    throw new Error('Forbidden');
  }

  return { uid };
}

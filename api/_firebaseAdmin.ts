import { initializeApp, cert, getApps, getApp, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function parseServiceAccount() {
  let raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    console.error('FIREBASE_SERVICE_ACCOUNT_JSON is not set');
    return null;
  }

  raw = raw.trim();
  console.log('Parsing Service Account, length:', raw.length);

  if ((raw.startsWith("'") && raw.endsWith("'")) || (raw.startsWith('"') && raw.endsWith('"'))) {
    console.log('Removing surrounding quotes from SA JSON');
    raw = raw.slice(1, -1);
  }

  try {
    return JSON.parse(raw);
  } catch (e: any) {
    console.warn('Initial JSON parse failed, trying escaped newline replacement');
    try {
      // Support escaped JSON in env vars
      const processed = raw.replace(/\\\\n/g, '\\n').replace(/\\n/g, '\n');
      return JSON.parse(processed);
    } catch (e2: any) {
      console.error('Failed to parse Service Account JSON:', e2.message);
      return null;
    }
  }
}

export function getAdminApp(): App {
  const apps = getApps();
  if (apps.length) {
    console.log('[firebaseAdmin] Using existing app');
    return apps[0];
  }

  console.log('[firebaseAdmin] Initializing new app...');
  const sa = parseServiceAccount();
  if (!sa) {
    console.error('[firebaseAdmin] Parsing service account returned null');
    throw new Error('Missing or invalid FIREBASE_SERVICE_ACCOUNT_JSON');
  }

  try {
    const app = initializeApp({
      credential: cert(sa),
    });
    console.log('[firebaseAdmin] App initialized successfully');
    return app;
  } catch (e: any) {
    console.error('[firebaseAdmin] initializeApp failed:', e.message);
    throw e;
  }
}

export function getAdminFirestore() {
  return getFirestore(getAdminApp());
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
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

import admin from 'firebase-admin';

export default async function handler(req: any, res: any) {
    const saRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!saRaw) return res.status(200).json({ ok: false, error: 'missing env' });

    const steps: string[] = [];
    try {
        steps.push('parsing');
        const sa = JSON.parse(saRaw.trim().replace(/^['"]|['"]$/g, ''));

        steps.push('init');
        const app = admin.apps.length ? admin.apps[0] : admin.initializeApp({
            credential: admin.credential.cert(sa)
        });

        steps.push('firestore start');
        const db = app.firestore();
        steps.push('firestore got');

        steps.push('collection check');
        const snap = await db.collection('users').limit(1).get();
        steps.push('read done, count: ' + snap.size);

        res.status(200).json({ ok: true, steps });
    } catch (e: any) {
        res.status(200).json({ ok: false, error: e.message, steps });
    }
}

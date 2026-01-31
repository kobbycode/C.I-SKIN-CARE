import admin from 'firebase-admin';

export default async function handler(req: any, res: any) {
    const saRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!saRaw) return res.status(200).json({ ok: false, error: 'missing env' });

    try {
        const sa = JSON.parse(saRaw.trim().replace(/^['"]|['"]$/g, ''));
        const credential = admin.credential.cert(sa);

        // Check if already init
        let app = admin.apps.length > 0 ? admin.apps[0] : admin.initializeApp({ credential });

        const db = app.firestore();
        const snap = await db.collection('users').limit(1).get();

        res.status(200).json({
            ok: true,
            msg: 'Firestore read worked',
            count: snap.size
        });
    } catch (e: any) {
        res.status(200).json({ ok: false, error: e.message });
    }
}

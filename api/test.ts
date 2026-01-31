import admin from 'firebase-admin';

export default async function handler(req: any, res: any) {
    const saRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!saRaw) return res.status(200).json({ ok: false, error: 'missing env' });

    try {
        const sa = JSON.parse(saRaw.trim().replace(/^['"]|['"]$/g, ''));
        const credential = admin.credential.cert(sa);

        // Check if already init
        let app;
        if (admin.apps.length > 0) {
            app = admin.apps[0];
        } else {
            app = admin.initializeApp({ credential });
        }

        const auth = app.auth();

        res.status(200).json({
            ok: true,
            msg: 'Auth initialized',
            appName: app.name,
            hasAuth: !!auth
        });
    } catch (e: any) {
        res.status(500).json({ ok: false, error: e.message });
    }
}

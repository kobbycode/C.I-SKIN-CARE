import admin from 'firebase-admin';

export default function handler(req: any, res: any) {
    const saRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!saRaw) return res.status(200).json({ ok: false, error: 'missing env' });

    const steps: string[] = [];
    try {
        const apps = admin.apps;
        if (apps.length) return res.status(200).json({ ok: true, msg: 'already init', count: apps.length });

        steps.push('parsing');
        const sa = JSON.parse(saRaw.trim().replace(/^['"]|['"]$/g, ''));

        steps.push('cert');
        const credential = admin.credential.cert(sa);

        steps.push('init start');
        const app = admin.initializeApp({ credential });
        steps.push('init done');

        res.status(200).json({ ok: true, steps, name: app.name });
    } catch (e: any) {
        res.status(200).json({ ok: false, error: e.message, steps });
    }
}

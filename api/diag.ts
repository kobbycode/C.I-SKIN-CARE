import admin from 'firebase-admin';

export default function handler(req: any, res: any) {
    const saRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!saRaw) return res.status(200).json({ ok: false, error: 'missing env' });

    const steps: string[] = [];
    try {
        steps.push('parsing');
        const sa = JSON.parse(saRaw.trim().replace(/^['"]|['"]$/g, ''));
        steps.push('parsed');

        steps.push('cert start');
        const cr = admin.credential.cert(sa);
        steps.push('cert done');

        res.status(200).json({ ok: true, steps });
    } catch (e: any) {
        res.status(200).json({ ok: false, error: e.message, steps });
    }
}

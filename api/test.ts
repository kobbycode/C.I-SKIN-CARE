import admin from 'firebase-admin';

export default function handler(req: any, res: any) {
    const saRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!saRaw) return res.status(200).json({ ok: false, error: 'missing env' });

    try {
        const sa = JSON.parse(saRaw.trim().replace(/^['']|['"]$/g, ''));
        const cr = admin.credential.cert(sa);
        res.status(200).json({
            ok: true,
            msg: 'Cert created',
            projectId: sa.project_id,
            hasPrivateKey: !!sa.private_key
        });
    } catch (e: any) {
        res.status(500).json({ ok: false, error: e.message, saLength: saRaw.length });
    }
}

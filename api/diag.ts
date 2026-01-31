import admin from 'firebase-admin';

export default function handler(req: any, res: any) {
    try {
        const count = (admin.apps || []).length;
        res.status(200).json({ ok: true, appsCount: count });
    } catch (e: any) {
        res.status(500).json({ ok: false, error: e.message });
    }
}

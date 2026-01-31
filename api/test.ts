import admin from 'firebase-admin';

export default function handler(req: any, res: any) {
    try {
        res.status(200).json({
            ok: true,
            adminExportKeys: Object.keys(admin),
            appsCount: (admin.apps || []).length
        });
    } catch (e: any) {
        res.status(500).json({ ok: false, error: e.message });
    }
}

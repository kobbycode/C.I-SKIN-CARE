import { requireAdmin } from './_firebaseAdmin';

export default async function handler(req: any, res: any) {
    try {
        const result = await requireAdmin(req);
        res.status(200).json({ ok: true, admin: result });
    } catch (e: any) {
        res.status(500).json({
            ok: false,
            error: e.message,
            stack: e.stack,
            hint: 'This error occurred inside requireAdmin'
        });
    }
}

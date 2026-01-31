import { requireAdmin } from './_firebaseAdmin';

export default async function handler(req: any, res: any) {
    try {
        const adminUser = await requireAdmin(req);
        res.status(200).json({
            ok: true,
            msg: 'Shared requireAdmin worked',
            uid: adminUser.uid
        });
    } catch (e: any) {
        res.status(200).json({
            ok: false,
            error: e.message,
            hint: 'Error inside shared requireAdmin'
        });
    }
}

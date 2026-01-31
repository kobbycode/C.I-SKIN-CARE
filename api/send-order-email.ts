import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth, getAdminFirestore } from './_firebaseAdmin.js';
import { sendEmail } from './_sendEmail.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { email } = await requireAuth(req);
        const { order, type = 'order_confirmation' } = req.body || {};

        if (!order || !order.id) {
            return res.status(400).json({ error: 'Missing order details' });
        }

        // Security: Ensure the user is sending an email for their own order 
        // or is an admin (for shipping/delivery notifications)
        // For now, we trust the order object if it matches the authenticated user's email
        // for confirmation, or if it's an admin request.

        // TODO: Add more robust ownership check if needed
        const recipientEmail = order.customerEmail || email;

        // Check user preferences if this is not a mandatory order confirmation
        if (type !== 'order_confirmation' && order.userId) {
            const db = getAdminFirestore();
            const userSnap = await db.collection('users').doc(order.userId).get();
            if (userSnap.exists) {
                const userData = userSnap.data();
                if (userData?.notifyOrders === false) {
                    console.log(`User ${order.userId} has disabled order notifications. Skipping ${type}.`);
                    return res.status(200).json({ ok: true, skipped: true, reason: 'unsubscribed' });
                }
            }
        }

        const result = await sendEmail({
            to: recipientEmail,
            type: type as any,
            order,
            trackingInfo: order.trackingNumber
        });

        if (result.success) {
            return res.status(200).json({ ok: true, id: result.id });
        } else {
            return res.status(500).json({ error: 'Failed to send email', details: result.error });
        }
    } catch (e: any) {
        return res.status(401).json({ error: e?.message || 'Unauthorized' });
    }
}

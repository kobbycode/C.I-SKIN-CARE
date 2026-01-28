import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminFirestore, requireAuth } from './_firebaseAdmin';

type VerifyResponse = {
  status: boolean;
  message: string;
  data?: any;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { uid, email } = await requireAuth(req);

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) throw new Error('Missing PAYSTACK_SECRET_KEY');

    const { reference, orderDraft } = (req.body || {}) as any;
    if (!reference || !orderDraft) return res.status(400).json({ error: 'Missing reference/orderDraft' });

    const verifyUrl = `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`;
    const resp = await fetch(verifyUrl, {
      headers: {
        Authorization: `Bearer ${secret}`,
      },
    });
    const json = (await resp.json()) as VerifyResponse;
    if (!resp.ok || !json.status) throw new Error(json?.message || 'Paystack verify failed');

    const data = json.data;
    if (data?.status !== 'success') throw new Error('Payment not successful');

    // Amount comes in kobo/pesewas (smallest unit)
    const expectedAmount = Math.round(Number(orderDraft.total) * 100);
    const paidAmount = Number(data?.amount);
    if (!Number.isFinite(expectedAmount) || !Number.isFinite(paidAmount)) throw new Error('Invalid amount');
    if (paidAmount !== expectedAmount) throw new Error('Amount mismatch');

    // Create order server-side (prevents client spoofing)
    const db = getAdminFirestore();
    const orderRef = db.collection('orders').doc();
    const now = new Date();

    const orderDoc = {
      ...orderDraft,
      id: orderRef.id,
      userId: uid,
      customerEmail: orderDraft.customerEmail || email || '',
      date:
        orderDraft.date ||
        now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      time: orderDraft.time || now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'Pending',
      paymentStatus: 'paid',
      paymentReference: reference,
      paystack: {
        reference,
        channel: data?.channel,
        currency: data?.currency,
        paidAt: data?.paid_at,
        gatewayResponse: data?.gateway_response,
      },
    };

    await orderRef.set(orderDoc, { merge: true });

    return res.status(200).json({ ok: true, orderId: orderRef.id });
  } catch (e: any) {
    return res.status(400).json({ error: e?.message || 'Failed' });
  }
}


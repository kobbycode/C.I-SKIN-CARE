import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminFirestore, requireAuth } from './_firebaseAdmin.js';

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

    // Create order and update stock in a transaction
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

    await db.runTransaction(async (transaction) => {
      // 1. Read all product docs first (required for transactions)
      const productRefs = orderDoc.items.map((item: any) => db.collection('products').doc(item.id));
      const productDocs = await Promise.all(productRefs.map((ref: any) => transaction.get(ref)));

      // 2. Prepare updates
      productDocs.forEach((docSnap, index) => {
        if (!docSnap.exists) return; // Product might have been deleted, skip stock update

        const item = orderDoc.items[index];
        const productData = docSnap.data();

        if (item.selectedVariant) {
          // Update specific variant stock
          const variants = productData?.variants || [];
          const variantIndex = variants.findIndex((v: any) => v.id === item.selectedVariant.id);

          if (variantIndex !== -1) {
            const currentStock = variants[variantIndex].stock || 0;
            variants[variantIndex].stock = Math.max(0, currentStock - item.quantity); // Prevent negative for now, or allow it? Let's cap at 0 but log it ideally.
            transaction.update(productRefs[index], { variants });
          }
        } else {
          // Update main product stock
          const currentStock = productData?.stock || 0;
          const newStock = Math.max(0, currentStock - item.quantity);
          transaction.update(productRefs[index], { stock: newStock });
        }
      });

      // 3. Create the order
      transaction.set(orderRef, orderDoc);
    });

    return res.status(200).json({ ok: true, orderId: orderRef.id });
  } catch (e: any) {
    return res.status(400).json({ error: e?.message || 'Failed' });
  }
}


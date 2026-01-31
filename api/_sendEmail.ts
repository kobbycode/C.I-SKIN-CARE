import { Resend } from 'resend';
import {
    getOrderConfirmationTemplate,
    getShippingNotificationTemplate,
    getDeliveryConfirmationTemplate
} from './_emailTemplates.js';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'C.I. Skin Care <orders@ci-skin-care.com>';

export type EmailType = 'order_confirmation' | 'shipping_notification' | 'delivery_confirmation';

export async function sendEmail({
    to,
    type,
    order,
    trackingInfo
}: {
    to: string;
    type: EmailType;
    order: any;
    trackingInfo?: string;
}) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is missing. Skipping email.');
        return { error: 'Service not configured' };
    }

    let html = '';
    let subject = '';

    switch (type) {
        case 'order_confirmation':
            html = getOrderConfirmationTemplate(order);
            subject = `Order Confirmed: #${order.id}`;
            break;
        case 'shipping_notification':
            html = getShippingNotificationTemplate(order, trackingInfo);
            subject = `Your Order is En Route: #${order.id}`;
            break;
        case 'delivery_confirmation':
            html = getDeliveryConfirmationTemplate(order);
            subject = `Delivered: #${order.id}`;
            break;
    }

    try {
        const data = await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject,
            html,
        });

        return { success: true, id: data.data?.id };
    } catch (error) {
        console.error(`Failed to send ${type} email:`, error);
        return { success: false, error };
    }
}

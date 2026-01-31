
/**
 * Shared Styles for Email Templates
 */
const STYLES = `
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9f9f9; }
  .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e1e1e1; }
  .header { background: #221C1D; color: #ffffff; padding: 40px 20px; text-align: center; }
  .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 4px; font-weight: 300; }
  .content { padding: 40px 30px; }
  .order-item { padding: 15px 0; border-bottom: 1px solid #eeeeee; display: flex; justify-content: space-between; }
  .total-row { padding: 20px 0; font-weight: bold; font-size: 18px; border-top: 2px solid #221C1D; margin-top: 20px; text-align: right; }
  .footer { background: #f4f4f4; padding: 30px; text-align: center; font-size: 12px; color: #777; }
  .btn { display: inline-block; padding: 12px 25px; background: #221C1D; color: #ffffff; text-decoration: none; border-radius: 4px; margin-top: 20px; text-transform: uppercase; font-size: 12px; font-weight: bold; letter-spacing: 1px; }
  .address-box { background: #f8f8f8; padding: 20px; border-radius: 4px; margin-top: 20px; font-size: 14px; }
`;

export const getOrderConfirmationTemplate = (order: any) => `
<!DOCTYPE html>
<html>
<head>
  <style>${STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>C.I. Skin Care</h1>
    </div>
    <div class="content">
      <h2 style="font-weight: 300;">Your Ritual Invitation is Confirmed</h2>
      <p>Dear ${order.customerName},</p>
      <p>Thank you for choosing C.I. Skin Care. Your order <strong>#${order.id}</strong> has been received and is being prepared with clinical precision.</p>
      
      <div style="margin-top: 30px;">
        <h3 style="text-transform: uppercase; font-size: 14px; border-bottom: 1px solid #221C1D; padding-bottom: 10px;">Order Details</h3>
        ${order.items.map((item: any) => `
          <div class="order-item">
            <span>${item.name} ${item.selectedVariant ? `(${item.selectedVariant.name})` : ''} x ${item.quantity}</span>
            <span>GH₵${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        `).join('')}
        
        <div class="total-row">
          Total: GH₵${order.total.toFixed(2)}
        </div>
      </div>

      <div class="address-box">
        <strong>Shipping Ritual:</strong><br/>
        ${order.shippingAddress}
      </div>

      <p style="margin-top: 30px;">You will receive another notification once your items have been dispatched.</p>
      
      <a href="https://ci-skin-care.com/orders/${order.id}" class="btn">View Order Details</a>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} C.I. Skin Care. Engineered for Radiance.<br/>
      Luxury & Science Combined.
    </div>
  </div>
</body>
</html>
`;

export const getShippingNotificationTemplate = (order: any, trackingInfo?: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>${STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>C.I. Skin Care</h1>
    </div>
    <div class="content">
      <h2 style="font-weight: 300;">Your Elements are Dispatched</h2>
      <p>Dear ${order.customerName},</p>
      <p>Your order <strong>#${order.id}</strong> has been carefully packaged and is now on its way to you.</p>
      
      <div class="address-box">
        <strong>Estimated arrival at:</strong><br/>
        ${order.shippingAddress}
      </div>

      ${trackingInfo ? `
        <div style="margin-top: 20px; padding: 15px; border: 1px dashed #221C1D; text-align: center;">
          <p style="margin-top: 0;">Tracking Identifier:</p>
          <strong style="font-size: 18px; letter-spacing: 2px;">${trackingInfo}</strong>
        </div>
      ` : ''}

      <p style="margin-top: 30px;">Prepare your skin for the transformation.</p>
      
      <a href="https://ci-skin-care.com/track/${order.id}" class="btn">Track Shipment</a>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} C.I. Skin Care. Engineered for Radiance.<br/>
      Luxury & Science Combined.
    </div>
  </div>
</body>
</html>
`;

export const getDeliveryConfirmationTemplate = (order: any) => `
<!DOCTYPE html>
<html>
<head>
  <style>${STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>C.I. Skin Care</h1>
    </div>
    <div class="content">
      <h2 style="font-weight: 300;">Ritual Elements Delivered</h2>
      <p>Dear ${order.customerName},</p>
      <p>We are pleased to confirm that your order <strong>#${order.id}</strong> has been delivered.</p>
      
      <p>We hope these elements elevate your skincare ritual. May your journey to radiance be as premium as the products you've received.</p>
      
      <div style="text-align: center; margin-top: 40px;">
        <p>Share your transformation with us:</p>
        <a href="https://ci-skin-care.com/reviews/new?order=${order.id}" class="btn">Leave a Review</a>
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} C.I. Skin Care. Engineered for Radiance.<br/>
      Luxury & Science Combined.
    </div>
  </div>
</body>
</html>
`;

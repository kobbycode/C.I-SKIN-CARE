import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = (req.query.id as string) || '';
  const host = (req.headers['host'] as string) || 'www.theciskincare.com';
  const origin = `https://${host}`;

  // Firestore REST API (public apiKey; safe to embed like in the frontend config)
  const FIREBASE_PROJECT_ID = 'ci-skincare-digital-platform';
  const FIREBASE_API_KEY = 'AIzaSyAu1mLzhzY4c3Dkq6_C_WO1Qu4MYg4heo4';
  const FIRESTORE_DOCS_BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

  const escapeHtml = (s: string) =>
    String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  // For attribute values that are URLs, do NOT escape '&' -> '&amp;'
  // Some link scrapers (e.g. WhatsApp) may not decode entities reliably for OG image URLs.
  const escapeHtmlUrlAttr = (s: string) =>
    String(s ?? '')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const inferImageMimeType = (imageUrl: string) => {
    try {
      const u = new URL(imageUrl);
      const p = u.pathname.toLowerCase();
      if (p.endsWith('.png')) return 'image/png';
      if (p.endsWith('.webp')) return 'image/webp';
      if (p.endsWith('.gif')) return 'image/gif';
      if (p.endsWith('.jpg') || p.endsWith('.jpeg')) return 'image/jpeg';
      return 'image/jpeg';
    } catch {
      const lower = (imageUrl || '').toLowerCase();
      if (lower.includes('.png')) return 'image/png';
      if (lower.includes('.webp')) return 'image/webp';
      if (lower.includes('.gif')) return 'image/gif';
      if (lower.includes('.jpg') || lower.includes('.jpeg')) return 'image/jpeg';
      return 'image/jpeg';
    }
  };

  const readFirestoreValue = (field: any) => {
    if (!field) return undefined;
    if (field.stringValue != null) return field.stringValue;
    if (field.integerValue != null) return field.integerValue;
    if (field.doubleValue != null) return field.doubleValue;
    if (field.booleanValue != null) return field.booleanValue;
    if (field.timestampValue != null) return field.timestampValue;
    return undefined;
  };

  try {
    let name = 'C.I SKIN CARE | Luxury Beauty';
    let description = 'Discover science-backed luxury skincare. Join the ritual of radiance.';
    let image = `${origin}/logo.jpg`;
    let priceText = '';
    // When a product id is in the URL, always use that URL for sharing (even if product not found)
    const url = id ? `${origin}/product/${id}` : `${origin}/`;
    let isProduct = false;

    if (id) {
      const docUrl = `${FIRESTORE_DOCS_BASE}/products/${encodeURIComponent(id)}?key=${encodeURIComponent(FIREBASE_API_KEY)}`;
      const resp = await fetch(docUrl);
      if (resp.ok) {
        const data: any = await resp.json();
        const fields = data?.fields || {};
        const rawName = readFirestoreValue(fields.name);
        const rawDesc = readFirestoreValue(fields.description);
        const rawImage = readFirestoreValue(fields.image);
        const rawPrice = readFirestoreValue(fields.price);

        const parsedPrice = rawPrice != null ? Number(rawPrice) : NaN;
        const hasValidPrice = Number.isFinite(parsedPrice);

        if (rawName) {
          name = `${rawName} – ${hasValidPrice ? `GH₵${parsedPrice.toFixed(2)}` : ''} | C.I SKIN CARE`.replace(' –  |', ' |');
          description = rawDesc || description;
          const img = rawImage || '';
          image = String(img).startsWith('http')
            ? String(img)
            : `${origin}${String(img).startsWith('/') ? '' : '/'}${img || 'logo.jpg'}`;
          if (hasValidPrice) {
            priceText = `GH₵${parsedPrice.toFixed(2)}`;
          }
          isProduct = true;
        } else {
          name = `Product | C.I SKIN CARE`;
          description = 'Discover science-backed luxury skincare.';
        }
      } else {
        name = `Product | C.I SKIN CARE`;
        description = 'Discover science-backed luxury skincare.';
      }
    }

    const productPriceMeta = isProduct && priceText
      ? `<meta property="product:price:amount" content="${priceText.replace('GH₵', '').trim()}">
<meta property="product:price:currency" content="GHS">`
      : '';

    // Escape dynamic content for HTML safety
    const safeTitle = escapeHtml(name);
    const safeDesc = escapeHtml(description);
    const safeImage = escapeHtmlUrlAttr(image);
    const safeUrl = escapeHtmlUrlAttr(url);
    const imageType = inferImageMimeType(image);

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${safeTitle}</title>
<meta property="og:type" content="${isProduct ? 'product' : 'website'}">
<meta property="og:url" content="${safeUrl}">
<meta property="og:title" content="${safeTitle}">
<meta property="og:description" content="${safeDesc}">
<meta property="og:image" content="${safeImage}">
<meta property="og:image:secure_url" content="${safeImage}">
<meta property="og:image:type" content="${imageType}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
${productPriceMeta}
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:title" content="${safeTitle}">
<meta property="twitter:description" content="${safeDesc}">
<meta property="twitter:image" content="${safeImage}">
<link rel="icon" href="${origin}/logo.jpg">
</head>
<body>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (e) {
    const fallback = `<!doctype html><html><head><meta charset="utf-8"><meta property="og:title" content="C.I SKIN CARE | Luxury Beauty"><meta property="og:image" content="${origin}/logo.jpg"></head><body></body></html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(fallback);
  }
}

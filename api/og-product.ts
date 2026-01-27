
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
export default async function handler(req: any, res: any) {
  const id = (req.query.id as string) || '';
  const ua = (req.headers['user-agent'] as string) || '';
  const host = (req.headers['host'] as string) || 'www.theciskincare.com';
  const origin = `https://${host}`;

  try {
    let name = 'C.I SKIN CARE | Luxury Beauty';
    let description = 'Discover science-backed luxury skincare. Join the ritual of radiance.';
    let image = `${origin}/logo.jpg`;
    let priceText = '';
    let url = `${origin}/`;

    if (id) {
      const ref = doc(db, 'products', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const p = snap.data() as any;
        name = `${p.name} – GH₵${Number(p.price).toFixed(2)} | C.I SKIN CARE`;
        description = p.description || description;
        image = p.image?.startsWith('http') ? p.image : `${origin}${p.image?.startsWith('/') ? '' : '/'}${p.image || 'logo.jpg'}`;
        url = `${origin}/product/${id}`;
        priceText = `GH₵${Number(p.price).toFixed(2)}`;
      }
    }

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${name}</title>
<meta property="og:type" content="product">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${name}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${image}">
<meta property="og:image:secure_url" content="${image}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="product:price:amount" content="${priceText.replace('GH₵','')}">
<meta property="product:price:currency" content="GHS">
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:title" content="${name}">
<meta property="twitter:description" content="${description}">
<meta property="twitter:image" content="${image}">
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

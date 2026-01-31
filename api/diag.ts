import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    const saRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const secret = process.env.BOOTSTRAP_SECRET;

    res.status(200).json({
        hasServiceAccount: !!saRaw,
        serviceAccountLength: saRaw ? saRaw.length : 0,
        hasBootstrapSecret: !!secret,
        nodeVersion: process.version,
        envKeys: Object.keys(process.env).filter(k => k.includes('FIREBASE') || k.includes('SECRET')),
    });
}

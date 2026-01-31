import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminApp } from './_firebaseAdmin';

export default function handler(req: VercelRequest, res: VercelResponse) {
    const saRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const secret = process.env.BOOTSTRAP_SECRET;

    let saParseable = false;
    let saError = '';
    if (saRaw) {
        try {
            JSON.parse(saRaw);
            saParseable = true;
        } catch (e: any) {
            saError = e.message;
        }
    }

    let adminInitialized = false;
    let adminInitError = '';
    try {
        const app = getAdminApp();
        adminInitialized = !!app;
    } catch (e: any) {
        adminInitError = e.message;
    }

    res.status(200).json({
        hasServiceAccount: !!saRaw,
        serviceAccountLength: saRaw ? saRaw.length : 0,
        saParseable,
        saError,
        adminInitialized,
        adminInitError,
        hasBootstrapSecret: !!secret,
        nodeVersion: process.version,
        platform: process.platform,
        envKeys: Object.keys(process.env).filter(k => k.includes('FIREBASE') || k.includes('SECRET')),
    });
}

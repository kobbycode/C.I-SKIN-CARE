import { getAdminApp } from './_firebaseAdmin';
import fs from 'fs';

export default function handler(req: VercelRequest, res: VercelResponse) {
    console.log('[diag] Starting diagnostic check...');
    const saRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const secret = process.env.BOOTSTRAP_SECRET;

    let saParseable = false;
    let saError = '';
    if (saRaw) {
        try {
            JSON.parse(saRaw.trim().replace(/^['"]|['"]$/g, ''));
            saParseable = true;
        } catch (e: any) {
            saError = e.message;
        }
    }

    let adminInitialized = false;
    let adminInitError = '';
    try {
        console.log('[diag] Attempting getAdminApp...');
        const app = getAdminApp();
        adminInitialized = !!app;
        console.log('[diag] adminInitialized:', adminInitialized);
    } catch (e: any) {
        console.error('[diag] adminInitError:', e.message);
        adminInitError = e.message;
    }

    let files: string[] = [];
    try {
        files = fs.readdirSync('.');
    } catch (e) { }

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
        cwd: process.cwd(),
        files
    });
}

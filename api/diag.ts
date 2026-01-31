import admin from 'firebase-admin';
import { getAdminApp } from './_firebaseAdmin';

function parseSAInternal() {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!raw) return null;
    return JSON.parse(raw.trim().replace(/^['"]|['"]$/g, ''));
}

export default async function handler(req: any, res: any) {
    const diagnosticSteps: string[] = [];
    try {
        diagnosticSteps.push('Step 1: Checking SA Raw');
        const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        if (!raw) throw new Error('Raw SA missing');
        diagnosticSteps.push('Raw SA found, length: ' + raw.length);

        diagnosticSteps.push('Step 2: Parsing SA JSON');
        const sa = parseSAInternal();
        diagnosticSteps.push('SA JSON parsed, keys: ' + Object.keys(sa).join(','));

        diagnosticSteps.push('Step 3: Checking private_key format');
        if (!sa.private_key) throw new Error('private_key missing');
        diagnosticSteps.push('private_key length: ' + sa.private_key.length);
        diagnosticSteps.push('private_key starts with: ' + sa.private_key.substring(0, 30));
        diagnosticSteps.push('private_key contains \\n (escaped): ' + sa.private_key.includes('\\n'));
        diagnosticSteps.push('private_key contains real newline: ' + sa.private_key.includes('\n'));

        diagnosticSteps.push('Step 4: Attempting admin.credential.cert');
        try {
            const cr = admin.credential.cert(sa);
            diagnosticSteps.push('cert created successfully');
        } catch (e: any) {
            diagnosticSteps.push('cert helper failed: ' + e.message);
            // Try to re-parse the key specifically if cert failed
            if (sa.private_key && typeof sa.private_key === 'string') {
                diagnosticSteps.push('retrying manual newline enrichment for private_key');
                sa.private_key = sa.private_key.replace(/\\n/g, '\n');
                admin.credential.cert(sa);
                diagnosticSteps.push('cert retry worked');
            } else {
                throw e;
            }
        }

        diagnosticSteps.push('Step 5: Attempting getAdminApp call');
        try {
            const app = getAdminApp();
            diagnosticSteps.push('getAdminApp returned app: ' + (!!app));
        } catch (e: any) {
            diagnosticSteps.push('getAdminApp crashed: ' + e.message);
            throw e;
        }

        res.status(200).json({
            ok: true,
            steps: diagnosticSteps
        });
    } catch (e: any) {
        console.error('DIAG ERROR:', e);
        res.status(500).json({
            ok: false,
            error: e.message,
            detail: e.toString(),
            steps: diagnosticSteps
        });
    }
}

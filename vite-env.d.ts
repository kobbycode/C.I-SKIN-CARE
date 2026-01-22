/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_PAYSTACK_PUBLIC_KEY: string;
    // Add other env variables here as needed
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

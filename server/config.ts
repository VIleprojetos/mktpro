import dotenv from 'dotenv';
dotenv.config();

function getEnvVar(key: string, defaultValue?: string): string {
    const value = process.env[key] || defaultValue;
    if (value === undefined) {
        throw new Error(`Variável de ambiente obrigatória ${key} não definida.`);
    }
    return value;
}

// --- Configurações Gerais ---
export const NODE_ENV = getEnvVar('NODE_ENV', 'development');
export const PORT = getEnvVar('PORT', '3000');
export const APP_BASE_URL = getEnvVar('APP_BASE_URL', `http://localhost:${PORT}`);

// --- Banco de Dados ---
export const DATABASE_URL = getEnvVar('DATABASE_URL');
export const DATABASE_AUTH_TOKEN = getEnvVar('DATABASE_AUTH_TOKEN');

// --- Autenticação e Segurança ---
export const JWT_SECRET = getEnvVar('JWT_SECRET', 'your-super-secret-jwt-key');

// --- Caminhos e Uploads ---
export const UPLOADS_PATH = getEnvVar('UPLOADS_PATH', 'uploads');

// --- Chaves de API de Serviços Externos ---
export const GEMINI_API_KEY = getEnvVar('GEMINI_API_KEY', '');

// --- Configurações para Integrações (OAuth) ---
export const GOOGLE_CLIENT_ID = getEnvVar('GOOGLE_CLIENT_ID');
export const GOOGLE_CLIENT_SECRET = getEnvVar('GOOGLE_CLIENT_SECRET');
export const FACEBOOK_CLIENT_ID = getEnvVar('FACEBOOK_CLIENT_ID');
export const FACEBOOK_CLIENT_SECRET = getEnvVar('FACEBOOK_CLIENT_SECRET');

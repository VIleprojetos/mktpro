import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getEnv(varName: string, aDefault?: string): string {
  const value = process.env[varName];
  if (value === undefined && aDefault === undefined) {
      throw new Error(`Variável de ambiente obrigatória ${varName} não definida.`);
  }
  return value ?? aDefault!;
}

// --- Configurações Gerais ---
export const PORT = parseInt(getEnv('PORT', '3001'), 10);
export const APP_BASE_URL = getEnv('APP_BASE_URL', `http://localhost:${PORT}`);

// --- Autenticação e Segurança ---
export const JWT_SECRET = getEnv('JWT_SECRET', 'your-super-secret-jwt-key-change-it');

// --- Banco de Dados ---
export const DATABASE_URL = getEnv('DATABASE_URL');
// Mantendo DATABASE_AUTH_TOKEN se for usado em outra parte (ex: Drizzle Studio)
export const DATABASE_AUTH_TOKEN = getEnv('DATABASE_AUTH_TOKEN', '');

// --- Chaves de API de Serviços Externos ---
export const GOOGLE_API_KEY = getEnv('GOOGLE_API_KEY', '');
export const GEMINI_API_KEY = getEnv('GEMINI_API_KEY', '');
export const OPENROUTER_API_KEY = getEnv('OPENROUTER_API_KEY', '');

// --- Configurações para Integrações (OAuth) ---
export const GOOGLE_CLIENT_ID = getEnv('GOOGLE_CLIENT_ID');
export const GOOGLE_CLIENT_SECRET = getEnv('GOOGLE_CLIENT_SECRET');
export const FACEBOOK_CLIENT_ID = getEnv('FACEBOOK_CLIENT_ID');
export const FACEBOOK_CLIENT_SECRET = getEnv('FACEBOOK_CLIENT_SECRET');


// --- Configuração de Caminhos ---
export const PROJECT_ROOT = path.resolve(__dirname, '..'); 
export const UPLOADS_DIR_NAME = "uploads";

// Para deploy em serviços como Koyeb, defina a variável UPLOADS_MOUNT_PATH 
// para o caminho do seu disco persistente (ex: /data).
const uploadsMountPath = process.env.UPLOADS_MOUNT_PATH;

// O caminho para uploads agora aponta para o disco persistente (se definido), ou para a raiz do projeto.
export const UPLOADS_PATH = uploadsMountPath 
    ? path.join(uploadsMountPath, UPLOADS_DIR_NAME) 
    : path.join(PROJECT_ROOT, UPLOADS_DIR_NAME);

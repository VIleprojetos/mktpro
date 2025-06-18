import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Configuração de diretórios para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração padrão para UPLOADS_PATH
const UPLOADS_PATH = process.env.UPLOADS_PATH || path.join(__dirname, 'uploads');

const app = express();
const server = createServer(app);

// Configuração do Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// Middlewares Essenciais
app.use(cors());
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Servir arquivos de upload estaticamente
app.use('/uploads', express.static(UPLOADS_PATH));

// Função para carregar módulos opcionais
async function loadOptionalModule(modulePath: string, exportName?: string) {
  try {
    const module = await import(modulePath);
    return exportName ? module[exportName] : module.default || module;
  } catch (error) {
    console.warn(`⚠️ Módulo opcional não encontrado: ${modulePath}`, error.message);
    return null;
  }
}

// Carregar módulos opcionais
const router = await loadOptionalModule('./routes.ts', 'router') || express.Router();
const setupWhatsApp = await loadOptionalModule('./services/whatsapp-connection.service.ts', 'setupWhatsApp') || (() => console.log('WhatsApp service not available'));
const startCronJobs = await loadOptionalModule('./services/cron.service.ts', 'startCronJobs') || (() => console.log('Cron service not available'));
const vite = process.env.NODE_ENV !== 'production' ? await loadOptionalModule('./vite.ts', 'vite') : null;

// Rotas da API
app.use('/api', router);

// Configuração para servir o frontend
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, 'public');
  app.use(express.static(clientDistPath));
  
  // Rota catch-all para servir o index.html em produção (SPA)
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Usar o middleware do Vite em desenvolvimento
  if (vite) {
    app.use(vite);
  } else {
    console.warn('⚠️ Vite middleware não disponível em desenvolvimento');
  }
}

const PORT = process.env.PORT || 3000;

server.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  
  // Inicializar serviços de background
  try {
    if (setupWhatsApp) {
      await setupWhatsApp(io);
      console.log('✅ Serviço WhatsApp inicializado.');
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar WhatsApp:', error);
  }
  
  try {
    if (startCronJobs) {
      await startCronJobs();
      console.log('✅ Serviço Cron inicializado.');
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar Cron:', error);
  }
});

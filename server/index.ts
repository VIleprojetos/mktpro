// server/index.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
// ✅ CORREÇÃO: Importações ajustadas para resolver o erro de build do esbuild.
import { router } from './routes.js';
import { setupWhatsApp } from './services/whatsapp-connection.service.js';
import { startCronJobs } from './services/cron.service.js';
import { vite } from './vite.js';
import { UPLOADS_PATH } from './config.js';

// Configuração de diretórios para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Rotas da API
app.use('/api', router);

// Configuração para servir o frontend (Vite)
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, 'public');
  app.use(express.static(clientDistPath));
  // Rota catch-all para servir o index.html em produção (SPA)
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Usar o middleware do Vite em desenvolvimento
  app.use(vite);
}

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  
  // Inicializar serviços de background
  setupWhatsApp(io);
  startCronJobs();
  
  console.log('✅ Serviços de WhatsApp e Cron inicializados.');
});

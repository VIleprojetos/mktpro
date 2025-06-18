import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
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

// Importações condicionais para evitar erros de build
let router: any;
let setupWhatsApp: any;
let startCronJobs: any;
let vite: any;

try {
  // Importação do router
  const routesModule = await import('./routes.js');
  router = routesModule.router || routesModule.default;
} catch (error) {
  console.warn('⚠️ Não foi possível importar as rotas:', error);
  router = express.Router();
}

try {
  // Importação do serviço WhatsApp
  const whatsappModule = await import('./services/whatsapp-connection.service.js');
  setupWhatsApp = whatsappModule.setupWhatsApp || whatsappModule.default;
} catch (error) {
  console.warn('⚠️ Não foi possível importar o serviço WhatsApp:', error);
  setupWhatsApp = () => console.log('WhatsApp service not available');
}

try {
  // Importação do serviço Cron
  const cronModule = await import('./services/cron.service.js');
  startCronJobs = cronModule.startCronJobs || cronModule.default;
} catch (error) {
  console.warn('⚠️ Não foi possível importar o serviço Cron:', error);
  startCronJobs = () => console.log('Cron service not available');
}

try {
  // Importação do Vite (apenas em desenvolvimento)
  if (process.env.NODE_ENV !== 'production') {
    const viteModule = await import('./vite.js');
    vite = viteModule.vite || viteModule.default;
  }
} catch (error) {
  console.warn('⚠️ Não foi possível importar o Vite:', error);
  vite = null;
}

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

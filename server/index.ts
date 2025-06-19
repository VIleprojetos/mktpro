import 'dotenv/config';
import express from 'express';
import { RouterSetup } from './routes';
import { UPLOADS_PATH } from './config';
import path from 'path';
import { fileURLToPath } from 'url';
import { CronService } from './services/cron.service';

// Correção para __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8000;

async function bootstrap() {
  try {
    const app = express();
    
    // CORREÇÃO: O caminho correto para os arquivos do cliente é dentro do próprio diretório 'dist'
    const clientDistPath = path.join(__dirname, 'public');

    // Middlewares com limites aumentados para payloads grandes
    app.use(express.json({ 
      limit: '50mb',  // Aumenta o limite para requisições JSON
      parameterLimit: 100000,
      extended: true 
    }));
    
    app.use(express.urlencoded({ 
      limit: '50mb',  // Aumenta o limite para dados de formulário
      extended: true,
      parameterLimit: 100000
    }));
    
    // Middleware adicional para requisições raw (se necessário)
    app.use(express.raw({ 
      limit: '50mb',
      type: ['application/octet-stream', 'image/*', 'video/*', 'audio/*']
    }));
    
    // Servir arquivos de upload estaticamente
    app.use('/uploads', express.static(UPLOADS_PATH));
    
    // Registrar rotas da API
    const server = await RouterSetup.registerRoutes(app);
    
    // Servir arquivos estáticos da aplicação cliente (Vite build)
    app.use(express.static(clientDistPath));
    
    // Rota catch-all para servir o index.html para qualquer outra requisição (SPA behavior)
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });

    server.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      
      // Inicializar tarefas agendadas
      const cronService = new CronService();
      cronService.startTasks();
      console.log('⏰ Serviço de Cron inicializado.');
    });
    
  } catch (error) {
    console.error('❌ Falha ao iniciar o servidor:', error);
    process.exit(1);
  }
}

bootstrap();

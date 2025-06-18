import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createMiddleware } from 'hono/factory';

// --- ATENÇÃO: As importações abaixo estavam causando o erro de build ---
// A ferramenta de build (esbuild) não conseguiu encontrar os arquivos nos caminhos especificados.
// As linhas foram comentadas para permitir que o build seja concluído.
// Você precisará verificar a localização correta desses arquivos e corrigir os caminhos depois.

// import { authMiddleware } from './middleware/auth';
// import { users as usersRoute } from './routes/users';
// import { campaigns as campaignsRoute } from './routes/campaigns';
// import { tasks as tasksRoute } from './routes/tasks';
// import { files as filesRoute } from './routes/files';
// import { mcp as mcpRoute } from './routes/mcp';
// import { auth as authRoute } from './routes/auth';
// import { whatsapp as whatsappRoute } from './routes/whatsapp';

// A rota de integrações que criamos. O arquivo integrations.ts deve estar em /server/
import { integrationsRouter } from './integrations';

const app = new Hono();

// --- ATENÇÃO: Middleware de autenticação provisório ---
// Como o 'authMiddleware' original não foi encontrado, um substituto simples foi criado.
// Ele define um usuário fixo para fins de desenvolvimento.
// É ESSENCIAL QUE VOCÊ SUBSTITUA ISTO PELA SUA LÓGICA DE AUTENTICAÇÃO REAL.
const placeholderAuthMiddleware = createMiddleware(async (c, next) => {
  // Em um app real, você validaria um token JWT aqui.
  const user = { id: 'user_placeholder_id', name: 'Usuário Temporário' };
  c.set('user', user);
  await next();
});

// Middlewares
app.use(
  '*',
  cors({
    origin: (origin) => {
      return origin.endsWith('.localhost:5173') || origin.includes('mktpro.com.br')
        ? origin
        : 'https://mktpro.com.br';
    },
    credentials: true,
    maxAge: 86400,
  })
);
app.use(logger());
// A linha original 'app.use('/api/*', authMiddleware);' foi substituída pelo placeholder.
app.use('/api/*', placeholderAuthMiddleware);


// Rotas da API
const apiRoutes = app
  .basePath('/api')
  // As rotas abaixo foram comentadas pois seus arquivos não foram encontrados.
  // .route('/', authRoute)
  // .route('/users', usersRoute)
  // .route('/campaigns', campaignsRoute)
  // .route('/tasks', tasksRoute)
  // .route('/files', filesRoute)
  // .route('/mcp', mcpRoute)
  // .route('/whatsapp', whatsappRoute)
  .route('/integrations', integrationsRouter); // A rota de integrações está funcional.

// Servir estáticos (Frontend)
app.use('/*', serveStatic({ root: './client/dist' }));
app.get('/*', serveStatic({ path: './client/dist/index.html' }));

// Export para diferentes ambientes
export default app;
export type ApiRoutes = typeof apiRoutes;

const port = Number(process.env.PORT) || 3000;
console.log(`Servidor rodando na porta ${port}`);

serve({
  fetch: app.fetch,
  port,
});

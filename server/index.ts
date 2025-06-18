import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authMiddleware } from './middleware/auth';
import { users as usersRoute } from './routes/users';
import { campaigns as campaignsRoute } from './routes/campaigns';
import { tasks as tasksRoute } from './routes/tasks';
import { files as filesRoute } from './routes/files';
import { mcp as mcpRoute } from './routes/mcp';
import { auth as authRoute } from './routes/auth';
import { whatsapp as whatsappRoute } from './routes/whatsapp';
import { integrationsRouter } from './integrations'; // Importado

const app = new Hono();

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
app.use('/api/*', authMiddleware);

// Rotas da API
const apiRoutes = app
  .basePath('/api')
  .route('/', authRoute)
  .route('/users', usersRoute)
  .route('/campaigns', campaignsRoute)
  .route('/tasks', tasksRoute)
  .route('/files', filesRoute)
  .route('/mcp', mcpRoute)
  .route('/whatsapp', whatsappRoute)
  .route('/integrations', integrationsRouter); // Rota adicionada

// Servir estáticos (Frontend)
app.use('/*', serveStatic({ root: './client/dist' }));
app.get('/*', serveStatic({ path: './client/dist/index.html' }));

// Export para diferentes ambientes
export default app;
export type ApiRoutes = typeof apiRoutes;

const port = Number(process.env.PORT) || 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

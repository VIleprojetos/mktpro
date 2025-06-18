// server/index.ts

import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { csrf } from 'hono/csrf'
import { trimTrailingSlash } from 'hono/trailing-slash'
import { HTTPException } from 'hono/http-exception'
import { serveStatic } from '@hono/node-server/serve-static'
import { migrate } from 'drizzle-orm/node-postgres/migrator'

import routes from './routes'
import { MCP } from './mcp_handler'
import { CronService } from './services/cron.service'
import { db } from './db'
import { viteDevServer } from './vite'

const app = new Hono()

// Inicializar e agendar tarefas cron
const cronService = CronService.getInstance()
cronService.startAllJobs()

/**
 * Middlewares
 */
app.use(logger())
app.use(csrf())
app.use(trimTrailingSlash())

// Error handler
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse()
  }
  console.error('Internal Server Error:', err)
  // Em vez de retornar err.message, que pode expor detalhes, retorne uma mensagem genérica.
  return c.json({ message: 'Ocorreu um erro interno no servidor.' }, 500)
})

/**
 * Rotas
 */
// CORREÇÃO: Montar as rotas na raiz ('/').
// O ficheiro de rotas (`routes.ts`) já inclui o prefixo '/api' com `basePath`.
// Alterar app.route('/api', routes) para app.route('/', routes) evita a duplicação de caminhos (e.g., /api/api/...).
app.route('/', routes)
app.route('/mcp', MCP)

/**
 * Servir ficheiros estáticos e Vite
 */
if (process.env.NODE_ENV === 'production') {
  console.log('A executar em modo de produção')
  
  // Servir a build de produção do cliente
  app.get(
    '*',
    serveStatic({
      root: `./dist/public`,
    })
  )

  // Migrar a base de dados em produção
  console.log('A executar as migrações da base de dados...');
  migrate(db, { migrationsFolder: './migrations' })
    .then(() => console.log('Migrações concluídas com sucesso.'))
    .catch((err) => {
      console.error('As migrações falharam:', err)
      process.exit(1) // Sair do processo se as migrações falharem
    });

} else {
  // Servir com o middleware do Vite em desenvolvimento
  console.log('A executar em modo de desenvolvimento')
  app.use(viteDevServer)
}

/**
 * Iniciar o servidor
 */
const port = Number(process.env.PORT) || 3000
console.log(`Servidor está a ser executado na porta ${port}`)

serve({
  fetch: app.fetch,
  port,
})

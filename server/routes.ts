// server/routes.ts
import express, { Router, Request, Response, NextFunction } from 'express';
import { db } from './db';
import { 
  campaigns as campaignsSchema, 
  tasks as tasksSchema,
  users as usersSchema,
  landingPages as landingPagesSchema,
  whatsAppConnections as whatsAppConnectionsSchema
} from '../shared/schema';
import { eq, desc } from 'drizzle-orm';
import { upload } from './multer.config';
import { geminiService } from './services/gemini.service';
import { funnelGeminiService } from './services/gemini.service.fn'; // Importado o novo serviço
import { openRouterService } from './services/openrouter.service';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { startWhatsAppSession, getSessionStatus, closeWhatsAppSession, getQRCode, sendMessage } from './services/whatsapp-connection.service';
import { executeFlow } from './flow-executor';
import { authenticateToken } from './mcp_handler';
import { googleDriveService } from './services/google-drive.service';

export const apiRouter: Router = Router();

// Middleware de autenticação (exemplo)
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

// Rotas de Usuário
apiRouter.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Usuário e senha são obrigatórios' });
  }
  try {
    const existingUser = await db.select().from(usersSchema).where(eq(usersSchema.username, username)).limit(1);
    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'Usuário já existe' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.insert(usersSchema).values({ username, password: hashedPassword, role: 'user' }).returning();
    res.status(201).json({ id: newUser[0].id, username: newUser[0].username });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

apiRouter.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Usuário e senha são obrigatórios' });
  }
  try {
    const user = await db.select().from(usersSchema).where(eq(usersSchema.username, username)).limit(1);
    if (user.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    const isPasswordValid = await bcrypt.compare(password, user[0].password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    const token = jwt.sign(
      { userId: user[0].id, username: user[0].username, role: user[0].role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );
    res.json({ token, user: { id: user[0].id, username: user[0].username, role: user[0].role } });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});


// Rotas de Campanhas
apiRouter.get('/campaigns', requireAuth, async (req, res) => {
  try {
    const campaigns = await db.select().from(campaignsSchema).orderBy(desc(campaignsSchema.createdAt));
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Falha ao buscar campanhas', error });
  }
});

apiRouter.post('/campaigns', requireAuth, async (req, res) => {
  try {
    const newCampaign = await db.insert(campaignsSchema).values(req.body).returning();
    res.status(201).json(newCampaign[0]);
  } catch (error) {
    res.status(500).json({ message: 'Falha ao criar campanha', error });
  }
});

apiRouter.put('/campaigns/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const updatedCampaign = await db.update(campaignsSchema)
            .set({ ...req.body, updatedAt: new Date() })
            .where(eq(campaignsSchema.id, parseInt(id)))
            .returning();
        if (updatedCampaign.length === 0) {
            return res.status(404).json({ message: 'Campanha não encontrada' });
        }
        res.json(updatedCampaign[0]);
    } catch (error) {
        res.status(500).json({ message: 'Falha ao atualizar campanha', error });
    }
});

apiRouter.delete('/campaigns/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCampaign = await db.delete(campaignsSchema)
            .where(eq(campaignsSchema.id, parseInt(id)))
            .returning();
        if (deletedCampaign.length === 0) {
            return res.status(404).json({ message: 'Campanha não encontrada' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Falha ao deletar campanha', error });
    }
});


// Rotas de Tarefas
apiRouter.get('/tasks', requireAuth, async (req, res) => {
    try {
        const tasks = await db.select().from(tasksSchema).orderBy(desc(tasksSchema.createdAt));
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Falha ao buscar tarefas', error });
    }
});

apiRouter.post('/tasks', requireAuth, async (req, res) => {
    try {
        const newTask = await db.insert(tasksSchema).values(req.body).returning();
        res.status(201).json(newTask[0]);
    } catch (error) {
        res.status(500).json({ message: 'Falha ao criar tarefa', error });
    }
});

apiRouter.put('/tasks/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const updatedTask = await db.update(tasksSchema)
            .set({ ...req.body, updatedAt: new Date() })
            .where(eq(tasksSchema.id, parseInt(id)))
            .returning();
        if (updatedTask.length === 0) {
            return res.status(404).json({ message: 'Tarefa não encontrada' });
        }
        res.json(updatedTask[0]);
    } catch (error) {
        res.status(500).json({ message: 'Falha ao atualizar tarefa', error });
    }
});

apiRouter.delete('/tasks/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTask = await db.delete(tasksSchema)
            .where(eq(tasksSchema.id, parseInt(id)))
            .returning();
        if (deletedTask.length === 0) {
            return res.status(404).json({ message: 'Tarefa não encontrada' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Falha ao deletar tarefa', error });
    }
});

// ✅ ROTA CORRIGIDA PARA ANÁLISE DE CENÁRIO
apiRouter.post('/analyze-scenario', requireAuth, async (req, res) => {
  try {
    const { inputs, calculations } = req.body;
    if (!inputs || !calculations) {
      return res.status(400).json({ message: 'Dados de inputs e calculations são obrigatórios.' });
    }
    const analysis = await funnelGeminiService.analyzeFunnelScenario(inputs, calculations);
    res.json({ analysis });
  } catch (error) {
    console.error('Erro na rota /analyze-scenario:', error);
    res.status(500).json({ message: 'Falha ao analisar o cenário', error: (error as Error).message });
  }
});


// Rota para IA generativa
apiRouter.post('/generate-text', requireAuth, async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ message: 'O prompt é obrigatório.' });
    }
    try {
        const generatedText = await geminiService.generateText(prompt);
        res.json({ text: generatedText });
    } catch (error) {
        console.error('Erro ao gerar texto:', error);
        res.status(500).json({ message: 'Falha ao gerar texto com o serviço Gemini.' });
    }
});

// Rotas para Landing Pages
apiRouter.get('/landingpages', requireAuth, async (req, res) => {
    try {
        const pages = await db.select().from(landingPagesSchema).orderBy(desc(landingPagesSchema.createdAt));
        res.json(pages);
    } catch (error) {
        res.status(500).json({ message: 'Falha ao buscar landing pages', error });
    }
});

apiRouter.get('/landingpages/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const page = await db.select().from(landingPagesSchema).where(eq(landingPagesSchema.id, parseInt(id)));
        if (page.length === 0) {
            return res.status(404).json({ message: 'Landing page não encontrada' });
        }
        res.json(page[0]);
    } catch (error) {
        res.status(500).json({ message: 'Falha ao buscar landing page', error });
    }
});

apiRouter.post('/landingpages/generate-advanced', requireAuth, async (req, res) => {
  const { prompt, options, reference } = req.body;
  if (!prompt) {
    return res.status(400).json({ message: 'O prompt é obrigatório' });
  }
  try {
    const htmlContent = await geminiService.createAdvancedLandingPage(prompt, options, reference);
    res.json({ html: htmlContent });
  } catch (error: any) {
    res.status(500).json({ message: `Erro ao gerar landing page: ${error.message}` });
  }
});

apiRouter.post('/landingpages', requireAuth, async (req, res) => {
  const { name, htmlContent, jsonContent, campaignId } = req.body;
  if (!name || !htmlContent || !jsonContent) {
    return res.status(400).json({ message: 'Nome, conteúdo HTML e JSON são obrigatórios' });
  }

  try {
    const newPage = await db.insert(landingPagesSchema).values({
      name,
      htmlContent,
      jsonContent,
      campaignId: campaignId ? parseInt(campaignId) : null,
      userId: (req as any).user.userId,
    }).returning();
    res.status(201).json(newPage[0]);
  } catch (error) {
    console.error('Erro ao salvar landing page:', error);
    res.status(500).json({ message: 'Falha ao salvar landing page', error });
  }
});

apiRouter.put('/landingpages/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { name, htmlContent, jsonContent } = req.body;
    if (!name || !htmlContent || !jsonContent) {
        return res.status(400).json({ message: 'Nome, conteúdo HTML e JSON são obrigatórios' });
    }

    try {
        const updatedPage = await db.update(landingPagesSchema)
            .set({ name, htmlContent, jsonContent, updatedAt: new Date() })
            .where(eq(landingPagesSchema.id, parseInt(id)))
            .returning();

        if (updatedPage.length === 0) {
            return res.status(404).json({ message: 'Landing page não encontrada' });
        }

        res.json(updatedPage[0]);
    } catch (error) {
        console.error('Erro ao atualizar landing page:', error);
        res.status(500).json({ message: 'Falha ao atualizar landing page', error });
    }
});


apiRouter.delete('/landingpages/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPage = await db.delete(landingPagesSchema)
            .where(eq(landingPagesSchema.id, parseInt(id)))
            .returning();
        if (deletedPage.length === 0) {
            return res.status(404).json({ message: 'Landing page não encontrada' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Falha ao deletar landing page', error });
    }
});


// Rota para OpenRouter
apiRouter.post('/openrouter/chat', requireAuth, async (req, res) => {
    const { model, messages } = req.body;
    if (!model || !messages) {
        return res.status(400).json({ message: 'Modelo e mensagens são obrigatórios.' });
    }
    try {
        const response = await openRouterService.getChatCompletion(model, messages);
        res.json(response);
    } catch (error) {
        console.error('Erro na API da OpenRouter:', error);
        res.status(500).json({ message: 'Falha ao comunicar com a OpenRouter.' });
    }
});

// Rotas de Conexão WhatsApp
apiRouter.post('/whatsapp/connect', requireAuth, async (req, res) => {
    const { sessionId } = req.body;
    if (!sessionId) {
        return res.status(400).json({ message: 'sessionId é obrigatório' });
    }
    try {
        await startWhatsAppSession(sessionId);
        res.status(200).json({ message: 'Iniciando conexão com WhatsApp...', sessionId });
    } catch (error: any) {
        res.status(500).json({ message: `Erro ao iniciar sessão: ${error.message}` });
    }
});

apiRouter.get('/whatsapp/status/:sessionId', requireAuth, async (req, res) => {
    const { sessionId } = req.params;
    try {
        const status = await getSessionStatus(sessionId);
        res.status(200).json({ status });
    } catch (error: any) {
        res.status(500).json({ message: `Erro ao obter status: ${error.message}` });
    }
});

apiRouter.get('/whatsapp/qr/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    try {
        const qrCode = await getQRCode(sessionId);
        if (qrCode) {
            res.status(200).send(`<img src="${qrCode}" alt="QR Code" />`);
        } else {
            res.status(200).send('QR Code não disponível. A sessão pode já estar conectada.');
        }
    } catch (error: any) {
        res.status(500).json({ message: `Erro ao obter QR code: ${error.message}` });
    }
});


apiRouter.post('/whatsapp/disconnect', requireAuth, async (req, res) => {
    const { sessionId } = req.body;
    if (!sessionId) {
        return res.status(400).json({ message: 'sessionId é obrigatório' });
    }
    try {
        await closeWhatsAppSession(sessionId);
        res.status(200).json({ message: 'Sessão do WhatsApp desconectada.' });
    } catch (error: any) {
        res.status(500).json({ message: `Erro ao desconectar: ${error.message}` });
    }
});

apiRouter.post('/whatsapp/send', requireAuth, async (req, res) => {
    const { sessionId, number, message } = req.body;
    if (!sessionId || !number || !message) {
        return res.status(400).json({ message: 'sessionId, number e message são obrigatórios' });
    }
    try {
        await sendMessage(sessionId, number, message);
        res.status(200).json({ success: true, message: 'Mensagem enviada com sucesso.' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: `Erro ao enviar mensagem: ${error.message}` });
    }
});

// Rotas de Automação de Fluxo
apiRouter.post('/flow/execute', authenticateToken, async (req, res) => {
    try {
      const { flow } = req.body;
      const result = await executeFlow(flow);
      res.json({ success: true, result });
    } catch (error: any) {
      console.error("Erro ao executar fluxo:", error);
      res.status(500).json({ success: false, message: error.message });
    }
});

// Rotas Google Drive
apiRouter.get('/drive/files', authenticateToken, async (req, res) => {
    try {
        const files = await googleDriveService.listFiles();
        res.json(files);
    } catch (error: any) {
        res.status(500).json({ message: 'Falha ao listar arquivos do Google Drive', error: error.message });
    }
});

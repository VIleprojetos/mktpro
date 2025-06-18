import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { and, eq, inArray } from 'drizzle-orm';
import { db } from './db'; // Ajuste o caminho se necessário
import { integrations as integrationsTable } from '../shared/schema';
import { HTTPException } from 'hono/http-exception';
import type { User } from './types'; // Supondo que um tipo User exista

export const integrationsRouter = new Hono<{ Variables: { user: User } }>()
  .use('*', async (c, next) => {
    const user = c.get('user');
    if (!user || !user.id) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }
    await next();
  })
  .get('/', async (c) => {
    const user = c.get('user');
    const userIntegrations = await db
      .select()
      .from(integrationsTable)
      .where(eq(integrationsTable.userId, user.id));
    return c.json(userIntegrations);
  })
  .post(
    '/save-credentials',
    zValidator(
      'json',
      z.object({
        id: z.string(),
        name: z.string(),
        clientId: z.string().trim().min(1, 'Client ID é obrigatório'),
        clientSecret: z.string().trim().min(1, 'Client Secret é obrigatório'),
        developerToken: z.string().optional(),
      })
    ),
    async (c) => {
      const user = c.get('user');
      const credentials = c.req.valid('json');

      const dataToUpsert = {
        id: credentials.id,
        userId: user.id,
        name: credentials.name,
        clientId: credentials.clientId,
        clientSecret: credentials.clientSecret,
        developerToken: credentials.developerToken || null,
        updatedAt: new Date(),
      };

      const result = await db
        .insert(integrationsTable)
        .values({
          ...dataToUpsert,
          status: 'disconnected',
          createdAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [integrationsTable.id, integrationsTable.userId],
          set: dataToUpsert,
        })
        .returning();

      return c.json(result[0]);
    }
  )
  .get('/connect/:id', async (c) => {
    const user = c.get('user');
    const { id } = c.req.param();

    const integration = await db.query.integrations.findFirst({
      where: and(eq(integrationsTable.id, id), eq(integrationsTable.userId, user.id)),
    });

    if (!integration?.clientId) {
      throw new HTTPException(400, {
        message: 'Client ID não configurado. Salve as credenciais primeiro.',
      });
    }

    const redirectUri = `${process.env.VITE_APP_URL}/integrations`;
    let authUrl = '';

    const state = Buffer.from(
      JSON.stringify({ userId: user.id, integrationId: id })
    ).toString('base64');

    switch (id) {
      case 'google-ads': {
        const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        url.searchParams.set('client_id', integration.clientId);
        url.searchParams.set('redirect_uri', redirectUri);
        url.searchParams.set('response_type', 'code');
        url.searchParams.set('scope', 'https://www.googleapis.com/auth/adwords');
        url.searchParams.set('access_type', 'offline');
        url.searchParams.set('prompt', 'consent');
        url.searchParams.set('state', state);
        authUrl = url.toString();
        break;
      }
      case 'meta-ads': {
        const url = new URL('https://www.facebook.com/v18.0/dialog/oauth');
        url.searchParams.set('client_id', integration.clientId);
        url.searchParams.set('redirect_uri', redirectUri);
        url.searchParams.set('state', state);
        url.searchParams.set('scope', 'ads_management,ads_read,business_management');
        authUrl = url.toString();
        break;
      }
      default:
        throw new HTTPException(400, {
          message: 'Esta integração não suporta conexão OAuth.',
        });
    }

    return c.json({ authUrl });
  })
  .post(
    '/callback',
    zValidator(
      'json',
      z.object({
        code: z.string(),
        state: z.string(),
      })
    ),
    async (c) => {
      const { code, state } = c.req.valid('json');
      const { userId, integrationId } = JSON.parse(
        Buffer.from(state, 'base64').toString('ascii')
      );
      const currentUser = c.get('user');

      if (currentUser.id !== userId) {
        throw new HTTPException(403, { message: 'Invalido. Violação de segurança.' });
      }

      const integration = await db.query.integrations.findFirst({
        where: and(
          eq(integrationsTable.id, integrationId),
          eq(integrationsTable.userId, userId)
        ),
      });

      if (!integration?.clientId || !integration.clientSecret) {
        throw new HTTPException(500, {
          message: 'Credenciais da integração não configuradas.',
        });
      }

      const redirectUri = `${process.env.VITE_APP_URL}/integrations`;
      let tokenResponse;

      try {
        switch (integrationId) {
          case 'google-ads':
            tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                code,
                client_id: integration.clientId,
                client_secret: integration.clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
              }),
            });
            break;
          case 'meta-ads':
            tokenResponse = await fetch(
              `https://graph.facebook.com/v18.0/oauth/access_token`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                  code,
                  client_id: integration.clientId,
                  client_secret: integration.clientSecret,
                  redirect_uri: redirectUri,
                }),
              }
            );
            break;
          default:
            throw new HTTPException(400, {
              message: 'Integração não suportada para callback.',
            });
        }

        if (!tokenResponse.ok) {
          const errorBody = await tokenResponse.json();
          console.error('OAuth Error:', errorBody);
          throw new Error(
            errorBody.error?.message || 'Falha ao trocar o código pelo token.'
          );
        }

        const tokenData = await tokenResponse.json();

        const updated = await db
          .update(integrationsTable)
          .set({
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            tokenExpiresAt: tokenData.expires_in
              ? Math.floor(Date.now() / 1000) + tokenData.expires_in
              : null,
            status: 'connected',
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(integrationsTable.id, integrationId),
              eq(integrationsTable.userId, userId)
            )
          )
          .returning();

        return c.json(updated[0]);
      } catch (error: any) {
        console.error('OAuth callback error:', error);
        await db
          .update(integrationsTable)
          .set({ status: 'error', updatedAt: new Date() })
          .where(
            and(
              eq(integrationsTable.id, integrationId),
              eq(integrationsTable.userId, userId)
            )
          );
        throw new HTTPException(500, {
          message: error.message || 'Ocorreu um erro durante a autenticação.',
        });
      }
    }
  )
  .post('/disconnect/:id', async (c) => {
    const user = c.get('user');
    const { id } = c.req.param();

    const [deleted] = await db
      .delete(integrationsTable)
      .where(and(eq(integrationsTable.id, id), eq(integrationsTable.userId, user.id)))
      .returning();

    if (!deleted) {
      throw new HTTPException(404, { message: 'Integração não encontrada' });
    }

    // Retornamos um objeto com o ID para o frontend saber qual remover
    return c.json({ id: deleted.id });
  });

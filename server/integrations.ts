import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Link as LinkIcon, 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  Zap,
  Globe,
  Loader2,
  PowerOff
} from 'lucide-react';
import { SiFacebook, SiGoogle, SiInstagram, SiLinkedin, SiTiktok, SiWhatsapp } from 'react-icons/si';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Definição das plataformas com seus metadados
const PLATFORM_CONFIG = [
  { 
    id: 'google', 
    name: 'Google (Ads & Analytics)', 
    icon: SiGoogle, 
    description: 'Sincronize campanhas do Google Ads e dados do Analytics.',
    features: ['Métricas de Anúncios', 'Dados de Audiência', 'Performance de Palavras-chave'],
    enabled: true
  },
  { 
    id: 'facebook', 
    name: 'Meta (Facebook & Instagram)', 
    icon: SiFacebook, 
    description: 'Gerencie e importe dados de anúncios do Facebook e Instagram.',
    features: ['Anúncios do Feed', 'Anúncios dos Stories', 'Métricas de Engajamento'],
    enabled: true
  },
  { 
    id: 'linkedin', 
    name: 'LinkedIn Ads', 
    icon: SiLinkedin, 
    description: 'Conecte sua conta de anúncios do LinkedIn.',
    features: ['Anúncios B2B', 'Geração de Leads', 'Métricas Profissionais'],
    enabled: false
  },
  { 
    id: 'tiktok', 
    name: 'TikTok for Business', 
    icon: SiTiktok, 
    description: 'Importe dados e gerencie suas campanhas do TikTok.',
    features: ['Anúncios em Vídeo', 'Métricas de Viralização', 'Dados Demográficos'],
    enabled: false
  },
  { 
    id: 'whatsapp', 
    name: 'WhatsApp Business', 
    icon: SiWhatsapp, 
    description: 'Automatize mensagens e gerencie conversas.',
    features: ['Disparos em Massa', 'Chatbots', 'Integração com CRM'],
    enabled: false
  },
];

// Tipagem para os dados de uma integração
interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: 'connected' | 'disconnected' | 'error';
  features: string[];
  enabled: boolean;
  lastSync?: string;
  accountInfo?: {
    name: string;
    id: string;
    currency?: string;
  };
}

// Funções de API
async function fetchConnectedPlatforms(): Promise<string[]> {
  const res = await api.get('/api/integrations');
  if (!res.ok) {
    if (res.status === 401) {
        throw new Error('Sessão expirada. Faça login novamente.');
    }
    throw new Error('Falha ao buscar o status das integrações');
  }
  return res.json();
}

async function disconnectPlatform(platformId: string) {
    const res = await api.delete(`/api/integrations/${platformId}`);
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Falha ao desconectar' }));
        throw new Error(errorData.message || 'Falha ao desconectar plataforma');
    }
    return res.json();
}

// Hook customizado para lidar com toasts de redirecionamento
function useIntegrationRedirectFeedback() {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const error = params.get('error');
        const success = params.get('success');

        if (success) {
            toast({ 
                title: 'Conexão bem-sucedida!', 
                description: 'A plataforma foi integrada com sucesso.',
                variant: 'default'
            });
        } else if (error) {
            const errorMessages: Record<string, string> = {
                'auth_failed': 'A autorização falhou ou foi cancelada pelo usuário.',
                'invalid_state': 'A requisição de segurança expirou. Tente novamente.',
                'unsupported_platform': 'A plataforma selecionada não é suportada no momento.',
                'callback_failed': 'Ocorreu um erro ao processar a conexão. Tente novamente.',
            };
            toast({ 
                title: 'Erro na Conexão', 
                description: errorMessages[error] || 'Ocorreu um erro desconhecido.',
                variant: 'destructive' 
            });
        }

        if (error || success) {
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate, toast]);
}


export default function IntegrationsPage() {
  useIntegrationRedirectFeedback();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string | null>('google');

  const { data: connectedPlatforms, isLoading, error } = useQuery({
    queryKey: ['integrations'],
    queryFn: fetchConnectedPlatforms,
    retry: (failureCount, err) => (err as Error).message.includes('Sessão expirada') ? 0 : failureCount < 2,
  });

  const disconnectMutation = useMutation({
    mutationFn: disconnectPlatform,
    onSuccess: (_, platformId) => {
        toast({ title: "Desconectado com sucesso", description: `A integração com ${platformId} foi removida.` });
        queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
    onError: (err) => {
        toast({ title: 'Erro ao Desconectar', description: err.message, variant: 'destructive' });
    }
  });

  const handleConnect = (platformId: string) => {
    window.location.href = `/api/integrations/${platformId}/connect`;
  };

  const handleDisconnect = (platformId: string) => {
    disconnectMutation.mutate(platformId);
  };
  
  // Mapeia a configuração estática com o status dinâmico da API
  const allIntegrations: Integration[] = PLATFORM_CONFIG.map(p => ({
    ...p,
    status: connectedPlatforms?.includes(p.id) ? 'connected' : 'disconnected'
  }));
  
  const selectedIntegrationData = allIntegrations.find(i => i.id === selectedIntegrationId);

  const getStatusIcon = (status: Integration['status']) => {
    if (isLoading) return <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />;
    switch (status) {
      case 'connected': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <PowerOff className="w-5 h-5 text-gray-400" />;
    }
  };
  
  const getStatusBadge = (status: Integration['status']) => {
    switch (status) {
        case 'connected': return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Conectado</Badge>;
        case 'error': return <Badge variant="destructive">Erro</Badge>;
        default: return <Badge variant="outline">Desconectado</Badge>;
    }
  };
  
  if (error) {
    return (
        <div className="flex items-center justify-center h-full text-center text-red-500">
            <AlertCircle className="w-6 h-6 mr-2" />
            <p>{error.message}</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrações</h1>
          <p className="text-muted-foreground">Conecte suas contas para sincronização automática de dados.</p>
        </div>
        <Button disabled>
          <Zap className="w-4 h-4 mr-2" />
          Sincronizar Todas
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Integrações */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Plataformas Disponíveis</CardTitle>
              <CardDescription>Conecte suas contas de publicidade.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="p-4 rounded-xl bg-muted/50 animate-pulse h-[60px]"></div>
                ))
              ) : (
                allIntegrations.map((integration) => (
                  <div
                    key={integration.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                      selectedIntegrationId === integration.id
                        ? 'border-primary bg-primary/10'
                        : 'border-transparent hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedIntegrationId(integration.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <integration.icon className={`w-6 h-6 ${!integration.enabled ? 'text-muted-foreground/50' : ''}`} />
                        <div>
                          <h3 className="font-semibold text-sm">{integration.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {integration.enabled ? `${integration.features.length} recursos` : 'Em breve'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(integration.status)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detalhes da Integração */}
        <div className="lg:col-span-2 space-y-6">
          {selectedIntegrationData ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <selectedIntegrationData.icon className="w-8 h-8" />
                      <div>
                        <CardTitle>{selectedIntegrationData.name}</CardTitle>
                        <CardDescription>{selectedIntegrationData.description}</CardDescription>
                      </div>
                    </div>
                    {selectedIntegrationData.enabled && getStatusBadge(selectedIntegrationData.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Recursos Disponíveis</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedIntegrationData.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="font-normal">{feature}</Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Status da Conexão</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedIntegrationData.status === 'connected'
                          ? 'Conectado e pronto para sincronizar.'
                          : 'Clique em conectar para autorizar o acesso.'
                        }
                      </p>
                    </div>
                    {selectedIntegrationData.enabled ? (
                      selectedIntegrationData.status === 'connected' ? (
                        <Button 
                          variant="destructive"
                          onClick={() => handleDisconnect(selectedIntegrationData.id)}
                          disabled={disconnectMutation.isPending}
                        >
                            {disconnectMutation.isPending && disconnectMutation.variables === selectedIntegrationData.id ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <PowerOff className="w-4 h-4 mr-2" />
                            )}
                            Desconectar
                        </Button>
                      ) : (
                        <Button onClick={() => handleConnect(selectedIntegrationData.id)}>
                          <LinkIcon className="w-4 h-4 mr-2" />
                          Conectar
                        </Button>
                      )
                    ) : (
                      <Button disabled>Em breve</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
          ) : (
            <div className="flex items-center justify-center h-full rounded-lg border border-dashed">
                <div className="text-center text-muted-foreground p-8">
                <Settings className="w-12 h-12 mx-auto mb-4" />
                <p className="text-lg font-semibold">Selecione uma integração</p>
                <p>Clique em uma plataforma à esquerda para ver os detalhes.</p>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

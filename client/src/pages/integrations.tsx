import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Link as LinkIcon, CheckCircle, AlertCircle, Settings, Zap, BarChart3, Trash2, Loader2, PowerOff } from 'lucide-react';
import { SiFacebook, SiGoogle, SiLinkedin, SiTiktok, SiWhatsapp } from 'react-icons/si';
import { apiRequest } from '@/lib/api'; // CORREÇÃO: Importa a função correta
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

type IntegrationStatus = 'connected' | 'disconnected' | 'error';
interface AvailableIntegration {
  id: string;
  name: string;
  description: string;
  icon: any;
  features: string[];
}
type UserIntegration = {
  id: string;
  name: string;
  status: IntegrationStatus;
  clientId?: string | null;
  clientSecret?: string | null;
  developerToken?: string | null;
  accountInfo?: any;
  lastSync?: number | null;
};

const AVAILABLE_INTEGRATIONS: AvailableIntegration[] = [
    { id: 'google-ads', name: 'Google Ads', description: 'Gerencie campanhas, palavras-chave e relatórios.', icon: SiGoogle, features: ['Campanhas', 'Palavras-chave', 'Relatórios', 'Conversões'] },
    { id: 'meta-ads', name: 'Meta Business (Facebook/Instagram)', description: 'Integração completa com Facebook Ads e Instagram.', icon: SiFacebook, features: ['Campanhas', 'Conjuntos de anúncios', 'Criativos', 'Pixels'] },
    { id: 'linkedin-ads', name: 'LinkedIn Ads', description: 'Campanhas B2B e segmentação profissional.', icon: SiLinkedin, features: ['Campanhas B2B', 'Segmentação', 'Lead Gen Forms'] },
    { id: 'tiktok-ads', name: 'TikTok for Business', description: 'Anúncios na plataforma de vídeos mais popular.', icon: SiTiktok, features: ['Vídeo Ads', 'Spark Ads', 'Audiências'] },
    { id: 'whatsapp-business', name: 'WhatsApp Business API', description: 'Automação e mensagens em massa via WhatsApp.', icon: SiWhatsapp, features: ['Mensagens', 'Templates', 'Webhooks'] },
];

const credentialsSchema = z.object({
  clientId: z.string().min(1, 'Client ID é obrigatório.'),
  clientSecret: z.string().min(1, 'Client Secret é obrigatório.'),
  developerToken: z.string().optional(),
});

type CredentialsFormData = z.infer<typeof credentialsSchema>;

const getStatusIcon = (status?: IntegrationStatus) => {
    switch (status) {
        case 'connected': return <CheckCircle className="w-5 h-5 text-green-500" />;
        case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
        default: return <PowerOff className="w-5 h-5 text-gray-400" />;
    }
};

const getStatusBadge = (status?: IntegrationStatus) => {
    switch (status) {
        case 'connected': return <Badge className="bg-green-100 text-green-800">Conectado</Badge>;
        case 'error': return <Badge variant="destructive">Erro</Badge>;
        default: return <Badge variant="outline">Desconectado</Badge>;
    }
};

export default function IntegrationsPage() {
    const [selectedId, setSelectedId] = useState<string>('google-ads');
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: userIntegrations, isLoading: isLoadingIntegrations } = useQuery<UserIntegration[]>({
        queryKey: ['integrations'],
        queryFn: async () => {
            const res = await apiRequest('GET', '/integrations');
            return res.json();
        },
    });

    const integrationsMap = new Map(userIntegrations?.map((i) => [i.id, i]));
    const selectedUserIntegration = integrationsMap.get(selectedId);
    const selectedAvailableIntegration = AVAILABLE_INTEGRATIONS.find(i => i.id === selectedId)!;

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<CredentialsFormData>({
        resolver: zodResolver(credentialsSchema),
        defaultValues: {
            clientId: '',
            clientSecret: '',
            developerToken: '',
        }
    });

    useEffect(() => {
        setValue('clientId', selectedUserIntegration?.clientId || '');
        setValue('clientSecret', selectedUserIntegration?.clientSecret || '');
        setValue('developerToken', selectedUserIntegration?.developerToken || '');
    }, [selectedId, selectedUserIntegration, setValue]);
    
    const callbackMutation = useMutation({
        mutationFn: async ({ code, state }: { code: string; state: string }) => {
            const res = await apiRequest('POST', '/integrations/callback', { code, state });
            return res.json();
        },
        onSuccess: (data: UserIntegration) => {
            queryClient.invalidateQueries({ queryKey: ['integrations'] });
            toast({ title: "Sucesso!", description: `${data.name} conectado.` });
            navigate('/integrations', { replace: true });
        },
        onError: (error: Error) => {
            toast({ title: "Erro na Conexão", description: error.message, variant: 'destructive' });
            navigate('/integrations', { replace: true });
        }
    });

    useEffect(() => {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        if (code && state) {
            callbackMutation.mutate({ code, state });
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, callbackMutation, setSearchParams]);

    const saveCredentialsMutation = useMutation({
        mutationFn: async (data: CredentialsFormData) => {
            const payload = { ...data, id: selectedId, name: selectedAvailableIntegration.name };
            const res = await apiRequest('POST', '/integrations/save-credentials', payload);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['integrations'] });
            toast({ title: "Sucesso!", description: "Credenciais salvas com sucesso." });
        },
        onError: (error: Error) => toast({ title: "Erro", description: error.message, variant: 'destructive' })
    });

    const connectMutation = useMutation({
        mutationFn: async (integrationId: string) => {
            const res = await apiRequest('GET', `/integrations/connect/${integrationId}`);
            return res.json();
        },
        onSuccess: (data: { authUrl: string }) => {
            if (data.authUrl) window.location.href = data.authUrl;
        },
        onError: (error: Error) => toast({ title: "Erro", description: error.message, variant: 'destructive' })
    });

    const disconnectMutation = useMutation({
        mutationFn: async (integrationId: string) => {
            const res = await apiRequest('POST', `/integrations/disconnect/${integrationId}`);
            return res.json();
        },
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ['integrations'] });
             toast({ title: "Desconectado", description: `A integração foi removida.` });
        },
        onError: (error: Error) => toast({ title: "Erro", description: error.message, variant: 'destructive' })
    });
    
    const onSubmitCredentials = (data: CredentialsFormData) => {
        saveCredentialsMutation.mutate(data);
    };

    if (isLoadingIntegrations) {
        return <div className="space-y-6"><Skeleton className="h-12 w-1/3" /><div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><Skeleton className="h-64 lg:col-span-1" /><Skeleton className="h-96 lg:col-span-2" /></div></div>;
    }

    const Icon = selectedAvailableIntegration.icon;
    const status = selectedUserIntegration?.status;

    return (
        <div className="space-y-6">
            {callbackMutation.isPending && (
                <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
                    <div className="flex items-center space-x-2">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="text-lg">Finalizando conexão...</span>
                    </div>
                </div>
            )}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Integrações</h1>
                    <p className="text-muted-foreground">Conecte suas contas de anúncios para sincronização automática</p>
                </div>
                <Button><Zap className="w-4 h-4 mr-2" />Sincronizar Todas</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <Card className="neu-card">
                        <CardHeader><CardTitle>Plataformas Disponíveis</CardTitle><CardDescription>Conecte suas contas de publicidade</CardDescription></CardHeader>
                        <CardContent className="space-y-4">
                            {AVAILABLE_INTEGRATIONS.map((integration) => {
                                const currentStatus = integrationsMap.get(integration.id)?.status;
                                return (
                                    <div key={integration.id} onClick={() => setSelectedId(integration.id)} className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${selectedId === integration.id ? 'neu-card-inset' : 'neu-card hover:scale-105'}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <integration.icon className="w-6 h-6" />
                                                <div>
                                                    <h3 className="font-semibold text-sm">{integration.name}</h3>
                                                    <p className="text-xs text-muted-foreground">{integration.features.length} recursos</p>
                                                </div>
                                            </div>
                                            {getStatusIcon(currentStatus)}
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <Card className="neu-card">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Icon className="w-8 h-8" />
                                    <div>
                                        <CardTitle>{selectedAvailableIntegration.name}</CardTitle>
                                        <CardDescription>{selectedAvailableIntegration.description}</CardDescription>
                                    </div>
                                </div>
                                {getStatusBadge(status)}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div>
                                <h4 className="font-semibold mb-2">Recursos Disponíveis</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedAvailableIntegration.features.map((feature) => (<Badge key={feature} variant="outline">{feature}</Badge>))}
                                </div>
                            </div>
                            <Separator />
                             <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">Status da Conexão</p>
                                    <p className="text-sm text-muted-foreground">
                                        {status === 'connected' ? 'Conectado e sincronizando dados.' : status === 'error' ? 'Falha na conexão. Verifique as credenciais.' : 'É necessário salvar as credenciais e conectar.'}
                                    </p>
                                </div>
                                {status === 'connected' ? (
                                    <Button variant="destructive" onClick={() => disconnectMutation.mutate(selectedId)} disabled={disconnectMutation.isPending} className="neu-button">
                                        {disconnectMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />} Desconectar
                                    </Button>
                                ) : (
                                    <Button onClick={() => connectMutation.mutate(selectedId)} disabled={!selectedUserIntegration?.clientId || connectMutation.isPending} className="neu-button">
                                        {connectMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LinkIcon className="w-4 h-4 mr-2" />} Conectar
                                    </Button>
                                )}
                            </div>

                        </CardContent>
                    </Card>

                    <Tabs defaultValue="setup" className="space-y-4">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="setup">Configuração</TabsTrigger>
                            <TabsTrigger value="sync">Sincronização</TabsTrigger>
                            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
                        </TabsList>
                        <TabsContent value="setup">
                            <form onSubmit={handleSubmit(onSubmitCredentials)}>
                                <Card className="neu-card">
                                    <CardHeader><CardTitle>Configurar Conexão</CardTitle><CardDescription>Insira suas credenciais de API para conectar.</CardDescription></CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="client-id">Client ID</Label>
                                            <Input id="client-id" placeholder="Digite seu Client ID" {...register('clientId')} className="neu-input" />
                                            {errors.clientId && <p className="text-sm text-red-500">{errors.clientId.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="client-secret">Client Secret</Label>
                                            <Input id="client-secret" type="password" placeholder="Digite seu Client Secret" {...register('clientSecret')} className="neu-input" />
                                             {errors.clientSecret && <p className="text-sm text-red-500">{errors.clientSecret.message}</p>}
                                        </div>
                                        {selectedId === 'google-ads' && (
                                            <div className="space-y-2">
                                                <Label htmlFor="developer-token">Developer Token</Label>
                                                <Input id="developer-token" placeholder="Digite seu Developer Token do Google Ads" {...register('developerToken')} className="neu-input" />
                                            </div>
                                        )}
                                        <Button type="submit" className="w-full neu-button" disabled={saveCredentialsMutation.isPending}>
                                            {saveCredentialsMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Salvar Credenciais
                                        </Button>
                                    </CardContent>
                                </Card>
                            </form>
                        </TabsContent>
                         <TabsContent value="sync" className="space-y-4">
                             <Card className="neu-card">
                                 <CardHeader><CardTitle>Configurações de Sincronização</CardTitle><CardDescription>Configure quando e quais dados sincronizar</CardDescription></CardHeader>
                                 <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between"><Label>Funcionalidade em desenvolvimento</Label></div>
                                 </CardContent>
                             </Card>
                         </TabsContent>
                         <TabsContent value="webhooks" className="space-y-4">
                             <Card className="neu-card">
                                 <CardHeader><CardTitle>Configurar Webhooks</CardTitle><CardDescription>Receba notificações em tempo real sobre mudanças</CardDescription></CardHeader>
                                 <CardContent className="space-y-4">
                                     <div className="flex items-center justify-between"><Label>Funcionalidade em desenvolvimento</Label></div>
                                 </CardContent>
                             </Card>
                         </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

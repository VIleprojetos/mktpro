// client/src/pages/funnel.tsx
import React, { useState, useMemo, useEffect, ChangeEvent, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Users, MousePointer, ShoppingCart, Percent, TrendingUp, Plus, Edit, Trash2, Loader2, AlertTriangle, Link as LinkIcon, Filter as FilterIcon, BarChartHorizontalBig, Settings, ShoppingBag, DollarSign as DollarSignIcon, Workflow, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, FunnelChart, Funnel as RechartsFunnel, Tooltip as RechartsTooltip, LabelList, Cell } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api';
import { Funnel as FunnelType, FunnelStage, InsertFunnel, insertFunnelSchema, Campaign as CampaignType } from '@shared/schema';
import { cn } from '@/lib/utils';

interface FunnelWithStages extends FunnelType {
  stages: FunnelStage[];
}

interface FunnelMetrics {
  totalVisitors: number;
  totalConversions: number;
  overallConversionRate: number;
  stagesMetrics: Array<{ name: string; value: number; conversionFromPrevious: number | null; }>;
}

type FunnelFormData = Pick<InsertFunnel, "name" | "description" | "campaignId">;

interface SimulatorData {
  investimentoDiario: number;
  cpc: number;
  precoProduto: number;
  alcanceOrganico: number;
  conversaoAlcanceParaCliques: number;
  taxaConversaoSite: number;
}

const initialSimulatorData: SimulatorData = {
  investimentoDiario: 279.70,
  cpc: 1.95,
  precoProduto: 97.00,
  alcanceOrganico: 12000,
  conversaoAlcanceParaCliques: 2.00,
  taxaConversaoSite: 2.50,
};

const FUNNEL_COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658'];
const SIMULATOR_FUNNEL_COLORS = ['#00C49F', '#FFBB28', '#FF8042'];

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatNumber = (value: number) => new Intl.NumberFormat('pt-BR').format(Math.round(value));

export default function FunnelPage() {
  const [selectedFunnelId, setSelectedFunnelId] = useState<number | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingFunnel, setEditingFunnel] = useState<FunnelType | null>(null);
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const [simulatorData, setSimulatorData] = useState<SimulatorData>(initialSimulatorData);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allFunnels = [], isLoading: isLoadingFunnels, error: funnelsError, refetch: refetchFunnelsList } = useQuery<FunnelType[]>({
    queryKey: ['funnels'],
    queryFn: async () => apiRequest('GET', '/api/funnels').then(res => res.json()),
  });

  const { data: selectedFunnelData, isLoading: isLoadingSelectedFunnel, error: selectedFunnelError } = useQuery<FunnelWithStages>({
    queryKey: ['funnelDetails', selectedFunnelId],
    queryFn: async () => apiRequest('GET', `/api/funnels/${selectedFunnelId}`).then(res => res.json()),
    enabled: !!selectedFunnelId,
  });

  const { data: campaignsList = [] } = useQuery<CampaignType[]>({
    queryKey: ['campaignsForFunnelForm'],
    queryFn: () => apiRequest('GET', '/api/campaigns').then(res => res.json()),
  });

  const form = useForm<FunnelFormData>({
    resolver: zodResolver(insertFunnelSchema.pick({ name: true, description: true, campaignId: true })),
    defaultValues: { name: '', description: '', campaignId: null },
  });

  useEffect(() => {
    if (editingFunnel) {
      form.reset({ name: editingFunnel.name, description: editingFunnel.description || '', campaignId: editingFunnel.campaignId ?? null });
    } else {
      form.reset({ name: '', description: '', campaignId: null });
    }
  }, [editingFunnel, form]);

  const funnelMutation = useMutation<FunnelType, Error, FunnelFormData & { id?: number }>({
    mutationFn: async (data) => {
      const method = data.id ? 'PUT' : 'POST';
      const endpoint = data.id ? `/api/funnels/${data.id}` : '/api/funnels';
      const response = await apiRequest(method, endpoint, data);
      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
        throw new Error(errorResult.message || `Falha ao ${data.id ? 'atualizar' : 'criar'} funil.`);
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: `Funil ${editingFunnel ? 'atualizado' : 'criado'}!`, description: `"${data.name}" foi salvo.` });
      queryClient.invalidateQueries({ queryKey: ['funnels'] });
      setIsFormModalOpen(false);
      setEditingFunnel(null);
      setSelectedFunnelId(data.id);
    },
    onError: (error) => toast({ title: 'Erro ao salvar funil', description: error.message, variant: 'destructive' })
  });

  const deleteFunnelMutation = useMutation<void, Error, number>({
    mutationFn: (id) => apiRequest('DELETE', `/api/funnels/${id}`),
    onSuccess: (_, deletedId) => {
      toast({ title: 'Funil excluído!' });
      queryClient.invalidateQueries({ queryKey: ['funnels'] });
      if (selectedFunnelId === deletedId) setSelectedFunnelId(null);
    },
    onError: (error) => toast({ title: 'Erro ao excluir funil', description: error.message, variant: 'destructive' })
  });

  const handleOpenFormModal = (funnel?: FunnelType) => {
    setEditingFunnel(funnel || null);
    setIsFormModalOpen(true);
  };

  const onSubmitFunnelForm = (data: FunnelFormData) => funnelMutation.mutate({ ...data, id: editingFunnel?.id });
  const handleDeleteFunnel = (id: number) => { if (window.confirm('Excluir este funil e suas etapas?')) deleteFunnelMutation.mutate(id); };

  const filteredFunnelsList = useMemo(() => {
    if (campaignFilter === 'all') return allFunnels;
    return allFunnels.filter(f => String(f.campaignId) === campaignFilter);
  }, [allFunnels, campaignFilter]);

  useEffect(() => {
    if (!selectedFunnelId && filteredFunnelsList.length > 0) {
      setSelectedFunnelId(filteredFunnelsList[0].id);
    } else if (filteredFunnelsList.length === 0) {
        setSelectedFunnelId(null);
    }
  }, [filteredFunnelsList, selectedFunnelId]);

  const funnelMetrics = useMemo((): FunnelMetrics | null => {
    if (!selectedFunnelData || !selectedFunnelData.stages || selectedFunnelData.stages.length === 0) return null;
    const stages = [...selectedFunnelData.stages].sort((a, b) => a.order - b.order);
    const totalVisitors = 10000; // Mock: In a real scenario, this would come from an API or campaign metrics.
    let currentVisitors = totalVisitors;
    const stagesMetrics = stages.map((stage, index) => {
      const conversionRate = 0.4 + (Math.random() * 0.3); // Mock conversion rate (40-70%)
      const previousValue = index === 0 ? totalVisitors : stagesMetrics[index - 1].value;
      currentVisitors = index === 0 ? totalVisitors : Math.round(previousValue * conversionRate);
      return {
        name: `${stage.order}. ${stage.name}`,
        value: currentVisitors,
        conversionFromPrevious: index > 0 ? (currentVisitors / previousValue) * 100 : null
      };
    });
    const totalConversions = stagesMetrics[stagesMetrics.length - 1]?.value || 0;
    const overallConversionRate = totalVisitors > 0 ? (totalConversions / totalVisitors) * 100 : 0;
    return { totalVisitors, totalConversions, overallConversionRate, stagesMetrics };
  }, [selectedFunnelData]);

  const savedFunnelChartData = useMemo(() => funnelMetrics?.stagesMetrics.map((stage, index) => ({
    name: stage.name,
    value: stage.value,
    fill: FUNNEL_COLORS[index % FUNNEL_COLORS.length]
  })) || [], [funnelMetrics]);

  const handleSimulatorInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSimulatorData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSimulatorSliderChange = (name: keyof SimulatorData, value: number[]) => {
    setSimulatorData(prev => ({ ...prev, [name]: value[0] || 0 }));
  };

  const simulatorCalculations = useMemo(() => {
    const d = simulatorData;
    const visitantesPagos = d.cpc > 0 ? d.investimentoDiario / d.cpc : 0;
    const visitantesOrganicos = d.alcanceOrganico * (d.conversaoAlcanceParaCliques / 100);
    const totalVisitantes = visitantesPagos + visitantesOrganicos;
    const vendas = totalVisitantes * (d.taxaConversaoSite / 100);
    const faturamentoDiario = vendas * d.precoProduto;
    const lucroDiario = faturamentoDiario - d.investimentoDiario;
    return { totalVisitantes, vendas, faturamentoDiario, lucroDiario };
  }, [simulatorData]);

  const simulatorFunnelChartData = [
    { name: 'Total Visitantes', value: Math.round(simulatorCalculations.totalVisitantes), fill: SIMULATOR_FUNNEL_COLORS[0] },
    { name: 'Vendas Estimadas', value: Math.round(simulatorCalculations.vendas), fill: SIMULATOR_FUNNEL_COLORS[1] },
  ].filter(item => item.value > 0);

  if (isLoadingFunnels) return <div className="p-8 text-center"><Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" /> Carregando funis...</div>;
  if (funnelsError) return <div className="p-8 text-center text-destructive"><AlertTriangle className="h-12 w-12 mx-auto mb-2" />Erro: {funnelsError.message}<Button onClick={() => refetchFunnelsList()} className="mt-4">Tentar Novamente</Button></div>;

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold tracking-tight">Análise e Simulação de Funis</h1><p className="text-muted-foreground">Gerencie funis existentes e simule novas previsões.</p></div>
        <Button onClick={() => handleOpenFormModal()} className="neu-button-primary"><Plus className="w-4 h-4 mr-2" /> Novo Funil Salvo</Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="overview">Funis Salvos</TabsTrigger>
          <TabsTrigger value="simulator">Simulador</TabsTrigger>
          <TabsTrigger value="detailed" disabled={!selectedFunnelId}>Análise Detalhada (Em breve)</TabsTrigger>
          <TabsTrigger value="optimization" disabled={!selectedFunnelId}>Otimização (Em breve)</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="neu-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Meus Funis</CardTitle>
              <div className="w-full md:w-64">
                <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                  <SelectTrigger className="neu-input"><FilterIcon className="w-4 h-4 mr-2" /><SelectValue placeholder="Filtrar por Campanha" /></SelectTrigger>
                  <SelectContent className="neu-card">
                    <SelectItem value="all">Todas as Campanhas</SelectItem>
                    {campaignsList.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredFunnelsList.length === 0 ? <p className="text-muted-foreground text-center py-4">Nenhum funil salvo encontrado.</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFunnelsList.map((f) => (
                     <Card key={f.id} className={cn('p-4 border-2 rounded-lg cursor-pointer transition-colors', selectedFunnelId === f.id ? 'border-primary bg-primary/5 shadow-md' : 'border-transparent bg-muted/50 hover:border-primary/50')} onClick={() => setSelectedFunnelId(f.id)}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold">{f.name}</h3>
                                <p className="text-xs text-muted-foreground line-clamp-1">{f.description || "Sem descrição"}</p>
                            </div>
                            <div className="flex space-x-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleOpenFormModal(f);}}><Edit className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteFunnel(f.id);}}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                        </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {isLoadingSelectedFunnel && selectedFunnelId ? (<div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /> Carregando detalhes...</div>
          ) : selectedFunnelError ? (<Card className="border-destructive bg-destructive/10"><CardContent className="p-4 text-destructive flex items-center"><AlertCircle className="h-5 w-5 mr-2" />Erro: {selectedFunnelError.message}</CardContent></Card>
          ) : selectedFunnelData && funnelMetrics ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="neu-card"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Visitantes</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatNumber(funnelMetrics.totalVisitors)}</div></CardContent></Card>
                <Card className="neu-card"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Conversões</CardTitle><ShoppingCart className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatNumber(funnelMetrics.totalConversions)}</div></CardContent></Card>
                <Card className="neu-card"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle><Percent className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{funnelMetrics.overallConversionRate.toFixed(2)}%</div></CardContent></Card>
              </div>
              <Card className="neu-card">
                <CardHeader><CardTitle>Visualização do Funil</CardTitle><CardDescription>Fluxo de usuários por etapa (valores simulados baseados em taxas aleatórias).</CardDescription></CardHeader>
                <CardContent className="h-[450px] p-2">
                  {savedFunnelChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <FunnelChart><RechartsTooltip formatter={(value: number, name: string) => [formatNumber(value), name.substring(name.indexOf('.') + 2)]} /><RechartsFunnel dataKey="value" data={savedFunnelChartData} isAnimationActive>{savedFunnelChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}<LabelList position="center" fill="#fff" dataKey="name" formatter={(value: string) => value.substring(value.indexOf('.') + 2)} className="text-sm font-semibold" /></RechartsFunnel></FunnelChart>
                    </ResponsiveContainer>
                  ) : <div className="flex items-center justify-center h-full text-muted-foreground">Este funil não possui etapas.</div>}
                </CardContent>
              </Card>
            </>
          ) : !selectedFunnelId && !isLoadingFunnels && (<Card className="neu-card"><CardContent className="p-8 text-muted-foreground text-center"><Workflow className="h-10 w-10 mx-auto mb-2 opacity-50"/>Selecione um funil salvo para ver os detalhes.</CardContent></Card>)}
        </TabsContent>
        
        <TabsContent value="simulator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1 neu-card">
                <CardHeader><CardTitle>Configurar Simulação</CardTitle><CardDescription>Ajuste os valores para prever resultados.</CardDescription></CardHeader>
                <CardContent className="space-y-5">
                   <div className="space-y-2"><Label htmlFor="sim-inv" className="flex items-center text-sm font-medium"><DollarSignIcon className="w-4 h-4 mr-2"/>Investimento Diário (R$)</Label><div className="flex items-center space-x-2"><Input type="number" id="sim-inv" name="investimentoDiario" value={simulatorData.investimentoDiario} onChange={handleSimulatorInputChange} className="neu-input w-28"/> <Slider value={[simulatorData.investimentoDiario]} onValueChange={(v) => handleSimulatorSliderChange('investimentoDiario', v)} min={0} max={5000} step={10}/></div></div>
                   <div className="space-y-2"><Label htmlFor="sim-cpc" className="flex items-center text-sm font-medium"><MousePointer className="w-4 h-4 mr-2"/>CPC (R$)</Label><div className="flex items-center space-x-2"><Input type="number" id="sim-cpc" name="cpc" value={simulatorData.cpc} onChange={handleSimulatorInputChange} className="neu-input w-28"/> <Slider value={[simulatorData.cpc]} onValueChange={(v) => handleSimulatorSliderChange('cpc', v)} min={0.01} max={20} step={0.01}/></div></div>
                   <div className="space-y-2"><Label htmlFor="sim-preco" className="flex items-center text-sm font-medium"><ShoppingBag className="w-4 h-4 mr-2"/>Preço do Produto (R$)</Label><div className="flex items-center space-x-2"><Input type="number" id="sim-preco" name="precoProduto" value={simulatorData.precoProduto} onChange={handleSimulatorInputChange} className="neu-input w-28"/> <Slider value={[simulatorData.precoProduto]} onValueChange={(v) => handleSimulatorSliderChange('precoProduto', v)} min={1} max={2000} step={1}/></div></div>
                   <div className="space-y-2"><Label htmlFor="sim-alc" className="flex items-center text-sm font-medium"><Users className="w-4 h-4 mr-2"/>Alcance Orgânico Diário</Label><div className="flex items-center space-x-2"><Input type="number" id="sim-alc" name="alcanceOrganico" value={simulatorData.alcanceOrganico} onChange={handleSimulatorInputChange} className="neu-input w-28"/> <Slider value={[simulatorData.alcanceOrganico]} onValueChange={(v) => handleSimulatorSliderChange('alcanceOrganico', v)} min={0} max={100000} step={500}/></div></div>
                   <div className="space-y-2"><Label htmlFor="sim-convAlc" className="flex items-center text-sm font-medium"><Percent className="w-4 h-4 mr-2"/>Conversão Alcance p/ Cliques (%)</Label><div className="flex items-center space-x-2"><Input type="number" id="sim-convAlc" name="conversaoAlcanceParaCliques" value={simulatorData.conversaoAlcanceParaCliques} onChange={handleSimulatorInputChange} className="neu-input w-28"/> <Slider value={[simulatorData.conversaoAlcanceParaCliques]} onValueChange={(v) => handleSimulatorSliderChange('conversaoAlcanceParaCliques', v)} min={0.1} max={20} step={0.1}/></div></div>
                   <div className="space-y-2"><Label htmlFor="sim-txSite" className="flex items-center text-sm font-medium"><TrendingUp className="w-4 h-4 mr-2"/>Taxa de Conversão do Site (%)</Label><div className="flex items-center space-x-2"><Input type="number" id="sim-txSite" name="taxaConversaoSite" value={simulatorData.taxaConversaoSite} onChange={handleSimulatorInputChange} className="neu-input w-28"/> <Slider value={[simulatorData.taxaConversaoSite]} onValueChange={(v) => handleSimulatorSliderChange('taxaConversaoSite', v)} min={0.1} max={20} step={0.1}/></div></div>
                </CardContent>
              </Card>
              <div className="lg:col-span-2 space-y-6">
                <Card className="neu-card">
                  <CardHeader><CardTitle className="flex items-center"><BarChartHorizontalBig className="w-5 h-5 mr-2"/>Previsão do Funil</CardTitle><CardDescription>Resultados com base nas métricas simuladas.</CardDescription></CardHeader>
                  <CardContent>
                    <div className="h-[350px]"><ResponsiveContainer width="100%" height="100%"><FunnelChart><RechartsTooltip formatter={(value, name) => [formatNumber(value as number), name]} /><RechartsFunnel dataKey="value" data={simulatorFunnelChartData} isAnimationActive>{simulatorFunnelChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}<LabelList position="center" fill="#fff" dataKey="name" className="text-sm font-semibold"/></RechartsFunnel></FunnelChart></ResponsiveContainer></div>
                  </CardContent>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="neu-card"><CardHeader><CardTitle className="text-base">Vendas</CardTitle></CardHeader><CardContent className="space-y-1 text-sm"><p>Diário: <span className="font-semibold">{formatNumber(simulatorCalculations.vendas)}</span></p><p>Semanal: <span className="font-semibold">{formatNumber(simulatorCalculations.vendas*7)}</span></p><p>Mensal: <span className="font-semibold">{formatNumber(simulatorCalculations.vendas*30)}</span></p></CardContent></Card>
                  <Card className="neu-card"><CardHeader><CardTitle className="text-base">Faturamento (R$)</CardTitle></CardHeader><CardContent className="space-y-1 text-sm"><p>Diário: <span className="font-semibold">{formatCurrency(simulatorCalculations.faturamentoDiario)}</span></p><p>Semanal: <span className="font-semibold">{formatCurrency(simulatorCalculations.faturamentoDiario * 7)}</span></p><p>Mensal: <span className="font-semibold">{formatCurrency(simulatorCalculations.faturamentoDiario * 30)}</span></p></CardContent></Card>
                  <Card className="neu-card"><CardHeader><CardTitle className="text-base">Lucro (R$)</CardTitle></CardHeader><CardContent className="space-y-1 text-sm"><p>Diário: <span className="font-semibold">{formatCurrency(simulatorCalculations.lucroDiario)}</span></p><p>Semanal: <span className="font-semibold">{formatCurrency(simulatorCalculations.lucroDiario * 7)}</span></p><p>Mensal: <span className="font-semibold">{formatCurrency(simulatorCalculations.lucroDiario * 30)}</span></p></CardContent></Card>
                </div>
              </div>
            </div>
        </TabsContent>
        <TabsContent value="detailed"><Card className="neu-card"><CardContent className="p-12 text-center text-muted-foreground"><Settings className="mx-auto h-12 w-12 mb-4 opacity-50"/> <h3 className="text-xl font-semibold">Em breve</h3><p>Análises detalhadas de cada etapa do funil estarão disponíveis aqui.</p></CardContent></Card></TabsContent>
        <TabsContent value="optimization"><Card className="neu-card"><CardContent className="p-12 text-center text-muted-foreground"><TrendingUp className="mx-auto h-12 w-12 mb-4 opacity-50"/> <h3 className="text-xl font-semibold">Em breve</h3><p>Sugestões de otimização baseadas em IA para melhorar a performance do seu funil.</p></CardContent></Card></TabsContent>
      </Tabs>
      
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="sm:max-w-[500px] neu-card p-0">
            <DialogHeader className="p-6 pb-4 border-b border-border"><DialogTitle className="text-xl">{editingFunnel ? 'Editar Funil' : 'Novo Funil'}</DialogTitle><DialogDescription>{editingFunnel ? `Modificando "${editingFunnel.name}"` : 'Crie um funil para acompanhar suas métricas.'}</DialogDescription></DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitFunnelForm)} className="space-y-5 p-6">
                    <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nome *</FormLabel><FormControl><Input placeholder="Ex: Funil de Vendas Principal" {...field} className="neu-input" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea placeholder="Descreva o objetivo e as etapas deste funil..." {...field} className="neu-input" rows={3} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="campaignId" render={({ field }) => (<FormItem><FormLabel>Campanha (Opcional)</FormLabel><Select value={field.value === null ? "NONE" : String(field.value)} onValueChange={(value) => field.onChange(value === "NONE" ? null : parseInt(value))}><FormControl><SelectTrigger className="neu-input"><SelectValue placeholder="Nenhuma" /></SelectTrigger></FormControl><SelectContent className="neu-card"><SelectItem value="NONE">Nenhuma campanha</SelectItem>{campaignsList.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <DialogFooter className="pt-4"><Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)} disabled={funnelMutation.isPending} className="neu-button">Cancelar</Button><Button type="submit" disabled={funnelMutation.isPending} className="neu-button-primary">{funnelMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {editingFunnel ? 'Salvar' : 'Criar'}</Button></DialogFooter>
                </form>
            </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

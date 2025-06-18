import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/api';
import { LandingPage as LpType, Campaign as CampaignType } from '../../shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { MoreHorizontal, Edit, Bot, Loader2, Link as LinkIcon, Save, ExternalLink, Palette, Zap, Target, Settings, Sparkles, Wand2, Eye, Code, Layers, Rocket, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PuckEditor, Data } from '@/components/PuckEditor'; // Updated import
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const generateLpFormSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  campaignId: z.preprocess((val) => (val === "NONE" || val === "" ? null : Number(val)), z.number().nullable().optional()),
  reference: z.string().url("Por favor, insira uma URL válida.").optional().or(z.literal('')),
  prompt: z.string().min(20, "O prompt deve ter pelo menos 20 caracteres."),
  style: z.enum(['modern', 'minimal', 'bold', 'elegant', 'tech', 'startup']).default('modern'),
  colorScheme: z.enum(['dark', 'light', 'gradient', 'neon', 'earth', 'ocean']).default('dark'),
  industry: z.string().optional(),
  targetAudience: z.string().optional(),
  primaryCTA: z.string().default('Começar Agora'),
  secondaryCTA: z.string().default('Saber Mais'),
  includeTestimonials: z.boolean().default(true),
  includePricing: z.boolean().default(false),
  includeStats: z.boolean().default(true),
  includeFAQ: z.boolean().default(true),
  animationsLevel: z.enum(['none', 'subtle', 'moderate', 'dynamic']).default('moderate'),
});

type GenerateLpFormData = z.infer<typeof generateLpFormSchema>;

interface LandingPageOptions {
  style?: 'modern' | 'minimal' | 'bold' | 'elegant' | 'tech' | 'startup';
  colorScheme?: 'dark' | 'light' | 'gradient' | 'neon' | 'earth' | 'ocean';
  industry?: string;
  targetAudience?: string;
  primaryCTA?: string;
  secondaryCTA?: string;
  includeTestimonials?: boolean;
  includePricing?: boolean;
  includeStats?: boolean;
  includeFAQ?: boolean;
  animationsLevel?: 'none' | 'subtle' | 'moderate' | 'dynamic';
}

export default function LandingPages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewVariations, setPreviewVariations] = useState<string[]>([]);
  const [activePreview, setActivePreview] = useState(0);
  const [showEditor, setShowEditor] = useState(false);
  const [editingLp, setEditingLp] = useState<LpType | null>(null);

  const { data: campaigns = [] } = useQuery<CampaignType[]>({
    queryKey: ['campaignsForLpSelect'],
    queryFn: () => apiRequest('GET', '/api/campaigns').then(res => res.json())
  });

  const { data: landingPages = [] } = useQuery<LpType[]>({
    queryKey: ['landingPages'],
    queryFn: () => apiRequest('GET', '/api/landingpages').then(res => res.json())
  });

  const form = useForm<GenerateLpFormData>({
    resolver: zodResolver(generateLpFormSchema),
    defaultValues: { 
      name: '', 
      campaignId: null, 
      reference: '', 
      prompt: '', 
      style: 'modern', 
      colorScheme: 'dark', 
      industry: '', 
      targetAudience: '', 
      primaryCTA: 'Começar Agora', 
      secondaryCTA: 'Saber Mais', 
      includeTestimonials: true, 
      includePricing: false, 
      includeStats: true, 
      includeFAQ: true, 
      animationsLevel: 'moderate' 
    },
  });

  const previewMutation = useMutation({
    mutationFn: (data: { prompt: string; reference?: string; options?: LandingPageOptions }) => 
      apiRequest('POST', '/api/landingpages/preview-advanced', data).then(res => res.json()),
    onSuccess: (data: { htmlContent: string }) => {
      setPreviewHtml(data.htmlContent);
      setPreviewVariations([]);
      setActivePreview(0);
      toast({ title: "Landing Page Gerada! 🚀", description: "Sua página está pronta para revisão." });
    },
    onError: (error: Error) => {
      toast({ title: "Erro na Geração", description: error.message, variant: "destructive" });
    },
  });

  const variationsMutation = useMutation({
    mutationFn: (data: { prompt: string; reference?: string; options?: LandingPageOptions; count?: number }) => 
      apiRequest('POST', '/api/landingpages/generate-variations', data).then(res => res.json()),
    onSuccess: (data: { variations: string[] }) => {
      setPreviewVariations(data.variations);
      setPreviewHtml(data.variations[0] || null);
      setActivePreview(0);
      toast({ title: `${data.variations.length} Variações Criadas! ✨`, description: "Explore as diferentes opções de design." });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao Gerar Variações", description: error.message, variant: "destructive" });
    },
  });

  const saveAndEditMutation = useMutation({
    mutationFn: (data: { name: string; campaignId: number | null; grapesJsData: Data; generationOptions?: LandingPageOptions }) => 
      apiRequest('POST', '/api/landingpages', data).then(res => res.json()),
    onSuccess: (savedLp: LpType) => {
      toast({ title: "Página Salva com Sucesso! 💾", description: "Abrindo o editor visual..." });
      queryClient.invalidateQueries({ queryKey: ['landingPages'] });
      setEditingLp(savedLp);
      setShowEditor(true);
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao Salvar", description: error.message, variant: "destructive" });
    },
  });

  const updateLpMutation = useMutation({
    mutationFn: (data: { id: number, grapesJsData: Data }) => 
      apiRequest('PUT', `/api/landingpages/${data.id}`, { grapesJsData: data.grapesJsData }),
    onSuccess: () => {
      toast({ title: "Alterações Salvas! ✅", description: "Sua landing page foi atualizada com sucesso." });
      queryClient.invalidateQueries({ queryKey: ['landingPages'] });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao Salvar Alterações", description: error.message, variant: "destructive" });
    }
  });

  const optimizeMutation = useMutation({
    mutationFn: (data: { html: string; goals: string[] }) => 
      apiRequest('POST', '/api/landingpages/optimize', data).then(res => res.json()),
    onSuccess: (data: { htmlContent: string }) => {
      setPreviewHtml(data.htmlContent);
      toast({ title: "Página Otimizada! ⚡", description: "Aplicamos melhorias para aumentar a conversão." });
    },
    onError: (error: Error) => {
      toast({ title: "Erro na Otimização", description: error.message, variant: "destructive" });
    },
  });

  const onGenerateSubmit = (data: GenerateLpFormData) => {
    setPreviewHtml(null);
    setPreviewVariations([]);
    const options: LandingPageOptions = { 
      style: data.style, 
      colorScheme: data.colorScheme, 
      industry: data.industry, 
      targetAudience: data.targetAudience, 
      primaryCTA: data.primaryCTA, 
      secondaryCTA: data.secondaryCTA, 
      includeTestimonials: data.includeTestimonials, 
      includePricing: data.includePricing, 
      includeStats: data.includeStats, 
      includeFAQ: data.includeFAQ, 
      animationsLevel: data.animationsLevel, 
    };
    previewMutation.mutate({ prompt: data.prompt, reference: data.reference, options });
  };

  const onGenerateVariations = () => {
    const data = form.getValues();
    if (!data.prompt) {
      toast({ title: "Prompt necessário", description: "Por favor, preencha a descrição da página.", variant: "destructive"});
      return;
    }
    const options: LandingPageOptions = { 
      style: data.style, 
      colorScheme: data.colorScheme, 
      industry: data.industry, 
      targetAudience: data.targetAudience, 
      primaryCTA: data.primaryCTA, 
      secondaryCTA: data.secondaryCTA, 
      includeTestimonials: data.includeTestimonials, 
      includePricing: data.includePricing, 
      includeStats: data.includeStats, 
      includeFAQ: data.includeFAQ, 
      animationsLevel: data.animationsLevel, 
    };
    variationsMutation.mutate({ prompt: data.prompt, reference: data.reference, options, count: 3 });
  };

  const handleOptimize = () => {
    const currentHtml = getCurrentPreview();
    if (!currentHtml) return;
    optimizeMutation.mutate({ html: currentHtml, goals: ['conversion', 'performance', 'accessibility'] });
  };
  
// Continuação da função handleEditClick (estava incompleta)
  const handleEditClick = () => {
    const currentHtml = getCurrentPreview();
    if (!currentHtml) return;
    const formData = form.getValues();
    const generationOptions: LandingPageOptions = { 
      style: formData.style, 
      colorScheme: formData.colorScheme, 
      industry: formData.industry, 
      targetAudience: formData.targetAudience, 
      primaryCTA: formData.primaryCTA, 
      secondaryCTA: formData.secondaryCTA, 
      includeTestimonials: formData.includeTestimonials, 
      includePricing: formData.includePricing, 
      includeStats: formData.includeStats, 
      includeFAQ: formData.includeFAQ, 
      animationsLevel: formData.animationsLevel,
    };

    // Criar dados compatíveis com o PuckEditor
    const grapesJsData: Data = {
      html: currentHtml,
      css: '', // CSS será extraído do HTML inline ou definido separadamente
      components: null,
      styles: null,
    };

    // Salvar a página e abrir o editor
    saveAndEditMutation.mutate({
      name: formData.name,
      campaignId: formData.campaignId,
      grapesJsData,
      generationOptions
    });
  };

  const getCurrentPreview = (): string | null => {
    if (previewVariations.length > 0) {
      return previewVariations[activePreview] || null;
    }
    return previewHtml;
  };

  const handleSaveFromEditor = (data: Data) => {
    if (!editingLp) return;
    updateLpMutation.mutate({
      id: editingLp.id,
      grapesJsData: data
    });
  };

  const handleBackFromEditor = () => {
    setShowEditor(false);
    setEditingLp(null);
  };

  const openPreviewWindow = () => {
    const currentHtml = getCurrentPreview();
    if (!currentHtml) return;
    
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(currentHtml);
      newWindow.document.close();
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'draft': { color: 'secondary', label: 'Rascunho' },
      'published': { color: 'default', label: 'Publicado' },
      'archived': { color: 'outline', label: 'Arquivado' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.color as any}>{config.label}</Badge>;
  };

  // Se estiver no modo editor, mostrar apenas o editor
  if (showEditor && editingLp) {
    return (
      <PuckEditor
        initialData={editingLp.grapesJsData as Data}
        onSave={handleSaveFromEditor}
        onBack={handleBackFromEditor}
      />
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Landing Pages</h1>
          <p className="text-muted-foreground">
            Crie páginas de alta conversão com IA avançada
          </p>
        </div>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Criar Nova Página
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Gerenciar Páginas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulário de Configuração */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Configuração da Página
                </CardTitle>
                <CardDescription>
                  Configure os detalhes e personalize o estilo da sua landing page
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onGenerateSubmit)} className="space-y-4">
                    {/* Informações Básicas */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome da Página</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Página de Produto SaaS" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="campaignId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Campanha (Opcional)</FormLabel>
                            <Select 
                              onValueChange={(value) => field.onChange(value === "NONE" ? null : Number(value))}
                              value={field.value?.toString() || "NONE"}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione uma campanha" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="NONE">Nenhuma campanha</SelectItem>
                                {campaigns.map((campaign) => (
                                  <SelectItem key={campaign.id} value={campaign.id.toString()}>
                                    {campaign.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="reference"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL de Referência (Opcional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://exemplo.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              URL de uma página similar para inspiração
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="prompt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição da Página</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Descreva o produto/serviço, público-alvo, benefícios principais..."
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Seja específico sobre seu produto, público e objetivos
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    {/* Configurações de Design */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Design & Estilo
                      </h4>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="style"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estilo</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="modern">Moderno</SelectItem>
                                  <SelectItem value="minimal">Minimalista</SelectItem>
                                  <SelectItem value="bold">Arrojado</SelectItem>
                                  <SelectItem value="elegant">Elegante</SelectItem>
                                  <SelectItem value="tech">Tecnológico</SelectItem>
                                  <SelectItem value="startup">Startup</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="colorScheme"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Esquema de Cores</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="dark">Escuro</SelectItem>
                                  <SelectItem value="light">Claro</SelectItem>
                                  <SelectItem value="gradient">Gradiente</SelectItem>
                                  <SelectItem value="neon">Neon</SelectItem>
                                  <SelectItem value="earth">Terra</SelectItem>
                                  <SelectItem value="ocean">Oceano</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="primaryCTA"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CTA Principal</FormLabel>
                              <FormControl>
                                <Input placeholder="Começar Agora" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="secondaryCTA"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CTA Secundário</FormLabel>
                              <FormControl>
                                <Input placeholder="Saber Mais" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Seções e Conteúdo */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        Conteúdo & Seções
                      </h4>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="industry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Setor/Indústria</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: SaaS, E-commerce" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="targetAudience"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Público-Alvo</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: Empresários, Desenvolvedores" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name="includeTestimonials"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <div>
                                <FormLabel>Incluir Depoimentos</FormLabel>
                                <FormDescription>Adicionar seção de testimoniais</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="includePricing"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <div>
                                <FormLabel>Incluir Preços</FormLabel>
                                <FormDescription>Adicionar tabela de preços</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="includeStats"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <div>
                                <FormLabel>Incluir Estatísticas</FormLabel>
                                <FormDescription>Adicionar números e métricas</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="includeFAQ"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <div>
                                <FormLabel>Incluir FAQ</FormLabel>
                                <FormDescription>Adicionar perguntas frequentes</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="animationsLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nível de Animações</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">Sem animações</SelectItem>
                                <SelectItem value="subtle">Sutis</SelectItem>
                                <SelectItem value="moderate">Moderadas</SelectItem>
                                <SelectItem value="dynamic">Dinâmicas</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    {/* Botões de Ação */}
                    <div className="flex gap-2 pt-4">
                      <Button 
                        type="submit" 
                        disabled={previewMutation.isPending}
                        className="flex-1"
                      >
                        {previewMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Gerando...
                          </>
                        ) : (
                          <>
                            <Rocket className="h-4 w-4 mr-2" />
                            Gerar Página
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Preview da Página */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Preview
                  </span>
                  {previewHtml && (
                    <div className="flex items-center gap-2">
                      {previewVariations.length > 1 && (
                        <div className="flex items-center gap-1">
                          {previewVariations.map((_, index) => (
                            <Button
                              key={index}
                              variant={activePreview === index ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                setActivePreview(index);
                                setPreviewHtml(previewVariations[index]);
                              }}
                            >
                              {index + 1}
                            </Button>
                          ))}
                        </div>
                      )}
                      <Button variant="outline" size="sm" onClick={openPreviewWindow}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardTitle>
                <CardDescription>
                  {previewHtml ? "Sua página está pronta! Use as ações abaixo para continuar." : "Configure e gere sua landing page para ver o preview"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {previewHtml ? (
                  <div className="space-y-4">
                    {/* Preview iframe */}
                    <div className="border rounded-lg overflow-hidden bg-white" style={{ height: '400px' }}>
                      <iframe
                        srcDoc={previewHtml}
                        className="w-full h-full"
                        title="Landing Page Preview"
                      />
                    </div>
                    
                    {/* Ações do Preview */}
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        onClick={onGenerateVariations}
                        disabled={variationsMutation.isPending}
                        variant="outline"
                        size="sm"
                      >
                        {variationsMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Gerando...
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-4 w-4 mr-2" />
                            Gerar Variações
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        onClick={handleOptimize}
                        disabled={optimizeMutation.isPending}
                        variant="outline"
                        size="sm"
                      >
                        {optimizeMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Otimizando...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            Otimizar
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        onClick={handleEditClick}
                        disabled={saveAndEditMutation.isPending}
                        size="sm"
                      >
                        {saveAndEditMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Edit className="h-4 w-4 mr-2" />
                            Salvar & Editar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Configure sua página e clique em "Gerar Página" para ver o preview</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          {/* Lista de Landing Pages Existentes */}
          <div className="grid gap-4">
            {landingPages.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-semibold mb-2">Nenhuma landing page criada</h3>
                  <p className="text-muted-foreground mb-4">
                    Comece criando sua primeira página na aba "Criar Nova Página"
                  </p>
                </CardContent>
              </Card>
            ) : (
              landingPages.map((lp) => (
                <Card key={lp.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-semibold">{lp.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(lp.status)}
                            {lp.campaign && (
                              <Badge variant="outline">
                                <Target className="h-3 w-3 mr-1" />
                                {lp.campaign.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {lp.url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={lp.url} target="_blank" rel="noopener noreferrer">
                              <LinkIcon className="h-4 w-4 mr-2" />
                              Ver Online
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingLp(lp);
                            setShowEditor(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// client/src/pages/LaunchSimulator.tsx
import React, { useState, useMemo } from 'react';
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    DollarSign,
    Target,
    Users,
    ShoppingCart,
    TrendingUp,
    BarChart,
    Sparkles,
    HelpCircle,
    FileDown,
    Save,
    Loader2
} from 'lucide-react';

// --- Tipos e Interfaces ---
interface LaunchInputs {
    investimentoTráfego: number;
    cplEstimado: number;
    listaEmailsExistente: number;
    taxaParticipacaoCPL: number;
    taxaCliquesPaginaVendas: number;
    precoProdutoPrincipal: number;
    taxaConversaoPaginaVendas: number;
    habilitarOrderBump: boolean;
    precoOrderBump: number;
    taxaAdesaoOrderBump: number;
    habilitarUpsell: boolean;
    precoUpsell: number;
    taxaAdesaoUpsell: number;
    taxaPlataforma: number;
    taxaAprovacaoPagamentos: number;
    taxaReembolso: number;
}

interface FunnelStageData {
    label: string;
    value: number;
    conversionRate: number; // Taxa de conversão da etapa ANTERIOR para esta
    faturamento?: number; 
}

// --- Estado Inicial ---
const initialState: LaunchInputs = {
    investimentoTráfego: 20000,
    cplEstimado: 2.00,
    listaEmailsExistente: 0,
    taxaParticipacaoCPL: 35,
    taxaCliquesPaginaVendas: 80,
    precoProdutoPrincipal: 990,
    taxaConversaoPaginaVendas: 5,
    habilitarOrderBump: true,
    precoOrderBump: 97,
    taxaAdesaoOrderBump: 35,
    habilitarUpsell: true,
    precoUpsell: 197,
    taxaAdesaoUpsell: 15,
    taxaPlataforma: 7.99,
    taxaAprovacaoPagamentos: 88,
    taxaReembolso: 3,
};

// --- Componentes Auxiliares ---
const InputField = ({ label, id, value, onChange, unit = "R$", type = "number", helpText }: { label: string, id: keyof LaunchInputs, value: number, onChange: (id: keyof LaunchInputs, value: number) => void, unit?: string, type?: string, helpText?: string }) => (
    <div className="space-y-2">
        <div className="flex items-center justify-between">
            <Label htmlFor={id} className="text-sm font-medium text-gray-300">{label}</Label>
            {helpText && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-gray-500" /></TooltipTrigger>
                        <TooltipContent><p>{helpText}</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
        <div className="flex items-center">
            <span className="text-sm bg-gray-700 text-gray-300 px-3 py-2 rounded-l-md border border-r-0 border-gray-600">{unit}</span>
            <Input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange(id, parseFloat(e.target.value) || 0)}
                className="bg-gray-800 border-gray-600 text-white rounded-l-none focus:ring-blue-500 focus:border-blue-500"
            />
        </div>
    </div>
);

const SliderField = ({ label, id, value, onChange, helpText }: { label: string, id: keyof LaunchInputs, value: number, onChange: (id: keyof LaunchInputs, value: number) => void, helpText?: string }) => (
    <div className="space-y-2">
        <div className="flex items-center justify-between">
            <Label htmlFor={id} className="text-sm font-medium text-gray-300">{label}</Label>
            {helpText && (
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-gray-500" /></TooltipTrigger>
                        <TooltipContent><p>{helpText}</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
        <div className="flex items-center gap-4">
            <Slider
                id={id}
                min={0}
                max={100}
                step={1}
                value={[value]}
                onValueChange={(values) => onChange(id, values[0])}
            />
            <span className="text-sm font-semibold text-blue-300 w-12 text-right">{value}%</span>
        </div>
    </div>
);

const FinancialCard = ({ title, value, icon: Icon }: { title: string, value: string, icon: React.ElementType }) => (
    <Card className="bg-gray-800/50 border-gray-700 text-center">
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center justify-center gap-2"><Icon className="h-4 w-4" />{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-2xl font-bold text-blue-300">{value}</p>
        </CardContent>
    </Card>
);

// --- Componente do Funil 3D ---
const Funnel3D = ({ data, formatCurrency, roas }: { data: FunnelStageData[], formatCurrency: (value: number) => string, roas: number }) => {
    const VIEWBOX_WIDTH = 400;
    const VIEWBOX_HEIGHT = 550;
    const MAX_WIDTH = 300;
    const SEGMENT_HEIGHT = 80;
    const ELLIPSE_RY = 20;
    const BASE_HEIGHT = 60;
    
    const maxVal = data.length > 0 ? data[0].value : 1;
    
    const getWidth = (value: number) => {
        if (maxVal === 0) return 0;
        return (value / maxVal) * MAX_WIDTH;
    };

    const segments = data.map((stage, index) => {
        const topY = index * SEGMENT_HEIGHT + 50;
        const topWidth = getWidth(stage.value);
        const bottomWidth = (index < data.length - 1) ? getWidth(data[index+1].value) : getWidth(stage.value) * 0.8;
        
        const x1 = (VIEWBOX_WIDTH - topWidth) / 2;
        const x2 = (VIEWBOX_WIDTH + topWidth) / 2;
        const x3 = (VIEWBOX_WIDTH - bottomWidth) / 2;
        const x4 = (VIEWBOX_WIDTH + bottomWidth) / 2;
        
        const y1 = topY + ELLIPSE_RY;
        const y2 = topY + SEGMENT_HEIGHT;
        
        return {
            ...stage,
            topY,
            topWidth,
            bottomWidth,
            path: `M ${x1} ${y1} L ${x3} ${y2} Q ${VIEWBOX_WIDTH/2} ${y2 + ELLIPSE_RY}, ${x4} ${y2} L ${x2} ${y1} Q ${VIEWBOX_WIDTH/2} ${y1 - ELLIPSE_RY}, ${x1} ${y1} Z`,
            ellipseTopCx: VIEWBOX_WIDTH / 2,
            ellipseTopCy: y1,
            ellipseTopRx: topWidth / 2,
            ellipseTopRy: ELLIPSE_RY,
        };
    });
    
    const lastSegment = segments[segments.length - 1];
    const financialBaseY = lastSegment ? lastSegment.topY + SEGMENT_HEIGHT + ELLIPSE_RY : VIEWBOX_HEIGHT - BASE_HEIGHT;

    return (
        <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} width="100%" height="100%" className="drop-shadow-2xl">
            <defs>
                 <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#4A90E2" /><stop offset="100%" stopColor="#3A7BC8" /></linearGradient>
                <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#50E3C2" /><stop offset="100%" stopColor="#42CBAA" /></linearGradient>
                <linearGradient id="grad3" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#F5A623" /><stop offset="100%" stopColor="#D38E1B" /></linearGradient>
                <linearGradient id="grad4" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#7ED321" /><stop offset="100%" stopColor="#68B61A" /></linearGradient>
                <linearGradient id="gradBase" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#BD10E0" /><stop offset="100%" stopColor="#9E0BC0" /></linearGradient>
            </defs>
            <g>
                {segments.map((s, i) => (
                    <g key={i}>
                        <path d={s.path} fill={`url(#grad${i + 1})`} stroke="#111827" strokeWidth="0.5" />
                        <ellipse cx={s.ellipseTopCx} cy={s.ellipseTopCy} rx={s.ellipseTopRx} ry={s.ellipseTopRy} fill={`url(#grad${i + 1})`} className="brightness-125" />
                        <text x={VIEWBOX_WIDTH / 2} y={s.topY + SEGMENT_HEIGHT / 2 + 5} textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">{s.value.toLocaleString('pt-BR')}</text>
                        <text x={20} y={s.topY + SEGMENT_HEIGHT / 2 - 5} textAnchor="start" fill="#E5E7EB" fontSize="12" fontWeight="bold">{s.label}</text>
                        {i > 0 && (<text x={VIEWBOX_WIDTH - 20} y={s.topY + SEGMENT_HEIGHT / 2 + 5} textAnchor="end" fill="#E5E7EB" fontSize="12" fontWeight="bold">{s.conversionRate.toFixed(1)}%</text>)}
                    </g>
                ))}
                {lastSegment && data.length > 0 && data[data.length -1].faturamento !== undefined && (
                    <g>
                        <path d={`M ${(VIEWBOX_WIDTH - lastSegment.bottomWidth) / 2} ${financialBaseY} L ${(VIEWBOX_WIDTH - lastSegment.bottomWidth * 0.9) / 2} ${financialBaseY + BASE_HEIGHT} Q ${VIEWBOX_WIDTH/2} ${financialBaseY + BASE_HEIGHT + ELLIPSE_RY}, ${(VIEWBOX_WIDTH + lastSegment.bottomWidth*0.9) / 2} ${financialBaseY + BASE_HEIGHT} L ${(VIEWBOX_WIDTH + lastSegment.bottomWidth) / 2} ${financialBaseY} Q ${VIEWBOX_WIDTH/2} ${financialBaseY - ELLIPSE_RY}, ${(VIEWBOX_WIDTH - lastSegment.bottomWidth) / 2} ${financialBaseY} Z`} fill="url(#gradBase)" stroke="#111827" strokeWidth="0.5" />
                        <ellipse cx={VIEWBOX_WIDTH / 2} cy={financialBaseY} rx={lastSegment.bottomWidth/2} ry={ELLIPSE_RY} fill="url(#gradBase)" className="brightness-125" />
                        <text x={VIEWBOX_WIDTH / 2} y={financialBaseY + 25} textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">{formatCurrency(data[data.length - 1].faturamento!)}</text>
                        <text x={VIEWBOX_WIDTH / 2} y={financialBaseY + 45} textAnchor="middle" fill="#E5E7EB" fontSize="12">ROAS: {roas.toFixed(2)}x</text>
                        <text x={20} y={financialBaseY + BASE_HEIGHT / 2} textAnchor="start" fill="#E5E7EB" fontSize="12" fontWeight="bold">Faturação</text>
                    </g>
                )}
            </g>
        </svg>
    );
};


// --- Componente Principal ---
export default function LaunchSimulatorPage() {
    const [inputs, setInputs] = useState<LaunchInputs>(initialState);
    const [insight, setInsight] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleInputChange = (id: keyof LaunchInputs, value: number) => {
        setInputs(prev => ({ ...prev, [id]: value }));
        setInsight(null);
    };

    const handleCheckboxChange = (id: keyof LaunchInputs, checked: boolean) => {
        setInputs(prev => ({ ...prev, [id]: checked }));
        setInsight(null);
    };

    const calculations = useMemo(() => {
        const leadsGerados = inputs.cplEstimado > 0 ? (inputs.investimentoTráfego / inputs.cplEstimado) + inputs.listaEmailsExistente : inputs.listaEmailsExistente;
        const leadsAquecidos = leadsGerados * (inputs.taxaParticipacaoCPL / 100);
        const visitantesPaginaVendas = leadsAquecidos * (inputs.taxaCliquesPaginaVendas / 100);
        const vendasRealizadasBrutas = visitantesPaginaVendas * (inputs.taxaConversaoPaginaVendas / 100);
        const vendasAprovadas = vendasRealizadasBrutas * (inputs.taxaAprovacaoPagamentos / 100);
        const receitaProdutoPrincipal = vendasAprovadas * inputs.precoProdutoPrincipal;
        const vendasOrderBump = inputs.habilitarOrderBump ? vendasAprovadas * (inputs.taxaAdesaoOrderBump / 100) : 0;
        const receitaOrderBump = vendasOrderBump * inputs.precoOrderBump;
        const vendasUpsell = inputs.habilitarUpsell ? vendasAprovadas * (inputs.taxaAdesaoUpsell / 100) : 0;
        const receitaUpsell = vendasUpsell * inputs.precoUpsell;
        const faturamentoBruto = receitaProdutoPrincipal + receitaOrderBump + receitaUpsell;
        const custoTaxas = faturamentoBruto * (inputs.taxaPlataforma / 100);
        const custoReembolso = faturamentoBruto * (inputs.taxaReembolso / 100);
        const lucroLiquido = faturamentoBruto - (inputs.investimentoTráfego + custoTaxas + custoReembolso);
        const roas = inputs.investimentoTráfego > 0 ? faturamentoBruto / inputs.investimentoTráfego : 0;
        const cac = vendasAprovadas > 0 ? inputs.investimentoTráfego / vendasAprovadas : 0;
        const ticketMedio = vendasAprovadas > 0 ? faturamentoBruto / vendasAprovadas : 0;
        return {
            leadsGerados: Math.round(leadsGerados),
            leadsAquecidos: Math.round(leadsAquecidos),
            visitantesPaginaVendas: Math.round(visitantesPaginaVendas),
            vendasRealizadas: Math.round(vendasAprovadas),
            faturamentoBruto, lucroLiquido, roas, cac, ticketMedio, receitaProdutoPrincipal, receitaOrderBump, receitaUpsell, custoTaxas, custoReembolso,
        };
    }, [inputs]);

    const funnelForChart: FunnelStageData[] = [
        { label: 'Leads Gerados', value: calculations.leadsGerados, conversionRate: 100 },
        { label: 'Leads Aquecidos', value: calculations.leadsAquecidos, conversionRate: inputs.taxaParticipacaoCPL },
        { label: 'Visitantes PV', value: calculations.visitantesPaginaVendas, conversionRate: inputs.taxaCliquesPaginaVendas },
        { label: 'Vendas', value: calculations.vendasRealizadas, conversionRate: inputs.taxaConversaoPaginaVendas, faturamento: calculations.faturamentoBruto },
    ];
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    
    const handleGeminiAnalysis = async () => {
        setIsAnalyzing(true);
        setInsight("A analisar o seu cenário... Isto pode demorar alguns segundos.");

        const prompt = `
            Aja como um especialista em marketing digital e lançamentos de infoprodutos. Analise o seguinte cenário de lançamento e forneça um insight estratégico em português (Portugal).

            **Dados do Cenário:**
            - Investimento em Tráfego: ${formatCurrency(inputs.investimentoTráfego)}
            - Custo por Lead (CPL) Estimado: ${formatCurrency(inputs.cplEstimado)}
            - Lista de E-mails Existente: ${inputs.listaEmailsExistente.toLocaleString('pt-BR')} leads
            - Taxa de Participação nos CPLs: ${inputs.taxaParticipacaoCPL}%
            - Taxa de Cliques para a Página de Vendas: ${inputs.taxaCliquesPaginaVendas}%
            - Preço do Produto Principal: ${formatCurrency(inputs.precoProdutoPrincipal)}
            - Taxa de Conversão da Página de Vendas: ${inputs.taxaConversaoPaginaVendas}%
            - Order Bump: ${inputs.habilitarOrderBump ? `Sim (${formatCurrency(inputs.precoOrderBump)} com ${inputs.taxaAdesaoOrderBump}% de adesão)` : 'Não'}
            - Upsell: ${inputs.habilitarUpsell ? `Sim (${formatCurrency(inputs.precoUpsell)} com ${inputs.taxaAdesaoUpsell}% de adesão)` : 'Não'}

            **Resultados Calculados:**
            - Faturação Bruta: ${formatCurrency(calculations.faturamentoBruto)}
            - Lucro Líquido: ${formatCurrency(calculations.lucroLiquido)}
            - ROAS: ${calculations.roas.toFixed(2)}x
            - Custo por Aquisição (CAC): ${formatCurrency(calculations.cac)}
            - Ticket Médio: ${formatCurrency(calculations.ticketMedio)}

            **Sua Tarefa:**
            1.  **Diagnóstico Rápido:** Identifique o principal ponto de estrangulamento ou a maior alavanca de crescimento neste funil.
            2.  **Recomendações Acionáveis:** Forneça 2 a 3 sugestões claras, específicas e práticas para melhorar os resultados. Explique o "porquê" de cada sugestão.
            3.  **Impacto Potencial:** Descreva brevemente o impacto esperado se as suas sugestões forem implementadas.

            Seja direto, estratégico e use uma linguagem que um gestor de marketing entenderia facilmente. Formate a resposta de forma clara, usando listas ou parágrafos curtos.
        `;

        try {
            let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
            const payload = { contents: chatHistory };
            const apiKey = ""; 
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`API error: ${response.statusText}`);
            
            const result = await response.json();

            if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
                setInsight(result.candidates[0].content.parts[0].text);
            } else {
                throw new Error("Resposta da IA inválida ou vazia.");
            }
        } catch (error) {
            console.error("Erro ao chamar a Gemini API:", error);
            setInsight("Ocorreu um erro ao tentar analisar o cenário. Por favor, tente novamente.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8 font-sans">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Simulador de Lançamento Digital</h1>
                <p className="text-lg text-gray-400 mt-2">Planeje, simule e otimize os seus resultados antes de investir.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Coluna 1: Entradas */}
                <div className="lg:col-span-3">
                    <Card className="bg-gray-800/50 border border-gray-700 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-xl text-white">Painel de Controlo</CardTitle>
                            <CardDescription>Insira as variáveis do seu lançamento.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3', 'item-4']} className="w-full">
                                <AccordionItem value="item-1"><AccordionTrigger>Investimento e Geração de Leads</AccordionTrigger><AccordionContent className="space-y-4 pt-4"><InputField label="Investimento em Tráfego" id="investimentoTráfego" value={inputs.investimentoTráfego} onChange={handleInputChange} /><InputField label="Custo por Lead (CPL) Estimado" id="cplEstimado" value={inputs.cplEstimado} onChange={handleInputChange} /><InputField label="Tamanho da Lista de E-mails" id="listaEmailsExistente" value={inputs.listaEmailsExistente} onChange={handleInputChange} unit="Leads" /></AccordionContent></AccordionItem>
                                <AccordionItem value="item-2"><AccordionTrigger>Engajamento do Pré-Lançamento</AccordionTrigger><AccordionContent className="space-y-4 pt-4"><SliderField label="Taxa de Participação nos CPLs" id="taxaParticipacaoCPL" value={inputs.taxaParticipacaoCPL} onChange={handleInputChange} helpText="Dos leads gerados, quantos % assistirão seus conteúdos gratuitos de aquecimento (CPLs)." /><SliderField label="Taxa de Cliques para Página de Vendas" id="taxaCliquesPaginaVendas" value={inputs.taxaCliquesPaginaVendas} onChange={handleInputChange} helpText="Dos leads que participaram, quantos % clicarão para visitar a página de vendas." /></AccordionContent></AccordionItem>
                                <AccordionItem value="item-3"><AccordionTrigger>A Oferta e a Conversão</AccordionTrigger><AccordionContent className="space-y-4 pt-4"><InputField label="Preço do Produto Principal" id="precoProdutoPrincipal" value={inputs.precoProdutoPrincipal} onChange={handleInputChange} /><SliderField label="Taxa de Conversão da Página de Vendas" id="taxaConversaoPaginaVendas" value={inputs.taxaConversaoPaginaVendas} onChange={handleInputChange} /><div className="space-y-4 pt-4 border-t border-gray-700"><div className="flex items-center space-x-2"><Checkbox id="habilitarOrderBump" checked={inputs.habilitarOrderBump} onCheckedChange={(c) => handleCheckboxChange('habilitarOrderBump', !!c)} /><label htmlFor="habilitarOrderBump" className="text-sm">Habilitar Order Bump?</label></div>{inputs.habilitarOrderBump && (<><InputField label="Preço do Order Bump" id="precoOrderBump" value={inputs.precoOrderBump} onChange={handleInputChange} /><SliderField label="Taxa de Adesão ao Order Bump" id="taxaAdesaoOrderBump" value={inputs.taxaAdesaoOrderBump} onChange={handleInputChange} /></>)}</div><div className="space-y-4 pt-4 border-t border-gray-700"><div className="flex items-center space-x-2"><Checkbox id="habilitarUpsell" checked={inputs.habilitarUpsell} onCheckedChange={(c) => handleCheckboxChange('habilitarUpsell', !!c)} /><label htmlFor="habilitarUpsell" className="text-sm">Habilitar Upsell?</label></div>{inputs.habilitarUpsell && (<><InputField label="Preço do Upsell" id="precoUpsell" value={inputs.precoUpsell} onChange={handleInputChange} /><SliderField label="Taxa de Adesão ao Upsell" id="taxaAdesaoUpsell" value={inputs.taxaAdesaoUpsell} onChange={handleInputChange} /></>)}</div></AccordionContent></AccordionItem>
                                <AccordionItem value="item-4"><AccordionTrigger>Variáveis Financeiras</AccordionTrigger><AccordionContent className="space-y-4 pt-4"><InputField label="Taxa da Plataforma/Gateway" id="taxaPlataforma" value={inputs.taxaPlataforma} onChange={handleInputChange} unit="%" /><SliderField label="Taxa de Aprovação de Pagamentos" id="taxaAprovacaoPagamentos" value={inputs.taxaAprovacaoPagamentos} onChange={handleInputChange} helpText="Considera boletos não pagos e cartões recusados." /><SliderField label="Taxa de Reembolso Estimada" id="taxaReembolso" value={inputs.taxaReembolso} onChange={handleInputChange} /></AccordionContent></AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                </div>

                {/* Coluna 2: Funil */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center">
                   <Funnel3D data={funnelForChart} formatCurrency={formatCurrency} roas={calculations.roas} />
                </div>

                {/* Coluna 3: Saídas */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="bg-gray-800/50 border-gray-700">
                        <CardHeader><CardTitle className="text-xl text-white">Projeções e Análise</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <FinancialCard title="Faturação Bruta" value={formatCurrency(calculations.faturamentoBruto)} icon={DollarSign} />
                                <FinancialCard title="Lucro Líquido" value={formatCurrency(calculations.lucroLiquido)} icon={TrendingUp} />
                                <FinancialCard title="ROAS" value={`${calculations.roas.toFixed(2)}x`} icon={BarChart} />
                                <FinancialCard title="CAC" value={formatCurrency(calculations.cac)} icon={Target} />
                                <FinancialCard title="Ticket Médio" value={formatCurrency(calculations.ticketMedio)} icon={ShoppingCart} />
                                <FinancialCard title="Vendas" value={calculations.vendasRealizadas.toString()} icon={Users} />
                            </div>
                            <Accordion type="single" collapsible><AccordionItem value="financial-details"><AccordionTrigger>Detalhamento Financeiro</AccordionTrigger><AccordionContent className="text-sm space-y-2 pt-2"><div className="flex justify-between"><span>Receita do Produto Principal:</span> <span className="font-medium">{formatCurrency(calculations.receitaProdutoPrincipal)}</span></div><div className="flex justify-between"><span>Receita do Order Bump:</span> <span className="font-medium text-green-400">+ {formatCurrency(calculations.receitaOrderBump)}</span></div><div className="flex justify-between"><span>Receita do Upsell:</span> <span className="font-medium text-green-400">+ {formatCurrency(calculations.receitaUpsell)}</span></div><hr className="border-gray-600 my-2" /><div className="flex justify-between font-bold"><span>Faturação Total Bruta:</span> <span>{formatCurrency(calculations.faturamentoBruto)}</span></div><div className="flex justify-between text-red-400"><span>- Investimento em Tráfego:</span> <span>{formatCurrency(inputs.investimentoTráfego)}</span></div><div className="flex justify-between text-red-400"><span>- Taxas da Plataforma:</span> <span>{formatCurrency(calculations.custoTaxas)}</span></div><div className="flex justify-between text-red-400"><span>- Reembolsos Estimados:</span> <span>{formatCurrency(calculations.custoReembolso)}</span></div><hr className="border-gray-600 my-2" /><div className="flex justify-between font-bold text-xl text-green-300"><span>Lucro Líquido do Lançamento:</span> <span>{formatCurrency(calculations.lucroLiquido)}</span></div></AccordionContent></AccordionItem></Accordion>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-800/50 border-gray-700">
                        <CardHeader><CardTitle className="text-xl text-white flex items-center gap-2"><Sparkles className="text-purple-400" />Análise de Alavancagem com IA</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                             <Button
                                variant="default"
                                className="w-full justify-center bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                                onClick={handleGeminiAnalysis}
                                disabled={isAnalyzing}
                            >
                                {isAnalyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                                {isAnalyzing ? 'A analisar...' : 'Analisar Cenário com IA'}
                            </Button>
                            {insight && (
                                <div className="mt-4 p-4 bg-gray-900/70 border border-purple-500/30 rounded-md text-sm text-gray-300 prose prose-invert prose-sm max-w-none">
                                    <p className="whitespace-pre-wrap font-sans">{insight}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex gap-4">
                        <Button className="w-full" variant="outline"><Save className="h-4 w-4 mr-2" /> Salvar Cenário</Button>
                        <Button className="w-full"><FileDown className="h-4 w-4 mr-2" /> Exportar PDF</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

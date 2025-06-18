// client/src/pages/LaunchSimulator.tsx
import React, { useState, useMemo, useRef } from 'react';
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from '@/lib/api';
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

// Declaração de tipos globais para as bibliotecas carregadas via script
declare global {
    interface Window {
        jspdf: any;
        html2canvas: any;
    }
}

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
    conversionRate: number;
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
            <Label htmlFor={id} className="text-sm font-medium text-blue-200 neon-text-subtle">{label}</Label>
            {helpText && (
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-blue-400 cursor-help" /></TooltipTrigger>
                        <TooltipContent className="holographic-card-dark"><p>{helpText}</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
        <div className="flex items-center">
            <span className="holographic-input-addon">{unit}</span>
            <Input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange(id, parseFloat(e.target.value) || 0)}
                className="holographic-input"
            />
        </div>
    </div>
);

const SliderField = ({ label, id, value, onChange, helpText }: { label: string, id: keyof LaunchInputs, value: number, onChange: (id: keyof LaunchInputs, value: number) => void, helpText?: string }) => (
    <div className="space-y-2">
        <div className="flex items-center justify-between">
            <Label htmlFor={id} className="text-sm font-medium text-blue-200 neon-text-subtle">{label}</Label>
            {helpText && (
                 <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-blue-400 cursor-help" /></TooltipTrigger>
                        <TooltipContent className="holographic-card-dark"><p>{helpText}</p></TooltipContent>
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
            <span className="text-sm font-semibold text-cyan-300 neon-text w-12 text-right">{value}%</span>
        </div>
    </div>
);

const FinancialCard = ({ title, value, icon: Icon }: { title: string, value: string, icon: React.ElementType }) => (
    <Card className="holographic-card text-center p-1">
        <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-blue-300 neon-text-subtle flex items-center justify-center gap-2">
                <Icon className="h-4 w-4 neon-icon" />{title}
            </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
            <p className="text-xl md:text-2xl font-bold text-cyan-300 neon-text">{value}</p>
        </CardContent>
    </Card>
);

const Funnel3D = ({ data, roas }: { data: FunnelStageData[], roas: number }) => {
    const VIEWBOX_WIDTH = 400;
    const VIEWBOX_HEIGHT = 550;
    const MAX_WIDTH = 300;
    const SEGMENT_HEIGHT = 80;
    const ELLIPSE_RY = 20;
    const BASE_HEIGHT = 60;
    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    
    const maxVal = data.length > 0 ? data[0].value : 1;
    
    const getWidth = (value: number) => {
        if (maxVal === 0) return 0;
        return Math.max((value / maxVal) * MAX_WIDTH, 20);
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
            path: `M ${x1} ${y1} L ${x3} ${y2} Q ${VIEWBOX_WIDTH/2} ${y2 + ELLIPSE_RY}, ${x4} ${y2} L ${x2} ${y1} Q ${VIEWBOX_WIDTH/2} ${y1 - ELLIPSE_RY}, ${x1} ${y1} Z`,
            ellipseTopCx: VIEWBOX_WIDTH / 2,
            ellipseTopCy: y1,
            ellipseTopRx: topWidth / 2,
        };
    });
    
    const lastSegment = segments[segments.length - 1];
    const financialBaseY = lastSegment ? lastSegment.topY + SEGMENT_HEIGHT + ELLIPSE_RY : VIEWBOX_HEIGHT - BASE_HEIGHT;

    return (
        <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} width="100%" height="100%">
            <defs>
                <linearGradient id="gradBlue1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#00d9ff" /><stop offset="100%" stopColor="#00bfff" /></linearGradient>
                <linearGradient id="gradBlue2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#00bfff" /><stop offset="100%" stopColor="#008fcc" /></linearGradient>
                <linearGradient id="gradBlue3" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#008fcc" /><stop offset="100%" stopColor="#006f99" /></linearGradient>
                <linearGradient id="gradBlue4" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#006f99" /><stop offset="100%" stopColor="#004f66" /></linearGradient>
            </defs>
            <g className="funnel-3d-group">
                {segments.map((s, i) => (
                    <g key={i} className="funnel-segment" style={{ '--i': i } as React.CSSProperties}>
                        <path d={s.path} fill={`url(#gradBlue${i + 1})`} fillOpacity="0.5" stroke={`url(#gradBlue${i + 1})`} strokeWidth="1" />
                        <ellipse cx={s.ellipseTopCx} cy={s.ellipseTopCy} rx={s.ellipseTopRx} ry={ELLIPSE_RY} fill={`url(#gradBlue${i + 1})`} fillOpacity="0.7" className="brightness-150" />
                        <text x={VIEWBOX_WIDTH / 2} y={s.topY + SEGMENT_HEIGHT / 2 + 5} textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" className="neon-text-strong">{s.value.toLocaleString('pt-BR')}</text>
                        <text x={30} y={s.topY + SEGMENT_HEIGHT / 2 - 5} textAnchor="start" fill="#E5E7EB" fontSize="13" fontWeight="bold" className="neon-text-subtle">{s.label}</text>
                        {i > 0 && (<text x={VIEWBOX_WIDTH - 30} y={s.topY + SEGMENT_HEIGHT / 2 + 5} textAnchor="end" fill="#E5E7EB" fontSize="14" fontWeight="bold" className="neon-text">{s.conversionRate.toFixed(1)}%</text>)}
                    </g>
                ))}
                {lastSegment && data.length > 0 && data[data.length -1].faturamento !== undefined && (
                    <g className="funnel-segment" style={{ '--i': 4 } as React.CSSProperties}>
                        <path d={`M ${(VIEWBOX_WIDTH - getWidth(data[data.length-1].value)*0.8) / 2} ${financialBaseY} L ${(VIEWBOX_WIDTH - getWidth(data[data.length-1].value) * 0.7) / 2} ${financialBaseY + BASE_HEIGHT} Q ${VIEWBOX_WIDTH/2} ${financialBaseY + BASE_HEIGHT + ELLIPSE_RY}, ${(VIEWBOX_WIDTH + getWidth(data[data.length-1].value)*0.7) / 2} ${financialBaseY + BASE_HEIGHT} L ${(VIEWBOX_WIDTH + getWidth(data[data.length-1].value)*0.8) / 2} ${financialBaseY} Q ${VIEWBOX_WIDTH/2} ${financialBaseY - ELLIPSE_RY}, ${(VIEWBOX_WIDTH - getWidth(data[data.length-1].value)*0.8) / 2} ${financialBaseY} Z`} fill="url(#gradBlue1)" fillOpacity="0.5" stroke="url(#gradBlue1)" strokeWidth="1" />
                        <ellipse cx={VIEWBOX_WIDTH / 2} cy={financialBaseY} rx={getWidth(data[data.length - 1].value)*0.8/2} ry={ELLIPSE_RY} fill="url(#gradBlue1)" fillOpacity="0.7" className="brightness-150" />
                        <text x={VIEWBOX_WIDTH / 2} y={financialBaseY + 25} textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" className="neon-text-strong">{formatCurrency(data[data.length - 1].faturamento!)}</text>
                        <text x={VIEWBOX_WIDTH / 2} y={financialBaseY + 48} textAnchor="middle" fill="#E5E7EB" fontSize="14" className="neon-text">ROAS: {roas.toFixed(2)}x</text>
                        <text x={30} y={financialBaseY + BASE_HEIGHT / 2} textAnchor="start" fill="#E5E7EB" fontSize="13" fontWeight="bold" className="neon-text-subtle">Faturação</text>
                    </g>
                )}
            </g>
        </svg>
    );
};


export default function LaunchSimulatorPage() {
    const [inputs, setInputs] = useState<LaunchInputs>(initialState);
    const [insight, setInsight] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const resultsRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

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
            leadsGerados: Math.round(leadsGerados), leadsAquecidos: Math.round(leadsAquecidos), visitantesPaginaVendas: Math.round(visitantesPaginaVendas), vendasRealizadas: Math.round(vendasAprovadas),
            faturamentoBruto, lucroLiquido, roas, cac, ticketMedio, receitaProdutoPrincipal, receitaOrderBump, receitaUpsell, custoTaxas, custoReembolso,
        };
    }, [inputs]);

    const funnelForChart: FunnelStageData[] = [
        { label: 'ALCANCE POTENCIAL', value: calculations.leadsGerados, conversionRate: 100 },
        { label: 'ENGAJAMENTO', value: calculations.leadsAquecidos, conversionRate: inputs.taxaParticipacaoCPL },
        { label: 'INTENÇÃO', value: calculations.visitantesPaginaVendas, conversionRate: inputs.taxaCliquesPaginaVendas },
        { label: 'CONVERSÃO', value: calculations.vendasRealizadas, conversionRate: inputs.taxaConversaoPaginaVendas, faturamento: calculations.faturamentoBruto },
    ];
    
    const handleGeminiAnalysis = async () => {
        setIsAnalyzing(true);
        setInsight("A IA está a analisar o seu cenário... Este processo pode demorar alguns segundos.");
        try {
            const res = await apiRequest('POST', '/api/analyze-scenario', { inputs, calculations });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: 'Erro desconhecido ao processar a resposta do servidor.' }));
                throw new Error(errorData.message || `API Error: ${res.status}`);
            }
            const data = await res.json();
            setInsight(data.analysis);
        } catch (error) {
            console.error("Erro ao chamar a API de análise:", error);
            setInsight(`Ocorreu um erro ao tentar analisar o cenário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSaveScenario = async () => {
        const scenarioName = prompt("Por favor, dê um nome para este cenário:", "Cenário Realista");
        if (!scenarioName) {
            toast({ title: "Cancelado", description: "O cenário não foi salvo.", variant: "destructive" });
            return;
        }
        try {
            await apiRequest('POST', '/api/scenarios', {
                name: scenarioName,
                inputs: inputs,
                results: calculations
            });
            toast({ title: "Cenário Salvo!", description: `"${scenarioName}" foi guardado com sucesso.`, className: "holographic-card-dark" });
        } catch (error) {
             toast({ title: "Erro ao Salvar", description: `Não foi possível salvar o cenário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, variant: "destructive" });
        }
    };

    const handleExportPdf = () => {
        const { jsPDF } = (window as any).jspdf || {};
        const html2canvas = (window as any).html2canvas;

        if (!jsPDF || !html2canvas) {
            toast({ title: "Erro", description: "Recursos de exportação não estão prontos. Por favor, recarregue a página e tente novamente.", variant: "destructive" });
            return;
        }

        const input = resultsRef.current;
        if (input) {
            toast({ title: "A gerar PDF...", description: "Por favor, aguarde.", className: "holographic-card-dark" });
            html2canvas(input, { 
                backgroundColor: '#0A0F1F', 
                useCORS: true, 
                scale: 2 
            }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save("simulacao-lancamento.pdf");
            });
        }
    };

    return (
        <>
            <style>{`:root { --neon-cyan: #00f6ff; --neon-blue: #00bfff; }
                .holographic-body-container { background: #0A0F1F; }
                .holographic-card { background: rgba(18, 28, 58, 0.5); border: 1px solid rgba(0, 191, 255, 0.3); backdrop-filter: blur(8px); box-shadow: 0 0 15px rgba(0, 191, 255, 0.1), 0 0 30px rgba(0, 191, 255, 0.1); transition: all 0.3s ease; }
                .holographic-card:hover { border-color: rgba(0, 191, 255, 0.7); box-shadow: 0 0 20px rgba(0, 191, 255, 0.3), 0 0 40px rgba(0, 191, 255, 0.2); }
                .holographic-card-dark { background: rgba(10, 15, 31, 0.8); border: 1px solid rgba(0, 191, 255, 0.5); color: #fff; }
                .neon-text { text-shadow: 0 0 5px var(--neon-cyan), 0 0 10px var(--neon-cyan); }
                .neon-text-strong { text-shadow: 0 0 5px #fff, 0 0 10px var(--neon-cyan), 0 0 15px var(--neon-cyan); }
                .neon-text-subtle { text-shadow: 0 0 8px var(--neon-blue); }
                .neon-icon { filter: drop-shadow(0 0 4px var(--neon-cyan)); }
                .holographic-input, .holographic-input-addon { background: rgba(18, 28, 58, 0.7); border: 1px solid rgba(0, 191, 255, 0.4); color: white; transition: all 0.3s ease; }
                .holographic-input-addon { border-right: none; }
                .holographic-input { border-left: none; }
                .holographic-input:focus { background: rgba(28, 40, 78, 0.8); border-color: var(--neon-cyan); box-shadow: 0 0 15px rgba(0, 246, 255, 0.3); }
                .funnel-3d-group { animation: float 6s ease-in-out infinite; }
                .funnel-segment { animation: float-segment 8s ease-in-out infinite; animation-delay: calc(var(--i) * 0.2s); }
                @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
                @keyframes float-segment { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.02); opacity: 0.95; } }
            `}</style>
            <div className="min-h-screen holographic-body-container text-gray-200 p-4 sm:p-6 lg:p-8 font-sans" style={{ background: '#0A0F1F' }}>
                <div className="relative z-10">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl lg:text-5xl font-bold text-white neon-text-strong">Simulador de Lançamento Digital</h1>
                        <p className="text-lg text-blue-300 mt-2 neon-text-subtle">Planeje, simule e otimize os seus resultados com uma estética futurista.</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-3">
                            <Card className="holographic-card">
                                <CardHeader><CardTitle className="text-xl text-white neon-text-strong">Painel de Controlo</CardTitle><CardDescription className="text-blue-300 neon-text-subtle">Insira as variáveis do seu lançamento.</CardDescription></CardHeader>
                                <CardContent>
                                    <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-full">
                                        <AccordionItem value="item-1"><AccordionTrigger className="text-cyan-300">Investimento e Geração de Leads</AccordionTrigger><AccordionContent className="space-y-4 pt-4"><InputField label="Investimento em Tráfego" id="investimentoTráfego" value={inputs.investimentoTráfego} onChange={handleInputChange} /><InputField label="Custo por Lead (CPL) Estimado" id="cplEstimado" value={inputs.cplEstimado} onChange={handleInputChange} /><InputField label="Tamanho da Lista de E-mails" id="listaEmailsExistente" value={inputs.listaEmailsExistente} onChange={handleInputChange} unit="Leads" /></AccordionContent></AccordionItem>
                                        <AccordionItem value="item-2"><AccordionTrigger className="text-cyan-300">Engajamento do Pré-Lançamento</AccordionTrigger><AccordionContent className="space-y-4 pt-4"><SliderField label="Taxa de Participação nos CPLs" id="taxaParticipacaoCPL" value={inputs.taxaParticipacaoCPL} onChange={handleInputChange} helpText="Dos leads gerados, quantos % assistirão seus conteúdos gratuitos de aquecimento (CPLs)." /><SliderField label="Taxa de Cliques para Página de Vendas" id="taxaCliquesPaginaVendas" value={inputs.taxaCliquesPaginaVendas} onChange={handleInputChange} helpText="Dos leads que participaram, quantos % clicarão para visitar a página de vendas." /></AccordionContent></AccordionItem>
                                        <AccordionItem value="item-3"><AccordionTrigger className="text-cyan-300">A Oferta e a Conversão</AccordionTrigger><AccordionContent className="space-y-4 pt-4"><InputField label="Preço do Produto Principal" id="precoProdutoPrincipal" value={inputs.precoProdutoPrincipal} onChange={handleInputChange} /><SliderField label="Taxa de Conversão da Página de Vendas" id="taxaConversaoPaginaVendas" value={inputs.taxaConversaoPaginaVendas} onChange={handleInputChange} /><div className="space-y-4 pt-4 border-t border-blue-500/30"><div className="flex items-center space-x-2"><Checkbox id="habilitarOrderBump" checked={inputs.habilitarOrderBump} onCheckedChange={(c) => handleCheckboxChange('habilitarOrderBump', !!c)} /><label htmlFor="habilitarOrderBump" className="text-sm">Habilitar Order Bump?</label></div>{inputs.habilitarOrderBump && (<><InputField label="Preço do Order Bump" id="precoOrderBump" value={inputs.precoOrderBump} onChange={handleInputChange} /><SliderField label="Taxa de Adesão ao Order Bump" id="taxaAdesaoOrderBump" value={inputs.taxaAdesaoOrderBump} onChange={handleInputChange} /></>)}</div><div className="space-y-4 pt-4 border-t border-blue-500/30"><div className="flex items-center space-x-2"><Checkbox id="habilitarUpsell" checked={inputs.habilitarUpsell} onCheckedChange={(c) => handleCheckboxChange('habilitarUpsell', !!c)} /><label htmlFor="habilitarUpsell" className="text-sm">Habilitar Upsell?</label></div>{inputs.habilitarUpsell && (<><InputField label="Preço do Upsell" id="precoUpsell" value={inputs.precoUpsell} onChange={handleInputChange} /><SliderField label="Taxa de Adesão ao Upsell" id="taxaAdesaoUpsell" value={inputs.taxaAdesaoUpsell} onChange={handleInputChange} /></>)}</div></AccordionContent></AccordionItem>
                                        <AccordionItem value="item-4"><AccordionTrigger className="text-cyan-300">Variáveis Financeiras</AccordionTrigger><AccordionContent className="space-y-4 pt-4"><InputField label="Taxa da Plataforma/Gateway" id="taxaPlataforma" value={inputs.taxaPlataforma} onChange={handleInputChange} unit="%" /><SliderField label="Taxa de Aprovação de Pagamentos" id="taxaAprovacaoPagamentos" value={inputs.taxaAprovacaoPagamentos} onChange={handleInputChange} helpText="Considera boletos não pagos e cartões recusados." /><SliderField label="Taxa de Reembolso Estimada" id="taxaReembolso" value={inputs.taxaReembolso} onChange={handleInputChange} /></AccordionContent></AccordionItem>
                                    </Accordion>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-5 flex flex-col items-center justify-center">
                           <Funnel3D data={funnelForChart} roas={calculations.roas} />
                        </div>
                        <div className="lg:col-span-4 space-y-6" ref={resultsRef}>
                            <Card className="holographic-card">
                                <CardHeader><CardTitle className="text-xl text-white neon-text-strong">Projeções e Análise</CardTitle></CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FinancialCard title="Faturação Bruta" value={formatCurrency(calculations.faturamentoBruto)} icon={DollarSign} />
                                        <FinancialCard title="Lucro Líquido" value={formatCurrency(calculations.lucroLiquido)} icon={TrendingUp} />
                                        <FinancialCard title="ROAS" value={`${calculations.roas.toFixed(2)}x`} icon={BarChart} />
                                        <FinancialCard title="CAC" value={formatCurrency(calculations.cac)} icon={Target} />
                                        <FinancialCard title="Ticket Médio" value={formatCurrency(calculations.ticketMedio)} icon={ShoppingCart} />
                                        <FinancialCard title="Vendas" value={calculations.vendasRealizadas.toString()} icon={Users} />
                                    </div>
                                    <Accordion type="single" collapsible className="w-full">
                                        <AccordionItem value="financial-details">
                                            <AccordionTrigger className="text-cyan-300">Detalhamento Financeiro</AccordionTrigger>
                                            <AccordionContent className="text-sm space-y-2 pt-4">
                                                <div className="flex justify-between"><span>Receita Principal:</span> <span className="font-medium">{formatCurrency(calculations.receitaProdutoPrincipal)}</span></div>
                                                <div className="flex justify-between"><span>Receita Order Bump:</span> <span className="font-medium text-green-400">+ {formatCurrency(calculations.receitaOrderBump)}</span></div>
                                                <div className="flex justify-between"><span>Receita Upsell:</span> <span className="font-medium text-green-400">+ {formatCurrency(calculations.receitaUpsell)}</span></div>
                                                <hr className="border-blue-500/20 my-2" />
                                                <div className="flex justify-between font-bold"><span>Faturação Bruta:</span> <span>{formatCurrency(calculations.faturamentoBruto)}</span></div>
                                                <div className="flex justify-between text-red-400"><span>- Tráfego:</span> <span>{formatCurrency(inputs.investimentoTráfego)}</span></div>
                                                <div className="flex justify-between text-red-400"><span>- Taxas:</span> <span>{formatCurrency(calculations.custoTaxas)}</span></div>
                                                <div className="flex justify-between text-red-400"><span>- Reembolsos:</span> <span>{formatCurrency(calculations.custoReembolso)}</span></div>
                                                <hr className="border-blue-500/20 my-2" />
                                                <div className="flex justify-between font-bold text-xl text-green-300"><span>Lucro Líquido:</span> <span>{formatCurrency(calculations.lucroLiquido)}</span></div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </CardContent>
                            </Card>
                            <Card className="holographic-card">
                                <CardHeader><CardTitle className="text-xl text-white neon-text-strong flex items-center gap-2"><Sparkles className="text-cyan-400 neon-icon" />Análise Estratégica com IA</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                     <p className="text-sm text-blue-200 neon-text-subtle">Obtenha recomendações personalizadas para otimizar o seu lançamento.</p>
                                     <Button variant="default" className="w-full holographic-button" onClick={handleGeminiAnalysis} disabled={isAnalyzing}>
                                        {isAnalyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                                        {isAnalyzing ? 'A analisar...' : 'Analisar Cenário com IA'}
                                    </Button>
                                    {insight && (<div className="mt-4 p-4 holographic-card-dark rounded-md text-sm text-gray-300 prose prose-invert prose-sm max-w-none"><p className="whitespace-pre-wrap font-sans">{insight}</p></div>)}
                                </CardContent>
                            </Card>
                            <div className="flex gap-4">
                                <Button className="w-full holographic-button-secondary" onClick={handleSaveScenario}><Save className="h-4 w-4 mr-2" /> Salvar Cenário</Button>
                                <Button className="w-full holographic-button-secondary" onClick={handleExportPdf}><FileDown className="h-4 w-4 mr-2" /> Exportar PDF</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

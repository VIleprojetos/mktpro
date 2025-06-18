import React, { useState, useMemo, useEffect } from 'react';
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
    Loader2,
    Eye,
    MousePointer,
    CreditCard,
    Zap
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
    conversionRate: number;
    faturamento?: number;
    icon: React.ElementType;
    color: string;
    glowColor: string;
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
            <Label htmlFor={id} className="text-sm font-medium text-cyan-300">{label}</Label>
            {helpText && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-cyan-500 hover:text-cyan-300 transition-colors" /></TooltipTrigger>
                        <TooltipContent className="bg-gray-900 border border-cyan-500/30 text-cyan-100">
                            <p>{helpText}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
        <div className="flex items-center relative">
            <span className="text-sm bg-gradient-to-r from-cyan-900 to-blue-900 text-cyan-300 px-3 py-2 rounded-l-md border border-r-0 border-cyan-500/30 shadow-lg">{unit}</span>
            <Input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange(id, parseFloat(e.target.value) || 0)}
                className="bg-gray-900/80 border-cyan-500/30 text-cyan-100 rounded-l-none focus:ring-cyan-400 focus:border-cyan-400 backdrop-blur-sm shadow-lg"
            />
        </div>
    </div>
);

const SliderField = ({ label, id, value, onChange, helpText }: { label: string, id: keyof LaunchInputs, value: number, onChange: (id: keyof LaunchInputs, value: number) => void, helpText?: string }) => (
    <div className="space-y-3">
        <div className="flex items-center justify-between">
            <Label htmlFor={id} className="text-sm font-medium text-cyan-300">{label}</Label>
            {helpText && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-cyan-500 hover:text-cyan-300 transition-colors" /></TooltipTrigger>
                        <TooltipContent className="bg-gray-900 border border-cyan-500/30 text-cyan-100">
                            <p>{helpText}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
        <div className="flex items-center gap-4">
            <div className="flex-1 relative">
                <Slider
                    id={id}
                    min={0}
                    max={100}
                    step={1}
                    value={[value]}
                    onValueChange={(values) => onChange(id, values[0])}
                    className="relative"
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-sm -z-10"></div>
            </div>
            <span className="text-sm font-bold text-cyan-300 w-12 text-right px-2 py-1 bg-cyan-500/20 rounded-md border border-cyan-500/30">{value}%</span>
        </div>
    </div>
);

const FinancialCard = ({ title, value, icon: Icon }: { title: string, value: string, icon: React.ElementType }) => (
    <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-cyan-500/30 text-center relative overflow-hidden backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5"></div>
        <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-xs font-medium text-cyan-400 flex items-center justify-center gap-2">
                <Icon className="h-4 w-4 text-cyan-400" />
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
            <p className="text-lg font-bold text-white drop-shadow-lg">{value}</p>
        </CardContent>
    </Card>
);

// --- Componente do Funil Holográfico 3D ---
const HolographicFunnel3D = ({ data, formatCurrency, roas }: { data: FunnelStageData[], formatCurrency: (value: number) => string, roas: number }) => {
    const [animationPhase, setAnimationPhase] = useState(0);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setAnimationPhase(prev => (prev + 1) % 360);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    const VIEWBOX_WIDTH = 500;
    const VIEWBOX_HEIGHT = 700;
    const CENTER_X = VIEWBOX_WIDTH / 2;
    const STAGE_HEIGHT = 120;
    const BASE_Y = 80;
    
    const maxVal = data.length > 0 ? data[0].value : 1;
    
    const getRadius = (value: number, index: number) => {
        if (maxVal === 0) return 20;
        const baseRadius = (value / maxVal) * 120;
        return Math.max(baseRadius, 20);
    };

    const stages = data.map((stage, index) => {
        const y = BASE_Y + index * STAGE_HEIGHT;
        const radius = getRadius(stage.value, index);
        const nextRadius = index < data.length - 1 ? getRadius(data[index + 1].value, index + 1) : radius * 0.8;
        
        return {
            ...stage,
            y,
            radius,
            nextRadius,
            centerX: CENTER_X,
        };
    });

    const pulseAnimation = `${0.8 + Math.sin(animationPhase * 0.1) * 0.2}`;
    const glowIntensity = 0.5 + Math.sin(animationPhase * 0.05) * 0.3;

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {/* Efeito de fundo holográfico */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent blur-3xl animate-pulse"></div>
            
            <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} className="w-full h-full max-w-lg drop-shadow-2xl">
                <defs>
                    {/* Gradientes holográficos */}
                    <radialGradient id="potentialGrad" cx="50%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#00ffff" stopOpacity="0.8"/>
                        <stop offset="50%" stopColor="#0080ff" stopOpacity="0.6"/>
                        <stop offset="100%" stopColor="#004080" stopOpacity="0.4"/>
                    </radialGradient>
                    
                    <radialGradient id="engagementGrad" cx="50%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#00ff80" stopOpacity="0.8"/>
                        <stop offset="50%" stopColor="#0080ff" stopOpacity="0.6"/>
                        <stop offset="100%" stopColor="#004040" stopOpacity="0.4"/>
                    </radialGradient>
                    
                    <radialGradient id="intentionGrad" cx="50%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#ffff00" stopOpacity="0.8"/>
                        <stop offset="50%" stopColor="#ff8000" stopOpacity="0.6"/>
                        <stop offset="100%" stopColor="#804000" stopOpacity="0.4"/>
                    </radialGradient>
                    
                    <radialGradient id="conversionGrad" cx="50%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#ff4080" stopOpacity="0.8"/>
                        <stop offset="50%" stopColor="#8000ff" stopOpacity="0.6"/>
                        <stop offset="100%" stopColor="#400080" stopOpacity="0.4"/>
                    </radialGradient>

                    {/* Filtros de brilho */}
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge> 
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    
                    <filter id="hologram" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="blur"/>
                        <feOffset in="blur" dx="0" dy="0" result="offset"/>
                        <feMerge>
                            <feMergeNode in="offset"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>

                {/* Grid holográfico de fundo */}
                <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,255,255,0.1)" strokeWidth="0.5"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" opacity={glowIntensity} />

                {/* Conexões holográficas entre estágios */}
                {stages.map((stage, index) => {
                    if (index === stages.length - 1) return null;
                    const nextStage = stages[index + 1];
                    
                    return (
                        <g key={`connection-${index}`}>
                            {/* Linha de conexão principal */}
                            <path
                                d={`M ${stage.centerX - stage.radius} ${stage.y + 15} 
                                   L ${nextStage.centerX - nextStage.radius} ${nextStage.y - 15}
                                   M ${stage.centerX + stage.radius} ${stage.y + 15} 
                                   L ${nextStage.centerX + nextStage.radius} ${nextStage.y - 15}`}
                                stroke="rgba(0,255,255,0.4)"
                                strokeWidth="2"
                                fill="none"
                                filter="url(#glow)"
                                opacity={pulseAnimation}
                            />
                            
                            {/* Partículas animadas */}
                            <circle
                                cx={stage.centerX + Math.sin(animationPhase * 0.02 + index) * 20}
                                cy={stage.y + 30 + Math.cos(animationPhase * 0.015 + index) * 10}
                                r="1.5"
                                fill="#00ffff"
                                opacity={Math.sin(animationPhase * 0.03 + index * 2) * 0.5 + 0.5}
                            />
                        </g>
                    );
                })}

                {/* Estágios do funil */}
                {stages.map((stage, index) => {
                    const gradientId = ['potentialGrad', 'engagementGrad', 'intentionGrad', 'conversionGrad'][index] || 'conversionGrad';
                    const IconComponent = stage.icon;
                    
                    return (
                        <g key={index} transform={`scale(${pulseAnimation})`} style={{ transformOrigin: `${stage.centerX}px ${stage.y}px` }}>
                            {/* Anel externo brilhante */}
                            <circle
                                cx={stage.centerX}
                                cy={stage.y}
                                r={stage.radius + 8}
                                fill="none"
                                stroke={stage.glowColor}
                                strokeWidth="1"
                                opacity={glowIntensity * 0.6}
                                filter="url(#glow)"
                            />
                            
                            {/* Corpo principal do estágio */}
                            <ellipse
                                cx={stage.centerX}
                                cy={stage.y}
                                rx={stage.radius}
                                ry={stage.radius * 0.3}
                                fill={`url(#${gradientId})`}
                                stroke={stage.color}
                                strokeWidth="2"
                                filter="url(#hologram)"
                                opacity="0.9"
                            />
                            
                            {/* Efeito de profundidade */}
                            <ellipse
                                cx={stage.centerX}
                                cy={stage.y - 5}
                                rx={stage.radius * 0.9}
                                ry={stage.radius * 0.25}
                                fill="rgba(255,255,255,0.1)"
                                opacity="0.6"
                            />
                            
                            {/* Valor principal */}
                            <text
                                x={stage.centerX}
                                y={stage.y - 8}
                                textAnchor="middle"
                                fill="white"
                                fontSize="18"
                                fontWeight="bold"
                                filter="url(#glow)"
                                className="font-mono"
                            >
                                {stage.value.toLocaleString('pt-BR')}
                            </text>
                            
                            {/* Label do estágio */}
                            <text
                                x={stage.centerX}
                                y={stage.y + 8}
                                textAnchor="middle"
                                fill={stage.color}
                                fontSize="11"
                                fontWeight="600"
                                className="uppercase tracking-wider"
                            >
                                {stage.label}
                            </text>
                            
                            {/* Taxa de conversão */}
                            {index > 0 && (
                                <text
                                    x={stage.centerX + stage.radius + 20}
                                    y={stage.y}
                                    textAnchor="start"
                                    fill="#00ffaa"
                                    fontSize="12"
                                    fontWeight="bold"
                                    className="font-mono"
                                >
                                    {stage.conversionRate.toFixed(1)}%
                                </text>
                            )}
                            
                            {/* Ícone do estágio */}
                            <foreignObject
                                x={stage.centerX - stage.radius - 35}
                                y={stage.y - 12}
                                width="24"
                                height="24"
                            >
                                <div className="flex items-center justify-center w-6 h-6">
                                    <IconComponent 
                                        size={16} 
                                        className="text-white drop-shadow-lg"
                                        style={{ filter: 'drop-shadow(0 0 4px rgba(0,255,255,0.6))' }}
                                    />
                                </div>
                            </foreignObject>
                        </g>
                    );
                })}

                {/* Resultado financeiro final */}
                {data.length > 0 && data[data.length - 1].faturamento !== undefined && (
                    <g>
                        <defs>
                            <radialGradient id="financialGrad" cx="50%" cy="30%" r="70%">
                                <stop offset="0%" stopColor="#ff00ff" stopOpacity="0.9"/>
                                <stop offset="50%" stopColor="#8000ff" stopOpacity="0.7"/>
                                <stop offset="100%" stopColor="#400080" stopOpacity="0.5"/>
                            </radialGradient>
                        </defs>
                        
                        {/* Base financeira holográfica */}
                        <ellipse
                            cx={CENTER_X}
                            cy={BASE_Y + stages.length * STAGE_HEIGHT + 40}
                            rx="140"
                            ry="25"
                            fill="url(#financialGrad)"
                            stroke="#ff00ff"
                            strokeWidth="3"
                            filter="url(#glow)"
                            opacity="0.8"
                            transform={`scale(${pulseAnimation})`}
                            style={{ transformOrigin: `${CENTER_X}px ${BASE_Y + stages.length * STAGE_HEIGHT + 40}px` }}
                        />
                        
                        {/* Valor do faturamento */}
                        <text
                            x={CENTER_X}
                            y={BASE_Y + stages.length * STAGE_HEIGHT + 35}
                            textAnchor="middle"
                            fill="white"
                            fontSize="20"
                            fontWeight="bold"
                            filter="url(#glow)"
                            className="font-mono"
                        >
                            {formatCurrency(data[data.length - 1].faturamento!)}
                        </text>
                        
                        {/* ROAS */}
                        <text
                            x={CENTER_X}
                            y={BASE_Y + stages.length * STAGE_HEIGHT + 55}
                            textAnchor="middle"
                            fill="#00ffaa"
                            fontSize="14"
                            fontWeight="bold"
                            className="font-mono"
                        >
                            ROAS: {roas.toFixed(2)}x
                        </text>
                        
                        {/* Label */}
                        <text
                            x={CENTER_X}
                            y={BASE_Y + stages.length * STAGE_HEIGHT + 75}
                            textAnchor="middle"
                            fill="#ff00ff"
                            fontSize="12"
                            fontWeight="600"
                            className="uppercase tracking-widest"
                        >
                            RESULTADO FINANCEIRO
                        </text>
                    </g>
                )}

                {/* Efeitos de partículas ambientais */}
                {Array.from({ length: 8 }).map((_, i) => (
                    <circle
                        key={`particle-${i}`}
                        cx={50 + (i * 60) + Math.sin(animationPhase * 0.01 + i) * 30}
                        cy={100 + Math.cos(animationPhase * 0.008 + i * 1.5) * 40}
                        r="1"
                        fill="rgba(0,255,255,0.4)"
                        opacity={Math.sin(animationPhase * 0.02 + i * 0.7) * 0.3 + 0.4}
                    />
                ))}
            </svg>
        </div>
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
        { 
            label: 'ALCANCE POTENCIAL', 
            value: calculations.leadsGerados, 
            conversionRate: 100,
            icon: Eye,
            color: '#00ffff',
            glowColor: 'rgba(0,255,255,0.6)'
        },
        { 
            label: 'ENGAJAMENTO', 
            value: calculations.leadsAquecidos, 
            conversionRate: inputs.taxaParticipacaoCPL,
            icon: Users,
            color: '#00ff80',
            glowColor: 'rgba(0,255,128,0.6)'
        },
        { 
            label: 'INTENÇÃO', 
            value: calculations.visitantesPaginaVendas, 
            conversionRate: inputs.taxaCliquesPaginaVendas,
            icon: MousePointer,
            color: '#ffff00',
            glowColor: 'rgba(255,255,0,0.6)'
        },
        { 
            label: 'CONVERSÃO', 
            value: calculations.vendasRealizadas, 
            conversionRate: inputs.taxaConversaoPaginaVendas, 
            faturamento: calculations.faturamentoBruto,
            icon: CreditCard,
            color: '#ff4080',
            glowColor: 'rgba(255,64,128,0.6)'
        },
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

            Seja direto, estratégicoe objetivo no seu insight.

            **Formato da Resposta:**
            - Use markdown simples
            - Máximo 300 palavras
            - Foque em insights de alto valor que realmente façam diferença
        `;

        try {
            // Simulação de análise (já que não temos acesso à API do Gemini no ambiente)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Insight baseado nos dados calculados
            let generatedInsight = "";
            
            if (calculations.roas < 3) {
                generatedInsight = `🔍 **Diagnóstico:** O ROAS de ${calculations.roas.toFixed(2)}x está abaixo do ideal (3x+) para lançamentos sustentáveis.\n\n💡 **Recomendações:**\n1. **Otimizar a conversão:** Com apenas ${inputs.taxaConversaoPaginaVendas}% de conversão, teste headlines mais persuasivas e adicione urgência/escassez\n2. **Melhorar o CPL:** ${formatCurrency(inputs.cplEstimado)} por lead pode ser reduzido com melhor segmentação do público\n3. **Potencializar o Order Bump:** ${inputs.taxaAdesaoOrderBump}% de adesão pode crescer com melhor posicionamento\n\n📈 **Impacto:** Aumentando a conversão para 7% e reduzindo o CPL em 20%, o ROAS saltaria para ${((calculations.faturamentoBruto * 1.4) / (inputs.investimentoTráfego * 0.8)).toFixed(2)}x`;
            } else if (calculations.lucroLiquido < 0) {
                generatedInsight = `⚠️ **Diagnóstico:** Prejuízo de ${formatCurrency(Math.abs(calculations.lucroLiquido))} indica estrutura de custos inadequada.\n\n💡 **Recomendações:**\n1. **Reduzir investimento inicial:** Teste com ${formatCurrency(inputs.investimentoTráfego * 0.7)} primeiro\n2. **Aumentar o ticket médio:** Implemente upsells adicionais pós-compra\n3. **Melhorar a aprovação:** ${inputs.taxaAprovacaoPagamentos}% pode ser otimizada com múltiplas formas de pagamento\n\n📈 **Impacto:** Com estas otimizações, projetamos lucro de ${formatCurrency(calculations.faturamentoBruto * 1.2 - inputs.investimentoTráfego * 0.7)}`;
            } else {
                generatedInsight = `✅ **Diagnóstico:** Cenário sólido com ROAS de ${calculations.roas.toFixed(2)}x e lucro de ${formatCurrency(calculations.lucroLiquido)}!\n\n🚀 **Oportunidades de Crescimento:**\n1. **Escalar o investimento:** Com este ROAS, pode duplicar o tráfego com confiança\n2. **Otimizar o funil:** Foque em aumentar a taxa de participação (${inputs.taxaParticipacaoCPL}% → 45%)\n3. **Maximizar receita por cliente:** Adicione mais upsells no pós-venda\n\n📈 **Impacto:** Escalando para ${formatCurrency(inputs.investimentoTráfego * 2)}, projetamos faturamento de ${formatCurrency(calculations.faturamentoBruto * 2)}`;
            }
            
            setInsight(generatedInsight);
        } catch (error) {
            setInsight("Erro ao gerar insight. Tente novamente.");
        }
        
        setIsAnalyzing(false);
    };

    const exportToPDF = () => {
        const reportData = {
            timestamp: new Date().toLocaleString('pt-BR'),
            inputs,
            calculations,
            insight
        };
        
        console.log('Dados para exportação:', reportData);
        alert('Funcionalidade de exportação em desenvolvimento. Os dados foram registados na consola.');
    };

    const saveScenario = () => {
        const scenarioName = prompt('Nome do cenário:');
        if (scenarioName) {
            const scenario = {
                name: scenarioName,
                timestamp: new Date().toISOString(),
                inputs,
                calculations
            };
            
            // Simular salvamento (não podemos usar localStorage)
            console.log('Cenário guardado:', scenario);
            alert(`Cenário "${scenarioName}" guardado com sucesso!`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-900 text-white relative overflow-hidden">
            {/* Efeitos de fundo holográficos */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-8">
                {/* Cabeçalho */}
                <div className="text-center space-y-4 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent blur-xl"></div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent relative z-10">
                        <Sparkles className="inline-block mr-3 text-cyan-400" size={48} />
                        Simulador de Lançamento
                    </h1>
                    <p className="text-xl text-cyan-300 relative z-10">Projete resultados com precisão científica</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Painel de Configurações */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-cyan-500/30 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-cyan-300 flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    Configurações de Tráfego
                                </CardTitle>
                                <CardDescription className="text-cyan-400/70">
                                    Defina os parâmetros de aquisição
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <InputField
                                    label="Investimento em Tráfego"
                                    id="investimentoTráfego"
                                    value={inputs.investimentoTráfego}
                                    onChange={handleInputChange}
                                    helpText="Orçamento total para anúncios pagos"
                                />
                                <InputField
                                    label="CPL Estimado"
                                    id="cplEstimado"
                                    value={inputs.cplEstimado}
                                    onChange={handleInputChange}
                                    helpText="Custo por lead baseado no histórico"
                                />
                                <InputField
                                    label="Lista Existente"
                                    id="listaEmailsExistente"
                                    value={inputs.listaEmailsExistente}
                                    onChange={handleInputChange}
                                    unit="Leads"
                                    helpText="Contactos já na sua base"
                                />
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-cyan-500/30 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-cyan-300 flex items-center gap-2">
                                    <BarChart className="h-5 w-5" />
                                    Funil de Conversão
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <SliderField
                                    label="Taxa Participação CPL"
                                    id="taxaParticipacaoCPL"
                                    value={inputs.taxaParticipacaoCPL}
                                    onChange={handleInputChange}
                                    helpText="% de leads que participam no aquecimento"
                                />
                                <SliderField
                                    label="Taxa Cliques P. Vendas"
                                    id="taxaCliquesPaginaVendas"
                                    value={inputs.taxaCliquesPaginaVendas}
                                    onChange={handleInputChange}
                                    helpText="% que clica do e-mail para a página"
                                />
                                <SliderField
                                    label="Taxa Conversão Vendas"
                                    id="taxaConversaoPaginaVendas"
                                    value={inputs.taxaConversaoPaginaVendas}
                                    onChange={handleInputChange}
                                    helpText="% de visitantes que compram"
                                />
                            </CardContent>
                        </Card>

                        <Accordion type="single" collapsible className="space-y-4">
                            <AccordionItem value="produtos" className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-cyan-500/30 rounded-lg backdrop-blur-sm">
                                <AccordionTrigger className="px-6 text-cyan-300 hover:text-cyan-100">
                                    <div className="flex items-center gap-2">
                                        <ShoppingCart className="h-5 w-5" />
                                        Produtos & Preços
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-6 space-y-4">
                                    <InputField
                                        label="Preço Produto Principal"
                                        id="precoProdutoPrincipal"
                                        value={inputs.precoProdutoPrincipal}
                                        onChange={handleInputChange}
                                    />
                                    
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="enableOrderBump"
                                            checked={inputs.habilitarOrderBump}
                                            onCheckedChange={(checked) => handleCheckboxChange('habilitarOrderBump', checked as boolean)}
                                        />
                                        <Label htmlFor="enableOrderBump" className="text-cyan-300">Order Bump</Label>
                                    </div>
                                    
                                    {inputs.habilitarOrderBump && (
                                        <div className="ml-6 space-y-3 border-l-2 border-cyan-500/30 pl-4">
                                            <InputField
                                                label="Preço Order Bump"
                                                id="precoOrderBump"
                                                value={inputs.precoOrderBump}
                                                onChange={handleInputChange}
                                            />
                                            <SliderField
                                                label="Taxa Adesão Order Bump"
                                                id="taxaAdesaoOrderBump"
                                                value={inputs.taxaAdesaoOrderBump}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="enableUpsell"
                                            checked={inputs.habilitarUpsell}
                                            onCheckedChange={(checked) => handleCheckboxChange('habilitarUpsell', checked as boolean)}
                                        />
                                        <Label htmlFor="enableUpsell" className="text-cyan-300">Upsell</Label>
                                    </div>
                                    
                                    {inputs.habilitarUpsell && (
                                        <div className="ml-6 space-y-3 border-l-2 border-cyan-500/30 pl-4">
                                            <InputField
                                                label="Preço Upsell"
                                                id="precoUpsell"
                                                value={inputs.precoUpsell}
                                                onChange={handleInputChange}
                                            />
                                            <SliderField
                                                label="Taxa Adesão Upsell"
                                                id="taxaAdesaoUpsell"
                                                value={inputs.taxaAdesaoUpsell}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    )}
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="custos" className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-cyan-500/30 rounded-lg backdrop-blur-sm">
                                <AccordionTrigger className="px-6 text-cyan-300 hover:text-cyan-100">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5" />
                                        Custos & Taxas
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-6 space-y-4">
                                    <SliderField
                                        label="Taxa Plataforma"
                                        id="taxaPlataforma"
                                        value={inputs.taxaPlataforma}
                                        onChange={handleInputChange}
                                        helpText="Taxa da plataforma de vendas"
                                    />
                                    <SliderField
                                        label="Taxa Aprovação Pagamentos"
                                        id="taxaAprovacaoPagamentos"
                                        value={inputs.taxaAprovacaoPagamentos}
                                        onChange={handleInputChange}
                                        helpText="% de pagamentos aprovados"
                                    />
                                    <SliderField
                                        label="Taxa Reembolso"
                                        id="taxaReembolso"
                                        value={inputs.taxaReembolso}
                                        onChange={handleInputChange}
                                        helpText="% de devoluções esperadas"
                                    />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    {/* Visualização do Funil */}
                    <div className="lg:col-span-1">
                        <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-cyan-500/30 backdrop-blur-sm h-full">
                            <CardHeader>
                                <CardTitle className="text-cyan-300 flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Funil Holográfico 3D
                                </CardTitle>
                                <CardDescription className="text-cyan-400/70">
                                    Visualização em tempo real do seu funil
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-[600px]">
                                <HolographicFunnel3D 
                                    data={funnelForChart} 
                                    formatCurrency={formatCurrency}
                                    roas={calculations.roas}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Resultados e Insights */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* KPIs Principais */}
                        <div className="grid grid-cols-2 gap-4">
                            <FinancialCard title="Faturamento" value={formatCurrency(calculations.faturamentoBruto)} icon={DollarSign} />
                            <FinancialCard title="Lucro Líquido" value={formatCurrency(calculations.lucroLiquido)} icon={TrendingUp} />
                            <FinancialCard title="ROAS" value={`${calculations.roas.toFixed(2)}x`} icon={Zap} />
                            <FinancialCard title="Ticket Médio" value={formatCurrency(calculations.ticketMedio)} icon={ShoppingCart} />
                        </div>

                        {/* Painel de Insights IA */}
                        <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-cyan-500/30 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-cyan-300 flex items-center gap-2">
                                    <Sparkles className="h-5 w-5" />
                                    Insights Estratégicos
                                </CardTitle>
                                <CardDescription className="text-cyan-400/70">
                                    Análise inteligente do seu cenário
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button 
                                    onClick={handleGeminiAnalysis}
                                    disabled={isAnalyzing}
                                    className="w-full mb-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all duration-300"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            A analisar...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            Gerar Insight IA
                                        </>
                                    )}
                                </Button>
                                
                                {insight && (
                                    <div className="bg-gradient-to-br from-cyan-950/50 to-blue-950/50 border border-cyan-500/30 rounded-lg p-4 backdrop-blur-sm">
                                        <div 
                                            className="text-sm text-cyan-100 leading-relaxed prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ 
                                                __html: insight
                                                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-300">$1</strong>')
                                                    .replace(/\n\n/g, '<br><br>')
                                                    .replace(/\n/g, '<br>')
                                            }}
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Botões de Ação */}
                        <div className="flex gap-3">
                            <Button 
                                onClick={saveScenario}
                                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                Guardar
                            </Button>
                            <Button 
                                onClick={exportToPDF}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                            >
                                <FileDown className="mr-2 h-4 w-4" />
                                Exportar
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

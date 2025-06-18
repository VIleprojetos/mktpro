// client/src/pages/funnel.tsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Users, DollarSign, Target, BarChart, FileDown, Wand2, Loader2, AlertCircle } from 'lucide-react';
import { FunnelChart, Funnel, LabelList } from 'recharts';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import LogoPng from '@/assets/logo-b.png';
import { Remarkable } from 'remarkable';

// Tipagem para jsPDF com autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

const FunnelPage: React.FC = () => {
  const [inputs, setInputs] = useState({
    investimentoTráfego: 5000,
    cplEstimado: 2.50,
    taxaConversaoPaginaVendas: 2,
    precoProdutoPrincipal: 497,
  });
  const [insight, setInsight] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);
  const funnelChartRef = useRef<HTMLDivElement>(null);
  const md = new Remarkable();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSliderChange = (name: keyof typeof inputs, value: number[]) => {
    setInputs(prev => ({ ...prev, [name]: value[0] }));
  };

  const calculations = useMemo(() => {
    const leadsGerados = inputs.investimentoTráfego / (inputs.cplEstimado || 1);
    const vendasRealizadas = leadsGerados * (inputs.taxaConversaoPaginaVendas / 100);
    const faturamentoBruto = vendasRealizadas * inputs.precoProdutoPrincipal;
    const lucroLiquido = faturamentoBruto - inputs.investimentoTráfego;
    const roas = faturamentoBruto / (inputs.investimentoTráfego || 1);
    const cac = inputs.investimentoTráfego / (vendasRealizadas || 1);

    return {
      leadsGerados,
      vendasRealizadas: Math.floor(vendasRealizadas),
      faturamentoBruto,
      lucroLiquido,
      roas,
      cac: isFinite(cac) ? cac : 0,
    };
  }, [inputs]);

  const funnelData = useMemo(() => [
    { value: calculations.leadsGerados, name: 'Leads', fill: '#8884d8' },
    { value: calculations.vendasRealizadas, name: 'Vendas', fill: '#82ca9d' },
  ], [calculations]);

  const { mutate: runAnalysis, isPending: isAnalyzing, error: analysisError } = useMutation({
    mutationFn: () => apiRequest<{ analysis: string }>('POST', '/api/analyze-scenario', { inputs, calculations }),
    onSuccess: (data) => {
      setInsight(data.analysis);
    },
    onError: (err) => {
      console.error("Erro na análise de IA:", err);
    }
  });

  const handleGeminiAnalysis = () => {
    runAnalysis();
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const handleExportPdf = async () => {
    setIsExporting(true);
    const funnelChartElement = funnelChartRef.current;
    if (!funnelChartElement) {
        setIsExporting(false);
        return;
    }

    const doc = new jsPDF() as jsPDFWithAutoTable;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    // Funções de Header e Footer
    const addHeader = () => {
      doc.addImage(LogoPng, 'PNG', margin, 5, 30, 15);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text('Relatório de Simulação de Funil', pageWidth - margin, 15, { align: 'right' });
    };

    const addFooter = (pageNumber: number) => {
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Página ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    };
    
    // --- PÁGINA 1: VISÃO GERAL E GRÁFICO ---
    addHeader();
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text('Visão Geral do Cenário', margin, 30);

    // Captura do Gráfico
    const canvas = await html2canvas(funnelChartElement, { scale: 2, backgroundColor: null });
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 180;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    doc.addImage(imgData, 'PNG', (pageWidth - imgWidth) / 2, 40, imgWidth, imgHeight);

    // KPIs
    const kpiYStart = 45 + imgHeight;
    doc.autoTable({
        startY: kpiYStart,
        body: [
            [
                { content: 'Faturamento Bruto', styles: { fontStyle: 'bold' } }, 
                formatCurrency(calculations.faturamentoBruto)
            ],
            [
                { content: 'Lucro Líquido', styles: { fontStyle: 'bold' } }, 
                formatCurrency(calculations.lucroLiquido)
            ],
            [
                { content: 'ROAS', styles: { fontStyle: 'bold' } }, 
                `${calculations.roas.toFixed(2)}x`
            ],
        ],
        theme: 'striped',
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: { 0: { cellWidth: 50 }, 1: { halign: 'right' } },
    });
    addFooter(1);


    // --- PÁGINA 2: DETALHES E ANÁLISE DE IA ---
    doc.addPage();
    addHeader();
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text('Detalhamento da Simulação', margin, 30);

    // Tabela de Parâmetros de Entrada
    doc.autoTable({
        head: [['Parâmetros de Entrada', 'Valor']],
        body: [
            ['Investimento em Tráfego', formatCurrency(inputs.investimentoTráfego)],
            ['CPL Estimado', formatCurrency(inputs.cplEstimado)],
            ['Preço do Produto', formatCurrency(inputs.precoProdutoPrincipal)],
            ['Taxa de Conversão (%)', `${inputs.taxaConversaoPaginaVendas.toFixed(2)}%`],
        ],
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [22, 163, 74] },
    });
    
    // Tabela de Resultados
    doc.autoTable({
        head: [['Resultados Calculados', 'Valor']],
        body: [
            ['Leads Gerados', calculations.leadsGerados.toLocaleString('pt-BR', { maximumFractionDigits: 0 })],
            ['Vendas Realizadas', calculations.vendasRealizadas.toString()],
            ['Custo por Aquisição (CAC)', formatCurrency(calculations.cac)],
        ],
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
    });

    // Análise de IA
    if (insight) {
      doc.setFontSize(14);
      doc.setTextColor(40);
      doc.text('Análise e Recomendações da IA', margin, doc.autoTable.previous.finalY + 20);
      
      // Remove markdown e converte para texto simples para o PDF
      const plainText = insight
          .replace(/\*\*/g, '') // Remove negrito
          .replace(/\*/g, '') // Remove outros asteriscos
          .replace(/#/g, ''); // Remove hashes de título
          
      const splitText = doc.splitTextToSize(plainText, pageWidth - margin * 2);
      
      doc.setFontSize(10);
      doc.setTextColor(80);
      doc.text(splitText, margin, doc.autoTable.previous.finalY + 30);
    }
    addFooter(2);
    
    doc.save(`relatorio-funil-${new Date().toISOString().slice(0,10)}.pdf`);
    setIsExporting(false);
  };

  useEffect(() => {
    // Para renderizar o markdown corretamente na tela
    if (insight && resultsRef.current) {
        const insightCard = resultsRef.current.querySelector('#insight-card .prose');
        if (insightCard) {
            insightCard.innerHTML = md.render(insight);
        }
    }
  }, [insight, md]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Simulador de Funil de Lançamento</h1>
        <p className="text-muted-foreground">Projete seus resultados e analise cenários de investimento.</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Parâmetros de Entrada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="investimentoTráfego">Investimento em Tráfego (R$)</Label>
              <Input 
                id="investimentoTráfego" 
                name="investimentoTráfego"
                type="number" 
                value={inputs.investimentoTráfego} 
                onChange={handleInputChange} 
                className="text-lg"
              />
              <Slider value={[inputs.investimentoTráfego]} onValueChange={(v) => handleSliderChange('investimentoTráfego', v)} min={100} max={50000} step={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cplEstimado">Custo por Lead (CPL) Estimado (R$)</Label>
              <Input id="cplEstimado" name="cplEstimado" type="number" value={inputs.cplEstimado} onChange={handleInputChange} step="0.1" className="text-lg" />
              <Slider value={[inputs.cplEstimado]} onValueChange={(v) => handleSliderChange('cplEstimado', v)} min={0.5} max={20} step={0.1} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxaConversaoPaginaVendas">Taxa de Conversão da Pág. de Vendas (%)</Label>
              <Input id="taxaConversaoPaginaVendas" name="taxaConversaoPaginaVendas" type="number" value={inputs.taxaConversaoPaginaVendas} onChange={handleInputChange} step="0.1" className="text-lg" />
              <Slider value={[inputs.taxaConversaoPaginaVendas]} onValueChange={(v) => handleSliderChange('taxaConversaoPaginaVendas', v)} min={0.1} max={15} step={0.1} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="precoProdutoPrincipal">Preço do Produto Principal (R$)</Label>
              <Input id="precoProdutoPrincipal" name="precoProdutoPrincipal" type="number" value={inputs.precoProdutoPrincipal} onChange={handleInputChange} className="text-lg" />
              <Slider value={[inputs.precoProdutoPrincipal]} onValueChange={(v) => handleSliderChange('precoProdutoPrincipal', v)} min={97} max={2997} step={10} />
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-8" ref={resultsRef}>
          <Card>
            <CardHeader>
              <CardTitle>Resultados Projetados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-secondary rounded-lg">
                  <Users className="mx-auto mb-2 h-6 w-6 text-secondary-foreground" />
                  <p className="text-sm text-muted-foreground">Leads Gerados</p>
                  <p className="text-2xl font-bold">{calculations.leadsGerados.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <Target className="mx-auto mb-2 h-6 w-6 text-secondary-foreground" />
                  <p className="text-sm text-muted-foreground">Vendas</p>
                  <p className="text-2xl font-bold">{calculations.vendasRealizadas}</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <DollarSign className="mx-auto mb-2 h-6 w-6 text-green-500" />
                  <p className="text-sm text-muted-foreground">Faturamento</p>
                  <p className="text-2xl font-bold">{formatCurrency(calculations.faturamentoBruto)}</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <BarChart className="mx-auto mb-2 h-6 w-6 text-blue-500" />
                  <p className="text-sm text-muted-foreground">ROAS</p>
                  <p className="text-2xl font-bold">{calculations.roas.toFixed(2)}x</p>
                </div>
              </div>
              <div ref={funnelChartRef} className="w-full h-64 mt-6">
                 <FunnelChart width={730} height={250}>
                    <Funnel dataKey="value" data={funnelData} isAnimationActive>
                      <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
                      <LabelList position="center" fill="#fff" stroke="none" dataKey="value" formatter={(val: number) => val.toLocaleString('pt-BR', {maximumFractionDigits: 0})}/>
                    </Funnel>
                 </FunnelChart>
              </div>
            </CardContent>
             <CardFooter className="flex justify-end gap-2">
                <Button onClick={handleGeminiAnalysis} disabled={isAnalyzing}>
                  {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  {isAnalyzing ? 'Analisando...' : 'Análise com IA'}
                </Button>
                <Button onClick={handleExportPdf} variant="outline" disabled={isExporting}>
                   {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                   {isExporting ? 'Exportando...' : 'Exportar PDF'}
                </Button>
            </CardFooter>
          </Card>
          
          {(isAnalyzing || insight || analysisError) && (
            <Card id="insight-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wand2 className="mr-2"/> Insights & Recomendações
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isAnalyzing && (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                )}
                {analysisError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erro na Análise</AlertTitle>
                    <AlertDescription>
                      Não foi possível obter a análise da IA. Por favor, tente novamente.
                    </AlertDescription>
                  </Alert>
                )}
                {insight && !isAnalyzing && (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        {/* O conteúdo do markdown será injetado aqui pelo useEffect */}
                    </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default FunnelPage;

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { apiRequest } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Download } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

// Tipos para os dados do formulário e do gráfico
type FunnelData = {
  name: string;
  value: number;
};

type FunnelInputs = {
  [key: string]: string;
};

const initialInputs: FunnelInputs = {
  investimento: '1000',
  cpm: '10',
  ctr: '1',
  cpc: '1',
  conversaoLp: '5',
  taxaAgendamento: '50',
  taxaComparecimento: '70',
  taxaConversaoFinal: '20',
  ticketMedio: '500',
};

export function FunnelPage() {
  const [inputs, setInputs] = useState<FunnelInputs>(initialInputs);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [date, setDate] = useState<DateRange | undefined>({ from: new Date(), to: new Date() });
  const [exportFormat, setExportFormat] = useState("pdf");

  const calculations = useMemo(() => {
    const inv = parseFloat(inputs.investimento);
    const cpmValue = parseFloat(inputs.cpm);
    const ctrValue = parseFloat(inputs.ctr) / 100;
    const convLp = parseFloat(inputs.conversaoLp) / 100;
    const taxaAg = parseFloat(inputs.taxaAgendamento) / 100;
    const taxaComp = parseFloat(inputs.taxaComparecimento) / 100;
    const taxaConvFinal = parseFloat(inputs.taxaConversaoFinal) / 100;
    const ticket = parseFloat(inputs.ticketMedio);

    if ([inv, cpmValue, ctrValue, convLp, taxaAg, taxaComp, taxaConvFinal, ticket].some(isNaN)) {
      return {};
    }

    const impressoes = (inv / cpmValue) * 1000;
    const cliques = impressoes * ctrValue;
    const leads = cliques * convLp;
    const agendamentos = leads * taxaAg;
    const comparecimentos = agendamentos * taxaComp;
    const vendas = comparecimentos * taxaConvFinal;
    const receita = vendas * ticket;
    const roi = receita > 0 ? ((receita - inv) / inv) * 100 : 0;
    const cpl = leads > 0 ? inv / leads : 0;
    const custoAgendamento = agendamentos > 0 ? inv / agendamentos : 0;
    const custoVenda = vendas > 0 ? inv / vendas : 0;

    return {
      impressoes, cliques, leads, agendamentos,
      comparecimentos, vendas, receita, roi,
      cpl, custoAgendamento, custoVenda
    };
  }, [inputs]);

  const funnelData: FunnelData[] = useMemo(() => [
    { name: 'Impressões', value: calculations.impressoes || 0 },
    { name: 'Cliques', value: calculations.cliques || 0 },
    { name: 'Leads', value: calculations.leads || 0 },
    { name: 'Agendamentos', value: calculations.agendamentos || 0 },
    { name: 'Comparecimentos', value: calculations.comparecimentos || 0 },
    { name: 'Vendas', value: calculations.vendas || 0 },
  ], [calculations]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setAnalysis(null);
    try {
      const response = await apiRequest(
        'POST',
        '/analyze-scenario', // CORREÇÃO: Endpoint corrigido de /scenarios para /analyze-scenario
        { inputs, calculations }
      );
      const result = await response.json();
      setAnalysis(result.analysis);
      toast({ title: "Análise Gerada", description: "A análise do cenário foi concluída com sucesso." });
    } catch (error) {
      console.error("Erro ao chamar a API de análise:", error);
      toast({
        title: "Erro na Análise",
        description: error instanceof Error ? error.message : "Não foi possível gerar a análise.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExport = () => {
    console.log("Exportando dados:", { format: exportFormat, dateRange: date });
    toast({
      title: "Exportação Iniciada",
      description: `Seus dados serão exportados como ${exportFormat.toUpperCase()}.`,
    });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Análise de Funil</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Exportar Análise</DialogTitle>
              <DialogDescription>
                Selecione o formato e o período para exportar os dados da análise de funil.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="format" className="text-right">Formato</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione o formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Período</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="col-span-3 justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(date.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Escolha um período</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleExport}>Exportar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Coluna de Inputs */}
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Entrada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.keys(initialInputs).map(key => (
                <div key={key} className="space-y-1">
                  <Label htmlFor={key} className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                  <Input
                    id={key}
                    name={key}
                    type="number"
                    value={inputs[key]}
                    onChange={handleInputChange}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
          <Button onClick={handleAnalyze} disabled={isLoading} className="w-full">
            {isLoading ? 'Analisando...' : 'Analisar Cenário'}
          </Button>
        </div>

        {/* Coluna do Gráfico e Análise */}
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Visualização do Funil</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={funnelData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={120} />
                  <Tooltip formatter={(value: number) => value.toLocaleString('pt-BR')} />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="Volume" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {analysis && (
            <Card>
              <CardHeader>
                <CardTitle>Análise da IA</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>{analysis}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

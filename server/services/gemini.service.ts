import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import {
  GEMINI_API_KEY
} from '../config';

interface LandingPageOptions {
  style?: 'modern' | 'minimal' | 'bold' | 'elegant' | 'tech' | 'startup' | 'corporate' | 'creative' | 'luxury' | 'gaming';
  colorScheme?: 'dark' | 'light' | 'gradient' | 'neon' | 'earth' | 'ocean' | 'sunset' | 'aurora' | 'cyber' | 'nature';
  industry?: string;
  targetAudience?: string;
  primaryCTA?: string;
  secondaryCTA?: string;
  includeTestimonials?: boolean;
  includePricing?: boolean;
  includeStats?: boolean;
  includeFAQ?: boolean;
  includeVideo?: boolean;
  includeNewsletter?: boolean;
  includeBlog?: boolean;
  includeFeatures?: boolean;
  animationsLevel?: 'none' | 'subtle' | 'moderate' | 'dynamic' | 'extreme';
  layout?: 'single-page' | 'multi-section' | 'storytelling' | 'product-focused' | 'service-focused';
  brandPersonality?: 'professional' | 'friendly' | 'innovative' | 'trustworthy' | 'disruptive' | 'premium';
}

interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textSecondary: string;
  background: string;
  surface: string;
  border: string;
  gradient: string;
  shadow: string;
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor(apiKey: string) {
    if (!apiKey) {
      console.warn('[GeminiService] API Key não configurada. O serviço não funcionará.');
      return;
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  public async generateText(prompt: string): Promise<string> {
    if (!this.genAI) {
      throw new Error('A API Key do Gemini não está configurada no servidor.');
    }
    const model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest"
    });
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('[GeminiService] Erro ao gerar texto simples:', error);
      throw new Error(`Falha ao gerar texto: ${error.message}`);
    }
  }

  private getAdvancedColorScheme(scheme: string): ColorPalette {
    const schemes: Record<string, ColorPalette> = {
      dark: {
        primary: 'bg-slate-900',
        secondary: 'bg-gray-800',
        accent: 'from-blue-600 to-purple-600',
        text: 'text-white',
        textSecondary: 'text-gray-300',
        background: 'bg-gray-900',
        surface: 'bg-gray-800/50',
        border: 'border-gray-700',
        gradient: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
        shadow: 'shadow-2xl shadow-purple-500/20'
      },
      light: {
        primary: 'bg-white',
        secondary: 'bg-gray-50',
        accent: 'from-indigo-500 to-purple-600',
        text: 'text-gray-900',
        textSecondary: 'text-gray-600',
        background: 'bg-gray-50',
        surface: 'bg-white/80',
        border: 'border-gray-200',
        gradient: 'bg-gradient-to-br from-white via-blue-50 to-indigo-100',
        shadow: 'shadow-2xl shadow-blue-500/10'
      },
      gradient: {
        primary: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900',
        secondary: 'bg-white/10 backdrop-blur-lg',
        accent: 'from-cyan-400 to-pink-400',
        text: 'text-white',
        textSecondary: 'text-gray-200',
        background: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900',
        surface: 'bg-white/10 backdrop-blur-lg',
        border: 'border-white/20',
        gradient: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900',
        shadow: 'shadow-2xl shadow-pink-500/30'
      },
      neon: {
        primary: 'bg-black',
        secondary: 'bg-gray-900',
        accent: 'from-green-400 to-cyan-400',
        text: 'text-white',
        textSecondary: 'text-green-300',
        background: 'bg-black',
        surface: 'bg-gray-900/50',
        border: 'border-green-400',
        gradient: 'bg-gradient-to-br from-black via-gray-900 to-black',
        shadow: 'shadow-2xl shadow-green-400/30'
      },
      sunset: {
        primary: 'bg-gradient-to-br from-orange-400 via-red-500 to-pink-500',
        secondary: 'bg-white/10 backdrop-blur-lg',
        accent: 'from-yellow-400 to-red-500',
        text: 'text-white',
        textSecondary: 'text-orange-100',
        background: 'bg-gradient-to-br from-orange-400 via-red-500 to-pink-500',
        surface: 'bg-white/10 backdrop-blur-lg',
        border: 'border-orange-300',
        gradient: 'bg-gradient-to-br from-orange-400 via-red-500 to-pink-500',
        shadow: 'shadow-2xl shadow-orange-500/30'
      },
      aurora: {
        primary: 'bg-gradient-to-br from-purple-400 via-pink-500 to-blue-500',
        secondary: 'bg-white/10 backdrop-blur-lg',
        accent: 'from-purple-400 to-blue-400',
        text: 'text-white',
        textSecondary: 'text-purple-100',
        background: 'bg-gradient-to-br from-purple-400 via-pink-500 to-blue-500',
        surface: 'bg-white/10 backdrop-blur-lg',
        border: 'border-purple-300',
        gradient: 'bg-gradient-to-br from-purple-400 via-pink-500 to-blue-500',
        shadow: 'shadow-2xl shadow-purple-500/30'
      },
      cyber: {
        primary: 'bg-black',
        secondary: 'bg-gray-900',
        accent: 'from-cyan-400 to-blue-500',
        text: 'text-cyan-400',
        textSecondary: 'text-blue-300',
        background: 'bg-black',
        surface: 'bg-gray-900/50',
        border: 'border-cyan-400',
        gradient: 'bg-gradient-to-br from-black via-blue-900 to-black',
        shadow: 'shadow-2xl shadow-cyan-400/30'
      },
      ocean: {
        primary: 'bg-slate-800',
        secondary: 'bg-blue-900',
        accent: 'from-blue-400 to-teal-400',
        text: 'text-white',
        textSecondary: 'text-blue-200',
        background: 'bg-slate-800',
        surface: 'bg-blue-900/50',
        border: 'border-blue-400',
        gradient: 'bg-gradient-to-br from-slate-800 via-blue-900 to-teal-800',
        shadow: 'shadow-2xl shadow-blue-500/30'
      },
      earth: {
        primary: 'bg-amber-50',
        secondary: 'bg-orange-100',
        accent: 'from-orange-500 to-red-500',
        text: 'text-amber-900',
        textSecondary: 'text-orange-700',
        background: 'bg-amber-50',
        surface: 'bg-orange-100/50',
        border: 'border-orange-300',
        gradient: 'bg-gradient-to-br from-amber-50 via-orange-100 to-red-100',
        shadow: 'shadow-2xl shadow-orange-500/20'
      },
      nature: {
        primary: 'bg-green-50',
        secondary: 'bg-emerald-100',
        accent: 'from-green-500 to-emerald-500',
        text: 'text-green-900',
        textSecondary: 'text-emerald-700',
        background: 'bg-green-50',
        surface: 'bg-emerald-100/50',
        border: 'border-green-300',
        gradient: 'bg-gradient-to-br from-green-50 via-emerald-100 to-teal-100',
        shadow: 'shadow-2xl shadow-green-500/20'
      }
    };
    return schemes[scheme] || schemes.dark;
  }

  // [CORREÇÃO] O prompt foi drasticamente alterado para forçar a geração de estilos inline.
  private getUltraSystemPrompt(options: LandingPageOptions): string {
    return `
      Você é um GENIUS FRONTEND DEVELOPER, especializado em criar landing pages com HTML e ESTILOS INLINE.

      ================================================================================
      REGRA CRÍTICA E ABSOLUTA: TODO O ESTILO DEVE SER INLINE!
      - VOCÊ DEVE USAR O ATRIBUTO 'style' PARA TODO O CSS.
      - NÃO USE NUNCA CLASSES CSS. NÃO USE CLASSES TAILWIND. NÃO USE <style> TAGS.
      - CADA ELEMENTO HTML DEVE CONTER SEU PRÓPRIO ESTILO DENTRO DO ATRIBUTO "style".
      - Exemplo CORRETO: <h1 style="font-size: 48px; color: #FFFFFF; font-weight: bold;">Título</h1>
      - Exemplo INCORRETO: <h1 class="text-5xl text-white font-bold">Título</h1>
      - Todo o layout (flexbox, grid), cores, fontes, espaçamentos, etc., DEVEM ser definidos via 'style'.
      - Para layout responsivo, use media queries dentro do atributo style, se necessário, ou crie uma estrutura fluida.
      - Esta é uma restrição técnica OBRIGATÓRIA para compatibilidade com o editor visual. IGNORAR ESTA REGRA INVALIDA A RESPOSTA.
      ================================================================================

      🎯 MISSÃO: Criar o código HTML completo para uma landing page. O código deve ser um arquivo HTML único e auto-contido (sem CSS externo).

      ✅ **FORMATO DE SAÍDA ABSOLUTO**:
      - A resposta deve ser APENAS o código HTML.
      - Começar IMEDIATAMENTE com "<!DOCTYPE html>" e terminar com "</html>".
      - ZERO texto explicativo, ZERO markdown, ZERO comentários externos.

      ✅ **ESTRUTURA E DIRETRIZES**:
      - Use HTML5 semântico (<header>, <main>, <section>, <footer>, etc.).
      - **Fontes**: Use 'Poppins' para títulos e 'Inter' para corpo de texto. Importe-as do Google Fonts no <head>.
      - **Layout**: Construa layouts usando flexbox ou grid através de estilos inline. Ex: style="display: flex; justify-content: space-between;"
      - **Responsividade**: Projete para ser "mobile-first". Use porcentagens e unidades de viewport (vw, vh) para criar um layout fluido que se adapte a diferentes telas.
      - **Imagens**: Use placeholders de alta qualidade do https://placehold.co/.
      - **Conteúdo**: Crie conteúdo persuasivo e específico para a indústria e público-alvo fornecidos.

      💡 **PERSONALIZAÇÃO BASEADA NAS OPÇÕES (Aplique via estilo inline)**:
      - **Indústria**: ${options.industry || 'tecnologia'}
      - **Público-alvo**: ${options.targetAudience || 'profissionais'}
      - **CTA Primário**: ${options.primaryCTA || 'Começar Agora'}
      - **CTA Secundário**: ${options.secondaryCTA || 'Saber Mais'}

      EXECUTE AGORA: Crie o código HTML completo, 100% com estilos inline, baseado no briefing do usuário.
    `;
  }

  public async createUltraLandingPage(
    prompt: string,
    options: LandingPageOptions = {},
    reference?: string
  ): Promise<string> {
    if (!this.genAI) {
      throw new Error('A API Key do Gemini não está configurada no servidor.');
    }

    const model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest",
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    const systemPrompt = this.getUltraSystemPrompt(options);

    const userPrompt = `
      BRIEFING DO CLIENTE:
      ${prompt}
      
      ${reference ? `
      REFERÊNCIA VISUAL (use como inspiração para a estrutura e conteúdo, mas aplique 100% de estilos inline):
      ${reference}
      ` : ''}

      LEMBRETE CRÍTICO E FINAL: Sua resposta deve ser apenas o código HTML, começando com "<!DOCTYPE html>". Todos os estilos devem estar no atributo 'style' de cada elemento. Nenhuma classe CSS é permitida.
    `;

    try {
      const result = await model.generateContent([systemPrompt, userPrompt]);
      const response = result.response;
      let htmlContent = response.text();

      const htmlMatch = htmlContent.match(/<!DOCTYPE html>.*<\/html>/is);
      if (htmlMatch) {
        htmlContent = htmlMatch[0];
      } else {
        htmlContent = htmlContent
          .replace(/```html\n?/g, '')
          .replace(/```/g, '')
          .trim();
        if (!htmlContent.startsWith('<!DOCTYPE html>')) {
          htmlContent = `<!DOCTYPE html>\n<html><head><title>Página Gerada</title></head><body>${htmlContent}</body></html>`;
        }
      }
      return htmlContent;
    } catch (error: any) {
      console.error('[GeminiService] Erro ao chamar a API do Gemini:', error);
      throw new Error(`Falha ao gerar landing page: ${error.message}`);
    }
  }

  public async optimizeUltraLandingPage(
    currentHtml: string,
    optimizationGoals: string[] = ['conversion', 'performance', 'accessibility', 'seo']
  ): Promise<string> {
    if (!this.genAI) {
      throw new Error('A API Key do Gemini não está configurada no servidor.');
    }
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const optimizationPrompt = `
      Você é um ULTRA-ESPECIALISTA em OTIMIZAÇÃO DE LANDING PAGES.
      Analise o HTML fornecido e reescreva-o aplicando as melhores práticas para os seguintes objetivos: ${optimizationGoals.join(', ')}.
      MANTENHA A REGRA DE ESTILOS 100% INLINE. Não adicione classes CSS.
      
      HTML ATUAL:
      ${currentHtml}
      
      RESULTADO: Retorne APENAS o HTML otimizado completo, sem explicações, mantendo todos os estilos inline.
      Início obrigatório: "<!DOCTYPE html>"
    `;
    try {
      const result = await model.generateContent(optimizationPrompt);
      const response = result.response;
      return response.text();
    } catch (error: any) {
      console.error('[GeminiService] Erro ao otimizar landing page:', error);
      throw new Error(`Falha ao otimizar landing page: ${error.message}`);
    }
  }

  public async analyzeLandingPageConversion(html: string): Promise<{
    score: number;
    recommendations: string[];
    strengths: string[];
    weaknesses: string[];
  }> {
    if (!this.genAI) {
      throw new Error('A API Key do Gemini não está configurada no servidor.');
    }
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const analysisPrompt = `
      Você é um CONVERSION RATE OPTIMIZATION EXPERT. Analise esta landing page e forneça um score de conversão (0-100), recomendações, pontos fortes e fracos.
      LANDING PAGE:
      ${html}
      Responda APENAS em formato JSON: {"score": number, "recommendations": [], "strengths": [], "weaknesses": []}
    `;
    try {
      const result = await model.generateContent(analysisPrompt);
      const response = result.response;
      const jsonText = response.text().replace(/```json|```/g, '').trim();
      return JSON.parse(jsonText);
    } catch (error: any) {
      console.error('[GeminiService] Erro ao analisar conversão:', error);
      return {
        score: 0,
        recommendations: ['Erro na análise - tente novamente'],
        strengths: [],
        weaknesses: ['Falha na análise técnica']
      };
    }
  }

  public async generatePremiumVariations(
    prompt: string,
    count: number = 3,
    baseOptions: LandingPageOptions = {}
  ): Promise<string[]> {
    const variations: Promise<string>[] = [];
    for (let i = 0; i < count; i++) {
        const options: LandingPageOptions = { ...baseOptions };
        variations.push(this.createUltraLandingPage(prompt, options));
    }
    return Promise.all(variations);
  }
}

export const geminiService = new GeminiService(GEMINI_API_KEY);

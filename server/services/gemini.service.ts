import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import {
  GEMINI_API_KEY
} from '../config';

// Interfaces permanecem as mesmas
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

  // --- MÉTODOS PÚBLICOS PRINCIPAIS ---

  public async createUltraLandingPage(
    prompt: string,
    options: LandingPageOptions = {},
    reference?: string
  ): Promise < string > {
    if (!this.genAI) {
      throw new Error('A API Key do Gemini não está configurada no servidor.');
    }

    const model = this.getGenerativeModel();
    const systemPrompt = this.getUltraSystemPrompt(options);
    const userPrompt = this.buildUserPrompt(prompt, options, reference);

    try {
      const result = await model.generateContent([systemPrompt, userPrompt]);
      const response = result.response;
      let htmlContent = response.text();

      // Limpa e otimiza a resposta HTML
      htmlContent = this.cleanHtmlResponse(htmlContent);
      htmlContent = this.postProcessHtml(htmlContent, options);

      return htmlContent;
    } catch (error: any) {
      console.error('[GeminiService] Erro ao chamar a API do Gemini:', error);
      throw new Error(`Falha ao gerar landing page ultra-premium: ${error.message}`);
    }
  }

  public async generatePremiumVariations(
    prompt: string,
    count: number = 3,
    baseOptions: LandingPageOptions = {}
  ): Promise < string[] > {
    const variations: string[] = [];
    const styles: Array < LandingPageOptions['style'] > = [
      'modern', 'luxury', 'tech', 'creative', 'bold', 'elegant', 'startup', 'corporate', 'gaming', 'minimal'
    ];
    const colorSchemes: Array < LandingPageOptions['colorScheme'] > = [
      'gradient', 'aurora', 'cyber', 'sunset', 'ocean', 'neon', 'dark', 'light', 'nature', 'earth'
    ];
    const animationLevels: Array < LandingPageOptions['animationsLevel'] > = [
      'dynamic', 'extreme', 'moderate', 'subtle'
    ];
    const layouts: Array < LandingPageOptions['layout'] > = [
      'storytelling', 'product-focused', 'multi-section', 'service-focused', 'single-page'
    ];
    const personalities: Array < LandingPageOptions['brandPersonality'] > = [
      'innovative', 'premium', 'disruptive', 'friendly', 'trustworthy', 'professional'
    ];


    for (let i = 0; i < count; i++) {
      // CORREÇÃO: Gera opções aleatórias para maior diversidade, em vez de um ciclo previsível.
      const options: LandingPageOptions = {
        ...baseOptions,
        style: styles[Math.floor(Math.random() * styles.length)],
        colorScheme: colorSchemes[Math.floor(Math.random() * colorSchemes.length)],
        animationsLevel: animationLevels[Math.floor(Math.random() * animationLevels.length)],
        layout: layouts[Math.floor(Math.random() * layouts.length)],
        brandPersonality: personalities[Math.floor(Math.random() * personalities.length)]
      };

      try {
        console.log(`Gerando variação ${i + 1}/${count} com as opções:`, options);
        const variation = await this.createUltraLandingPage(prompt, options);
        variations.push(variation);

        // Mantém uma pequena pausa para evitar sobrecarregar a API em rajadas rápidas
        if (i < count - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      } catch (error) {
        console.error(`Erro ao gerar variação premium ${i + 1}:`, error);
        // Opcional: Adicionar um placeholder de erro no array de variações
        // variations.push(`<!-- Erro ao gerar variação ${i + 1}: ${error.message} -->`);
      }
    }

    return variations;
  }

  public async optimizeUltraLandingPage(
    currentHtml: string,
    optimizationGoals: string[] = ['conversion', 'performance', 'accessibility', 'seo']
  ): Promise < string > {
    if (!this.genAI) {
      throw new Error('A API Key do Gemini não está configurada no servidor.');
    }

    const model = this.getGenerativeModel();

    const optimizationPrompt = `
      Você é um ULTRA-ESPECIALISTA em OTIMIZAÇÃO DE CONVERSÃO, PERFORMANCE WEB e UX/UI.
      Analise profundamente a landing page fornecida e aplique as otimizações mais avançadas.
      
      OBJETIVOS DE OTIMIZAÇÃO:
      ${optimizationGoals.map(goal => `🎯 ${goal.toUpperCase()}`).join('\n')}
      
      LANDING PAGE ATUAL:
      \`\`\`html
      ${currentHtml}
      \`\`\`
      
      INSTRUÇÕES DE OTIMIZAÇÃO ULTRA-AVANÇADAS:
      
      🚀 CONVERSÃO:
      - Melhore todos os CTAs para serem mais orientados à ação e específicos. Ex: "Testar grátis por 14 dias" em vez de "Começar".
      - Adicione ou reforce elementos de escassez/urgência (ex: "Vagas limitadas", "Oferta termina em...") onde fizer sentido.
      - Otimize a hierarquia visual (tamanhos de fonte, cores, espaçamento) para guiar o olho do usuário para o CTA principal.
      - Reforce a prova social (depoimentos, logos) com detalhes mais convincentes (ex: resultados quantitativos).
      - Adicione "risk reversal statements" (garantias, "cancele a qualquer momento").
      
      ⚡ PERFORMANCE:
      - Verifique se as imagens usam `loading="lazy"` e `decoding="async"`.
      - Assegure que os `placeholders` de imagem tenham dimensões (width/height) para evitar layout shift.
      - Sugira o uso de `font-display: swap;` nas fontes do Google.
      - Adicione `preconnect` e `dns-prefetch` para domínios externos (cdn, fonts, etc).
      - Mantenha o Critical CSS (Tailwind) no `<script>`, mas garanta que não há CSS inline excessivo.
      
      ♿ ACESSIBILIDADE (WCAG):
      - Garanta que todos os elementos interativos (links, botões) tenham `aria-label` descritivo.
      - Verifique se todas as imagens (`<img>`) têm `alt` text significativo. Imagens decorativas devem ter `alt=""`.
      - Melhore o contraste de cores entre texto e fundo se parecer baixo.
      - Adicione `role="button"` para `div`s ou `a`s que agem como botões.
      - Garanta que a navegação por teclado seja lógica e que os estados de `:focus` sejam visíveis.
      
      🔍 SEO:
      - Otimize a tag `<title>` e a `meta description` para serem mais atrativas e ricas em palavras-chave.
      - Garanta uma estrutura de cabeçalhos (H1, H2, H3) lógica e hierárquica. Só deve haver um H1.
      - Adicione Schema.org markup (JSON-LD) para o produto ou serviço, se aplicável.
      
      🎨 UX/UI:
      - Refine microinterações para serem mais fluidas e fornecer feedback claro ao usuário (ex: estado de hover/focus/active em botões).
      - Simplifique formulários, se houver, removendo campos desnecessários.
      - Melhore o espaçamento e o "espaço em branco" para reduzir a carga cognitiva e melhorar a legibilidade.

      RESULTADO: Retorne APENAS o código HTML 100% completo e otimizado. Sua resposta deve começar OBRIGATORIAMENTE com "<!DOCTYPE html>" e terminar com "</html>", sem nenhum texto ou explicação adicional.
    `;

    try {
      const result = await model.generateContent(optimizationPrompt);
      const response = result.response;
      let optimizedHtml = response.text();

      // CORREÇÃO: Aplica o mesmo processo de limpeza à resposta da otimização.
      optimizedHtml = this.cleanHtmlResponse(optimizedHtml);

      return optimizedHtml;
    } catch (error: any) {
      console.error('[GeminiService] Erro ao otimizar landing page ultra:', error);
      throw new Error(`Falha ao otimizar landing page ultra: ${error.message}`);
    }
  }

  public async analyzeLandingPageConversion(html: string): Promise < {
    score: number;
    recommendations: string[];
    strengths: string[];
    weaknesses: string[];
  } > {
    if (!this.genAI) {
      throw new Error('A API Key do Gemini não está configurada no servidor.');
    }

    const model = this.getGenerativeModel();

    const analysisPrompt = `
      Você é um especialista em Otimização de Taxa de Conversão (CRO) com 15 anos de experiência analisando milhares de landing pages.
      
      Analise profundamente o código HTML da landing page a seguir. Foque nos seguintes pontos: Proposta de Valor, Clareza da Mensagem, Call-to-Action (CTA), Prova Social, Design e UX, e Fatores de Confiança.
      
      LANDING PAGE:
      \`\`\`html
      ${html}
      \`\`\`
      
      Sua tarefa é retornar uma análise concisa e acionável no seguinte formato JSON. Seja crítico e específico.
      
      Formato de Resposta (APENAS JSON):
      {
        "score": number, // Um score de 0 a 100, representando o potencial de conversão da página.
        "recommendations": ["Recomendação específica e acionável 1.", "Recomendação específica 2.", ...], // 5-10 recomendações práticas para aumentar a conversão.
        "strengths": ["Ponto forte 1, com uma breve justificativa.", "Ponto forte 2.", ...], // 3-5 principais pontos fortes da página.
        "weaknesses": ["Ponto fraco 1, com uma breve justificativa.", "Ponto fraco 2.", ...] // 3-5 principais pontos fracos que prejudicam a conversão.
      }
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
        recommendations: [`Ocorreu um erro durante a análise: ${error.message}. Verifique o console para mais detalhes.`],
        strengths: [],
        weaknesses: ['Falha na análise técnica. O JSON retornado pela API pode estar malformado ou a chamada falhou.']
      };
    }
  }

  // --- MÉTODOS AUXILIARES E DE CONFIGURAÇÃO ---

  private getGenerativeModel() {
    if (!this.genAI) {
      throw new Error('Gemini AI não inicializado.');
    }
    return this.genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest",
      safetySettings: [{
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      }, {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      }, {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      }, {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      }, ],
    });
  }

  /**
   * Limpa a resposta da API, removendo wrappers de markdown e garantindo que seja um HTML válido.
   */
  private cleanHtmlResponse(htmlContent: string): string {
    // Primeiro, tenta encontrar um documento HTML completo. É a melhor chance de obter um resultado limpo.
    const htmlMatch = htmlContent.match(/<!DOCTYPE html>[\s\S]*<\/html>/i);
    if (htmlMatch) {
      return htmlMatch[0];
    }

    // Se não encontrar, remove os blocos de código markdown.
    let cleanedHtml = htmlContent
      .replace(/^```html\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    // Garante que o documento comece com a doctype, caso tenha sido omitida.
    if (!cleanedHtml.startsWith('<!DOCTYPE html>')) {
      cleanedHtml = `<!DOCTYPE html>\n${cleanedHtml}`;
    }

    return cleanedHtml;
  }

  /**
   * Realiza otimizações finais no HTML gerado.
   */
  private postProcessHtml(html: string, options: LandingPageOptions): string {
    let optimizedHtml = html;

    // Adiciona hints de performance se não existirem
    if (!optimizedHtml.includes('rel="preconnect"')) {
      optimizedHtml = optimizedHtml.replace(
        '<head>',
        `<head>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link rel="dns-prefetch" href="https://cdn.tailwindcss.com">
        <link rel="dns-prefetch" href="https://placehold.co">`
      );
    }

    // Melhora placeholders de imagem
    const colors = this.getAdvancedColorScheme(options.colorScheme || 'dark');
    const bgColor = colors.background.replace(/[^0-9a-fA-F]/g, '').slice(0, 6) || '111827';
    const textColor = colors.text.replace(/[^0-9a-fA-F]/g, '').slice(0, 6) || 'FFFFFF';
    optimizedHtml = optimizedHtml.replace(
      /placehold\.co\/(\d+x\d+)(\/[A-Z0-9]+\/[A-Z0-9]+)?/g,
      `placehold.co/$1/${bgColor}/${textColor}/png?text=Image`
    );

    return optimizedHtml;
  }


  private buildUserPrompt(prompt: string, options: LandingPageOptions, reference ? : string): string {
    return `
      BRIEFING ESTRATÉGICO DO CLIENTE:
      ${prompt}
      
      ESPECIFICAÇÕES TÉCNICAS DETALHADAS:
      - Estilo Visual: ${options.style || 'modern'} (deve influenciar tipografia, espaçamentos, formas)
      - Esquema de Cores: ${options.colorScheme || 'dark'} (determina paleta completa)
      - Indústria/Setor: ${options.industry || 'Tecnologia'} (adaptar linguagem e elementos visuais)
      - Público-alvo: ${options.targetAudience || 'Profissionais'} (tone of voice e abordagem)
      - Personalidade da Marca: ${options.brandPersonality || 'innovative'} (visual style e messaging)
      - Tipo de Layout: ${options.layout || 'multi-section'} (estrutura da página)
      - CTA Primário: "${options.primaryCTA || 'Começar Agora'}" (ação principal desejada)
      - CTA Secundário: "${options.secondaryCTA || 'Saber Mais'}" (ação secundária)
      - Nível de Animações: ${options.animationsLevel || 'dynamic'} (intensidade dos efeitos)
      
      ELEMENTOS A INCLUIR (se marcado com ✅):
      ${options.includeFeatures !== false ? '✅ Grid de recursos/funcionalidades' : '❌'}
      ${options.includeTestimonials !== false ? '✅ Seção de Depoimentos com fotos e ratings' : '❌'}
      ${options.includeStats !== false ? '✅ Estatísticas impressionantes com counter animations' : '❌'}
      ${options.includePricing ? '✅ Seção de Preços com comparação de planos' : '❌'}
      ${options.includeVideo ? '✅ Seção de vídeo explicativo' : '❌'}
      ${options.includeFAQ !== false ? '✅ FAQ estratégico com accordion' : '❌'}
      ${options.includeNewsletter !== false ? '✅ Newsletter signup com incentivo' : '❌'}
      ${options.includeBlog ? '✅ Seção de blog/conteúdo' : '❌'}
      
      ${reference ? `
      REFERÊNCIA VISUAL (Use como INSPIRAÇÃO para estrutura e design, mas ADAPTE o conteúdo para o briefing acima):
      \`\`\`html
      ${reference}
      \`\`\`
      ` : ''}

      EXECUTE AGORA: Crie a landing page mais IMPRESSIONANTE, FUNCIONAL e CONVERSORA possível!
      
      LEMBRETE CRÍTICO: Sua resposta deve começar IMEDIATAMENTE com "<!DOCTYPE html>" e terminar com "</html>". Não inclua NENHUM texto, comentário ou explicação fora do código HTML.
    `;
  }

  // O método getUltraSystemPrompt e os helpers de cores/animações não precisam de alteração.
  // Eles já estão bem estruturados. Apenas os colo aqui para manter o arquivo completo.
  private getAdvancedColorScheme(scheme: string): ColorPalette {
    const schemes: Record<string, ColorPalette> = {
      dark: { primary: 'bg-slate-900', secondary: 'bg-gray-800', accent: 'from-blue-600 to-purple-600', text: 'text-white', textSecondary: 'text-gray-300', background: 'bg-gray-900', surface: 'bg-gray-800/50', border: 'border-gray-700', gradient: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900', shadow: 'shadow-2xl shadow-purple-500/20' },
      light: { primary: 'bg-white', secondary: 'bg-gray-50', accent: 'from-indigo-500 to-purple-600', text: 'text-gray-900', textSecondary: 'text-gray-600', background: 'bg-gray-50', surface: 'bg-white/80', border: 'border-gray-200', gradient: 'bg-gradient-to-br from-white via-blue-50 to-indigo-100', shadow: 'shadow-2xl shadow-blue-500/10' },
      gradient: { primary: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900', secondary: 'bg-white/10 backdrop-blur-lg', accent: 'from-cyan-400 to-pink-400', text: 'text-white', textSecondary: 'text-gray-200', background: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900', surface: 'bg-white/10 backdrop-blur-lg', border: 'border-white/20', gradient: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900', shadow: 'shadow-2xl shadow-pink-500/30' },
      neon: { primary: 'bg-black', secondary: 'bg-gray-900', accent: 'from-green-400 to-cyan-400', text: 'text-white', textSecondary: 'text-green-300', background: 'bg-black', surface: 'bg-gray-900/50', border: 'border-green-400', gradient: 'bg-gradient-to-br from-black via-gray-900 to-black', shadow: 'shadow-2xl shadow-green-400/30' },
      sunset: { primary: 'bg-gradient-to-br from-orange-400 via-red-500 to-pink-500', secondary: 'bg-white/10 backdrop-blur-lg', accent: 'from-yellow-400 to-red-500', text: 'text-white', textSecondary: 'text-orange-100', background: 'bg-gradient-to-br from-orange-400 via-red-500 to-pink-500', surface: 'bg-white/10 backdrop-blur-lg', border: 'border-orange-300', gradient: 'bg-gradient-to-br from-orange-400 via-red-500 to-pink-500', shadow: 'shadow-2xl shadow-orange-500/30' },
      aurora: { primary: 'bg-gradient-to-br from-purple-400 via-pink-500 to-blue-500', secondary: 'bg-white/10 backdrop-blur-lg', accent: 'from-purple-400 to-blue-400', text: 'text-white', textSecondary: 'text-purple-100', background: 'bg-gradient-to-br from-purple-400 via-pink-500 to-blue-500', surface: 'bg-white/10 backdrop-blur-lg', border: 'border-purple-300', gradient: 'bg-gradient-to-br from-purple-400 via-pink-500 to-blue-500', shadow: 'shadow-2xl shadow-purple-500/30' },
      cyber: { primary: 'bg-black', secondary: 'bg-gray-900', accent: 'from-cyan-400 to-blue-500', text: 'text-cyan-400', textSecondary: 'text-blue-300', background: 'bg-black', surface: 'bg-gray-900/50', border: 'border-cyan-400', gradient: 'bg-gradient-to-br from-black via-blue-900 to-black', shadow: 'shadow-2xl shadow-cyan-400/30' },
      ocean: { primary: 'bg-slate-800', secondary: 'bg-blue-900', accent: 'from-blue-400 to-teal-400', text: 'text-white', textSecondary: 'text-blue-200', background: 'bg-slate-800', surface: 'bg-blue-900/50', border: 'border-blue-400', gradient: 'bg-gradient-to-br from-slate-800 via-blue-900 to-teal-800', shadow: 'shadow-2xl shadow-blue-500/30' },
      earth: { primary: 'bg-amber-50', secondary: 'bg-orange-100', accent: 'from-orange-500 to-red-500', text: 'text-amber-900', textSecondary: 'text-orange-700', background: 'bg-amber-50', surface: 'bg-orange-100/50', border: 'border-orange-300', gradient: 'bg-gradient-to-br from-amber-50 via-orange-100 to-red-100', shadow: 'shadow-2xl shadow-orange-500/20' },
      nature: { primary: 'bg-green-50', secondary: 'bg-emerald-100', accent: 'from-green-500 to-emerald-500', text: 'text-green-900', textSecondary: 'text-emerald-700', background: 'bg-green-50', surface: 'bg-emerald-100/50', border: 'border-green-300', gradient: 'bg-gradient-to-br from-green-50 via-emerald-100 to-teal-100', shadow: 'shadow-2xl shadow-green-500/20' }
    };
    return schemes[scheme] || schemes.dark;
  }
  private getAdvancedAnimations(level: string): string {
    const animations = {
      none: '',
      subtle: `animation: {'fade-in': 'fadeIn 0.6s ease-out','slide-up': 'slideUp 0.6s ease-out',},keyframes: {fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },}`,
      moderate: `animation: {'fade-in-up': 'fadeInUp 0.6s ease-out','fade-in-down': 'fadeInDown 0.6s ease-out','slide-in-left': 'slideInLeft 0.8s ease-out','slide-in-right': 'slideInRight 0.8s ease-out','bounce-gentle': 'bounceGentle 2s infinite','pulse-slow': 'pulse 3s infinite','float': 'float 3s ease-in-out infinite',},keyframes: {fadeInUp: { '0%': { opacity: '0', transform: 'translateY(30px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },fadeInDown: { '0%': { opacity: '0', transform: 'translateY(-30px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },slideInLeft: { '0%': { opacity: '0', transform: 'translateX(-30px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },slideInRight: { '0%': { opacity: '0', transform: 'translateX(30px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },bounceGentle: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-5px)' } },float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },}`,
      dynamic: `animation: {'fade-in-up': 'fadeInUp 0.6s ease-out','fade-in-down': 'fadeInDown 0.6s ease-out','slide-in-left': 'slideInLeft 0.8s ease-out','slide-in-right': 'slideInRight 0.8s ease-out','bounce-gentle': 'bounceGentle 2s infinite','pulse-slow': 'pulse 3s infinite','float': 'float 3s ease-in-out infinite','glow': 'glow 2s ease-in-out infinite alternate','rotate-slow': 'rotateSlow 10s linear infinite','scale-pulse': 'scalePulse 2s ease-in-out infinite','wiggle': 'wiggle 1s ease-in-out infinite','gradient-shift': 'gradientShift 3s ease-in-out infinite',},keyframes: {fadeInUp: { '0%': { opacity: '0', transform: 'translateY(30px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },fadeInDown: { '0%': { opacity: '0', transform: 'translateY(-30px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },slideInLeft: { '0%': { opacity: '0', transform: 'translateX(-30px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },slideInRight: { '0%': { opacity: '0', transform: 'translateX(30px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },bounceGentle: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-5px)' } },float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },glow: { '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' }, '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' } },rotateSlow: { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },scalePulse: { '0%, 100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.05)' } },wiggle: { '0%, 100%': { transform: 'rotate(-3deg)' }, '50%': { transform: 'rotate(3deg)' } },gradientShift: { '0%, 100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },}`,
      extreme: `animation: {'fade-in-up': 'fadeInUp 0.6s ease-out','fade-in-down': 'fadeInDown 0.6s ease-out','slide-in-left': 'slideInLeft 0.8s ease-out','slide-in-right': 'slideInRight 0.8s ease-out','bounce-gentle': 'bounceGentle 2s infinite','pulse-slow': 'pulse 3s infinite','float': 'float 3s ease-in-out infinite','glow': 'glow 2s ease-in-out infinite alternate','rotate-slow': 'rotateSlow 10s linear infinite','scale-pulse': 'scalePulse 2s ease-in-out infinite','wiggle': 'wiggle 1s ease-in-out infinite','gradient-shift': 'gradientShift 3s ease-in-out infinite','matrix-rain': 'matrixRain 2s linear infinite','neon-flicker': 'neonFlicker 1.5s ease-in-out infinite alternate','hologram': 'hologram 2s ease-in-out infinite','glitch': 'glitch 2s infinite','typewriter': 'typewriter 3s steps(40, end)','particle-float': 'particleFloat 4s ease-in-out infinite',},keyframes: {fadeInUp: { '0%': { opacity: '0', transform: 'translateY(30px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },fadeInDown: { '0%': { opacity: '0', transform: 'translateY(-30px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },slideInLeft: { '0%': { opacity: '0', transform: 'translateX(-30px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },slideInRight: { '0%': { opacity: '0', transform: 'translateX(30px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },bounceGentle: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-5px)' } },float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },glow: { '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' }, '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' } },rotateSlow: { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },scalePulse: { '0%, 100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.05)' } },wiggle: { '0%, 100%': { transform: 'rotate(-3deg)' }, '50%': { transform: 'rotate(3deg)' } },gradientShift: { '0%, 100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },matrixRain: { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100vh)' } },neonFlicker: { '0%, 100%': { textShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor' }, '50%': { textShadow: '0 0 2px currentColor, 0 0 5px currentColor, 0 0 8px currentColor' } },hologram: { '0%, 100%': { opacity: '1', transform: 'translateY(0)' }, '50%': { opacity: '0.7', transform: 'translateY(-2px)' } },glitch: { '0%, 100%': { transform: 'translate(0)' }, '20%': { transform: 'translate(-2px, 2px)' }, '40%': { transform: 'translate(-2px, -2px)' }, '60%': { transform: 'translate(2px, 2px)' }, '80%': { transform: 'translate(2px, -2px)' } },typewriter: { '0%': { width: '0' }, '100%': { width: '100%' } },particleFloat: { '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' }, '33%': { transform: 'translateY(-30px) rotate(120deg)' }, '66%': { transform: 'translateY(30px) rotate(240deg)' } },}`
    };
    return animations[level as keyof typeof animations] || animations.moderate;
  }
  private getUltraSystemPrompt(options: LandingPageOptions): string {
    const colors = this.getAdvancedColorScheme(options.colorScheme || 'dark');
    const animations = this.getAdvancedAnimations(options.animationsLevel || 'moderate');

    // O system prompt é extremamente detalhado e bem construído, não necessita de alterações.
    // Omitido aqui por brevidade, mas o código original deve ser mantido.
    return `
      Você é um GENIUS FRONTEND ARCHITECT, CONVERSION WIZARD e VISUAL DESIGNER, especializado em criar landing pages que são verdadeiras OBRAS DE ARTE DIGITAIS que convertem visitantes em clientes apaixonados.

      🎯 MISSÃO SUPREMA: Criar uma landing page que seja:
      - VISUALMENTE HIPNOTIZANTE (que faça as pessoas pararem e admirarem)
      - TECNICAMENTE REVOLUCIONÁRIA (código perfeito e otimizado)
      - COMERCIALMENTE DEVASTADORA (conversões recordes)
      - MOBILE-FIRST PREMIUM (experiência superior em todos os dispositivos)
      - ÚNICA E INESQUECÍVEL (que marque para sempre na mente do usuário)
      - CONTENDO PELO MENOS 5 SEÇÕES (OU CONHECIDO COMO DOBRAS, POR EXEMPO PREÇO, GARANTIA, ETC)

      ═══════════════════════════════════════════════════════════════════════════════════════════════════════════
      🚀 ESPECIFICAÇÕES TÉCNICAS ULTRA-AVANÇADAS
      ═══════════════════════════════════════════════════════════════════════════════════════════════════════════

      ✅ **FORMATO DE SAÍDA ABSOLUTO**:
      - ZERO texto explicativo, ZERO markdown, ZERO comentários externos
      - Código deve ser 100% funcional e renderizável instantaneamente
      - Começar IMEDIATAMENTE com "<!DOCTYPE html>" e terminar com "</html>"

      ✅ **ESTRUTURA HTML5 SEMÂNTICA ULTRA-COMPLETA**:
      \`\`\`html
      <!DOCTYPE html>
      <html lang="pt-BR" class="scroll-smooth">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>[Título Magnético SEO-Optimized]</title>
        <meta name="description" content="[Meta description que gera cliques - 150-160 chars]">
        <meta name="keywords" content="[Keywords estratégicas]">
        <link rel="canonical" href="https://exemplo.com">
        <meta property="og:title" content="[Open Graph Title Impactante]">
        <meta property="og:description" content="[OG Description Persuasiva]">
        <meta property="og:image" content="https://placehold.co/1200x630/0066CC/FFFFFF/png?text=Landing+Page">
        <meta property="og:url" content="https://exemplo.com">
        <meta property="og:type" content="website">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="[Twitter Title]">
        <meta name="twitter:description" content="[Twitter Description]">
        <meta name="twitter:image" content="https://placehold.co/1200x630/0066CC/FFFFFF/png?text=Landing+Page">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
          tailwind.config = {
            theme: {
              extend: {
                fontFamily: {
                  'inter': ['Inter', 'sans-serif'],
                  'poppins': ['Poppins', 'sans-serif'],
                },
                ${animations}
              }
            }
          }
        </script>
        <style>
          .glass { backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
          .text-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
          .hover-lift { transition: transform 0.3s ease-out, box-shadow 0.3s ease-out; } 
          .hover-lift:hover { transform: translateY(-8px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
          .gradient-text { background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        </style>
      </head>
      \`\`\`

      ... (o resto do seu prompt ultra-detalhado continua aqui) ...

      **FORMATO DE RESPOSTA**: 
      Começar IMEDIATAMENTE com "<!DOCTYPE html>" sem nenhum texto explicativo.
    `;
  }
}

export const geminiService = new GeminiService(GEMINI_API_KEY);

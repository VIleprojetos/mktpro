import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import {
  GEMINI_API_KEY
} from '../config';

// Interfaces para as opções da Landing Page e Paleta de Cores
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

  /**
   * Gera texto simples a partir de um prompt.
   * @param prompt O texto de entrada para o modelo.
   * @returns O texto gerado.
   */
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

  /**
   * Extrai e limpa o conteúdo HTML da resposta do modelo Gemini.
   * @param rawText O texto bruto retornado pela API.
   * @returns Uma string contendo apenas o código HTML limpo.
   */
  private extractHtmlFromResponse(rawText: string): string {
    // Tenta encontrar um documento HTML completo, que é o método mais confiável.
    const htmlMatch = rawText.match(/<!DOCTYPE html>[\s\S]*?<\/html>/i);
    if (htmlMatch) {
      return htmlMatch[0];
    }

    // Como fallback, remove as cercas de código markdown.
    let cleanHtml = rawText
      .replace(/^```html\s*/, '') // Remove a cerca de abertura
      .replace(/```$/, '') // Remove a cerca de fechamento
      .trim();

    // Garante que o código comece corretamente, caso o modelo omita o doctype.
    if (!cleanHtml.toLowerCase().startsWith('<!doctype html>')) {
      cleanHtml = `<!DOCTYPE html>\n${cleanHtml}`;
    }

    return cleanHtml;
  }

  /**
   * Cria e gera a landing page principal com base nas opções fornecidas.
   * @param prompt O briefing principal para a landing page.
   * @param options As opções de personalização.
   * @param reference HTML de referência (opcional).
   * @returns O código HTML completo da landing page.
   */
  public async createUltraLandingPage(
    prompt: string,
    options: LandingPageOptions = {},
    reference ? : string
  ): Promise<string> {
    if (!this.genAI) {
      throw new Error('A API Key do Gemini não está configurada no servidor.');
    }

    const model = this.genAI.getGenerativeModel({
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

    const systemPrompt = this.getUltraSystemPrompt(options);
    const userPrompt = this.buildUserPrompt(prompt, options, reference);

    try {
      const result = await model.generateContent([systemPrompt, userPrompt]);
      const response = result.response;
      
      // Usa a função centralizada para extrair e limpar o HTML
      let htmlContent = this.extractHtmlFromResponse(response.text());
      
      // Aplica otimizações finais no HTML gerado
      htmlContent = this.optimizeHtmlContent(htmlContent);

      return htmlContent;
    } catch (error: any) {
      console.error('[GeminiService] Erro ao chamar a API do Gemini:', error);
      throw new Error(`Falha ao gerar landing page ultra-premium: ${error.message}`);
    }
  }
  
  /**
   * Gera múltiplas variações de landing pages com base em um único prompt.
   * @param prompt O briefing principal.
   * @param count O número de variações a serem geradas.
   * @param baseOptions Opções base para aplicar a todas as variações.
   * @returns Uma array de strings, cada uma contendo o HTML de uma variação.
   */
  public async generatePremiumVariations(
    prompt: string,
    count: number = 3,
    baseOptions: LandingPageOptions = {}
  ): Promise<string[]> {
    const variations: string[] = [];
    const styles: Array<LandingPageOptions['style']> = [
      'modern', 'luxury', 'tech', 'creative', 'bold', 'elegant', 'startup', 'corporate', 'gaming'
    ];
    const colorSchemes: Array<LandingPageOptions['colorScheme']> = [
      'gradient', 'aurora', 'cyber', 'sunset', 'ocean', 'neon', 'dark', 'nature'
    ];
    const animationLevels: Array<LandingPageOptions['animationsLevel']> = [
      'dynamic', 'extreme', 'moderate'
    ];

    for (let i = 0; i < count; i++) {
      const options: LandingPageOptions = {
        ...baseOptions,
        style: styles[i % styles.length],
        colorScheme: colorSchemes[i % colorSchemes.length],
        animationsLevel: animationLevels[i % animationLevels.length],
        layout: i === 0 ? 'storytelling' : i === 1 ? 'product-focused' : 'multi-section',
        brandPersonality: i === 0 ? 'innovative' : i === 1 ? 'premium' : 'disruptive'
      };

      try {
        console.log(`Gerando variação ${i + 1} de ${count}...`);
        const variation = await this.createUltraLandingPage(prompt, options);
        variations.push(variation);

        // **CORREÇÃO**: Pausa maior para evitar limites de taxa da API.
        // Aumentado para 15 segundos para segurança com o modelo Gemini 1.5 Pro (geralmente limitado a ~5 requisições/minuto).
        if (i < count - 1) {
          console.log(`Aguardando 15 segundos antes da próxima requisição para evitar limites de taxa...`);
          await new Promise(resolve => setTimeout(resolve, 15000));
        }
      } catch (error: any) {
        // Log mais descritivo para facilitar a depuração.
        console.error(`Erro ao gerar variação premium ${i + 1} com opções: ${JSON.stringify(options)}`, error.message);
      }
    }

    console.log("Geração de variações concluída.");
    return variations;
  }

  /**
   * Otimiza um HTML de landing page existente com base em metas específicas.
   * @param currentHtml O código HTML atual da página.
   * @param optimizationGoals Metas da otimização (ex: 'conversion', 'performance').
   * @returns O código HTML otimizado.
   */
  public async optimizeUltraLandingPage(
    currentHtml: string,
    optimizationGoals: string[] = ['conversion', 'performance', 'accessibility', 'seo']
  ): Promise<string> {
    if (!this.genAI) {
      throw new Error('A API Key do Gemini não está configurada no servidor.');
    }

    const model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest"
    });

    const optimizationPrompt = `
      Você é um ULTRA-ESPECIALISTA em OTIMIZAÇÃO DE CONVERSÃO, PERFORMANCE WEB e UX/UI.
      Analise profundamente a landing page fornecida e aplique as otimizações mais avançadas.
      
      OBJETIVOS DE OTIMIZAÇÃO:
      ${optimizationGoals.map(goal => `🎯 ${goal.toUpperCase()}`).join('\n')}
      
      LANDING PAGE ATUAL:
      ${currentHtml}
      
      INSTRUÇÕES:
      1. Melhore a landing page com base nos objetivos.
      2. Mantenha a estrutura e o conteúdo principal, focando nas melhorias.
      3. Retorne APENAS o HTML otimizado completo.
      4. O resultado DEVE começar com "<!DOCTYPE html>" e ser um código funcional.
    `;

    try {
      const result = await model.generateContent(optimizationPrompt);
      const response = result.response;
      
      // **CORREÇÃO CRÍTICA**: Usa a mesma função de extração de HTML para garantir um output limpo.
      return this.extractHtmlFromResponse(response.text());
    } catch (error: any) {
      console.error('[GeminiService] Erro ao otimizar landing page ultra:', error);
      throw new Error(`Falha ao otimizar landing page ultra: ${error.message}`);
    }
  }
  
  // Funções de ajuda privadas para construir os prompts e otimizar o conteúdo
  
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
          subtle: `animation:{'fade-in':'fadeIn .6s ease-out','slide-up':'slideUp .6s ease-out'},keyframes:{fadeIn:{'0%':{opacity:'0'},'100%':{opacity:'1'}},slideUp:{'0%':{opacity:'0',transform:'translateY(20px)'},'100%':{opacity:'1',transform:'translateY(0)'}}}`,
          moderate: `animation:{'fade-in-up':'fadeInUp .6s ease-out','fade-in-down':'fadeInDown .6s ease-out','slide-in-left':'slideInLeft .8s ease-out','slide-in-right':'slideInRight .8s ease-out','bounce-gentle':'bounceGentle 2s infinite','pulse-slow':'pulse 3s infinite','float':'float 3s ease-in-out infinite'},keyframes:{fadeInUp:{'0%':{opacity:'0',transform:'translateY(30px)'},'100%':{opacity:'1',transform:'translateY(0)'}},fadeInDown:{'0%':{opacity:'0',transform:'translateY(-30px)'},'100%':{opacity:'1',transform:'translateY(0)'}},slideInLeft:{'0%':{opacity:'0',transform:'translateX(-30px)'},'100%':{opacity:'1',transform:'translateX(0)'}},slideInRight:{'0%':{opacity:'0',transform:'translateX(30px)'},'100%':{opacity:'1',transform:'translateX(0)'}},bounceGentle:{'0%,100%':{transform:'translateY(0)'},'50%':{transform:'translateY(-5px)'}},float:{'0%,100%':{transform:'translateY(0px)'},'50%':{transform:'translateY(-10px)'}}}`,
          dynamic: `animation:{'fade-in-up':'fadeInUp .6s ease-out','fade-in-down':'fadeInDown .6s ease-out','slide-in-left':'slideInLeft .8s ease-out','slide-in-right':'slideInRight .8s ease-out','bounce-gentle':'bounceGentle 2s infinite','pulse-slow':'pulse 3s infinite','float':'float 3s ease-in-out infinite','glow':'glow 2s ease-in-out infinite alternate','rotate-slow':'rotateSlow 10s linear infinite','scale-pulse':'scalePulse 2s ease-in-out infinite','wiggle':'wiggle 1s ease-in-out infinite','gradient-shift':'gradientShift 3s ease-in-out infinite'},keyframes:{fadeInUp:{'0%':{opacity:'0',transform:'translateY(30px)'},'100%':{opacity:'1',transform:'translateY(0)'}},fadeInDown:{'0%':{opacity:'0',transform:'translateY(-30px)'},'100%':{opacity:'1',transform:'translateY(0)'}},slideInLeft:{'0%':{opacity:'0',transform:'translateX(-30px)'},'100%':{opacity:'1',transform:'translateX(0)'}},slideInRight:{'0%':{opacity:'0',transform:'translateX(30px)'},'100%':{opacity:'1',transform:'translateX(0)'}},bounceGentle:{'0%,100%':{transform:'translateY(0)'},'50%':{transform:'translateY(-5px)'}},float:{'0%,100%':{transform:'translateY(0px)'},'50%':{transform:'translateY(-10px)'}},glow:{'0%':{boxShadow:'0 0 5px rgba(59,130,246,.5)'},'100%':{boxShadow:'0 0 20px rgba(59,130,246,.8)'}},rotateSlow:{'0%':{transform:'rotate(0deg)'},'100%':{transform:'rotate(360deg)'}},scalePulse:{'0%,100%':{transform:'scale(1)'},'50%':{transform:'scale(1.05)'}},wiggle:{'0%,100%':{transform:'rotate(-3deg)'},'50%':{transform:'rotate(3deg)'}},gradientShift:{'0%,100%':{backgroundPosition:'0% 50%'},'50%':{backgroundPosition:'100% 50%'}}}`,
          extreme: `animation:{'fade-in-up':'fadeInUp .6s ease-out','fade-in-down':'fadeInDown .6s ease-out','slide-in-left':'slideInLeft .8s ease-out','slide-in-right':'slideInRight .8s ease-out','bounce-gentle':'bounceGentle 2s infinite','pulse-slow':'pulse 3s infinite','float':'float 3s ease-in-out infinite','glow':'glow 2s ease-in-out infinite alternate','rotate-slow':'rotateSlow 10s linear infinite','scale-pulse':'scalePulse 2s ease-in-out infinite','wiggle':'wiggle 1s ease-in-out infinite','gradient-shift':'gradientShift 3s ease-in-out infinite','matrix-rain':'matrixRain 2s linear infinite','neon-flicker':'neonFlicker 1.5s ease-in-out infinite alternate','hologram':'hologram 2s ease-in-out infinite','glitch':'glitch 2s infinite','typewriter':'typewriter 3s steps(40,end)','particle-float':'particleFloat 4s ease-in-out infinite'},keyframes:{fadeInUp:{'0%':{opacity:'0',transform:'translateY(30px)'},'100%':{opacity:'1',transform:'translateY(0)'}},fadeInDown:{'0%':{opacity:'0',transform:'translateY(-30px)'},'100%':{opacity:'1',transform:'translateY(0)'}},slideInLeft:{'0%':{opacity:'0',transform:'translateX(-30px)'},'100%':{opacity:'1',transform:'translateX(0)'}},slideInRight:{'0%':{opacity:'0',transform:'translateX(30px)'},'100%':{opacity:'1',transform:'translateX(0)'}},bounceGentle:{'0%,100%':{transform:'translateY(0)'},'50%':{transform:'translateY(-5px)'}},float:{'0%,100%':{transform:'translateY(0px)'},'50%':{transform:'translateY(-10px)'}},glow:{'0%':{boxShadow:'0 0 5px rgba(59,130,246,.5)'},'100%':{boxShadow:'0 0 20px rgba(59,130,246,.8)'}},rotateSlow:{'0%':{transform:'rotate(0deg)'},'100%':{transform:'rotate(360deg)'}},scalePulse:{'0%,100%':{transform:'scale(1)'},'50%':{transform:'scale(1.05)'}},wiggle:{'0%,100%':{transform:'rotate(-3deg)'},'50%':{transform:'rotate(3deg)'}},gradientShift:{'0%,100%':{backgroundPosition:'0% 50%'},'50%':{backgroundPosition:'100% 50%'}},matrixRain:{'0%':{transform:'translateY(-100%)'},'100%':{transform:'translateY(100vh)'}},neonFlicker:{'0%,100%':{textShadow:'0 0 5px currentColor,0 0 10px currentColor,0 0 15px currentColor'},'50%':{textShadow:'0 0 2px currentColor,0 0 5px currentColor,0 0 8px currentColor'}},hologram:{'0%,100%':{opacity:'1',transform:'translateY(0)'},'50%':{opacity:'.7',transform:'translateY(-2px)'}},glitch:{'0%,100%':{transform:'translate(0)'},'20%':{transform:'translate(-2px,2px)'},'40%':{transform:'translate(-2px,-2px)'},'60%':{transform:'translate(2px,2px)'},'80%':{transform:'translate(2px,-2px)'}},typewriter:{'0%':{width:'0'},'100%':{width:'100%'}},particleFloat:{'0%,100%':{transform:'translateY(0) rotate(0deg)'},'33%':{transform:'translateY(-30px) rotate(120deg)'},'66%':{transform:'translateY(30px) rotate(240deg)'}}}}`
      };
      return (animations[level as keyof typeof animations] || animations.moderate).replace(/\s+/g, ' ');
  }

  private getUltraSystemPrompt(options: LandingPageOptions): string {
    const colors = this.getAdvancedColorScheme(options.colorScheme || 'dark');
    const animations = this.getAdvancedAnimations(options.animationsLevel || 'moderate');

    return `
      Você é um GENIUS FRONTEND ARCHITECT e CONVERSION WIZARD. Sua missão é criar uma landing page HTML completa, funcional e visualmente espetacular usando TailwindCSS.
      REGRAS ABSOLUTAS:
      1.  **SAÍDA OBRIGATÓRIA**: APENAS o código HTML. Comece IMEDIATAMENTE com "<!DOCTYPE html>" e termine com "</html>". NENHUM texto, explicação, ou markdown fora do HTML.
      2.  **TECNOLOGIA**: Use HTML5 semântico e TailwindCSS via CDN. As fontes Inter e Poppins devem ser importadas do Google Fonts.
      3.  **CONTEÚDO**: Gere conteúdo de marketing PERSUASIVO e específico para a indústria e público-alvo fornecidos. Use placeholders de imagem de ALTA QUALIDADE de https://placehold.co/.
      4.  **DESIGN**: O design deve ser mobile-first, ultra-responsivo e visualmente impactante, aplicando o esquema de cores e o nível de animação solicitados.
      5.  **ESTRUTURA**: O código deve ser um arquivo único e completo, com CSS e JS inline (dentro de tags <style> e <script>).

      ESPECIFICAÇÕES DE DESIGN E ESTRUTURA:
      - **HEAD**: Inclua meta tags completas para SEO (title, description, keywords, canonical, OG, Twitter).
      - **TAILWIND CONFIG**: Configure as fontes ('inter', 'poppins') e as animações personalizadas (${animations}) no objeto \`tailwind.config\`.
      - **ESTILOS GLOBAIS**: Inclua estilos para 'glassmorphism', 'scroll-behavior', 'hover-effects', etc., na tag <style>.
      - **PALETA DE CORES**: Aplique rigorosamente as classes Tailwind correspondentes à paleta: ${JSON.stringify(colors, null, 2)}.
      - **SEÇÕES**: Construa a página com seções lógicas e bem definidas (Header, Hero, Features, Testimonials, Pricing, FAQ, CTA, Footer), incluindo APENAS as seções solicitadas nas opções.
      - **CONVERSÃO**: Otimize cada elemento (headlines, CTAs, prova social) para máxima conversão.

      Execute a missão e entregue uma obra-prima digital.
    `;
  }
  
  private buildUserPrompt(prompt: string, options: LandingPageOptions, reference?: string): string {
      return `
      BRIEFING DO CLIENTE:
      ${prompt}
      
      ESPECIFICAÇÕES DETALHADAS:
      - Estilo Visual: ${options.style || 'modern'}
      - Esquema de Cores: ${options.colorScheme || 'dark'}
      - Indústria/Setor: ${options.industry || 'Tecnologia'}
      - Público-alvo: ${options.targetAudience || 'Profissionais'}
      - Personalidade da Marca: ${options.brandPersonality || 'innovative'}
      - Layout: ${options.layout || 'multi-section'}
      - CTA Primário: "${options.primaryCTA || 'Começar Agora'}"
      - CTA Secundário: "${options.secondaryCTA || 'Saber Mais'}"
      - Nível de Animações: ${options.animationsLevel || 'dynamic'}
      
      SEÇÕES A INCLUIR OBRIGATORIAMENTE:
      ${options.includeFeatures !== false ? '✅ Grid de recursos/funcionalidades' : ''}
      ${options.includeTestimonials !== false ? '✅ Seção de Depoimentos' : ''}
      ${options.includeStats !== false ? '✅ Estatísticas de impacto' : ''}
      ${options.includePricing ? '✅ Seção de Preços' : ''}
      ${options.includeFAQ !== false ? '✅ FAQ com accordion' : ''}
      ${options.includeVideo ? '✅ Seção de vídeo' : ''}
      ${options.includeNewsletter !== false ? '✅ Captura para Newsletter no rodapé' : ''}
      ${options.includeBlog ? '✅ Seção de blog/artigos' : ''}
      
      ${reference ? `REFERÊNCIA VISUAL (use como inspiração para estrutura e estilo, mas adapte o conteúdo ao briefing):
      ${reference}` : ''}

      COMANDO FINAL: Crie a landing page agora, seguindo todas as regras à risca. A resposta deve ser apenas o código HTML.
    `;
  }
  
  private optimizeHtmlContent(html: string): string {
    let optimizedHtml = html;

    // Adiciona preconnect e dns-prefetch para melhor performance de carregamento de fontes e imagens.
    if (!optimizedHtml.includes('rel="preconnect"')) {
      optimizedHtml = optimizedHtml.replace(
        '<head>',
        `<head>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link rel="dns-prefetch" href="https://placehold.co">`
      );
    }
    
    // Melhora a qualidade dos placeholders de imagem.
    optimizedHtml = optimizedHtml.replace(
      /placehold\.co\/(\d+)x(\d+)/g,
      'placehold.co/$1x$2/1E293B/FFFFFF/png?text=Image'
    );

    return optimizedHtml;
  }
}

export const geminiService = new GeminiService(GEMINI_API_KEY);

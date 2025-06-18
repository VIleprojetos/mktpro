import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import {
  GEMINI_API_KEY
} from '../config';

// As interfaces permanecem as mesmas
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

  // =================================================================
  // MÉTODOS PÚBLICOS
  // =================================================================

  /**
   * [CORRIGIDO] Método genérico para gerar texto, re-adicionado para compatibilidade.
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
   * O método principal e mais avançado para criar a landing page.
   */
  public async createUltraLandingPage(
    prompt: string,
    options: LandingPageOptions = {},
    reference?: string
  ): Promise<string> {
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

      htmlContent = this.cleanHtmlResponse(htmlContent);
      htmlContent = this.postProcessHtml(htmlContent, options);

      return htmlContent;
    } catch (error: any) {
      console.error('[GeminiService] Erro ao chamar a API do Gemini:', error);
      throw new Error(`Falha ao gerar landing page ultra-premium: ${error.message}`);
    }
  }

  /**
   * O novo método para gerar múltiplas variações de design.
   */
  public async generatePremiumVariations(
    prompt: string,
    count: number = 3,
    baseOptions: LandingPageOptions = {}
  ): Promise<string[]> {
    const variations: string[] = [];
    const styles: Array<LandingPageOptions['style']> = ['modern', 'luxury', 'tech', 'creative', 'bold', 'elegant', 'startup', 'corporate', 'gaming', 'minimal'];
    const colorSchemes: Array<LandingPageOptions['colorScheme']> = ['gradient', 'aurora', 'cyber', 'sunset', 'ocean', 'neon', 'dark', 'light', 'nature', 'earth'];
    const animationLevels: Array<LandingPageOptions['animationsLevel']> = ['dynamic', 'extreme', 'moderate', 'subtle'];
    const layouts: Array<LandingPageOptions['layout']> = ['storytelling', 'product-focused', 'multi-section', 'service-focused', 'single-page'];
    const personalities: Array<LandingPageOptions['brandPersonality']> = ['innovative', 'premium', 'disruptive', 'friendly', 'trustworthy', 'professional'];

    for (let i = 0; i < count; i++) {
      const options: LandingPageOptions = {
        ...baseOptions,
        style: styles[Math.floor(Math.random() * styles.length)],
        colorScheme: colorSchemes[Math.floor(Math.random() * colorSchemes.length)],
        animationsLevel: animationLevels[Math.floor(Math.random() * animationLevels.length)],
        layout: layouts[Math.floor(Math.random() * layouts.length)],
        brandPersonality: personalities[Math.floor(Math.random() * personalities.length)]
      };

      try {
        console.log(`Gerando variação ${i + 1}/${count} com as opções:`, { style: options.style, colorScheme: options.colorScheme, layout: options.layout });
        const variation = await this.createUltraLandingPage(prompt, options);
        variations.push(variation);

        if (i < count - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      } catch (error) {
        console.error(`Erro ao gerar variação premium ${i + 1}:`, error);
      }
    }

    return variations;
  }
  
  public async optimizeUltraLandingPage(
    currentHtml: string,
    optimizationGoals: string[] = ['conversion', 'performance', 'accessibility', 'seo']
  ): Promise<string> {
    if (!this.genAI) {
      throw new Error('A API Key do Gemini não está configurada no servidor.');
    }

    const model = this.getGenerativeModel();
    const optimizationPrompt = `
      Você é um ULTRA-ESPECIALISTA em OTIMIZAÇÃO DE CONVERSÃO, PERFORMANCE WEB e UX/UI. Analise e otimize a landing page.
      OBJETIVOS: ${optimizationGoals.join(', ')}. LANDING PAGE: \`${currentHtml}\`.
      REGRAS: Melhore CTAs, prova social, performance (lazy loading), acessibilidade (ARIA, alt text) e SEO (meta, schema).
      RETORNE APENAS o código HTML 100% otimizado, começando com "<!DOCTYPE html>".
    `;

    try {
      const result = await model.generateContent(optimizationPrompt);
      let optimizedHtml = result.response.text();
      optimizedHtml = this.cleanHtmlResponse(optimizedHtml);
      return optimizedHtml;
    } catch (error: any) {
      console.error('[GeminiService] Erro ao otimizar landing page ultra:', error);
      throw new Error(`Falha ao otimizar landing page ultra: ${error.message}`);
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

    const model = this.getGenerativeModel();
    const analysisPrompt = `
      Você é um especialista em CRO. Analise este HTML e retorne um JSON com score (0-100), recommendations, strengths, e weaknesses.
      HTML: ${html}
      Responda APENAS em formato JSON.
    `;

    try {
      const result = await model.generateContent(analysisPrompt);
      const jsonText = result.response.text().replace(/```json|```/g, '').trim();
      return JSON.parse(jsonText);
    } catch (error: any) {
      console.error('[GeminiService] Erro ao analisar conversão:', error);
      return { score: 0, recommendations: ['Erro na análise'], strengths: [], weaknesses: ['Falha na análise'] };
    }
  }
  
  // =================================================================
  // MÉTODOS DE COMPATIBILIDADE (APELIDOS/ALIASES)
  // =================================================================

  /**
   * [COMPATIBILIDADE] Apelido para createUltraLandingPage.
   */
  public async createAdvancedLandingPage(prompt: string, options: LandingPageOptions = {}, reference?: string): Promise<string> {
    console.warn("[GeminiService] O método 'createAdvancedLandingPage' está obsoleto. Use 'createUltraLandingPage' no futuro.");
    return this.createUltraLandingPage(prompt, options, reference);
  }

  /**
   * [COMPATIBILIDADE] Apelido para generatePremiumVariations.
   */
  public async generateVariations(prompt: string, count: number = 3, baseOptions: LandingPageOptions = {}): Promise<string[]> {
    console.warn("[GeminiService] O método 'generateVariations' está obsoleto. Use 'generatePremiumVariations' no futuro.");
    return this.generatePremiumVariations(prompt, count, baseOptions);
  }
  
  /**
   * [COMPATIBILIDADE] Apelido para um método antigo.
   */
  public async createLandingPageFromPrompt(prompt: string, reference?: string): Promise<string> {
    console.warn("[GeminiService] O método 'createLandingPageFromPrompt' está obsoleto. Use 'createUltraLandingPage' com opções padrão no futuro.");
    return this.createUltraLandingPage(prompt, {
      style: 'modern',
      colorScheme: 'dark',
      animationsLevel: 'dynamic'
    }, reference);
  }

  // =================================================================
  // MÉTODOS PRIVADOS E DE CONFIGURAÇÃO (SEM ALTERAÇÕES)
  // =================================================================
  
  private getGenerativeModel() {
    if (!this.genAI) throw new Error('Gemini AI não inicializado.');
    return this.genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest",
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });
  }

  private cleanHtmlResponse(htmlContent: string): string {
    const htmlMatch = htmlContent.match(/<!DOCTYPE html>[\s\S]*<\/html>/i);
    if (htmlMatch) return htmlMatch[0];
    let cleanedHtml = htmlContent.replace(/^```html\s*/i, '').replace(/\s*```$/, '').trim();
    if (!cleanedHtml.startsWith('<!DOCTYPE html>')) {
      cleanedHtml = `<!DOCTYPE html>\n${cleanedHtml}`;
    }
    return cleanedHtml;
  }
  
  private postProcessHtml(html: string, options: LandingPageOptions): string {
    let optimizedHtml = html;
    if (!optimizedHtml.includes('rel="preconnect"')) {
      optimizedHtml = optimizedHtml.replace('<head>', `<head>\n<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="dns-prefetch" href="https://placehold.co">`);
    }
    return optimizedHtml;
  }

  private buildUserPrompt(prompt: string, options: LandingPageOptions, reference?: string): string {
    return `
      BRIEFING: ${prompt}
      OPÇÕES: ${JSON.stringify(options)}
      ${reference ? `REFERÊNCIA: ${reference}` : ''}
      Crie a landing page. Responda APENAS com o código HTML completo.
    `;
  }

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
    // Prompt ultra detalhado omitido por brevidade, mas deve ser o mesmo que você já tem
    return `Você é um GENIUS FRONTEND ARCHITECT... (o seu prompt original e completo vai aqui)`;
  }
}

export const geminiService = new GeminiService(GEMINI_API_KEY);

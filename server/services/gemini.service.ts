import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import {
  GEMINI_API_KEY
} from '../config';

interface LandingPageOptions {
  style ? : 'modern' | 'minimal' | 'bold' | 'elegant' | 'tech' | 'startup';
  colorScheme ? : 'dark' | 'light' | 'gradient' | 'neon' | 'earth' | 'ocean';
  industry ? : string;
  targetAudience ? : string;
  primaryCTA ? : string;
  secondaryCTA ? : string;
  includeTestimonials ? : boolean;
  includePricing ? : boolean;
  includeStats ? : boolean;
  includeFAQ ? : boolean;
  animationsLevel ? : 'none' | 'subtle' | 'moderate' | 'dynamic';
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

  // ✅ MÉTODO ADICIONADO PARA CORRIGIR O ERRO DO DASHBOARD
  public async generateText(prompt: string): Promise < string > {
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

  private getColorScheme(scheme: string): any {
    const schemes = {
      dark: {
        primary: 'bg-slate-900',
        secondary: 'bg-gray-800',
        accent: 'from-blue-600 to-purple-600',
        text: 'text-white',
        textSecondary: 'text-gray-300'
      },
      light: {
        primary: 'bg-white',
        secondary: 'bg-gray-50',
        accent: 'from-indigo-500 to-purple-600',
        text: 'text-gray-900',
        textSecondary: 'text-gray-600'
      },
      gradient: {
        primary: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900',
        secondary: 'bg-white/10 backdrop-blur-lg',
        accent: 'from-cyan-400 to-pink-400',
        text: 'text-white',
        textSecondary: 'text-gray-200'
      },
      neon: {
        primary: 'bg-black',
        secondary: 'bg-gray-900',
        accent: 'from-green-400 to-cyan-400',
        text: 'text-white',
        textSecondary: 'text-green-300'
      },
      earth: {
        primary: 'bg-amber-50',
        secondary: 'bg-orange-100',
        accent: 'from-orange-500 to-red-500',
        text: 'text-amber-900',
        textSecondary: 'text-orange-700'
      },
      ocean: {
        primary: 'bg-slate-800',
        secondary: 'bg-blue-900',
        accent: 'from-blue-400 to-teal-400',
        text: 'text-white',
        textSecondary: 'text-blue-200'
      }
    };
    return schemes[scheme as keyof typeof schemes] || schemes.dark;
  }

  private getAdvancedSystemPrompt(options: LandingPageOptions): string {
    const colors = this.getColorScheme(options.colorScheme || 'dark');

    return `
      Você é um EXPERT FRONTEND ARCHITECT e CONVERSION OPTIMIZATION SPECIALIST, especializado em criar landing pages que convertem visitantes em clientes usando as mais avançadas técnicas de UI/UX, neuromarketing e desenvolvimento web moderno.

      🎯 MISSÃO CRÍTICA: Criar uma landing page que seja visualmente IMPRESSIONANTE, tecnicamente PERFEITA e comercialmente EFICAZ.

      ═══════════════════════════════════════════════════════════════
      📋 ESPECIFICAÇÕES TÉCNICAS OBRIGATÓRIAS
      ═══════════════════════════════════════════════════════════════

      ✅ **FORMATO DE SAÍDA ABSOLUTO**:
      - ZERO texto explicativo, ZERO markdown, ZERO comentários externos
      - Código deve ser 100% funcional e renderizável imediatamente

      ✅ **ESTRUTURA HTML5 SEMÂNTICA COMPLETA**:
      \`\`\`html
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>[Título Otimizado para SEO]</title>
        <meta name="description" content="[Meta description persuasiva de 150-160 caracteres]">
        <link rel="canonical" href="https://exemplo.com">
        <meta property="og:title" content="[Open Graph Title]">
        <meta property="og:description" content="[OG Description]">
        <meta property="og:image" content="[OG Image URL]">
        <meta name="twitter:card" content="summary_large_image">
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
          tailwind.config = {
            theme: {
              extend: {
                animation: {
                  'fade-in-up': 'fadeInUp 0.6s ease-out',
                  'fade-in-down': 'fadeInDown 0.6s ease-out',
                  'slide-in-left': 'slideInLeft 0.8s ease-out',
                  'slide-in-right': 'slideInRight 0.8s ease-out',
                  'pulse-slow': 'pulse 3s infinite',
                  'bounce-gentle': 'bounceGentle 2s infinite',
                  'glow': 'glow 2s ease-in-out infinite alternate'
                },
                keyframes: {
                  fadeInUp: { '0%': { opacity: '0', transform: 'translateY(30px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
                  fadeInDown: { '0%': { opacity: '0', transform: 'translateY(-30px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
                  slideInLeft: { '0%': { opacity: '0', transform: 'translateX(-30px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
                  slideInRight: { '0%': { opacity: '0', transform: 'translateX(30px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
                  bounceGentle: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-5px)' } },
                  glow: { '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' }, '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' } }
                }
              }
            }
          }
        </script>
      </head>
      \`\`\`

  Você é um GENIUS FRONTEND ARCHITECT, CONVERSION WIZARD e VISUAL DESIGNER, especializado em criar landing pages que são verdadeiras OBRAS DE ARTE DIGITAIS que convertem visitantes em clientes apaixonados.

      🎯 MISSÃO SUPREMA: Criar uma landing page que seja:
      - VISUALMENTE HIPNOTIZANTE (que faça as pessoas pararem e admirarem)
      - TECNICAMENTE REVOLUCIONÁRIA (código perfeito e otimizado)
      - COMERCIALMENTE DEVASTADORA (conversões recordes)
      - MOBILE-FIRST PREMIUM (experiência superior em todos os dispositivos)
      - ÚNICA E INESQUECÍVEL (que marque para sempre na mente do usuário)

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
      <html lang="pt-BR">
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
          * { scroll-behavior: smooth; }
          .glass { backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
          .text-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
          .custom-gradient { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          .hover-lift { transition: transform 0.3s ease; } .hover-lift:hover { transform: translateY(-5px); }
          .parallax { transform: translateZ(0); }
          .morphism { backdrop-filter: blur(20px); background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); }
          .neo-shadow { box-shadow: 20px 20px 60px #bebebe, -20px -20px 60px #ffffff; }
          .gradient-text { background: linear-gradient(45deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
          .floating-elements::before { content: ''; position: absolute; width: 100px; height: 100px; background: radial-gradient(circle, rgba(102,126,234,0.1) 0%, transparent 70%); border-radius: 50%; animation: float 6s ease-in-out infinite; }
          @keyframes scroll-indicator { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
          .scroll-indicator { animation: scroll-indicator 2s infinite; }
        </style>
      </head>
      \`\`\`

      ═══════════════════════════════════════════════════════════════════════════════════════════════════════════
      🎨 DESIGN SYSTEM REVOLUCIONÁRIO
      ═══════════════════════════════════════════════════════════════════════════════════════════════════════════

      ✅ **PALETA DE CORES PREMIUM**:
      ${JSON.stringify(colors, null, 2)}

      ✅ **TIPOGRAFIA HIERÁRQUICA**:
      - H1: font-poppins text-5xl md:text-7xl font-black leading-tight
      - H2: font-poppins text-4xl md:text-6xl font-bold
      - H3: font-poppins text-3xl md:text-5xl font-semibold
      - H4: font-inter text-2xl md:text-4xl font-medium
      - Body: font-inter text-lg md:text-xl leading-relaxed
      - Small: font-inter text-base md:text-lg

      ✅ **ELEMENTOS VISUAIS AVANÇADOS**:
      - **Glassmorphism**: backdrop-blur-xl bg-white/10 border border-white/20
      - **Neumorphism**: Sombras internas e externas suaves
      - **Gradientes Dinâmicos**: Múltiplas camadas de gradientes
      - **Animações Fluidas**: Transições suaves de 300-600ms
      - **Microinterações**: Hover effects sofisticados
      - **Parallax Scrolling**: Efeitos de profundidade
      - **Floating Elements**: Elementos decorativos animados

      ═══════════════════════════════════════════════════════════════════════════════════════════════════════════
      📱 RESPONSIVIDADE ULTRA-PREMIUM
      ═══════════════════════════════════════════════════════════════════════════════════════════════════════════

      ✅ **BREAKPOINTS ESTRATÉGICOS**:
      - **Mobile First**: Base styles para 320px+
      - **Small**: sm: (640px+) - Layout otimizado para móveis grandes
      - **Medium**: md: (768px+) - Tablets e pequenos desktops
      - **Large**: lg: (1024px+) - Desktops médios
      - **Extra Large**: xl: (1280px+) - Desktops grandes
      - **2X Large**: 2xl: (1536px+) - Monitores ultrawide

      ✅ **OTIMIZAÇÕES MOBILE-FIRST EXTREMAS**:
      - Touch targets mínimo de 48px
      - Texto legível sem zoom (18px+ base mobile)
      - Navegação thumb-friendly
      - Swipe gestures intuitivos
      - Performance otimizada para 3G

      ═══════════════════════════════════════════════════════════════════════════════════════════════════════════
      🏗️ ARQUITETURA DE SEÇÕES ÉPICAS
      ═══════════════════════════════════════════════════════════════════════════════════════════════════════════

      **1. 🔝 HEADER MAGNÉTICO**:
      - Logo premium com animação sutil
      - Navegação sticky com backdrop-blur
      - Menu hamburger com animação fluida
      - CTA no header com urgência
      - Progress bar de scroll (opcional)
      - Tema switcher (dark/light)

      **2. 🚀 HERO SECTION DEVASTADORA**:
      - Headline que para o tráfego (power words + números)
      - Subheadline com benefício claro
      - Triplo CTA (primário + secundário + ghost)
      - Hero visual de impacto (video/imagem/animação)
      - Prova social imediata (logos, números, reviews)
      - Scroll indicator animado
      - Floating elements decorativos
      - Gradiente de fundo dinâmico

      **3. 💎 SEÇÃO DE VALOR ÚNICO**:
      - Estatísticas impressionantes
      - Animações on-scroll
      - Cards com hover effects

      **4. 🎯 RECURSOS/FUNCIONALIDADES PREMIUM**:
      - Grid responsivo de features
      - Cada feature com ícone SVG único
      - Microcopy persuasivo
      - Hover effects elaborados
      - Modal ou expandir para detalhes
      - Animações escalonadas

**5. 📊 PROVA SOCIAL IRRESISTÍVEL**:
      - Testimonials com fotos reais
      - Ratings e reviews destacados
      - Logos de clientes/parceiros
      - Números de usuários/vendas
      - Carousel de depoimentos
      - Trust badges e certificações

      **6. 💰 PRICING PERSUASIVO** (se includePrecing=true):
      - 3 planos com destaque no recomendado
      - Preços psicológicos ($97 vs $100)
      - Lista de features por plano
      - Garantia de satisfação
      - Urgência (oferta limitada)
      - FAQ de preços

      **7. ❓ FAQ ESTRATÉGICO** (se includeFAQ=true):
      - 6-10 perguntas mais comuns
      - Accordion com animações
      - Respostas que vendem
      - Links para suporte
      - Busca por pergunta

      **8. 📞 CTA FINAL DEMOLIDOR**:
      - Headline de urgência
      - Benefício principal repetido
      - Múltiplas opções de contato
      - Formulário simplificado
      - Prova social final
      - Garantias e seguranças

      **9. 🦶 FOOTER COMPLETO**:
      - Links organizados por categoria
      - Informações de contato completas
      - Redes sociais com hover effects
      - Newsletter signup
      - Copyright e políticas
      - Botão back-to-top

      ═══════════════════════════════════════════════════════════════════════════════════════════════════════════
      💡 ELEMENTOS INTERATIVOS AVANÇADOS
      ═══════════════════════════════════════════════════════════════════════════════════════════════════════════

      ✅ **JAVASCRIPT VANILLA PREMIUM**:
      - Smooth scrolling entre seções
      - Intersection Observer para animações
      - Modal system para videos/imagens
      - Form validation em tempo real
      - Progress bar dinâmico
      - Parallax scrolling effects
      - Theme switcher funcional
      - Mobile menu com overlay
      - Lazy loading de imagens
      - Analytics events tracking

      ✅ **MICROINTERAÇÕES ÉPICAS**:
      - Buttons com ripple effect
      - Cards que levitam no hover
      - Text reveal animations
      - Counter animations para estatísticas
      - Progress bars animadas
      - Typing effect para headlines
      - Stagger animations para listas

      ═══════════════════════════════════════════════════════════════════════════════════════════════════════════
      🎯 CONFIGURAÇÕES ESPECÍFICAS DA SOLICITAÇÃO
      ═══════════════════════════════════════════════════════════════════════════════════════════════════════════

      **OPÇÕES RECEBIDAS:**
      - Style: ${options.style || 'modern'}
      - Color Scheme: ${options.colorScheme || 'dark'}  
      - Industry: ${options.industry || 'tecnologia'}
      - Target Audience: ${options.targetAudience || 'empresários e empreendedores'}
      - Primary CTA: ${options.primaryCTA || 'Começar Agora'}
      - Secondary CTA: ${options.secondaryCTA || 'Saber Mais'}
      - Include Testimonials: ${options.includeTestimonials ? 'SIM' : 'NÃO'}
      - Include Pricing: ${options.includePricing ? 'SIM' : 'NÃO'}
      - Include Stats: ${options.includeStats ? 'SIM' : 'NÃO'}
      - Include FAQ: ${options.includeFAQ ? 'SIM' : 'NÃO'}
      - Include Video: ${options.includeVideo ? 'SIM' : 'NÃO'}
      - Include Newsletter: ${options.includeNewsletter ? 'SIM' : 'NÃO'}
      - Include Features: ${options.includeFeatures ? 'SIM' : 'NÃO'}
      - Animations Level: ${options.animationsLevel || 'moderate'}
      - Layout: ${options.layout || 'single-page'}
      - Brand Personality: ${options.brandPersonality || 'professional'}

      ═══════════════════════════════════════════════════════════════════════════════════════════════════════════
      🚨 INSTRUÇÕES FINAIS CRÍTICAS
      ═══════════════════════════════════════════════════════════════════════════════════════════════════════════

      1. **CÓDIGO 100% FUNCIONAL**: Sem placeholders, sem TODOs, sem comentários de desenvolvimento
      2. **PERFORMANCE EXTREMA**: Código otimizado, imagens compressed, lazy loading
      3. **SEO DEMOLIDOR**: Meta tags completas, structured data, sitemap ready
      4. **CONVERSÃO GARANTIDA**: Cada elemento deve empurrar para a conversão
      5. **VISUAL IMPACTANTE**: Deve causar "WOW effect" em 3 segundos
      6. **MOBILE PERFEITO**: Touch-friendly, thumb navigation, swipe gestures
      7. **ACESSIBILIDADE A11Y**: ARIA labels, contrast ratios, keyboard navigation
      8. **LOADING ULTRA-RÁPIDO**: Critical CSS inline, async loading, prefetch

      **ENTREGA IMEDIATA:**
      - Comece AGORA com <!DOCTYPE html>
      - HTML completamente funcional em arquivo único
      - Todas as seções implementadas conforme opções
      - JavaScript vanilla para todas as interações
      - CSS/Tailwind para visual premium
      - Termine com </html>

      **LEMBRE-SE**: Esta landing page deve ser uma OBRA PRIMA que converte visitantes em clientes fanáticos pela marca. Cada pixel, cada palavra, cada animação deve servir ao objetivo de CONVERTER e IMPRESSIONAR.

      🔥 CRIE A MELHOR LANDING PAGE QUE VOCÊ JÁ FEZ NA SUA VIDA! 🔥
    `;
  }
    `;
  }

  public async createAdvancedLandingPage(
    prompt: string,
    options: LandingPageOptions = {},
    reference ? : string
  ): Promise < string > {
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

    const systemPrompt = this.getAdvancedSystemPrompt(options);

    const userPrompt = `
      BRIEFING DO CLIENTE:
      ${prompt}
      
      CONFIGURAÇÕES ESPECÍFICAS:
      - Estilo: ${options.style || 'modern'}
      - Esquema de Cores: ${options.colorScheme || 'dark'}
      - Indústria: ${options.industry || 'Não especificada'}
      - Público-alvo: ${options.targetAudience || 'Público geral'}
      - CTA Primário: ${options.primaryCTA || 'Começar Agora'}
      - CTA Secundário: ${options.secondaryCTA || 'Saber Mais'}
      - Incluir Depoimentos: ${options.includeTestimonials !== false ? 'Sim' : 'Não'}
      - Incluir Preços: ${options.includePricing ? 'Sim' : 'Não'}
      - Incluir Estatísticas: ${options.includeStats !== false ? 'Sim' : 'Não'}
      - Incluir FAQ: ${options.includeFAQ !== false ? 'Sim' : 'Não'}
      - Nível de Animações: ${options.animationsLevel || 'moderate'}
      
      ${reference ? `
      REFERÊNCIA VISUAL (use como inspiração para estrutura e design, mas o conteúdo deve ser baseado no briefing acima):
      ${reference}
      ` : ''}

      EXECUTE AGORA: Crie a landing page mais impressionante e eficaz possível!
    `;

    try {
      const result = await model.generateContent([systemPrompt, userPrompt]);
      const response = result.response;
      let htmlContent = response.text();

      // Limpa o HTML para garantir que está no formato correto
      const htmlMatch = htmlContent.match(/<!DOCTYPE html>.*<\/html>/is);
      if (htmlMatch) {
        htmlContent = htmlMatch[0];
      } else {
        // Remove possíveis markdown blocks se existirem
        htmlContent = htmlContent
          .replace(/```html\n?/g, '')
          .replace(/```/g, '')
          .trim();

        // Se não começar com DOCTYPE, adiciona estrutura básica
        if (!htmlContent.startsWith('<!DOCTYPE html>')) {
          htmlContent = `<!DOCTYPE html>\n${htmlContent}`;
        }
      }

      return htmlContent;
    } catch (error: any) {
      console.error('[GeminiService] Erro ao chamar a API do Gemini:', error);
      throw new Error(`Falha ao gerar landing page: ${error.message}`);
    }
  }

  // Método de compatibilidade com a versão anterior
  public async createLandingPageFromPrompt(
    prompt: string,
    reference ? : string
  ): Promise < string > {
    return this.createAdvancedLandingPage(prompt, {
      style: 'modern',
      colorScheme: 'dark',
      animationsLevel: 'moderate'
    }, reference);
  }

  // Método para gerar múltiplas variações
  public async generateVariations(
    prompt: string,
    count: number = 3,
    baseOptions: LandingPageOptions = {}
  ): Promise < string[] > {
    const variations: string[] = [];
    const styles: Array < LandingPageOptions['style'] > = ['modern', 'minimal', 'bold', 'elegant', 'tech'];
    const colorSchemes: Array < LandingPageOptions['colorScheme'] > = ['dark', 'gradient', 'neon', 'ocean'];

    for (let i = 0; i < count; i++) {
      const options: LandingPageOptions = {
        ...baseOptions,
        style: styles[i % styles.length],
        colorScheme: colorSchemes[i % colorSchemes.length],
        animationsLevel: i === 0 ? 'dynamic' : i === 1 ? 'moderate' : 'subtle'
      };

      try {
        const variation = await this.createAdvancedLandingPage(prompt, options);
        variations.push(variation);
      } catch (error) {
        console.error(`Erro ao gerar variação ${i + 1}:`, error);
      }
    }

    return variations;
  }

  // Método para otimizar landing page existente
  public async optimizeLandingPage(
    currentHtml: string,
    optimizationGoals: string[] = ['conversion', 'performance', 'accessibility']
  ): Promise < string > {
    if (!this.genAI) {
      throw new Error('A API Key do Gemini não está configurada no servidor.');
    }

    const model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest"
    });

    const optimizationPrompt = `
      Você é um especialista em OTIMIZAÇÃO DE CONVERSÃO e PERFORMANCE WEB.
      
      Analise a landing page fornecida e aplique as seguintes otimizações:
      ${optimizationGoals.map(goal => `- ${goal.toUpperCase()}`).join('\n')}
      
      LANDING PAGE ATUAL:
      ${currentHtml}
      
      OTIMIZAÇÕES OBRIGATÓRIAS:
      1. Melhore os CTAs para aumentar conversão
      2. Otimize a hierarquia visual
      3. Adicione elementos de urgência e escassez
      4. Melhore a prova social
      5. Otimize para mobile
      6. Adicione microinterações
      7. Melhore o SEO on-page
      8. Otimize a velocidade de carregamento
      
      Retorne APENAS o HTML otimizado, sem explicações.
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
}

export const geminiService = new GeminiService(GEMINI_API_KEY);

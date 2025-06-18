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
      - Value proposition em destaque
      - 3-6 benefícios principais com ícones SVG
      - Comparação visual (antes/depois)
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

      **5. 📊 PROVA SOCIAL PODEROSA**:
      - Testimonials com fotos reais (placeholders de alta qualidade)
      - Rating system com estrelas animadas
      - Logos de clientes/parceiros em carrossel
      - Números de impacto com counter animations
      - Reviews em cards com glassmorphism
      - Trust badges e certificações

      **6. 💰 SEÇÃO DE PREÇOS IRRESISTÍVEL**:
      - Cards de pricing com destaque 3D
      - Comparação de planos visual
      - Badge "Mais Popular" animado
      - Calculator de ROI interativo
      - Garantias com ícones de segurança
      - Urgência com countdown timer

      **7. ❓ FAQ ESTRATÉGICO INTELIGENTE**:
      - Accordion com animações suaves
      - Perguntas que eliminam objeções
      - Respostas que reforçam benefícios
      - Search dentro do FAQ
      - Categorização por tópicos

      **8. 🔥 CTA FINAL APOCALÍPTICO**:
      - Urgência e escassez visual
      - Benefício final destacado
      - Múltiplas opções de conversão
      - Garantias de segurança
      - Risk reversal statements
      - Elementos pulsantes/brilhantes

      **9. 🌐 FOOTER COMPLETO E FUNCIONAL**:
      - Links organizados por categorias
      - Redes sociais com ícones SVG animados
      - Newsletter signup com incentivo
      - Mapa do site
      - Informações legais completas
      - Contato com múltiplos canais

      ═══════════════════════════════════════════════════════════════════════════════════════════════════════════
      ⚡ ANIMAÇÕES E MICROINTERAÇÕES ULTRA-AVANÇADAS
      ═══════════════════════════════════════════════════════════════════════════════════════════════════════════

      ✅ **NÍVEL DE ANIMAÇÃO: ${options.animationsLevel || 'dynamic'}**

      **Animações CSS Ultra-Personalizadas**:
      - Intersection Observer para scroll animations
      - Stagger animations para elementos em grupo
      - Hover effects com transforms 3D
      - Loading states com skeleton screens
      - Parallax scrolling com performance otimizada
      - Morphing shapes e elementos
      - Particle systems com CSS puro
      - Gradient animations dinâmicos

      **Microinterações Obrigatórias**:
      - Botões com ripple effect
      - Cards com tilt effect no hover
      - Form inputs com floating labels
      - Progress indicators animados
      - Menu transitions cinematográficas
      - Scroll progress indicator
      - Image zoom on hover
      - Icon morphing animations

      ═══════════════════════════════════════════════════════════════════════════════════════════════════════════
      📈 OTIMIZAÇÃO PARA CONVERSÃO EXTREMA
      ═══════════════════════════════════════════════════════════════════════════════════════════════════════════

      ✅ **TÉCNICAS DE NEUROMARKETING AVANÇADAS**:
      - Cores que geram ação (vermelho/laranja para CTAs)
      - Psicologia das cores por seção
      - Escassez e urgência visuais
      - Prova social abundante e variada  
      - Hierarquia visual clara (padrão Z/F)
      - Anchoring com preços
      - Loss aversion elements
      - Social proof diversity

      ✅ **COPYWRITING PERSUASIVO EXTREMO**:
      - Headlines com fórmulas comprovadas (AIDA, PAS, etc.)
      - Power words estratégicos
      - Benefícios focados no resultado final
      - Linguagem emocional + lógica
      - CTAs com urgência específica
      - Storytelling micro-narratives
      - Numbers e statistics
      - Risk reversal statements

      ✅ **UX PATTERNS COMPROVADOS**:
      - Above the fold otimizado para conversão
      - Formulários progressivos
      - Trust signals estratégicos
      - Mobile-first conversion flow
      - Exit-intent elements
      - Progressive disclosure
      - Cognitive load reduction
      - Decision fatigue elimination

      ═══════════════════════════════════════════════════════════════════════════════════════════════════════════
      🛡️ PERFORMANCE E ACESSIBILIDADE EXTREMAS
      ═══════════════════════════════════════════════════════════════════════════════════════════════════════════

      **Performance Ultra-Otimizada**:
      - Critical CSS inline
      - Lazy loading inteligente
      - Image optimization automática
      - Font display: swap
      - Resource hints (preload, prefetch)
      - Minificação agressiva
      - Compression otimizada
      - Core Web Vitals perfeitos

      **Acessibilidade WCAG AAA**:
      - Contraste superior a 7:1
      - Alt texts descritivos e contextuais  
      - Navegação por teclado completa
      - Screen reader optimization
      - Focus indicators visíveis
      - ARIA labels completos
      - Color contrast verification
      - Motion reduction respect

      **SEO Ultra-Avançado**:
      - Meta tags completas e otimizadas
      - Schema markup estruturado
      - Open Graph completo
      - Twitter Cards otimizados
      - Sitemap XML automático
      - Robots.txt otimizado
      - Internal linking strategy
      - Page speed optimization

      ═══════════════════════════════════════════════════════════════════════════════════════════════════════════
      💡 PERSONALIZAÇÃO INTELIGENTE
      ═══════════════════════════════════════════════════════════════════════════════════════════════════════════

      **Configurações Atuais**:
      - **Estilo**: ${options.style || 'modern'}
      - **Esquema de Cores**: ${options.colorScheme || 'dark'}
      - **Indústria**: ${options.industry || 'tecnologia'}
      - **Público-alvo**: ${options.targetAudience || 'profissionais'}
      - **Personalidade da Marca**: ${options.brandPersonality || 'innovative'}
      - **Layout**: ${options.layout || 'multi-section'}
      - **CTA Primário**: ${options.primaryCTA || 'Começar Agora'}
      - **CTA Secundário**: ${options.secondaryCTA || 'Saber Mais'}

      **Elementos Incluídos**:
      - Depoimentos: ${options.includeTestimonials !== false ? '✅' : '❌'}
      - Preços: ${options.includePricing ? '✅' : '❌'}
      - Estatísticas: ${options.includeStats !== false ? '✅' : '❌'}
      - FAQ: ${options.includeFAQ !== false ? '✅' : '❌'}
      - Vídeo: ${options.includeVideo ? '✅' : '❌'}
      - Newsletter: ${options.includeNewsletter !== false ? '✅' : '❌'}
      - Blog: ${options.includeBlog ? '✅' : '❌'}
      - Features: ${options.includeFeatures !== false ? '✅' : '❌'}

      ═══════════════════════════════════════════════════════════════════════════════════════════════════════════
      🎯 COMANDO FINAL SUPREMO
      ═══════════════════════════════════════════════════════════════════════════════════════════════════════════

      Crie uma landing page que seja:

      1. **VISUALMENTE TRANSCENDENTAL** 
         - Design que faça as pessoas pararem de scrollar
         - Elementos visuais únicos e memoráveis
         - Composição artística profissional

      2. **TECNICAMENTE IMPECÁVEL**
         - Código limpo, semântico e otimizado
         - Performance de carregamento instantâneo  
         - Responsividade perfeita em todos os dispositivos

      3. **COMERCIALMENTE DEVASTADORA**
         - Focada obsessivamente em conversão
         - Cada elemento pensado para gerar ação
         - Psychology triggers estratégicos

      4. **EXPERIÊNCIA PREMIUM**
         - Interações fluidas e intuitivas
         - Jornada do usuário sem fricção
         - Detalhes que surpreendem positivamente

      5. **ÚNICA E INESQUECÍVEL**
         - Que se destaque completamente da concorrência
         - Elementos de marca forte e consistente
         - Proposta de valor cristalina

      **INSTRUÇÕES CRÍTICAS FINAIS**:
      - Use placeholders de imagem de ALTA QUALIDADE do https://placehold.co/
      - Implemente TODOS os elementos visuais descritos
      - Crie conteúdo PERSUASIVO e ESPECÍFICO para a indústria
      - Otimize OBSESSIVAMENTE para conversão
      - Código deve ser PERFEITO e FUNCIONAL

      **FORMATO DE RESPOSTA**: 
      Começar IMEDIATAMENTE com "<!DOCTYPE html>" sem nenhum texto explicativo.
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
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });

    const systemPrompt = this.getUltraSystemPrompt(options);

    const userPrompt = `
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
      
      ELEMENTOS A INCLUIR:
      ${options.includeTestimonials !== false ? '✅ Seção de Depoimentos com fotos e ratings' : ''}
      ${options.includePricing ? '✅ Seção de Preços com comparação de planos' : ''}
      ${options.includeStats !== false ? '✅ Estatísticas impressionantes com counter animations' : ''}
      ${options.includeFAQ !== false ? '✅ FAQ estratégico com accordion' : ''}
      ${options.includeVideo ? '✅ Seção de vídeo explicativo' : ''}
      ${options.includeNewsletter !== false ? '✅ Newsletter signup com incentivo' : ''}
      ${options.includeBlog ? '✅ Seção de blog/conteúdo' : ''}
      ${options.includeFeatures !== false ? '✅ Grid de recursos/funcionalidades' : ''}
      
      ${reference ? `
      REFERÊNCIA VISUAL (inspiração para estrutura e design - adapte o conteúdo ao briefing):
      ${reference}
      ` : ''}

      EXECUTE AGORA: Crie a landing page mais IMPRESSIONANTE, FUNCIONAL e CONVERSORA possível!
      
      LEMBRETE CRÍTICO: Resposta deve começar IMEDIATAMENTE com "<!DOCTYPE html>" - ZERO texto adicional!
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
          htmlContent = `<!DOCTYPE html>\n${htmlContent}`;
        }
      }

      htmlContent = this.optimizeHtmlContent(htmlContent, options);

      return htmlContent;
    } catch (error: any) {
      console.error('[GeminiService] Erro ao chamar a API do Gemini:', error);
      throw new Error(`Falha ao gerar landing page ultra-premium: ${error.message}`);
    }
  }

  private optimizeHtmlContent(html: string, options: LandingPageOptions): string {
    let optimizedHtml = html;

    if (!optimizedHtml.includes('preconnect')) {
      optimizedHtml = optimizedHtml.replace(
        '<head>',
        `<head>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link rel="dns-prefetch" href="https://placehold.co">`
      );
    }

    optimizedHtml = optimizedHtml.replace(
      /placehold\.co\/(\d+)x(\d+)/g,
      'placehold.co/$1x$2/0066CC/FFFFFF/png?text=Premium+Image'
    );

    return optimizedHtml;
  }

  public async createAdvancedLandingPage(
    prompt: string,
    options: LandingPageOptions = {},
    reference?: string
  ): Promise<string> {
    return this.createUltraLandingPage(prompt, options, reference);
  }

  public async createLandingPageFromPrompt(
    prompt: string,
    reference?: string
  ): Promise<string> {
    return this.createUltraLandingPage(prompt, {
      style: 'modern',
      colorScheme: 'dark',
      animationsLevel: 'dynamic'
    }, reference);
  }

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
        const variation = await this.createUltraLandingPage(prompt, options);
        variations.push(variation);
        
        if (i < count - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
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

    const model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest"
    });

    const optimizationPrompt = `
      Você é um ULTRA-ESPECIALISTA em OTIMIZAÇÃO DE CONVERSÃO, PERFORMANCE WEB e UX/UI.
      
      Analise profundamente a landing page fornecida e aplique as otimizações mais avançadas:
      
      OBJETIVOS DE OTIMIZAÇÃO:
      ${optimizationGoals.map(goal => `🎯 ${goal.toUpperCase()}`).join('\n')}
      
      LANDING PAGE ATUAL:
      ${currentHtml}
      
      OTIMIZAÇÕES OBRIGATÓRIAS ULTRA-AVANÇADAS:
      
      🚀 CONVERSÃO:
      - Melhore todos os CTAs com urgência e especificidade
      - Adicione elementos de escassez visual
      - Otimize a hierarquia visual para o padrão F/Z
      - Implemente social proof mais convincente
      - Adicione risk reversal statements
      - Melhore as headlines com power words
      - Adicione trust signals estratégicos
      
      ⚡ PERFORMANCE:
      - Otimize Critical CSS inline
      - Implemente lazy loading inteligente
      - Adicione resource hints apropriados
      - Otimize imagens com placeholders melhores
      - Minimize JavaScript e CSS
      - Implemente font-display: swap
      
      ♿ ACESSIBILIDADE:
      - Melhore contraste de cores (WCAG AAA)
      - Adicione ARIA labels completos
      - Implemente navegação por teclado perfeita
      - Melhore alt texts das imagens
      - Adicione skip links
      - Otimize para screen readers
      
      🔍 SEO:
      - Otimize meta tags para cliques
      - Adicione schema markup estruturado
      - Melhore internal linking
      - Otimize URLs e anchors
      - Adicione breadcrumbs se aplicável
      - Melhore semântica HTML5
      
      🎨 UX/UI:
      - Melhore microinterações
      - Otimize formulários para conversão
      - Adicione estados de loading elegantes
      - Melhore responsive design
      - Otimize touch targets para mobile
      - Adicione feedback visual instantâneo
      
      RESULTADO: Retorne APENAS o HTML otimizado completo, sem explicações.
      Início obrigatório: "<!DOCTYPE html>"
    `;
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

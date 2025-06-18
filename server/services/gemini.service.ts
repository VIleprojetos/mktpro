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

  private getAdvancedAnimations(level: string): string {
    const animations = {
      none: '',
      subtle: `
        animation: {
          'fade-in': 'fadeIn 0.6s ease-out',
          'slide-up': 'slideUp 0.6s ease-out',
        },
        keyframes: {
          fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
          slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        }
      `,
      moderate: `
        animation: {
          'fade-in-up': 'fadeInUp 0.6s ease-out',
          'fade-in-down': 'fadeInDown 0.6s ease-out',
          'slide-in-left': 'slideInLeft 0.8s ease-out',
          'slide-in-right': 'slideInRight 0.8s ease-out',
          'bounce-gentle': 'bounceGentle 2s infinite',
          'pulse-slow': 'pulse 3s infinite',
          'float': 'float 3s ease-in-out infinite',
        },
        keyframes: {
          fadeInUp: { '0%': { opacity: '0', transform: 'translateY(30px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
          fadeInDown: { '0%': { opacity: '0', transform: 'translateY(-30px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
          slideInLeft: { '0%': { opacity: '0', transform: 'translateX(-30px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
          slideInRight: { '0%': { opacity: '0', transform: 'translateX(30px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
          bounceGentle: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-5px)' } },
          float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
        }
      `,
      dynamic: `
        animation: {
          'fade-in-up': 'fadeInUp 0.6s ease-out',
          'fade-in-down': 'fadeInDown 0.6s ease-out',
          'slide-in-left': 'slideInLeft 0.8s ease-out',
          'slide-in-right': 'slideInRight 0.8s ease-out',
          'bounce-gentle': 'bounceGentle 2s infinite',
          'pulse-slow': 'pulse 3s infinite',
          'float': 'float 3s ease-in-out infinite',
          'glow': 'glow 2s ease-in-out infinite alternate',
          'rotate-slow': 'rotateSlow 10s linear infinite',
          'scale-pulse': 'scalePulse 2s ease-in-out infinite',
          'wiggle': 'wiggle 1s ease-in-out infinite',
          'gradient-shift': 'gradientShift 3s ease-in-out infinite',
        },
        keyframes: {
          fadeInUp: { '0%': { opacity: '0', transform: 'translateY(30px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
          fadeInDown: { '0%': { opacity: '0', transform: 'translateY(-30px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
          slideInLeft: { '0%': { opacity: '0', transform: 'translateX(-30px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
          slideInRight: { '0%': { opacity: '0', transform: 'translateX(30px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
          bounceGentle: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-5px)' } },
          float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
          glow: { '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' }, '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' } },
          rotateSlow: { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
          scalePulse: { '0%, 100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.05)' } },
          wiggle: { '0%, 100%': { transform: 'rotate(-3deg)' }, '50%': { transform: 'rotate(3deg)' } },
          gradientShift: { '0%, 100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        }
      `,
      extreme: `
        animation: {
          'fade-in-up': 'fadeInUp 0.6s ease-out',
          'fade-in-down': 'fadeInDown 0.6s ease-out',
          'slide-in-left': 'slideInLeft 0.8s ease-out',
          'slide-in-right': 'slideInRight 0.8s ease-out',
          'bounce-gentle': 'bounceGentle 2s infinite',
          'pulse-slow': 'pulse 3s infinite',
          'float': 'float 3s ease-in-out infinite',
          'glow': 'glow 2s ease-in-out infinite alternate',
          'rotate-slow': 'rotateSlow 10s linear infinite',
          'scale-pulse': 'scalePulse 2s ease-in-out infinite',
          'wiggle': 'wiggle 1s ease-in-out infinite',
          'gradient-shift': 'gradientShift 3s ease-in-out infinite',
          'matrix-rain': 'matrixRain 2s linear infinite',
          'neon-flicker': 'neonFlicker 1.5s ease-in-out infinite alternate',
          'hologram': 'hologram 2s ease-in-out infinite',
          'glitch': 'glitch 2s infinite',
          'typewriter': 'typewriter 3s steps(40, end)',
          'particle-float': 'particleFloat 4s ease-in-out infinite',
        },
        keyframes: {
          fadeInUp: { '0%': { opacity: '0', transform: 'translateY(30px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
          fadeInDown: { '0%': { opacity: '0', transform: 'translateY(-30px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
          slideInLeft: { '0%': { opacity: '0', transform: 'translateX(-30px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
          slideInRight: { '0%': { opacity: '0', transform: 'translateX(30px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
          bounceGentle: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-5px)' } },
          float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
          glow: { '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' }, '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' } },
          rotateSlow: { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
          scalePulse: { '0%, 100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.05)' } },
          wiggle: { '0%, 100%': { transform: 'rotate(-3deg)' }, '50%': { transform: 'rotate(3deg)' } },
          gradientShift: { '0%, 100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
          matrixRain: { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100vh)' } },
          neonFlicker: { '0%, 100%': { textShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor' }, '50%': { textShadow: '0 0 2px currentColor, 0 0 5px currentColor, 0 0 8px currentColor' } },
          hologram: { '0%, 100%': { opacity: '1', transform: 'translateY(0)' }, '50%': { opacity: '0.7', transform: 'translateY(-2px)' } },
          glitch: { '0%, 100%': { transform: 'translate(0)' }, '20%': { transform: 'translate(-2px, 2px)' }, '40%': { transform: 'translate(-2px, -2px)' }, '60%': { transform: 'translate(2px, 2px)' }, '80%': { transform: 'translate(2px, -2px)' } },
          typewriter: { '0%': { width: '0' }, '100%': { width: '100%' } },
          particleFloat: { '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' }, '33%': { transform: 'translateY(-30px) rotate(120deg)' }, '66%': { transform: 'translateY(30px) rotate(240deg)' } },
        }
      `
    };
    return animations[level as keyof typeof animations] || animations.moderate;
  }

  private getUltraSystemPrompt(options: LandingPageOptions): string {
    const colors = this.getAdvancedColorScheme(options.colorScheme || 'dark');
    const animations = this.getAdvancedAnimations(options.animationsLevel || 'moderate');

    return `
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
    } catch (error: any)

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

interface ConversionAnalysis {
  score: number;
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
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

  public async generateLandingPage(options: LandingPageOptions): Promise<string> {
    if (!this.genAI) {
      throw new Error('A API Key do Gemini não está configurada no servidor.');
    }

    const model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest",
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    const prompt = this.getUltraSystemPrompt(options);

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('[GeminiService] Erro ao gerar landing page:', error);
      throw new Error(`Falha ao gerar landing page: ${error.message}`);
    }
  }

  public async analyzeLandingPageConversion(htmlContent: string): Promise<ConversionAnalysis> {
    if (!this.genAI) {
      throw new Error('A API Key do Gemini não está configurada no servidor.');
    }

    const model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest"
    });

    const analysisPrompt = `
      Analise esta landing page HTML e forneça uma análise detalhada de conversão:

      ${htmlContent}

      Forneça sua análise no seguinte formato JSON:
      {
        "score": [número de 0-100],
        "recommendations": ["recomendação 1", "recomendação 2", ...],
        "strengths": ["força 1", "força 2", ...],
        "weaknesses": ["fraqueza 1", "fraqueza 2", ...]
      }

      Considere os seguintes aspectos:
      - Clareza da proposta de valor
      - Força dos headlines
      - Qualidade dos CTAs
      - Prova social e credibilidade
      - Design e experiência do usuário
      - Responsividade mobile
      - Velocidade de carregamento potencial
      - SEO e estrutura
      - Psicologia de conversão
      - Redução de fricção no processo
    `;

    try {
      const result = await model.generateContent(analysisPrompt);
      const response = await result.response;
      const analysisText = response.text();
      
      // Parse JSON response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Não foi possível extrair a análise JSON');
      }
    } catch (error: any) {
      console.error('[GeminiService] Erro ao analisar conversão:', error);
      throw new Error(`Falha ao analisar conversão: ${error.message}`);
    }
  }

  public async optimizeLandingPageCopy(originalCopy: string, targetAudience: string, industry: string): Promise<string> {
    if (!this.genAI) {
      throw new Error('A API Key do Gemini não está configurada no servidor.');
    }

    const model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest"
    });

    const optimizationPrompt = `
      Você é um COPYWRITER ESPECIALISTA EM CONVERSÃO com 15+ anos de experiência em landing pages que convertem.

      TAREFA: Otimize o copy abaixo para maximizar conversões.

      COPY ORIGINAL:
      ${originalCopy}

      PÚBLICO-ALVO: ${targetAudience}
      INDÚSTRIA: ${industry}

      DIRETRIZES DE OTIMIZAÇÃO:
      1. Use poder de persuasão psicológica (escassez, autoridade, prova social)
      2. Headlines que param o scroll (números, benefícios, urgência)
      3. Subheadlines que explicam o "como" e "por que"
      4. CTAs com verbos de ação e benefício claro
      5. Microcopy que remove objeções
      6. Tom de voz apropriado para o público
      7. Storytelling quando apropriado
      8. Benefícios > Features
      9. Linguagem emocional + lógica
      10. Teste A/B ready (variações)

      RETORNE o copy otimizado mantendo a estrutura original mas melhorando cada elemento para conversão máxima.
    `;

    try {
      const result = await model.generateContent(optimizationPrompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('[GeminiService] Erro ao otimizar copy:', error);
      throw new Error(`Falha ao otimizar copy: ${error.message}`);
    }
  }

  public async generateABTestVariations(originalPage: string, elementToTest: string): Promise<string[]> {
    if (!this.genAI) {
      throw new Error('A API Key do Gemini não está configurada no servidor.');
    }

    const model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest"
    });

    const variationPrompt = `
      Você é um especialista em TESTES A/B e OTIMIZAÇÃO DE CONVERSÃO.

      TAREFA: Crie 3 variações diferentes do elemento especificado para teste A/B.

      PÁGINA ORIGINAL:
      ${originalPage}

      ELEMENTO PARA TESTAR: ${elementToTest}

      CRITÉRIOS PARA VARIAÇÕES:
      1. Variação A: Abordagem mais direta e objetiva
      2. Variação B: Abordagem mais emocional e storytelling
      3. Variação C: Abordagem mais técnica e com dados

      Cada variação deve:
      - Manter o mesmo contexto e função
      - Testar hipóteses diferentes de conversão
      - Ser significativamente diferente das outras
      - Manter alta qualidade e profissionalismo

      RETORNE as 3 variações em formato JSON:
      {
        "variations": [
          {"name": "Variação A - Direta", "content": "..."},
          {"name": "Variação B - Emocional", "content": "..."},
          {"name": "Variação C - Técnica", "content": "..."}
        ]
      }
    `;

    try {
      const result = await model.generateContent(variationPrompt);
      const response = await result.response;
      const responseText = response.text();
      
      // Parse JSON response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.variations.map((v: any) => v.content);
      } else {
        throw new Error('Não foi possível extrair as variações JSON');
      }
    } catch (error: any) {
      console.error('[GeminiService] Erro ao gerar variações A/B:', error);
      throw new Error(`Falha ao gerar variações A/B: ${error.message}`);
    }
  }

  public async generateSEOOptimizedContent(industry: string, targetKeywords: string[], contentType: 'meta' | 'headers' | 'body'): Promise<any> {
    if (!this.genAI) {
      throw new Error('A API Key do Gemini não está configurada no servidor.');
    }

    const model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest"
    });

    const seoPrompt = `
      Você é um especialista em SEO e CONTENT MARKETING com expertise em ranking no Google.

      TAREFA: Gerar conteúdo SEO-otimizado para landing page.

      INDÚSTRIA: ${industry}
      PALAVRAS-CHAVE TARGET: ${targetKeywords.join(', ')}
      TIPO DE CONTEÚDO: ${contentType}

      ${contentType === 'meta' ? `
        GERE:
        - Title tag (50-60 caracteres)
        - Meta description (150-160 caracteres)
        - Keywords meta tag
        - Open Graph tags
        - Schema markup JSON-LD
      ` : contentType === 'headers' ? `
        GERE:
        - H1 principal (1x)
        - H2 para seções (3-5x)
        - H3 para subseções (5-8x)
        - Todos otimizados com keywords naturalmente
      ` : `
        GERE:
        - Parágrafos otimizados para SEO
        - Densidade de keywords natural (1-2%)
        - LSI keywords integradas
        - Call-to-actions com keywords
        - Alt texts para imagens
      `}

      DIRETRIZES SEO:
      1. Keywords naturalmente integradas
      2. Intent matching (comercial/informacional)
      3. Featured snippet optimization
      4. Semantic search optimization
      5. E-A-T signals (Expertise, Authority, Trust)
      6. User experience signals
      7. Core Web Vitals friendly
      8. Mobile-first indexing ready

      RETORNE em formato JSON estruturado para fácil implementação.
    `;

    try {
      const result = await model.generateContent(seoPrompt);
      const response = await result.response;
      const responseText = response.text();
      
      // Parse JSON response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        // Fallback to text response if JSON parsing fails
        return { content: responseText };
      }
    } catch (error: any) {
      console.error('[GeminiService] Erro ao gerar conteúdo SEO:', error);
      throw new Error(`Falha ao gerar conteúdo SEO: ${error.message}`);
    }
  }
}

// Export do serviço
const geminiService = new GeminiService(GEMINI_API_KEY);
export default geminiService;

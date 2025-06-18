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

  private getAdvancedColorScheme(scheme: string): ColorPalette {
    const schemes: Record < string, ColorPalette > = {
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
      🏗️ ARQUITETURA DE SEÇÕES ÉPICAS (Mínimo de 6 seções OBRIGATÓRIAS)
      ═══════════════════════════════════════════════════════════════════════════════════════════════════════════

      **1. 🚀 HERO SECTION DEVASTADORA**: Headline, subheadline, CTAs, prova social, visual de impacto.
      **2. 💎 FEATURES/BENEFÍCIOS**: Grid de recursos com ícones, microcopy persuasivo.
      **3. 📊 PROVA SOCIAL PODEROSA**: Testimonials com fotos, ratings, logos de clientes.
      **4. 💰 OFERTA/PREÇOS IRRESISTÍVEL**: Cards de pricing, comparação, garantias, urgência.
      **5. ❓ FAQ ESTRATÉGICO**: Accordion para quebrar objeções.
      **6. 🔥 CTA FINAL APOCALÍPTICO**: Urgência, benefício final, risk reversal.
      **7. OUTRAS SEÇÕES (se aplicável)**: Vídeo, Newsletter, Blog, etc.
      
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
      2. **TECNICAMENTE IMPECÁVEL**
      3. **COMERCIALMENTE DEVASTADORA**
      4. **EXPERIÊNCIA PREMIUM**
      5. **ÚNICA E INESQUECÍVEL**

      **INSTRUÇÕES CRÍTICAS FINAIS**:
      - **MÍNIMO DE 6 SEÇÕES OBRIGATÓRIAS**: A página DEVE conter pelo menos 6 seções distintas e bem definidas, seguindo a estrutura clássica de uma landing page de alta conversão para lançamentos digitais (Ex: Herói, Features/Benefícios, Prova Social, Preços/Oferta, FAQ, CTA Final). Se o usuário pedir para não incluir uma dessas, substitua por outra relevante.
      - Use placeholders de imagem de ALTA QUALIDADE do https://placehold.co/
      - Implemente TODOS os elementos visuais descritos
      - Crie conteúdo PERSUASIVO e ESPECÍFICO para a indústria
      - Otimize OBSESSIVAMENTE para conversão
      - Código deve ser PERFEITO e FUNCIONAL

      **FORMATO DE RESPOSTA**: 
      Começar IMEDIATAMENTE com "<!DOCTYPE html>" sem nenhum texto explicativo.
    `;
  }

  /**
   * @deprecated Use createLandingPage a partir de agora.
   */
  public async createUltraLandingPage(
    prompt: string,
    options: LandingPageOptions = {},
    reference?: string
  ): Promise < string > {
    return this.createLandingPage(prompt, options, reference);
  }

  public async createLandingPage(
    prompt: string,
    options: LandingPageOptions = {},
    reference?: string
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

    const systemPrompt = this.getUltraSystemPrompt(options);

    const userPrompt = `
      BRIEFING ESTRATÉGICO DO CLIENTE:
      ${prompt}
      
      ESPECIFICAÇÕES TÉCNICAS DETALHADAS:
      - Estilo Visual: ${options.style || 'modern'}
      - Esquema de Cores: ${options.colorScheme || 'dark'}
      - Indústria/Setor: ${options.industry || 'Tecnologia'}
      - Público-alvo: ${options.targetAudience || 'Profissionais'}
      - Personalidade da Marca: ${options.brandPersonality || 'innovative'}
      - Tipo de Layout: ${options.layout || 'multi-section'}
      - CTA Primário: "${options.primaryCTA || 'Começar Agora'}"
      - CTA Secundário: "${options.secondaryCTA || 'Saber Mais'}"
      - Nível de Animações: ${options.animationsLevel || 'dynamic'}
      
      ELEMENTOS A INCLUIR (baseado nas opções, confirme a criação):
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

      EXECUTE AGORA: Crie a landing page mais IMPRESSIONANTE, FUNCIONAL e CONVERSORA possível, com no mínimo 6 seções!
      
      LEMBRETE CRÍTICO: Resposta deve começar IMEDIATAMENTE com "<!DOCTYPE html>" - ZERO texto adicional!
    `;

    try {
      const result = await model.generateContent([systemPrompt, userPrompt]);
      const response = result.response;
      let htmlContent = response.text();

      // Limpeza robusta para garantir que apenas o HTML seja retornado
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
      throw new Error(`Falha ao gerar landing page: ${error.message}`);
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

  public async createLandingPageFromPrompt(
    prompt: string,
    reference?: string
  ): Promise < string > {
    return this.createLandingPage(prompt, {
      style: 'modern',
      colorScheme: 'dark',
      animationsLevel: 'dynamic'
    }, reference);
  }

  /**
   * Gera múltiplas variações de landing pages com base em um único prompt.
   * Este método utiliza a lógica mais avançada para criar variações de alta qualidade.
   */
  public async generateVariations(
    prompt: string,
    count: number = 3,
    baseOptions: LandingPageOptions = {}
  ): Promise < string[] > {
    const variations: string[] = [];
    const styles: Array < LandingPageOptions['style'] > = [
      'modern', 'luxury', 'tech', 'creative', 'bold', 'elegant', 'startup', 'corporate', 'gaming'
    ];
    const colorSchemes: Array < LandingPageOptions['colorScheme'] > = [
      'gradient', 'aurora', 'cyber', 'sunset', 'ocean', 'neon', 'dark', 'nature'
    ];
    const animationLevels: Array < LandingPageOptions['animationsLevel'] > = [
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
        const variation = await this.createLandingPage(prompt, options);
        variations.push(variation);

        // Adiciona um pequeno delay para evitar sobrecarregar a API
        if (i < count - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Erro ao gerar variação ${i + 1}:`, error);
      }
    }

    return variations;
  }

  /**
   * Otimiza uma landing page existente com base em objetivos específicos.
   * Este método utiliza um prompt detalhado para otimizações avançadas.
   */
  public async optimizeLandingPage(
    currentHtml: string,
    optimizationGoals: string[] = ['conversion', 'performance', 'accessibility', 'seo']
  ): Promise < string > {
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
      - Adicione elementos de escassez visual (ex: contadores, estoque limitado)
      - Otimize a hierarquia visual para guiar o olhar do usuário (padrão F/Z)
      - Implemente prova social mais convincente (depoimentos com detalhes, números de impacto)
      - Adicione "risk reversal statements" (garantias, política de devolução)
      - Reforce as headlines com "power words" e foco em benefícios
      - Adicione "trust signals" estratégicos (selos de segurança, logos de parceiros)
      
      ⚡ PERFORMANCE:
      - Otimize o Critical CSS, se possível, colocando-o inline no <head>
      - Implemente lazy loading para imagens e iframes abaixo da dobra (loading="lazy")
      - Adicione resource hints (preload para fontes ou scripts críticos, prefetch)
      - Assegure que as imagens usem placeholders adequados e otimizados
      - Garanta que a tag <script> do TailwindCSS esteja no final do <body>, se possível, ou use um método mais avançado de compilação.
      - Implemente font-display: swap na importação de fontes CSS.
      
      ♿ ACESSIBILIDADE:
      - Verifique e melhore o contraste de cores para atender WCAG AA, idealmente AAA.
      - Adicione ARIA labels descritivos para elementos interativos sem texto claro (ex: botões com ícones).
      - Garanta que a navegação por teclado seja lógica e que todos os elementos interativos sejam focáveis.
      - Melhore os `alt` texts das imagens para serem mais descritivos.
      - Adicione um "skip link" no início do <body> para pular para o conteúdo principal.
      
      🔍 SEO:
      - Otimize as meta tags (title, description) para serem mais atrativas e ricas em keywords.
      - Adicione schema markup (JSON-LD) para o produto, serviço ou organização.
      - Melhore a semântica HTML5 (usar <main>, <section>, <article>, <nav>, <header>, <footer> corretamente).
      
      🎨 UX/UI:
      - Refine as microinterações para fornecer feedback claro (ex: hover, active, focus states em botões e links).
      - Otimize formulários para simplicidade e alta conversão.
      - Melhore o design responsivo para uma experiência impecável em telas ultra-wide e mobile.
      
      RESULTADO: Retorne o CÓDIGO HTML COMPLETO e otimizado, sem explicações ou markdown.
      Início obrigatório: "<!DOCTYPE html>"
    `;

    try {
      const result = await model.generateContent(optimizationPrompt);
      const response = result.response;
      let optimizedHtml = response.text();

      // Limpeza final para garantir
      const htmlMatch = optimizedHtml.match(/<!DOCTYPE html>.*<\/html>/is);
      if (htmlMatch) {
          optimizedHtml = htmlMatch[0];
      } else {
          optimizedHtml = optimizedHtml.replace(/```html|```/g, '').trim();
      }

      return optimizedHtml;
    } catch (error: any) {
      console.error('[GeminiService] Erro ao otimizar landing page:', error);
      throw new Error(`Falha ao otimizar landing page: ${error.message}`);
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

    const model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest"
    });

    const analysisPrompt = `
      Você é um CONVERSION RATE OPTIMIZATION EXPERT com 15 anos de experiência.
      
      Analise profundamente esta landing page e forneça:
      1. Score de conversão (0-100), baseado em heurísticas de Nielsen, psicologia da persuasão e melhores práticas de UX.
      2. 5 a 10 recomendações acionáveis e específicas para melhorar a conversão, ordenadas por impacto.
      3. 3 a 5 pontos fortes mais impactantes da página.
      4. 3 a 5 pontos fracos mais críticos que prejudicam a conversão.
      
      LANDING PAGE:
      ${html}
      
      Responda APENAS em formato JSON, sem markdown ou texto explicativo:
      {
        "score": number,
        "recommendations": ["rec1", "rec2", ...],
        "strengths": ["strength1", "strength2", ...],
        "weaknesses": ["weakness1", "weakness2", ...]
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
        recommendations: ['Erro na análise - verifique o console ou tente novamente.'],
        strengths: [],
        weaknesses: ['Falha na análise técnica do JSON retornado pela API.']
      };
    }
  }
}

export const geminiService = new GeminiService(GEMINI_API_KEY);

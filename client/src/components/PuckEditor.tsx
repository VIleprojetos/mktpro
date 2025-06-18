import React, { useEffect, useRef, useState } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Eye, Code, Loader2 } from 'lucide-react';

// Interface compatible with your Data type from @puckeditor/core
export interface Data {
  html?: string;
  css?: string;
  components?: any;
  styles?: any;
  [key: string]: any;
}

// Interface for the editor component props
interface PuckEditorProps {
  initialData?: Data;
  onSave: (data: Data) => void;
  onBack?: () => void;
}

// The main editor component
export function PuckEditor({ initialData, onSave, onBack }: PuckEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!editorRef.current) return;

    // GrapesJS configuration
    const grapesEditor = grapesjs.init({
      container: editorRef.current,
      height: '100%',
      width: 'auto',
      plugins: [gjsPresetWebpage],
      pluginsOpts: {
        [gjsPresetWebpage]: {
          blocksBasicOpts: {
            blocks: ['column1', 'column2', 'column3', 'text', 'link', 'image', 'video'],
            flexGrid: 1,
          },
          blocks: ['link-block', 'quote', 'text-basic'],
        },
      },
      blockManager: {
        appendTo: '.blocks-container',
      },
      layerManager: {
        appendTo: '.layers-container',
      },
      traitManager: {
        appendTo: '.traits-container',
      },
      selectorManager: {
        appendTo: '.styles-container',
      },
      panels: {
        defaults: [
          {
            id: 'basic-actions',
            el: '.panel__basic-actions',
            buttons: [
              {
                id: 'visibility',
                active: true,
                className: 'btn-toggle-borders',
                label: '<i class="fa fa-clone"></i>',
                command: 'sw-visibility',
              },
              {
                id: 'export',
                className: 'btn-open-export',
                label: '<i class="fa fa-code"></i>',
                command: 'export-template',
                context: 'export-template',
              },
              {
                id: 'preview',
                className: 'btn-preview',
                label: '<i class="fa fa-eye"></i>',
                command: 'preview',
              },
            ],
          },
        ],
      },
      storageManager: {
        type: 'remote',
        stepsBeforeSave: 1,
        options: {
          remote: {
            onStore: (data: any) => {
              return Promise.resolve();
            },
            onLoad: () => {
              return Promise.resolve(initialData || {});
            },
          },
        },
      },
    });

    // Load initial data if provided
    if (initialData) {
      if (initialData.html) {
        grapesEditor.setComponents(initialData.html);
      }
      if (initialData.css) {
        grapesEditor.setStyle(initialData.css);
      }
    }

    // Additional configurations
    grapesEditor.getConfig().showOffsets = true;

    // Add custom blocks
    addCustomBlocks(grapesEditor);

    setEditor(grapesEditor);
    setIsLoading(false);

    // Cleanup
    return () => {
      if (grapesEditor) {
        grapesEditor.destroy();
      }
    };
  }, []);

  const addCustomBlocks = (editor: any) => {
    // Custom text block
    editor.BlockManager.add('custom-text', {
      label: 'Texto Customizado',
      content: '<div class="custom-text" style="padding: 20px; border: 1px solid #ddd; margin: 10px; border-radius: 8px;">Texto customizado</div>',
      category: 'Básico',
    });

    // Card component
    editor.BlockManager.add('custom-card', {
      label: 'Card',
      content: `
        <div class="custom-card" style="
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          margin: 16px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          background: white;
          transition: transform 0.2s ease;
        " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
          <h3 style="margin: 0 0 12px 0; color: #1a202c; font-size: 1.5rem;">Título do Card</h3>
          <p style="margin: 0; color: #4a5568; line-height: 1.6;">
            Esta é a descrição do card. Você pode editar este conteúdo clicando duas vezes.
          </p>
        </div>
      `,
      category: 'Componentes',
    });

    // Hero section
    editor.BlockManager.add('hero-section', {
      label: 'Seção Hero',
      content: `
        <section style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 100px 20px;
          text-align: center;
          min-height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="max-width: 800px;">
            <h1 style="font-size: 3.5rem; margin-bottom: 24px; font-weight: bold; line-height: 1.2;">
              Título Principal Impactante
            </h1>
            <p style="font-size: 1.25rem; margin-bottom: 40px; opacity: 0.9; line-height: 1.6;">
              Subtítulo ou descrição que explica claramente o valor da sua oferta
            </p>
            <button style="
              background: #fff;
              color: #667eea;
              padding: 18px 36px;
              border: none;
              border-radius: 8px;
              font-size: 1.1rem;
              font-weight: bold;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'" 
               onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)'">
              Call to Action
            </button>
          </div>
        </section>
      `,
      category: 'Seções',
    });

    // Feature section
    editor.BlockManager.add('features-section', {
      label: 'Seção de Features',
      content: `
        <section style="padding: 80px 20px; background: #f8f9fa;">
          <div style="max-width: 1200px; margin: 0 auto;">
            <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 60px; color: #1a202c;">
              Principais Recursos
            </h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px;">
              <div style="text-align: center; padding: 30px;">
                <div style="width: 80px; height: 80px; background: #667eea; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-size: 2rem;">⚡</span>
                </div>
                <h3 style="font-size: 1.5rem; margin-bottom: 15px; color: #1a202c;">Rápido</h3>
                <p style="color: #4a5568; line-height: 1.6;">Descrição do recurso que destaca os benefícios para o usuário.</p>
              </div>
              <div style="text-align: center; padding: 30px;">
                <div style="width: 80px; height: 80px; background: #48bb78; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-size: 2rem;">🔒</span>
                </div>
                <h3 style="font-size: 1.5rem; margin-bottom: 15px; color: #1a202c;">Seguro</h3>
                <p style="color: #4a5568; line-height: 1.6;">Descrição do recurso que destaca os benefícios para o usuário.</p>
              </div>
              <div style="text-align: center; padding: 30px;">
                <div style="width: 80px; height: 80px; background: #ed8936; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-size: 2rem;">🚀</span>
                </div>
                <h3 style="font-size: 1.5rem; margin-bottom: 15px; color: #1a202c;">Escalável</h3>
                <p style="color: #4a5568; line-height: 1.6;">Descrição do recurso que destaca os benefícios para o usuário.</p>
              </div>
            </div>
          </div>
        </section>
      `,
      category: 'Seções',
    });

    // CTA section
    editor.BlockManager.add('cta-section', {
      label: 'Seção CTA',
      content: `
        <section style="
          background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 80px 20px;
          text-align: center;
        ">
          <div style="max-width: 600px; margin: 0 auto;">
            <h2 style="font-size: 2.5rem; margin-bottom: 20px; font-weight: bold;">
              Pronto para Começar?
            </h2>
            <p style="font-size: 1.2rem; margin-bottom: 40px; opacity: 0.9;">
              Junte-se a milhares de usuários satisfeitos e transforme seu negócio hoje mesmo.
            </p>
            <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
              <button style="
                background: #fff;
                color: #667eea;
                padding: 15px 30px;
                border: none;
                border-radius: 8px;
                font-size: 1.1rem;
                font-weight: bold;
                cursor: pointer;
                transition: transform 0.2s;
              ">
                Começar Agora
              </button>
              <button style="
                background: transparent;
                color: #fff;
                padding: 15px 30px;
                border: 2px solid #fff;
                border-radius: 8px;
                font-size: 1.1rem;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s;
              ">
                Saber Mais
              </button>
            </div>
          </div>
        </section>
      `,
      category: 'Seções',
    });
  };

  const handleSave = async () => {
    if (!editor) return;

    setIsSaving(true);
    try {
      const data: Data = {
        html: editor.getHtml(),
        css: editor.getCss(),
        components: editor.getComponents(),
        styles: editor.getStyles(),
      };

      await onSave(data);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (!editor) return;
    
    const html = editor.getHtml();
    const css = editor.getCss();
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Preview</title>
          <style>${css}</style>
        </head>
        <body>${html}</body>
      </html>
    `;
    
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(fullHtml);
      newWindow.document.close();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Carregando editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          )}
          <h1 className="text-xl font-semibold">Editor de Landing Page</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main editor area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Blocks and Layers */}
        <div className="w-64 bg-muted/30 border-r flex flex-col">
          <div className="p-3 border-b bg-background">
            <h3 className="font-medium">Componentes</h3>
          </div>
          <div className="blocks-container flex-1 overflow-auto p-2"></div>
          
          <div className="p-3 border-y bg-background">
            <h3 className="font-medium">Camadas</h3>
          </div>
          <div className="layers-container flex-1 overflow-auto p-2"></div>
        </div>

        {/* Main canvas area */}
        <div className="flex-1 flex flex-col">
          <div className="panel__basic-actions p-2 border-b bg-background flex gap-1"></div>
          <div ref={editorRef} className="flex-1 bg-white"></div>
        </div>

        {/* Right sidebar - Properties and Styles */}
        <div className="w-64 bg-muted/30 border-l flex flex-col">
          <div className="p-3 border-b bg-background">
            <h3 className="font-medium">Propriedades</h3>
          </div>
          <div className="traits-container flex-1 overflow-auto p-2"></div>
          
          <div className="p-3 border-y bg-background">
            <h3 className="font-medium">Estilos</h3>
          </div>
          <div className="styles-container flex-1 overflow-auto p-2"></div>
        </div>
      </div>
    </div>
  );
}

// Hook for managing page builder data
export function usePageBuilder() {
  const [data, setData] = useState<Data | null>(null);

  const saveData = (newData: Data) => {
    setData(newData);
    console.log('Dados salvos:', newData);
  };

  const loadData = (): Data | undefined => {
    return data || undefined;
  };

  return {
    data,
    saveData,
    loadData,
  };
}

import React, { useEffect, useRef, useState } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetWebpage from 'grapesjs-preset-webpage';

// Interface para os dados do editor
export interface EditorData {
  html: string;
  css: string;
  components: any;
  styles: any;
}

// Interface para as propriedades do nosso componente
interface PuckEditorProps {
  initialData?: EditorData;
  onSave: (data: EditorData) => void;
}

// O componente do editor
export function PuckEditor({ initialData, onSave }: PuckEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!editorRef.current) return;

    // Configuração do GrapesJS
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
                label: '<i class="fas fa-clone"></i>',
                command: 'sw-visibility',
              },
              {
                id: 'export',
                className: 'btn-open-export',
                label: '<i class="fas fa-code"></i>',
                command: 'export-template',
                context: 'export-template',
              },
              {
                id: 'show-json',
                className: 'btn-show-json',
                label: '<i class="fas fa-eye"></i>',
                context: 'show-json',
                command(editor: any) {
                  editor.Modal.setTitle('Components JSON')
                    .setContent(`<textarea style="width:100%; height: 250px;">
                      ${JSON.stringify(editor.getComponents(), null, 2)}
                    </textarea>`)
                    .open();
                },
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
              // Este callback é chamado quando o editor salva automaticamente
              return Promise.resolve();
            },
            onLoad: () => {
              // Carrega dados iniciais se fornecidos
              return Promise.resolve(initialData || {});
            },
          },
        },
      },
    });

    // Carrega dados iniciais se fornecidos
    if (initialData) {
      if (initialData.html) {
        grapesEditor.setComponents(initialData.html);
      }
      if (initialData.css) {
        grapesEditor.setStyle(initialData.css);
      }
    }

    // Configurações adicionais
    grapesEditor.getConfig().showOffsets = true;

    // Adiciona alguns blocos customizados
    grapesEditor.BlockManager.add('custom-text', {
      label: 'Texto Customizado',
      content: '<div class="custom-text" style="padding: 20px; border: 1px solid #ddd; margin: 10px;">Texto customizado</div>',
      category: 'Básico',
    });

    grapesEditor.BlockManager.add('custom-card', {
      label: 'Card',
      content: `
        <div class="custom-card" style="
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 24px;
          margin: 16px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          background: white;
        ">
          <h3 style="margin: 0 0 12px 0; color: #1a202c;">Título do Card</h3>
          <p style="margin: 0; color: #4a5568; line-height: 1.5;">
            Esta é a descrição do card. Você pode editar este conteúdo clicando duas vezes.
          </p>
        </div>
      `,
      category: 'Componentes',
    });

    grapesEditor.BlockManager.add('hero-section', {
      label: 'Seção Hero',
      content: `
        <section style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 80px 20px;
          text-align: center;
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="max-width: 600px;">
            <h1 style="font-size: 3rem; margin-bottom: 20px; font-weight: bold;">
              Título Principal
            </h1>
            <p style="font-size: 1.2rem; margin-bottom: 30px; opacity: 0.9;">
              Subtítulo ou descrição que explica o valor da sua oferta
            </p>
            <button style="
              background: #fff;
              color: #667eea;
              padding: 15px 30px;
              border: none;
              border-radius: 5px;
              font-size: 1.1rem;
              font-weight: bold;
              cursor: pointer;
              transition: transform 0.2s;
            " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
              Call to Action
            </button>
          </div>
        </section>
      `,
      category: 'Seções',
    });

    setEditor(grapesEditor);
    setIsLoading(false);

    // Cleanup
    return () => {
      if (grapesEditor) {
        grapesEditor.destroy();
      }
    };
  }, []);

  const handleSave = () => {
    if (!editor) return;

    const data: EditorData = {
      html: editor.getHtml(),
      css: editor.getCss(),
      components: editor.getComponents(),
      styles: editor.getStyles(),
    };

    onSave(data);
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Carregando editor...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
      {/* Header com botão de salvar */}
      <header style={{ 
        padding: '12px 20px', 
        borderBottom: '1px solid #e2e8f0', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: '#fff',
        zIndex: 1000,
      }}>
        <span style={{ fontWeight: 600, color: '#000', fontSize: '18px' }}>
          Editor de Landing Page
        </span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              if (editor) {
                editor.runCommand('preview');
              }
            }}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Preview
          </button>
          <button
            onClick={handleSave}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Salvar
          </button>
        </div>
      </header>

      {/* Container principal do editor */}
      <div style={{ 
        display: 'flex', 
        flexGrow: 1, 
        height: 'calc(100vh - 60px)',
        overflow: 'hidden'
      }}>
        {/* Sidebar esquerda - Blocos e Camadas */}
        <div style={{ 
          width: '250px', 
          backgroundColor: '#f8f9fa', 
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>
            <strong>Componentes</strong>
          </div>
          <div className="blocks-container" style={{ flex: 1, overflow: 'auto', padding: '10px' }}></div>
          
          <div style={{ padding: '10px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
            <strong>Camadas</strong>
          </div>
          <div className="layers-container" style={{ flex: 1, overflow: 'auto', padding: '10px' }}></div>
        </div>

        {/* Área principal do editor */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="panel__basic-actions" style={{ 
            padding: '8px', 
            backgroundColor: '#fff', 
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            gap: '5px'
          }}></div>
          <div ref={editorRef} style={{ flex: 1 }}></div>
        </div>

        {/* Sidebar direita - Propriedades e Estilos */}
        <div style={{ 
          width: '250px', 
          backgroundColor: '#f8f9fa', 
          borderLeft: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>
            <strong>Propriedades</strong>
          </div>
          <div className="traits-container" style={{ flex: 1, overflow: 'auto', padding: '10px' }}></div>
          
          <div style={{ padding: '10px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
            <strong>Estilos</strong>
          </div>
          <div className="styles-container" style={{ flex: 1, overflow: 'auto', padding: '10px' }}></div>
        </div>
      </div>
    </div>
  );
}

// Hook personalizado para usar o editor
export function usePageBuilder() {
  const [data, setData] = useState<EditorData | null>(null);

  const saveData = (newData: EditorData) => {
    setData(newData);
    // Aqui você pode adicionar lógica para salvar no backend
    console.log('Dados salvos:', newData);
  };

  const loadData = (): EditorData | undefined => {
    return data || undefined;
  };

  return {
    data,
    saveData,
    loadData,
  };
}

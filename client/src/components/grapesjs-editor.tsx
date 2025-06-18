// client/src/components/grapesjs-editor.tsx
import React, { useEffect, useRef } from 'react';
import grapesjs, { Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import grapesjsPresetWebpage from 'grapesjs-preset-webpage';
import grapesjsTailwind from 'grapesjs-tailwind';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface GrapesJsEditorProps {
  initialData?: { html: string; css: string };
  onSave: (data: { html: string; css: string }) => void;
  onBack: () => void;
  initialTheme?: 'light' | 'dark';
}

const GrapesJsEditor: React.FC<GrapesJsEditorProps> = ({ initialData, onSave, onBack, initialTheme = 'dark' }) => {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    let editor: Editor | null = null;

    const fontAwesomeLink = document.createElement('link');
    fontAwesomeLink.rel = 'stylesheet';
    fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
    document.head.appendChild(fontAwesomeLink);

    if (editorContainerRef.current) {
      editor = grapesjs.init({
        container: editorContainerRef.current,
        height: '100vh',
        width: 'auto',
        storageManager: false,
        plugins: [grapesjsPresetWebpage, grapesjsTailwind],
        canvas: {
          styles: [
            'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
            '/src/index.css'
          ],
          scripts: ['https://cdn.tailwindcss.com'],
        },
        // ✅ CORREÇÃO: Adicionada a configuração de painéis para garantir que a UI do editor seja renderizada.
        panels: {
          defaults: [
            {
              id: 'options',
              buttons: [], // Os botões serão adicionados dinamicamente abaixo.
            },
            {
              id: 'views',
              buttons: [
                {
                  id: 'open-style-manager',
                  className: 'fa fa-paint-brush',
                  command: 'open-sm',
                  attributes: { title: 'Estilos' },
                },
                {
                  id: 'open-trait-manager',
                  className: 'fa fa-cog',
                  command: 'open-tm',
                  attributes: { title: 'Configurações' },
                },
                {
                  id: 'open-blocks',
                  className: 'fa fa-th-large',
                  command: 'open-blocks',
                  attributes: { title: 'Blocos' },
                },
                 {
                  id: 'open-layer-manager',
                  className: 'fa fa-bars',
                  command: 'open-layers',
                  attributes: { title: 'Camadas' },
                },
              ],
            },
          ]
        },
        i18n: {
          locale: 'pt-BR',
          messages: {
            'pt-BR': {
              styleManager: {
                properties: {
                  'background-color': 'Cor de Fundo',
                  'color': 'Cor do Texto',
                  'font-size': 'Tamanho da Fonte',
                  'margin': 'Margem',
                  'padding': 'Preenchimento',
                  'border': 'Borda',
                  'width': 'Largura',
                  'height': 'Altura'
                },
                 sectors: {
                    general: 'Geral',
                    layout: 'Layout',
                    typography: 'Tipografia',
                    decorations: 'Decorações',
                    extra: 'Extra',
                }
              },
              assetManager: {
                title: 'Gerenciador de Ativos',
                upload: 'Enviar Imagem'
              },
              blockManager: {
                categories: {
                  'Basic': 'Básico',
                  'Typography': 'Tipografia',
                  'Forms': 'Formulários'
                }
              },
              layerManager: {
                  title: 'Camadas'
              },
              traitManager: {
                  title: 'Configurações'
              }
            }
          }
        }
      });

      editor.on('load', () => {
        const panels = editor!.Panels;
        const optionsPanel = panels.getPanel('options');
        optionsPanel?.get('buttons').reset(); // Limpa botões padrão para adicionar os personalizados

        // Botão para Voltar
        panels.addButton('options', {
          id: 'back-button',
          className: 'fa fa-arrow-left',
          command: () => onBack(),
          attributes: { title: 'Voltar' },
        });

        // Botão para Salvar
        panels.addButton('options', {
            id: 'save-db',
            className: 'fa fa-floppy-o',
            command: (editorInstance) => {
              const html = editorInstance.getHtml();
              const css = editorInstance.getCss();
              onSave({ html, css });
              toast({
                  title: "Salvo com sucesso!",
                  description: "Sua landing page foi salva no banco de dados.",
              });
            },
            attributes: { title: 'Salvar' },
        });

        // Botão para Download
        panels.addButton('options', {
            id: 'download-zip',
            className: 'fa fa-download',
            command: (editorInstance) => {
                const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sua Landing Page</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="./style.css">
</head>
<body>
    ${editorInstance.getHtml()}
</body>
</html>`;
                const css = editorInstance.getCss();
                const zip = new JSZip();
                zip.file("index.html", html);
                zip.file("style.css", css);

                zip.generateAsync({ type: "blob" }).then(content => {
                    saveAs(content, "landing-page.zip");
                });
                toast({
                    title: "Download Iniciado",
                    description: "Sua landing page está sendo baixada como um arquivo .zip.",
                });
            },
            attributes: { title: 'Baixar como .zip' }
        });

        // Botão para Alternar Tema
        panels.addButton('options', {
          id: 'toggle-theme',
          className: initialTheme === 'dark' ? 'fa fa-sun-o' : 'fa fa-moon-o',
          command: (editorInstance) => {
            const body = editorInstance.Canvas.getBody();
            const button = panels.getButton('options', 'toggle-theme');
            body.classList.toggle('dark');
            if (body.classList.contains('dark')) {
              button?.set('className', 'fa fa-sun-o');
            } else {
              button?.set('className', 'fa fa-moon-o');
            }
          },
          attributes: { title: 'Alternar Tema' },
        });

        const body = editor!.Canvas.getBody();
        body.classList.add('dashboard-container');
        if (initialTheme === 'dark') {
          body.classList.add('dark');
        }

        if (initialData?.html) {
          editor!.setComponents(initialData.html);
          if (initialData.css) {
            editor!.setStyle(initialData.css);
          }
        } else {
          editor!.setComponents(
            `<div class="p-16 text-center">
               <h1 class="text-4xl font-bold">Comece a construir sua página!</h1>
               <p class="mt-4">Arraste os blocos da direita para começar.</p>
             </div>`
          );
        }
      });
    }

    return () => {
      if (editor) {
        editor.destroy();
      }
      const existingLink = document.querySelector('link[href*="font-awesome"]');
      if (existingLink) {
        document.head.removeChild(existingLink);
      }
    };
  }, [initialData, onSave, onBack, initialTheme, toast]);

  return (
    <div className="h-screen w-full">
      <div ref={editorContainerRef} />
    </div>
  );
};

export default GrapesJsEditor;

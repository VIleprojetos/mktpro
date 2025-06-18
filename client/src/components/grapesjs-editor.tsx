// client/src/components/grapesjs-editor.tsx
import React, 'useEffect, useRef } from 'react';
import grapesjs, { Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import grapesjsPresetWebpage from 'grapesjs-preset-webpage';
import grapesjsTailwind from 'grapesjs-tailwind';
import { useToast } from '@/hooks/use-toast'; // Importar o hook de toast
import JSZip from 'jszip'; // Importar JSZip para criar o arquivo .zip
import { saveAs } from 'file-saver'; // Importar file-saver para iniciar o download

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

    // Adiciona o link para o Font Awesome no head do documento principal
    // para que os ícones dos botões do editor sejam carregados.
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
        // Carrega os estilos globais da aplicação e a fonte no canvas do editor
        canvas: {
          styles: [
            'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
            '/src/index.css' // Carrega o CSS principal da sua aplicação
          ],
          scripts: ['https://cdn.tailwindcss.com'],
        },
        // Configuração de internacionalização para traduzir o editor para PT-BR
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
                }
              },
              assetManager: {
                title: 'Gerenciador de Ativos',
                upload: 'Enviar Imagem'
              },
              blockManager: {
                labels: {
                  // ... outras traduções de blocos
                },
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

        // Limpa paineis existentes se necessário para evitar duplicatas
        if (panels.getPanel('options')) {
            panels.removePanel('options');
        }
        panels.addPanel({ id: 'options', buttons: [] });


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
              // Feedback visual para o usuário
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
                    ${editorInstance.getHtml()}
                    </html>
                `;
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
          className: 'fa fa-moon-o',
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

        // Aplica o tema inicial e classes ao carregar o editor
        const body = editor!.Canvas.getBody();
        body.classList.add('dashboard-container');
        if (initialTheme === 'dark') {
          body.classList.add('dark');
          panels.getButton('options', 'toggle-theme')?.set('className', 'fa fa-sun-o');
        }

        // Carrega os dados iniciais
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

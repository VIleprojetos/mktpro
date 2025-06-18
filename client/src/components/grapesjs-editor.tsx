// client/src/components/grapesjs-editor.tsx
import React, { useEffect, useRef } from 'react';
import grapesjs, { Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import grapesjsPresetWebpage from 'grapesjs-preset-webpage';
import grapesjsTailwind from 'grapesjs-tailwind';

interface GrapesJsEditorProps {
  initialData?: { html: string; css: string };
  onSave: (data: { html: string; css: string }) => void;
  onBack: () => void;
  initialTheme?: 'light' | 'dark';
}

const GrapesJsEditor: React.FC<GrapesJsEditorProps> = ({ initialData, onSave, onBack, initialTheme = 'dark' }) => {
  const editorContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let editor: Editor | null = null;

    if (editorContainerRef.current) {
      editor = grapesjs.init({
        container: editorContainerRef.current,
        height: '100vh',
        width: 'auto',
        storageManager: false,
        plugins: [grapesjsPresetWebpage, grapesjsTailwind],
        canvas: {
          styles: ['/editor-styles.css'],
          scripts: ['https://cdn.tailwindcss.com'],
        },
      });

      // ✅ A CORREÇÃO: Usar o evento 'load' para garantir que o editor está pronto.
      editor.on('load', () => {
        const panels = editor!.Panels;
      
        panels.addButton('options', {
            id: 'back-button', className: 'fa fa-arrow-left',
            command: () => onBack(), attributes: { title: 'Voltar' },
        });

        panels.addButton('options', {
            id: 'save-db', className: 'fa fa-floppy-o',
            command: (editorInstance) => {
              const body = editorInstance.Canvas.getBody();
              // Removemos as classes do body antes de salvar o HTML
              body.classList.remove('dashboard-container', 'dark');
              const html = editorInstance.getHtml();
              const css = editorInstance.getCss();
              onSave({ html, css });
              // Readicionamos as classes para continuar editando
              body.classList.add('dashboard-container');
              if (body.getAttribute('data-theme') === 'dark') {
                  body.classList.add('dark');
              }
            },
            attributes: { title: 'Salvar' },
        });
        
        panels.addButton('options', {
            id: 'toggle-theme', className: 'fa fa-moon-o',
            command: (editorInstance) => {
              const body = editorInstance.Canvas.getBody();
              const button = panels.getButton('options', 'toggle-theme');
              body.classList.toggle('dark');
              if (body.classList.contains('dark')) {
                button?.set('className', 'fa fa-sun-o');
                body.setAttribute('data-theme', 'dark'); // Armazena o estado
              } else {
                button?.set('className', 'fa fa-moon-o');
                body.setAttribute('data-theme', 'light');
              }
            },
            attributes: { title: 'Alternar Tema' },
        });

        // Agora este código é seguro, pois só executa após o 'load'
        const body = editor!.Canvas.getBody();
        body.classList.add('dashboard-container');
        if (initialTheme === 'dark') {
          body.classList.add('dark');
          body.setAttribute('data-theme', 'dark');
          panels.getButton('options', 'toggle-theme')?.set('className', 'fa fa-sun-o');
        } else {
          body.setAttribute('data-theme', 'light');
        }

        // Carrega os dados iniciais
        if (initialData?.html) {
          editor!.setComponents(initialData.html);
          if (initialData.css) {
            editor!.setStyle(initialData.css);
          }
        } else {
          editor!.setComponents(
            `<div style="padding: 4rem;">
                <div class="glass-card-wrapper">
                  <div class="glass-card-content">
                    <h1 class="text-4xl font-bold text-glow-primary">Transforme sua rotina...</h1>
                    <p class="mt-4 text-db-text-secondary">Sustentabilidade nunca foi tão acessível.</p>
                  </div>
                </div>
             </div>`
          );
        }
      });
    }

    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [initialData, onSave, onBack, initialTheme]);

  return (
    <div className="h-screen w-full">
      <div ref={editorContainerRef} />
    </div>
  );
};

export default GrapesJsEditor;

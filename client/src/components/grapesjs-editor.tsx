// client/src/components/grapesjs-editor.tsx
import React, { useEffect, useRef } from 'react';
import grapesjs, { Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import grapesjsPresetWebpage from 'grapesjs-preset-webpage';
import grapesjsTailwind from 'grapesjs-tailwind';
import { initial } from 'lodash';

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
        pluginsOpts: {
          /* ... */
        },
        
        canvas: {
          // Usamos o CSS compilado que você criou no passo anterior
          styles: ['/editor-styles.css'],
          scripts: ['https://cdn.tailwindcss.com'],
        },
      });

      // --- PAINÉIS E BOTÕES ---
      const panels = editor.Panels;
      
      panels.addButton('options', {
        id: 'back-button', className: 'fa fa-arrow-left',
        command: () => onBack(), attributes: { title: 'Voltar' },
      });

      panels.addButton('options', {
        id: 'save-db', className: 'fa fa-floppy-o',
        command: () => {
          const body = editor!.Canvas.getBody();
          // Importante: Ao salvar, verificamos se o body tem a classe e a removemos do HTML final
          // para evitar redundância, já que ela será aplicada na página renderizada.
          body.classList.remove('dashboard-container', 'dark');
          const html = editor!.getHtml();
          const css = editor!.getCss();
          onSave({ html, css });
        },
        attributes: { title: 'Salvar' },
      });
      
      panels.addButton('options', {
        id: 'toggle-theme', className: 'fa fa-moon-o',
        command: (editor) => {
          const body = editor.Canvas.getBody();
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

      // ✅ A MUDANÇA PRINCIPAL ESTÁ AQUI
      // Aplicamos as classes de fundo e tema diretamente no <body> do canvas do editor.
      const body = editor.Canvas.getBody();
      body.classList.add('dashboard-container');
      if (initialTheme === 'dark') {
        body.classList.add('dark');
        panels.getButton('options', 'toggle-theme')?.set('className', 'fa fa-sun-o');
      }

      // --- CARREGANDO DADOS INICIAIS ---
      // Agora não precisamos mais do <div> exterior.
      if (initialData?.html) {
        editor.setComponents(initialData.html, {});
        if (initialData.css) {
          editor.setStyle(initialData.css);
        }
      } else {
        // Exemplo inicial sem o div "dashboard-container", pois já está no body.
        editor.setComponents(
          `<div style="padding: 4rem;">
              <div class="glass-card-wrapper">
                <div class="glass-card-content">
                  <h1 class="text-4xl font-bold text-glow-primary">Transforme sua rotina...</h1>
                  <p class="mt-4 text-db-text-secondary">Sustentabilidade nunca foi tão acessível.</p>
                </div>
              </div>
           </div>`,
          {}
        );
      }
    }

    return () => {
      if (editor) editor.destroy();
    };
  }, [initialData, onSave, onBack, initialTheme]);

  return (
    <div className="h-screen w-full">
      <div ref={editorContainerRef} />
    </div>
  );
};

export default GrapesJsEditor;

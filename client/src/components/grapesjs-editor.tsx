// client/src/components/grapesjs-editor.tsx
import React, { useEffect, useRef }'react';
import grapesjs, { Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import grapesjsPresetWebpage from 'grapesjs-preset-webpage';
// The tailwind plugin is still useful for adding blocks and custom UI
import grapesjsTailwind from 'grapesjs-tailwind';

interface GrapesJsEditorProps {
  initialData?: { html: string; css: string };
  onSave: (data: { html: string; css: string }) => void;
  onBack: () => void;
}

const GrapesJsEditor: React.FC<GrapesJsEditorProps> = ({ initialData, onSave, onBack }) => {
  const editorContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let editor: Editor | null = null;

    if (editorContainerRef.current) {
      editor = grapesjs.init({
        container: editorContainerRef.current,
        fromElement: false,
        height: '100vh',
        width: 'auto',
        storageManager: false,
        plugins: [grapesjsPresetWebpage, grapesjsTailwind],
        pluginsOpts: {
          /* options */
        },
        assetManager: {
            upload: '/api/assets/lp-upload',
            uploadName: 'files',
        },

        // ✅ THE CRITICAL FIX IS HERE
        canvas: {
          styles: [
            // 1. Load your custom theme with all the CSS variables.
            // This file MUST be in your `public` folder.
            '/editor-styles.css',

            // 2. (Optional but recommended) Load any web fonts you use.
            'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap',
          ],
          scripts: [
            // 3. Load the Tailwind CDN script. This provides ALL utility classes
            // for live editing, including those from plugins like `typography`.
            'https://cdn.tailwindcss.com',
          ],
        },
      });

      // --- Panels and Buttons ---
      editor.Panels.addButton('options', {
        id: 'back-button',
        className: 'fa fa-arrow-left',
        command: () => onBack(),
        attributes: { title: 'Voltar' },
      });

      editor.Panels.addButton('options', {
        id: 'save-db',
        className: 'fa fa-floppy-o',
        command: () => {
          const html = editor!.getHtml();
          const css = editor!.getCss(); // This captures any custom CSS added in the style manager
          onSave({ html, css });
        },
        attributes: { title: 'Salvar' },
      });

      // --- Load Initial Data ---
      if (initialData?.html) {
        editor.setComponents(initialData.html, {});
        if (initialData.css) {
          editor.setStyle(initialData.css);
        }
      } else {
        editor.setComponents(
          `<div class="bg-background text-foreground flex min-h-screen items-center justify-center">
             <h1 class="text-4xl font-bold">Sua Landing Page Começa Aqui!</h1>
          </div>`,
          {}
        );
      }
    }

    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [initialData, onSave, onBack]);

  return (
    <div className="h-screen w-full">
      <div ref={editorContainerRef} />
    </div>
  );
};

export default GrapesJsEditor;

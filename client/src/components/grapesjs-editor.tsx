// client/src/components/grapesjs-editor.tsx
import React, { useEffect, useRef } from 'react';
import grapesjs, { Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import grapesjsPresetWebpage from 'grapesjs-preset-webpage';
import grapesjsTailwind from 'grapesjs-tailwind'; // Importe o plugin

// Remova o useToast se não for usado diretamente no useEffect
// import { useToast } from '@/hooks/use-toast'; 

interface GrapesJsEditorProps {
  initialData?: { html: string, css: string };
  onSave: (data: { html: string, css: string }) => void;
  onBack: () => void;
}

const GrapesJsEditor: React.FC<GrapesJsEditorProps> = ({ initialData, onSave, onBack }) => {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  // Não é necessário manter a instância do editor em um ref se a lógica de cleanup estiver correta
  // const editorInstanceRef = useRef<Editor | null>(null);

  useEffect(() => {
    let editor: Editor | null = null;

    if (editorContainerRef.current) {
      editor = grapesjs.init({
        container: editorContainerRef.current,
        fromElement: false,
        height: '100vh', // Use vh para ocupar a tela toda
        width: 'auto',
        storageManager: false,
        
        // Carregue os plugins aqui
        plugins: [grapesjsPresetWebpage, grapesjsTailwind],
        pluginsOpts: {
          [grapesjsPresetWebpage as any]: {
            // opções do preset
          },
          [grapesjsTailwind as any]: {
            // opções do plugin do tailwind (se necessário)
            // por exemplo, para usar a versão mais recente
            // tailwindPlayCdn: 'https://cdn.tailwindcss.com', 
          }
        },

        assetManager: {
            upload: '/api/assets/lp-upload',
            uploadName: 'files',
        },

        // ✅ A PARTE MAIS IMPORTANTE: CONFIGURAÇÃO DO CANVAS (IFRAME)
        canvas: {
          styles: [
            // 1. O URL PÚBLICO para seu arquivo CSS global.
            // Se você usa Next.js e seu CSS está em `styles/globals.css`,
            // o Next.js o compila. Você precisa descobrir o caminho final
            // ou, mais fácil, apenas deixar o plugin do Tailwind fazer o trabalho.
            // Para outros estilos (como fontes), adicione aqui.
            'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap', // Exemplo: Carregando a fonte Poppins
          ],
          scripts: [
            // O plugin grapesjs-tailwind já injeta o script do Tailwind CDN,
            // então este array pode ficar vazio a menos que você precise de outros scripts.
          ]
        }
      });
      
      // --- PAINÉIS E BOTÕES ---
      editor.Panels.addButton('options', {
        id: 'back-button',
        className: 'fa fa-arrow-left',
        command: () => onBack(),
        attributes: { title: 'Voltar' }
      });
      
      editor.Panels.addButton('options', {
        id: 'save-db',
        className: 'fa fa-floppy-o',
        command: () => {
          // Ao salvar, pegamos o HTML e o CSS que o GrapesJS gerencia.
          // O CSS aqui será o CSS customizado, não o do Tailwind.
          const html = editor!.getHtml();
          const css = editor!.getCss();
          onSave({ html, css });
        },
        attributes: { title: 'Salvar' }
      });

      // --- CARREGANDO DADOS INICIAIS ---
      if (initialData?.html) {
        // Ao carregar, o CSS customizado (se houver) deve ser injetado.
        // O HTML deve conter as classes do Tailwind, que serão renderizadas
        // pelo script do Tailwind que o plugin adicionou.
        editor.setComponents(initialData.html, {});
        if (initialData.css) {
            editor.setStyle(initialData.css);
        }
      } else {
        editor.setComponents(`
          <div class="bg-gray-100 min-h-screen flex items-center justify-center">
             <h1 class="text-4xl font-bold text-gray-800">Sua Landing Page Começa Aqui!</h1>
          </div>
        `, {});
      }
    }

    // Função de limpeza para destruir a instância do editor ao desmontar o componente
    return () => {
      if (editor) {
        editor.destroy();
        editor = null;
      }
    };
  }, [initialData, onSave, onBack]); // Dependências do useEffect

  return (
    <div className="h-screen w-full">
      <div ref={editorContainerRef} />
    </div>
  );
};

export default GrapesJsEditor;

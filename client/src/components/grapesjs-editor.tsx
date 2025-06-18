// client/src/components/grapesjs-editor.tsx
import React, { useEffect, useRef, useState } from 'react';
import grapesjs, { Editor } from 'grapesjs';
import grapesjsPresetWebpage from 'grapesjs-preset-webpage';
import grapesjsTailwind from 'grapesjs-tailwind';

interface GrapesJsEditorProps {
  initialData?: { html: string, css: string };
  onSave: (data: { html: string, css: string }) => void;
  onBack: () => void;
}

const GrapesJsEditor: React.FC<GrapesJsEditorProps> = ({ initialData, onSave, onBack }) => {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editor, setEditor] = useState<Editor | null>(null);

  useEffect(() => {
    let editorInstance: Editor | null = null;

    if (editorContainerRef.current) {
      // Inject dark neumorphism styles
      const darkStyles = `
        <style>
          /* Dark Neumorphism Theme for GrapesJS */
          :root {
            --dark-bg: #1a1a1a;
            --dark-surface: #2d2d2d;
            --dark-surface-light: #3a3a3a;
            --dark-text: #ffffff;
            --dark-text-secondary: #b0b0b0;
            --dark-accent: #4a9eff;
            --dark-accent-hover: #3d8bdb;
            --shadow-dark: rgba(0, 0, 0, 0.5);
            --shadow-light: rgba(255, 255, 255, 0.1);
          }

          /* Main containers */
          #gjs {
            background: var(--dark-bg) !important;
            color: var(--dark-text) !important;
          }

          /* Panels */
          .gjs-pn-panels {
            background: var(--dark-bg) !important;
          }

          .gjs-pn-panel {
            background: var(--dark-surface) !important;
            border-radius: 12px !important;
            margin: 8px !important;
            box-shadow: 
              8px 8px 16px var(--shadow-dark),
              -8px -8px 16px var(--shadow-light) !important;
            border: 1px solid rgba(255, 255, 255, 0.05) !important;
          }

          /* Buttons */
          .gjs-pn-btn {
            background: var(--dark-surface) !important;
            color: var(--dark-text) !important;
            border: none !important;
            border-radius: 8px !important;
            margin: 4px !important;
            transition: all 0.3s ease !important;
            box-shadow: 
              4px 4px 8px var(--shadow-dark),
              -4px -4px 8px var(--shadow-light) !important;
          }

          .gjs-pn-btn:hover {
            background: var(--dark-surface-light) !important;
            transform: translateY(-2px) !important;
            box-shadow: 
              6px 6px 12px var(--shadow-dark),
              -6px -6px 12px var(--shadow-light) !important;
          }

          .gjs-pn-btn.gjs-pn-active {
            background: var(--dark-accent) !important;
            color: white !important;
            box-shadow: 
              inset 4px 4px 8px rgba(0, 0, 0, 0.3),
              inset -4px -4px 8px rgba(255, 255, 255, 0.1) !important;
          }

          /* Blocks */
          .gjs-blocks-c {
            background: var(--dark-surface) !important;
            border-radius: 12px !important;
            border: 1px solid rgba(255, 255, 255, 0.05) !important;
          }

          .gjs-block {
            background: var(--dark-surface) !important;
            color: var(--dark-text) !important;
            border-radius: 8px !important;
            margin: 6px !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            box-shadow: 
              4px 4px 8px var(--shadow-dark),
              -4px -4px 8px var(--shadow-light) !important;
            transition: all 0.3s ease !important;
          }

          .gjs-block:hover {
            transform: translateY(-3px) !important;
            box-shadow: 
              6px 6px 12px var(--shadow-dark),
              -6px -6px 12px var(--shadow-light) !important;
            border-color: var(--dark-accent) !important;
          }

          /* Layers */
          .gjs-layers {
            background: var(--dark-surface) !important;
            border-radius: 12px !important;
            border: 1px solid rgba(255, 255, 255, 0.05) !important;
          }

          .gjs-layer {
            background: var(--dark-surface) !important;
            color: var(--dark-text) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          }

          .gjs-layer:hover {
            background: var(--dark-surface-light) !important;
          }

          .gjs-layer.gjs-hovered {
            background: var(--dark-accent) !important;
            color: white !important;
          }

          /* Style Manager */
          .gjs-sm-sectors {
            background: var(--dark-surface) !important;
            border-radius: 12px !important;
            border: 1px solid rgba(255, 255, 255, 0.05) !important;
          }

          .gjs-sm-sector {
            background: var(--dark-surface) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          }

          .gjs-sm-title {
            background: var(--dark-surface-light) !important;
            color: var(--dark-text) !important;
            border-radius: 8px !important;
            margin: 4px !important;
          }

          .gjs-sm-property {
            background: var(--dark-surface) !important;
            color: var(--dark-text) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
          }

          .gjs-sm-label {
            color: var(--dark-text-secondary) !important;
          }

          .gjs-field, .gjs-select {
            background: var(--dark-surface-light) !important;
            color: var(--dark-text) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 6px !important;
            box-shadow: 
              inset 2px 2px 4px var(--shadow-dark),
              inset -2px -2px 4px var(--shadow-light) !important;
          }

          .gjs-field:focus, .gjs-select:focus {
            border-color: var(--dark-accent) !important;
            box-shadow: 
              inset 2px 2px 4px var(--shadow-dark),
              inset -2px -2px 4px var(--shadow-light),
              0 0 0 2px rgba(74, 158, 255, 0.3) !important;
          }

          /* Canvas */
          .gjs-cv-canvas {
            background: var(--dark-bg) !important;
            border-radius: 12px !important;
            overflow: hidden !important;
            box-shadow: 
              inset 8px 8px 16px var(--shadow-dark),
              inset -8px -8px 16px var(--shadow-light) !important;
          }

          /* Toolbar */
          .gjs-toolbar {
            background: var(--dark-surface) !important;
            border-radius: 8px !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            box-shadow: 
              4px 4px 8px var(--shadow-dark),
              -4px -4px 8px var(--shadow-light) !important;
          }

          .gjs-toolbar-item {
            background: var(--dark-surface) !important;
            color: var(--dark-text) !important;
            border: none !important;
            border-radius: 4px !important;
            margin: 2px !important;
          }

          .gjs-toolbar-item:hover {
            background: var(--dark-accent) !important;
            color: white !important;
          }

          /* Modal */
          .gjs-mdl-dialog {
            background: var(--dark-surface) !important;
            color: var(--dark-text) !important;
            border-radius: 16px !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            box-shadow: 
              12px 12px 24px var(--shadow-dark),
              -12px -12px 24px var(--shadow-light) !important;
          }

          .gjs-mdl-header {
            background: var(--dark-surface-light) !important;
            color: var(--dark-text) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 16px 16px 0 0 !important;
          }

          /* RTE (Rich Text Editor) */
          .gjs-rte-toolbar {
            background: var(--dark-surface) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 8px !important;
            box-shadow: 
              4px 4px 8px var(--shadow-dark),
              -4px -4px 8px var(--shadow-light) !important;
          }

          .gjs-rte-action {
            background: var(--dark-surface) !important;
            color: var(--dark-text) !important;
            border: none !important;
            border-radius: 4px !important;
            margin: 2px !important;
          }

          .gjs-rte-action:hover {
            background: var(--dark-accent) !important;
            color: white !important;
          }

          /* Scrollbars */
          ::-webkit-scrollbar {
            width: 8px !important;
            height: 8px !important;
          }

          ::-webkit-scrollbar-track {
            background: var(--dark-surface) !important;
            border-radius: 4px !important;
          }

          ::-webkit-scrollbar-thumb {
            background: var(--dark-surface-light) !important;
            border-radius: 4px !important;
            box-shadow: 
              2px 2px 4px var(--shadow-dark),
              -2px -2px 4px var(--shadow-light) !important;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: var(--dark-accent) !important;
          }

          /* Responsive indicators */
          .gjs-pn-commands .gjs-pn-btn {
            position: relative !important;
          }

          .gjs-pn-commands .gjs-pn-btn::after {
            content: '' !important;
            position: absolute !important;
            bottom: 2px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            width: 0 !important;
            height: 2px !important;
            background: var(--dark-accent) !important;
            transition: width 0.3s ease !important;
          }

          .gjs-pn-commands .gjs-pn-btn.gjs-pn-active::after {
            width: 70% !important;
          }

          /* Custom animations */
          @keyframes neumorphPulse {
            0% { box-shadow: 4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light); }
            50% { box-shadow: 6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light); }
            100% { box-shadow: 4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light); }
          }

          .gjs-block:hover, .gjs-pn-btn:hover {
            animation: neumorphPulse 1s ease-in-out !important;
          }
        </style>
      `;

      editorInstance = grapesjs.init({
        container: editorContainerRef.current,
        fromElement: false,
        height: '100vh',
        width: 'auto',
        storageManager: false,
        
        plugins: [grapesjsPresetWebpage, grapesjsTailwind],
        pluginsOpts: {
          [grapesjsPresetWebpage as any]: {
            modalImportTitle: 'Importar Template',
            modalImportLabel: '<div style="margin-bottom: 10px; font-size: 13px;">Cole aqui seu HTML/CSS</div>',
            modalImportContent: function(editor: Editor) {
              return editor.getHtml() + '<style>' + editor.getCss() + '</style>';
            },
            filestackOpts: null,
            aviaryOpts: false,
            blocksBasicOpts: {
              blocks: ['column1', 'column2', 'column3', 'text', 'link', 'image', 'video'],
              flexGrid: 1,
              stylePrefix: 'gjs-'
            },
            customStyleManager: [{
              name: 'Geral',
              buildProps: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom'],
              properties: [{
                type: 'select',
                property: 'display',
                defaults: 'block',
                options: [
                  {value: 'block', name: 'Block'},
                  {value: 'inline', name: 'Inline'},
                  {value: 'inline-block', name: 'Inline Block'},
                  {value: 'flex', name: 'Flex'},
                  {value: 'grid', name: 'Grid'},
                  {value: 'none', name: 'None'},
                ],
              }]
            }]
          },
          [grapesjsTailwind as any]: {
            config: {
              darkMode: 'class',
              theme: {
                extend: {
                  colors: {
                    'dark': {
                      50: '#f8fafc',
                      100: '#f1f5f9',
                      200: '#e2e8f0',
                      300: '#cbd5e1',
                      400: '#94a3b8',
                      500: '#64748b',
                      600: '#475569',
                      700: '#334155',
                      800: '#1e293b',
                      900: '#0f172a',
                    }
                  }
                }
              }
            }
          }
        },

        assetManager: {
          upload: '/api/assets/lp-upload',
          uploadName: 'files',
          multiUpload: true,
          showUrlInput: true,
          autoAdd: 1,
        },

        canvas: {
          styles: [
            darkStyles,
            'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
          ],
          scripts: []
        },

        selectorManager: {
          appendTo: '.gjs-sm-sectors'
        },

        styleManager: {
          sectors: [{
            name: 'Layout',
            open: false,
            buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
            properties: [{
              type: 'composite',
              property: 'margin',
              properties: [
                { name: 'Top', property: 'margin-top'},
                { name: 'Right', property: 'margin-right'},
                { name: 'Bottom', property: 'margin-bottom'},
                { name: 'Left', property: 'margin-left'}
              ],
            },{
              type: 'composite',
              property: 'padding',
              properties: [
                { name: 'Top', property: 'padding-top'},
                { name: 'Right', property: 'padding-right'},
                { name: 'Bottom', property: 'padding-bottom'},
                { name: 'Left', property: 'padding-left'}
              ],
            }]
          },{
            name: 'Typography',
            open: false,
            buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align', 'text-decoration', 'text-shadow'],
            properties: [{
              type: 'select',
              property: 'font-family',
              defaults: 'Inter, sans-serif',
              options: [
                {name: 'Inter', value: 'Inter, sans-serif'},
                {name: 'Helvetica', value: 'Helvetica, sans-serif'},
                {name: 'Georgia', value: 'Georgia, serif'},
                {name: 'Times', value: 'Times, serif'},
                {name: 'Arial', value: 'Arial, sans-serif'},
                {name: 'Courier', value: 'Courier, monospace'},
              ],
            }]
          },{
            name: 'Aparência',
            open: false,
            buildProps: ['opacity', 'background-color', 'border-radius', 'border', 'box-shadow', 'background'],
            properties: [{
              type: 'slider',
              property: 'opacity',
              defaults: 1,
              step: 0.01,
              max: 1,
              min: 0,
            }]
          },{
            name: 'Flexbox',
            open: false,
            buildProps: ['flex-direction', 'justify-content', 'align-items', 'flex-wrap', 'align-content', 'order', 'flex-basis', 'flex-grow', 'flex-shrink', 'align-self']
          }]
        },

        blockManager: {
          appendTo: '#blocks',
          blocks: [
            {
              id: 'section',
              label: '<i class="fa fa-square-o"></i><div>Section</div>',
              attributes: { class: 'gjs-fonts gjs-f-b1' },
              content: '<section class="py-16 px-4 bg-gray-50 dark:bg-gray-900"><div class="max-w-7xl mx-auto"><h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">Nova Seção</h2><p class="text-gray-600 dark:text-gray-300">Conteúdo da seção aqui.</p></div></section>'
            },
            {
              id: 'hero',
              label: '<i class="fa fa-home"></i><div>Hero</div>',
              attributes: { class: 'gjs-fonts gjs-f-b2' },
              content: '<section class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700"><div class="text-center text-white"><h1 class="text-5xl font-bold mb-6">Título Principal</h1><p class="text-xl mb-8">Subtítulo impressionante</p><button class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300">Call to Action</button></div></section>'
            },
            {
              id: 'features',
              label: '<i class="fa fa-th"></i><div>Features</div>',
              attributes: { class: 'gjs-fonts gjs-f-b3' },
              content: '<section class="py-16 px-4 bg-white dark:bg-gray-800"><div class="max-w-6xl mx-auto"><div class="grid md:grid-cols-3 gap-8"><div class="text-center"><div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"><i class="fas fa-star text-white text-2xl"></i></div><h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Feature 1</h3><p class="text-gray-600 dark:text-gray-300">Descrição da funcionalidade</p></div><div class="text-center"><div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"><i class="fas fa-rocket text-white text-2xl"></i></div><h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Feature 2</h3><p class="text-gray-600 dark:text-gray-300">Descrição da funcionalidade</p></div><div class="text-center"><div class="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4"><i class="fas fa-heart text-white text-2xl"></i></div><h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Feature 3</h3><p class="text-gray-600 dark:text-gray-300">Descrição da funcionalidade</p></div></div></div></section>'
            }
          ]
        },

        layerManager: {
          appendTo: '.layers-container'
        },

        traitManager: {
          appendTo: '.traits-container',
        },

        deviceManager: {
          devices: [{
            name: 'Desktop',
            width: '',
          }, {
            name: 'Tablet',
            width: '768px',
            widthMedia: '992px',
          }, {
            name: 'Mobile portrait',
            width: '320px',
            widthMedia: '575px',
          }]
        }
      });

      // Custom panels configuration
      editorInstance.Panels.addPanel({
        id: 'panel-top',
        el: '.panel__top',
      });

      editorInstance.Panels.addPanel({
        id: 'basic-actions',
        el: '.panel__basic-actions',
        buttons: [
          {
            id: 'visibility',
            active: true,
            className: 'btn-toggle-borders',
            label: '<i class="fa fa-clone"></i>',
            command: 'sw-visibility',
            attributes: { title: 'Toggle Borders' }
          }, {
            id: 'export',
            className: 'btn-open-export',
            label: '<i class="fa fa-code"></i>',
            command: 'export-template',
            context: 'export-template',
            attributes: { title: 'View Code' }
          }, {
            id: 'show-json',
            className: 'btn-show-json',
            label: '<i class="fa fa-download"></i>',
            context: 'show-json',
            command(editor: Editor) {
              editor.Modal.setTitle('Components JSON')
                .setContent(`<textarea style="width:100%; height: 250px;">${JSON.stringify(editor.getComponents())}</textarea>`)
                .open();
            },
            attributes: { title: 'Show Components JSON' }
          }
        ],
      });

      // Custom commands
      editorInstance.Commands.add('show-layers', {
        getRowEl(editor: Editor) { return editor.getContainer().closest('.editor-row'); },
        getLayersEl(row: any) { return row.querySelector('.layers-container') },
        run(editor: Editor, sender: any) {
          const lmEl = this.getLayersEl(this.getRowEl(editor));
          lmEl.style.display = '';
        },
        stop(editor: Editor, sender: any) {
          const lmEl = this.getLayersEl(this.getRowEl(editor));
          lmEl.style.display = 'none';
        },
      });

      editorInstance.Commands.add('show-styles', {
        getRowEl(editor: Editor) { return editor.getContainer().closest('.editor-row'); },
        getStyleEl(row: any) { return row.querySelector('.styles-container') },
        run(editor: Editor, sender: any) {
          const smEl = this.getStyleEl(this.getRowEl(editor));
          smEl.style.display = '';
        },
        stop(editor: Editor, sender: any) {
          const smEl = this.getStyleEl(this.getRowEl(editor));
          smEl.style.display = 'none';
        },
      });

      editorInstance.Commands.add('show-traits', {
        getTraitsEl(editor: Editor) {
          const row = editor.getContainer().closest('.editor-row');
          return row.querySelector('.traits-container');
        },
        run(editor: Editor, sender: any) {
          this.getTraitsEl(editor).style.display = '';
        },
        stop(editor: Editor, sender: any) {
          this.getTraitsEl(editor).style.display = 'none';
        },
      });

      // Add panels
      editorInstance.Panels.addButton('options', {
        id: 'back-button',
        className: 'fa fa-arrow-left',
        command: () => onBack(),
        attributes: { title: 'Voltar' }
      });

      editorInstance.Panels.addButton('options', {
        id: 'save-db',
        className: 'fa fa-save',
        command: () => {
          const html = editorInstance!.getHtml();
          const css = editorInstance!.getCss();
          onSave({ html, css });
        },
        attributes: { title: 'Salvar' }
      });

      editorInstance.Panels.addButton('views', {
        id: 'show-layers',
        active: true,
        label: '<i class="fa fa-bars"></i>',
        command: 'show-layers',
        togglable: false,
        attributes: { title: 'Layers' }
      });

      editorInstance.Panels.addButton('views', {
        id: 'show-style',
        active: true,
        label: '<i class="fa fa-paint-brush"></i>',
        command: 'show-styles',
        togglable: false,
        attributes: { title: 'Styles' }
      });

      editorInstance.Panels.addButton('views', {
        id: 'show-traits',
        active: true,
        label: '<i class="fa fa-cog"></i>',
        command: 'show-traits',
        togglable: false,
        attributes: { title: 'Settings' }
      });

      // Load initial data
      if (initialData?.html) {
        editorInstance.setComponents(initialData.html);
        if (initialData.css) {
          editorInstance.setStyle(initialData.css);
        }
      } else {
        editorInstance.setComponents(`
          <div class="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
            <div class="text-center text-white">
              <h1 class="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Sua Landing Page
              </h1>
              <p class="text-xl mb-8 text-gray-300">Comece a criar algo incrível!</p>
              <button class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg transform hover:scale-105 transition duration-300 shadow-lg">
                Call to Action
              </button>
            </div>
          </div>
        `);
      }

      setEditor(editorInstance);
      setIsLoading(false);
    }

    return () => {
      if (editorInstance) {
        editorInstance.destroy();
        editorInstance = null;
      }
    };
  }, [initialData, onSave, onBack]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Carregando Editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-gray-900">
      <div className="editor-row h-full flex">
        <div className="gjs-column-m flex-1">
          <div ref={editorContainerRef} className="h-full" />
        </div>
        
        <div className="gjs-column-r w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="layers-container flex-1 p-4">
            <h3 className="text-white text-lg font-semibold mb-4">Layers</h3>
            <div id="layers"></div>
          </div>
          
          <div className="styles-container flex-1 p-4 border-t border-gray-700">
            <h3 className="text-white text-lg font-semibold mb-4">Styles</h3>
            <div id="styles"></div>
          </div>
          
          <div className="traits-container flex-1 p-4 border-t border-gray-700">
            <h3 className="text-white text-lg font-semibold mb-4">Settings</h3>
            <div id="traits"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrapesJsEditor;

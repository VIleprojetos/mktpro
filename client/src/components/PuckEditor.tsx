import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Eye, Code, Loader2, Plus, Move, Trash2, Edit3, Copy, Undo, Redo, Settings, Layout, Type, Image, Square, Sparkles, MousePointer } from 'lucide-react';

// --- Helper Component for Style Isolation using Shadow DOM ---
const ShadowContent: React.FC<{ htmlContent: string }> = ({ htmlContent }) => {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hostRef.current) {
      if (!hostRef.current.shadowRoot) {
        hostRef.current.attachShadow({ mode: 'open' });
      }
      hostRef.current.shadowRoot!.innerHTML = htmlContent;
    }
  }, [htmlContent]);

  return <div ref={hostRef} style={{ width: '100%', height: '100%' }}></div>;
};


export interface Data {
  html?: string;
  css?: string;
  components?: any;
  styles?: any;
  [key: string]: any;
}

interface PuckEditorProps {
  initialData?: Data;
  onSave: (data: Data) => void;
  onBack?: () => void;
}

interface EditorComponent {
  id: string;
  type: string;
  content: string;
  styles: Record<string, string>;
  props?: Record<string, any>;
  children?: string[];
}

interface HistoryState {
  components: EditorComponent[];
  timestamp: number;
}

const COMPONENT_TYPES = {
  rawHtml: { // Special component type for full-page HTML
    label: 'HTML Bruto',
    icon: Code,
    category: 'advanced'
  },
  text: {
    label: 'Texto',
    icon: Type,
    category: 'content',
    defaultContent: '<p style="color: #e2e8f0;">Clique para editar este texto</p>',
    defaultStyles: { padding: '16px', fontSize: '16px' }
  },
  heading: {
    label: 'Título',
    icon: Type,
    category: 'content',
    defaultContent: '<h1 style="color: #f8fafc;">Título Principal</h1>',
    defaultStyles: { padding: '16px', fontSize: '32px', fontWeight: 'bold' }
  },
  button: {
    label: 'Botão',
    icon: MousePointer,
    category: 'interactive',
    defaultContent: 'Clique Aqui',
    defaultStyles: { padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }
  },
  image: {
    label: 'Imagem',
    icon: Image,
    category: 'media',
    defaultContent: 'https://placehold.co/400x200/1f2937/e2e8f0?text=Sua+Imagem',
    defaultStyles: { width: '100%', maxWidth: '400px', height: 'auto' }
  },
};

const COMPONENT_CATEGORIES = {
  content: 'Conteúdo',
  interactive: 'Interativo',
  media: 'Mídia',
  advanced: 'Avançado'
};

export function PuckEditor({ initialData, onSave, onBack }: PuckEditorProps) {
  const [components, setComponents] = useState<EditorComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingContent, setEditingContent] = useState<string>('');
  const [showContentEditor, setShowContentEditor] = useState(false);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showCode, setShowCode] = useState(false);
  const [zoom, setZoom] = useState(100);

  const saveToHistory = useCallback((newComponents: EditorComponent[]) => {
    const newState = { components: JSON.parse(JSON.stringify(newComponents)), timestamp: Date.now() };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  useEffect(() => {
    setIsLoading(true);
    let initialComponents: EditorComponent[] = [];

    // [CORREÇÃO] A lógica agora prioriza tratar o HTML como um bloco único e isolado.
    if (initialData?.html) {
      initialComponents = [{
        id: `raw_html_${Date.now()}`,
        type: 'rawHtml',
        content: initialData.html,
        styles: { width: '100%', minHeight: '100vh', background: '#FFF' }, // Canvas branco para o iframe
      }];
    } else if (initialData?.components && Array.isArray(initialData.components) && initialData.components.length > 0) {
      initialComponents = initialData.components as EditorComponent[];
    } else {
      initialComponents = [{
        id: `text_${Date.now()}`,
        type: 'text',
        content: COMPONENT_TYPES.text.defaultContent,
        styles: COMPONENT_TYPES.text.defaultStyles,
      }];
    }
    
    setComponents(initialComponents);
    setHistory([{ components: JSON.parse(JSON.stringify(initialComponents)), timestamp: Date.now() }]);
    setHistoryIndex(0);
    setIsLoading(false);
  }, [initialData]);

  const updateComponent = (id: string, updates: Partial<EditorComponent>) => {
    const newComponents = components.map(comp => comp.id === id ? { ...comp, ...updates } : comp);
    setComponents(newComponents);
    saveToHistory(newComponents);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let finalHtml = '';
      if (components.length === 1 && components[0].type === 'rawHtml') {
        finalHtml = components[0].content;
      } else {
        // Fallback para montagem de componentes individuais
        finalHtml = components.map(c => `<div style="${Object.entries(c.styles).map(([k,v]) => `${k}:${v}`).join(';')}">${c.content}</div>`).join('\n');
      }

      const data: Data = { html: finalHtml, components: components };
      await onSave(data);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const generateCode = () => {
     if (components.length === 1 && components[0].type === 'rawHtml') {
        return components[0].content;
     }
     return 'Gere o código a partir de componentes individuais aqui.';
  }

  const openContentEditor = (component: EditorComponent) => {
    setEditingContent(component.content);
    setSelectedComponent(component.id);
    setShowContentEditor(true);
  };

  const saveContentEdit = () => {
    if (selectedComponent) {
      updateComponent(selectedComponent, { content: editingContent });
    }
    setShowContentEditor(false);
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen bg-gray-900"><Loader2 className="h-8 w-8 animate-spin text-blue-400" /></div>;

  return (
    <div className="flex flex-col h-screen w-full bg-gray-950 text-gray-200">
      <header className="flex items-center justify-between p-4 border-b bg-gray-900 border-gray-700">
        <div className="flex items-center gap-4">
            {onBack && <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Button>}
            <h1 className="text-xl font-semibold">Editor Visual</h1>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowCode(!showCode)}><Code className="h-4 w-4 mr-2" />Código</Button>
            <Button variant="outline" size="sm" onClick={handleSave}><Eye className="h-4 w-4 mr-2" />Preview</Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Salvar
            </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col">
            <div className="p-3 border-b border-gray-700"><h3 className="font-medium">Componentes</h3></div>
            {/* A sidebar de componentes pode ser desabilitada se estivermos no modo rawHtml */}
            {!(components.length === 1 && components[0].type === 'rawHtml') && (
               <div className="flex-1 overflow-auto p-2 space-y-1">
                 {Object.entries(COMPONENT_TYPES).map(([type, config]) => (
                    <Button key={type} variant="ghost" size="sm" className="w-full justify-start">{config.label}</Button>
                 ))}
               </div>
            )}
        </div>

        <div className="flex-1 flex flex-col bg-gray-800">
          <div className="flex-1 overflow-auto p-8" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}>
            <div className="max-w-full mx-auto bg-white min-h-full shadow-lg rounded-lg">
              {components.map((component) => (
                <div key={component.id} className={`relative group ${selectedComponent === component.id ? 'ring-2 ring-blue-500' : ''}`} onClick={() => setSelectedComponent(component.id)}>
                  
                  {/* Os controles só aparecem para o componente de HTML bruto */}
                  {component.type === 'rawHtml' && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 p-1 flex gap-1">
                       <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); openContentEditor(component); }} title="Editar HTML" className="w-8 h-8 text-white bg-blue-600 hover:bg-blue-700"><Edit3 className="h-4 w-4" /></Button>
                    </div>
                  )}

                  {component.type === 'rawHtml' ? (
                    <ShadowContent htmlContent={component.content} />
                  ) : (
                    <div style={component.styles} dangerouslySetInnerHTML={{ __html: component.content }} />
                  )}

                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
          <div className="p-3 border-b border-gray-700"><h3 className="font-medium">Propriedades</h3></div>
          <div className="flex-1 overflow-auto p-3">
            {!selectedComponent && <div className="text-center py-12 text-gray-500"><Settings className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>Selecione um componente</p></div>}
          </div>
        </div>
      </div>

      {showContentEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-[80vw] h-[80vh] flex flex-col border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Editar Conteúdo HTML</h3>
            <div className="flex-1 min-h-0">
              <textarea className="w-full h-full p-3 font-mono text-sm bg-gray-900 border-gray-600 text-gray-200" value={editingContent} onChange={(e) => setEditingContent(e.target.value)} />
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={saveContentEdit}><Save className="h-4 w-4 mr-2" />Salvar Alterações</Button>
              <Button variant="outline" onClick={() => setShowContentEditor(false)}>Cancelar</Button>
            </div>
          </div>
        </div>
      )}
      
      {showCode && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
           <div className="bg-gray-800 rounded-lg p-6 w-[80vw] h-[80vh] flex flex-col border border-gray-700">
             <h3 className="text-lg font-semibold mb-4">Código Gerado</h3>
             <pre className="bg-gray-900 p-4 rounded-lg text-sm overflow-auto h-full flex-1"><code className="text-yellow-300">{generateCode()}</code></pre>
             <Button variant="outline" onClick={() => setShowCode(false)} className="mt-4">Fechar</Button>
           </div>
        </div>
      )}
    </div>
  );
}

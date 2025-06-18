import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Eye, Code, Loader2, Plus, Move, Trash2, Edit3, Copy, Undo, Redo, Settings, Layout, Type, Image, Square, Sparkles, MousePointer } from 'lucide-react';

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
  text: {
    label: 'Texto',
    icon: Type,
    category: 'content',
    defaultContent: 'Clique para editar este texto',
    defaultStyles: {
      padding: '16px',
      fontSize: '16px',
      lineHeight: '1.6',
      color: '#e2e8f0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }
  },
  heading: {
    label: 'Título',
    icon: Type,
    category: 'content',
    defaultContent: 'Título Principal',
    defaultStyles: {
      padding: '16px',
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#f8fafc',
      lineHeight: '1.2',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }
  },
  button: {
    label: 'Botão',
    icon: MousePointer,
    category: 'interactive',
    defaultContent: 'Clique Aqui',
    defaultStyles: {
      padding: '12px 24px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'inline-block',
      textAlign: 'center',
      textDecoration: 'none',
      transition: 'all 0.2s ease'
    }
  },
  image: {
    label: 'Imagem',
    icon: Image,
    category: 'media',
    defaultContent: 'https://placehold.co/400x200/1f2937/e2e8f0?text=Sua+Imagem',
    defaultStyles: {
      width: '100%',
      maxWidth: '400px',
      height: 'auto',
      borderRadius: '8px',
      objectFit: 'cover'
    }
  },
  container: {
    label: 'Container',
    icon: Square,
    category: 'layout',
    defaultContent: '',
    defaultStyles: {
      padding: '24px',
      margin: '16px 0',
      border: '2px dashed #4a5568',
      borderRadius: '8px',
      minHeight: '100px',
      backgroundColor: '#1f2937',
      position: 'relative'
    }
  },
  hero: {
    label: 'Seção Hero',
    icon: Sparkles,
    category: 'sections',
    defaultContent: `
      <div style="text-align: center; color: white;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem; font-weight: bold;">Título Impactante</h1>
        <p style="font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9;">Subtítulo que explica seu valor</p>
        <button style="background: white; color: #4338ca; padding: 16px 32px; border: none; border-radius: 8px; font-size: 1.1rem; font-weight: bold; cursor: pointer;">Call to Action</button>
      </div>
    `,
    defaultStyles: {
      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
      padding: '80px 20px',
      textAlign: 'center',
      minHeight: '400px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }
  },
  card: {
    label: 'Card',
    icon: Layout,
    category: 'layout',
    defaultContent: `
      <h3 style="margin: 0 0 12px 0; color: #f1f5f9; font-size: 1.5rem; font-weight: 600;">Título do Card</h3>
      <p style="margin: 0; color: #9ca3af; line-height: 1.6;">Descrição do card.</p>
    `,
    defaultStyles: {
      border: '1px solid #374151',
      borderRadius: '12px',
      padding: '24px',
      margin: '16px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.4)',
      backgroundColor: '#1f2937'
    }
  },
  spacer: {
    label: 'Espaçador',
    icon: Layout,
    category: 'layout',
    defaultContent: '',
    defaultStyles: {
      height: '50px',
      backgroundColor: 'transparent'
    }
  }
};

const COMPONENT_CATEGORIES = {
  content: 'Conteúdo',
  layout: 'Layout',
  media: 'Mídia',
  interactive: 'Interativo',
  sections: 'Seções'
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
    const newState: HistoryState = {
      components: JSON.parse(JSON.stringify(newComponents)),
      timestamp: Date.now()
    };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setComponents(prevState.components);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setComponents(nextState.components);
      setHistoryIndex(historyIndex + 1);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    if (initialData?.components && Array.isArray(initialData.components) && initialData.components.length > 0) {
        const loadedComponents = initialData.components as EditorComponent[];
        setComponents(loadedComponents);
        saveToHistory(loadedComponents);
    } else if (initialData?.html) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = initialData.html;
        const parsedComponents: EditorComponent[] = [];
        let componentIndex = 0;
        const body = tempDiv.querySelector('body') || tempDiv;

        Array.from(body.children).forEach((element) => {
            if (!(element instanceof HTMLElement)) return;

            const styles: Record<string, string> = {};
            for (let i = 0; i < element.style.length; i++) {
                const property = element.style[i];
                styles[property] = element.style.getPropertyValue(property);
            }
            
            let type = 'container';
            const tagName = element.tagName.toLowerCase();
            if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span'].includes(tagName)) type = 'text';
            else if (tagName === 'img') type = 'image';
            else if (tagName === 'button') type = 'button';

            parsedComponents.push({
                id: `comp_${componentIndex++}`,
                type,
                content: element.innerHTML,
                styles,
            });
        });
        
        setComponents(parsedComponents);
        saveToHistory(parsedComponents);
    } else {
        const defaultComponents = [{
            id: 'hero_1',
            type: 'hero',
            content: COMPONENT_TYPES.hero.defaultContent,
            styles: COMPONENT_TYPES.hero.defaultStyles
        }];
        setComponents(defaultComponents);
        saveToHistory(defaultComponents);
    }
    setIsLoading(false);
  }, [initialData, saveToHistory]);

  const addComponent = (type: keyof typeof COMPONENT_TYPES) => {
    const componentType = COMPONENT_TYPES[type];
    const newComponent: EditorComponent = {
      id: `${type}_${Date.now()}`,
      type,
      content: componentType.defaultContent,
      styles: { ...componentType.defaultStyles }
    };
    const newComponents = [...components, newComponent];
    setComponents(newComponents);
    setSelectedComponent(newComponent.id);
    saveToHistory(newComponents);
  };

  const updateComponent = (id: string, updates: Partial<EditorComponent>) => {
    const newComponents = components.map(comp =>
      comp.id === id ? { ...comp, ...updates } : comp
    );
    setComponents(newComponents);
    saveToHistory(newComponents);
  };

  const duplicateComponent = (id: string) => {
    const component = components.find(c => c.id === id);
    if (component) {
      const newComponent = { ...component, id: `${component.type}_${Date.now()}` };
      const index = components.findIndex(c => c.id === id);
      const newComponents = [...components.slice(0, index + 1), newComponent, ...components.slice(index + 1)];
      setComponents(newComponents);
      setSelectedComponent(newComponent.id);
      saveToHistory(newComponents);
    }
  };

  const deleteComponent = (id: string) => {
    const newComponents = components.filter(comp => comp.id !== id);
    setComponents(newComponents);
    if (selectedComponent === id) setSelectedComponent(null);
    saveToHistory(newComponents);
  };

  const moveComponent = (id: string, direction: 'up' | 'down') => {
    const index = components.findIndex(comp => comp.id === id);
    if (index === -1) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= components.length) return;
    const newComponents = [...components];
    [newComponents[index], newComponents[newIndex]] = [newComponents[newIndex], newComponents[index]];
    setComponents(newComponents);
    saveToHistory(newComponents);
  };

  const generateHtmlFromComponents = () => {
    let html = '';
    components.forEach(component => {
      const styleString = Object.entries(component.styles)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}:${value}`)
        .join('; ');

      const elementTag = component.styles.display === 'flex' || component.styles.display === 'grid' ? 'div' : 'div';
      html += `<${elementTag} id="${component.id}" style="${styleString}">${component.content}</${elementTag}>\n`;
    });
    return html;
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const data: Data = {
        html: generateHtmlFromComponents(),
        css: '',
        components: components,
        styles: {}
      };
      await onSave(data);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Preview</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
          <style> body { margin: 0; padding: 0; } * { box-sizing: border-box; } </style>
        </head>
        <body>${generateHtmlFromComponents()}</body>
      </html>
    `;
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(fullHtml);
      newWindow.document.close();
    }
  };

  const openContentEditor = (component: EditorComponent) => {
    setEditingContent(component.content);
    setShowContentEditor(true);
  };

  const saveContentEdit = () => {
    if (selectedComponent) {
      updateComponent(selectedComponent, { content: editingContent });
    }
    setShowContentEditor(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-gray-950 text-gray-200">
      <header className="flex items-center justify-between p-4 border-b bg-gray-900 border-gray-700">
        <div className="flex items-center gap-4">
          {onBack && <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-300 hover:bg-gray-700 hover:text-white"><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Button>}
          <h1 className="text-xl font-semibold text-gray-100">Editor Visual</h1>
          <div className="flex items-center gap-2 ml-4">
            <Button variant="ghost" size="sm" onClick={undo} disabled={historyIndex <= 0} title="Desfazer" className="text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50"><Undo className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1} title="Refazer" className="text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50"><Redo className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="px-2 py-1 border rounded text-sm bg-gray-800 border-gray-600 text-gray-200">
            <option value={50}>50%</option><option value={75}>75%</option><option value={100}>100%</option><option value={125}>125%</option><option value={150}>150%</option>
          </select>
          <Button variant="outline" size="sm" onClick={() => setShowCode(!showCode)} className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"><Code className="h-4 w-4 mr-2" />Código</Button>
          <Button variant="outline" size="sm" onClick={handlePreview} className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"><Eye className="h-4 w-4 mr-2" />Preview</Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</> : <><Save className="h-4 w-4 mr-2" />Salvar</>}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col">
          <div className="p-3 border-b border-gray-700"><h3 className="font-medium mb-3 text-gray-100">Componentes</h3>
            <div className="flex flex-wrap gap-1">
              <button className={`px-2 py-1 text-xs rounded ${activeCategory === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`} onClick={() => setActiveCategory('all')}>Todos</button>
              {Object.entries(COMPONENT_CATEGORIES).map(([key, label]) => (
                <button key={key} className={`px-2 py-1 text-xs rounded ${activeCategory === key ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`} onClick={() => setActiveCategory(key)}>{label}</button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-1">
            {Object.entries(COMPONENT_TYPES).filter(([_, config]) => activeCategory === 'all' || config.category === activeCategory).map(([type, config]) => (
              <Button key={type} variant="ghost" size="sm" className="w-full justify-start text-gray-300 hover:bg-gray-700 hover:text-white" onClick={() => addComponent(type as keyof typeof COMPONENT_TYPES)}><config.icon className="h-4 w-4 mr-2" />{config.label}</Button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-gray-950">
          <div className="flex-1 overflow-auto p-8" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}>
            <div className="max-w-4xl mx-auto bg-gray-800 min-h-full shadow-lg rounded-lg overflow-hidden ring-1 ring-gray-700">
              {components.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-gray-500 text-center"><Plus className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Adicione componentes para começar</p></div>
              ) : (
                <div className="relative">
                  {components.map((component, index) => (
                    <div key={component.id} className={`relative group ${selectedComponent === component.id ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900' : ''}`} onClick={() => setSelectedComponent(component.id)}>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-gray-800 border border-gray-600 rounded-lg shadow-lg p-1 flex gap-1">
                        <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); openContentEditor(component); }} title="Editar conteúdo" className="w-6 h-6 text-gray-300 hover:bg-gray-700"><Edit3 className="h-3 w-3" /></Button>
                        <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); duplicateComponent(component.id); }} title="Duplicar" className="w-6 h-6 text-gray-300 hover:bg-gray-700"><Copy className="h-3 w-3" /></Button>
                        <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); moveComponent(component.id, 'up'); }} disabled={index === 0} title="Mover para cima" className="w-6 h-6 text-gray-300 hover:bg-gray-700 disabled:opacity-30"><Move className="h-3 w-3 rotate-[-90deg]" /></Button>
                        <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); moveComponent(component.id, 'down'); }} disabled={index === components.length - 1} title="Mover para baixo" className="w-6 h-6 text-gray-300 hover:bg-gray-700 disabled:opacity-30"><Move className="h-3 w-3 rotate-90" /></Button>
                        <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); deleteComponent(component.id); }} title="Excluir" className="w-6 h-6 text-red-400 hover:bg-red-900/50 hover:text-red-300"><Trash2 className="h-3 w-3" /></Button>
                      </div>
                      <div style={component.styles} dangerouslySetInnerHTML={{ __html: component.content }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
          <div className="p-3 border-b border-gray-700"><h3 className="font-medium text-gray-100">Propriedades</h3></div>
          <div className="flex-1 overflow-auto p-3">
            {selectedComponent ? (
              (() => {
                const component = components.find(c => c.id === selectedComponent);
                if (!component) return null;
                return (
                  <div className="space-y-6">
                    <div className="p-3 bg-gray-800 rounded-lg"><label className="text-sm font-medium text-gray-300">Tipo</label><p className="text-sm text-blue-400 mt-1">{COMPONENT_TYPES[component.type as keyof typeof COMPONENT_TYPES]?.label}</p></div>
                    <div className="space-y-3"><h4 className="font-medium text-sm text-gray-300 border-b border-gray-700 pb-2">Estilos</h4>
                      {Object.entries(component.styles).map(([key, value]) => (
                        <div key={key}>
                          <label className="text-xs font-medium text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                          <input type="text" className="w-full mt-1 px-2 py-1 border rounded text-sm bg-gray-700 border-gray-600 text-gray-200" value={value} onChange={(e) => updateComponent(component.id, { styles: { ...component.styles, [key]: e.target.value } })} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="text-center py-12 text-gray-500"><Settings className="h-12 w-12 mx-auto mb-4 opacity-30" /><p className="text-sm">Selecione um componente para editar</p></div>
            )}
          </div>
        </div>
      </div>

      {showContentEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-[600px] max-w-full max-h-[80vh] flex flex-col border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-100">Editar Conteúdo</h3>
            <div className="flex-1 min-h-0"><textarea className="w-full h-full p-3 border rounded-lg resize-none font-mono text-sm bg-gray-900 border-gray-600 text-gray-200" value={editingContent} onChange={(e) => setEditingContent(e.target.value)} /></div>
            <div className="flex gap-2 mt-4">
              <Button onClick={saveContentEdit} className="bg-blue-600 hover:bg-blue-700 text-white"><Save className="h-4 w-4 mr-2" />Salvar</Button>
              <Button variant="outline" onClick={() => setShowContentEditor(false)} className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">Cancelar</Button>
            </div>
          </div>
        </div>
      )}

      {showCode && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-[800px] max-w-full max-h-[80vh] flex flex-col border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-100">Código HTML Gerado</h3>
              <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(generateHtmlFromComponents())} className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"><Copy className="h-4 w-4 mr-2" />Copiar</Button>
            </div>
            <div className="flex-1 min-h-0"><pre className="bg-gray-900 p-4 rounded-lg text-sm overflow-auto h-full border border-gray-700"><code className="text-yellow-300">{generateHtmlFromComponents()}</code></pre></div>
            <div className="flex gap-2 mt-4"><Button variant="outline" onClick={() => setShowCode(false)} className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">Fechar</Button></div>
          </div>
        </div>
      )}
    </div>
  );
}

export function usePageBuilder() {
  const [data, setData] = useState<Data | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveData = async (newData: Data) => {
    setIsLoading(true); setError(null);
    try {
      setData(newData);
    } catch (err) {
      setError('Erro ao salvar os dados');
    } finally {
      setIsLoading(false);
    }
  };

  const loadData = (): Data | undefined => data || undefined;

  const exportData = () => {
    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'page-data.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const importData = (file: File): Promise<Data> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const loadedData = JSON.parse(e.target?.result as string);
          setData(loadedData);
          resolve(loadedData);
        } catch (err) {
          reject(new Error('Arquivo inválido'));
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  };

  return { data, isLoading, error, saveData, loadData, exportData, importData };
}

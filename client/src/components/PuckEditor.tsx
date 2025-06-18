import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Eye, Code, Loader2, Plus, Move, Trash2, Edit3, Copy, Undo, Redo, Settings, Layout, Type, Image, Square, Sparkles, MousePointer } from 'lucide-react';

// Interface compatible with your Data type
export interface Data {
  html?: string;
  css?: string;
  components?: any;
  styles?: any;
  [key: string]: any;
}

// Interface for the editor component props
interface PuckEditorProps {
  initialData?: Data;
  onSave: (data: Data) => void;
  onBack?: () => void;
}

// Component interface for the visual editor
interface EditorComponent {
  id: string;
  type: string;
  content: string;
  styles: Record<string, string>;
  props?: Record<string, any>;
  children?: string[];
}

// History interface for undo/redo
interface HistoryState {
  components: EditorComponent[];
  timestamp: number;
}

// Available component types with enhanced options
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
      color: '#333333',
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
      color: '#1a202c',
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
    defaultContent: 'https://via.placeholder.com/400x200/e2e8f0/64748b?text=Sua+Imagem',
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
      border: '2px dashed #e2e8f0',
      borderRadius: '8px',
      minHeight: '100px',
      backgroundColor: '#f8f9fa',
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
        <button style="background: white; color: #667eea; padding: 16px 32px; border: none; border-radius: 8px; font-size: 1.1rem; font-weight: bold; cursor: pointer; transition: transform 0.2s;">Call to Action</button>
      </div>
    `,
    defaultStyles: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
      <h3 style="margin: 0 0 12px 0; color: #1a202c; font-size: 1.5rem; font-weight: 600;">Título do Card</h3>
      <p style="margin: 0; color: #4a5568; line-height: 1.6;">Descrição do card. Você pode editar este conteúdo para adicionar mais informações.</p>
    `,
    defaultStyles: {
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '24px',
      margin: '16px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      backgroundColor: 'white',
      transition: 'transform 0.2s, box-shadow 0.2s'
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
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showCode, setShowCode] = useState(false);
  const [zoom, setZoom] = useState(100);

  // Save to history
  const saveToHistory = useCallback((newComponents: EditorComponent[]) => {
    const newState: HistoryState = {
      components: JSON.parse(JSON.stringify(newComponents)),
      timestamp: Date.now()
    };
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    
    // Keep only last 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Undo function
  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setComponents(prevState.components);
      setHistoryIndex(historyIndex - 1);
    }
  };

  // Redo function
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setComponents(nextState.components);
      setHistoryIndex(historyIndex + 1);
    }
  };

  useEffect(() => {
    // Initialize with initial data or empty state
    if (initialData?.html) {
      // Try to parse existing HTML into components (simplified)
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = initialData.html;
      
      const parsedComponents: EditorComponent[] = [];
      let componentIndex = 0;
      
      Array.from(tempDiv.children).forEach((element) => {
        const componentId = `comp_${componentIndex++}`;
        const styles: Record<string, string> = {};
        
        // Extract inline styles
        if (element instanceof HTMLElement && element.style) {
          for (let i = 0; i < element.style.length; i++) {
            const property = element.style[i];
            styles[property] = element.style.getPropertyValue(property);
          }
        }
        
        parsedComponents.push({
          id: componentId,
          type: element.tagName.toLowerCase() === 'h1' || element.tagName.toLowerCase() === 'h2' ? 'heading' : 'text',
          content: element.innerHTML,
          styles: styles
        });
      });
      
      setComponents(parsedComponents);
      saveToHistory(parsedComponents);
    } else {
      // Start with a default hero section
      const defaultComponents = [
        {
          id: 'hero_1',
          type: 'hero',
          content: COMPONENT_TYPES.hero.defaultContent,
          styles: COMPONENT_TYPES.hero.defaultStyles
        }
      ];
      setComponents(defaultComponents);
      saveToHistory(defaultComponents);
    }
    
    setIsLoading(false);
  }, [initialData]);

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
      const newComponent = {
        ...component,
        id: `${component.type}_${Date.now()}`
      };
      const index = components.findIndex(c => c.id === id);
      const newComponents = [
        ...components.slice(0, index + 1),
        newComponent,
        ...components.slice(index + 1)
      ];
      setComponents(newComponents);
      setSelectedComponent(newComponent.id);
      saveToHistory(newComponents);
    }
  };

  const deleteComponent = (id: string) => {
    const newComponents = components.filter(comp => comp.id !== id);
    setComponents(newComponents);
    if (selectedComponent === id) {
      setSelectedComponent(null);
    }
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Generate HTML and CSS from components
      let html = '';
      let css = `
        body { 
          margin: 0; 
          padding: 0; 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
        }
        * { 
          box-sizing: border-box; 
        }
        .hover-effect:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.15);
        }
        .button-hover:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
      `;
      
      components.forEach(component => {
        const styleString = Object.entries(component.styles)
          .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
          .join('; ');
        
        if (component.type === 'image') {
          html += `<img id="${component.id}" src="${component.content}" style="${styleString}" alt="Image" class="hover-effect" />`;
        } else if (component.type === 'button') {
          html += `<button id="${component.id}" style="${styleString}" class="button-hover">${component.content}</button>`;
        } else if (component.type === 'spacer') {
          html += `<div id="${component.id}" style="${styleString}"></div>`;
        } else {
          const tag = component.type === 'heading' ? 'h1' : 'div';
          const className = component.type === 'card' ? 'hover-effect' : '';
          html += `<${tag} id="${component.id}" style="${styleString}" class="${className}">${component.content}</${tag}>`;
        }
      });
      
      const data: Data = {
        html,
        css,
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
    let html = '';
    
    components.forEach(component => {
      const styleString = Object.entries(component.styles)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
        .join('; ');
      
      if (component.type === 'image') {
        html += `<img src="${component.content}" style="${styleString}" alt="Image" class="hover-effect" />`;
      } else if (component.type === 'button') {
        html += `<button style="${styleString}" class="button-hover" onclick="alert('Button clicked!')">${component.content}</button>`;
      } else if (component.type === 'spacer') {
        html += `<div style="${styleString}"></div>`;
      } else {
        const tag = component.type === 'heading' ? 'h1' : 'div';
        const className = component.type === 'card' ? 'hover-effect' : '';
        html += `<${tag} style="${styleString}" class="${className}">${component.content}</${tag}>`;
      }
    });
    
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Preview</title>
          <style>
            body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            * { box-sizing: border-box; }
            .hover-effect { transition: all 0.3s ease; }
            .hover-effect:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0,0,0,0.15); }
            .button-hover { transition: all 0.2s ease; }
            .button-hover:hover { transform: scale(1.05); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
          </style>
        </head>
        <body>${html}</body>
      </html>
    `;
    
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(fullHtml);
      newWindow.document.close();
    }
  };

  const generateCode = () => {
    let html = '';
    
    components.forEach(component => {
      const styleString = Object.entries(component.styles)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
        .join('; ');
      
      if (component.type === 'image') {
        html += `<img src="${component.content}" style="${styleString}" alt="Image" />\n`;
      } else if (component.type === 'button') {
        html += `<button style="${styleString}">${component.content}</button>\n`;
      } else if (component.type === 'spacer') {
        html += `<div style="${styleString}"></div>\n`;
      } else {
        const tag = component.type === 'heading' ? 'h1' : 'div';
        html += `<${tag} style="${styleString}">${component.content}</${tag}>\n`;
      }
    });
    
    return html;
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

  const filteredComponents = Object.entries(COMPONENT_TYPES).filter(([type, config]) => 
    activeCategory === 'all' || config.category === activeCategory
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Carregando editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50">
      {/* Enhanced Header */}
      <header className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          )}
          <h1 className="text-xl font-semibold">Editor Visual</h1>
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={historyIndex <= 0}
              title="Desfazer"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              title="Refazer"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value={50}>50%</option>
            <option value={75}>75%</option>
            <option value={100}>100%</option>
            <option value={125}>125%</option>
            <option value={150}>150%</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCode(!showCode)}
          >
            <Code className="h-4 w-4 mr-2" />
            Código
          </Button>
          <Button variant="outline" size="sm" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Enhanced Left sidebar - Components */}
        <div className="w-64 bg-white border-r flex flex-col shadow-sm">
          <div className="p-3 border-b">
            <h3 className="font-medium mb-3">Componentes</h3>
            <div className="flex flex-wrap gap-1">
              <button
                className={`px-2 py-1 text-xs rounded ${activeCategory === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
                onClick={() => setActiveCategory('all')}
              >
                Todos
              </button>
              {Object.entries(COMPONENT_CATEGORIES).map(([key, label]) => (
                <button
                  key={key}
                  className={`px-2 py-1 text-xs rounded ${activeCategory === key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
                  onClick={() => setActiveCategory(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-1">
            {filteredComponents.map(([type, config]) => {
              const IconComponent = config.icon;
              return (
                <Button
                  key={type}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start hover:bg-blue-50"
                  onClick={() => addComponent(type as keyof typeof COMPONENT_TYPES)}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {config.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Main canvas area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-auto p-4" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}>
            <div className="max-w-4xl mx-auto bg-white min-h-full shadow-lg rounded-lg overflow-hidden">
              {components.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Adicione componentes para começar a construir sua página</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {components.map((component, index) => (
                    <div
                      key={component.id}
                      className={`relative group ${
                        selectedComponent === component.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                      }`}
                      onClick={() => setSelectedComponent(component.id)}
                    >
                      {/* Enhanced Component Controls */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white border rounded-lg shadow-lg p-1 flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            openContentEditor(component);
                          }}
                          title="Editar conteúdo"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateComponent(component.id);
                          }}
                          title="Duplicar"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveComponent(component.id, 'up');
                          }}
                          disabled={index === 0}
                          title="Mover para cima"
                        >
                          ↑
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveComponent(component.id, 'down');
                          }}
                          disabled={index === components.length - 1}
                          title="Mover para baixo"
                        >
                          ↓
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteComponent(component.id);
                          }}
                          title="Excluir"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Component Render */}
                      <div style={component.styles}>
                        {component.type === 'image' ? (
                          <img 
                            src={component.content} 
                            alt="Component" 
                            style={{ width: '100%', height: 'auto' }}
                          />
                        ) : component.type === 'button' ? (
                          <button style={{ all: 'inherit' }}>
                            {component.content}
                          </button>
                        ) : component.type === 'spacer' ? (
                          <div style={{ 
                            border: selectedComponent === component.id ? '1px dashed #3b82f6' : 'none',
                            backgroundColor: selectedComponent === component.id ? '#f0f9ff' : 'transparent'
                          }} />
                        ) : (
                          <div dangerouslySetInnerHTML={{ __html: component.content }} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Right sidebar - Properties */}
        <div className="w-80 bg-white border-l flex flex-col shadow-sm">
          <div className="p-3 border-b">
            <h3 className="font-medium">Propriedades</h3>
          </div>
          <div className="flex-1 overflow-auto p-3">
            {selectedComponent ? (
              <div className="space-y-4">
                {(() => {
                  const component = components.find(c => c.id === selectedComponent);
                  if (!component) return null;
                  
                  return (
                    <div className="space-y-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <label className="text-sm font-medium text-gray-700">Tipo de Componente</label>
                        <p className="text-sm text-gray-600 mt-1">
                          {COMPONENT_TYPES[component.type as keyof typeof COMPONENT_TYPES]?.label}
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-gray-700 border-b pb-2">Layout</h4>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs font-medium text-gray-600">Padding</label>
                            <input
                              type="text"
                              className="w-full mt-1 px-2 py-1 border rounded text-sm"
                              value={component.styles.padding || ''}
                              onChange={(e) => updateComponent(component.id, {
                                styles: { ...component.styles, padding: e.target.value }
                              })}
                              placeholder="16px"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600">Margin</label>
                            <input
                              type="text"
                              className="w-full mt-1 px-2 py-1 border rounded text-sm"
                              value={component.styles.margin || ''}
                              onChange={(e) => updateComponent(component.id, {
                                styles: { ...component.styles, margin: e.target.value }
                              })}
                              placeholder="16px"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-gray-600">Border Radius</label>
                          <input
                            type="text"
                            className="w-full mt-1 px-2 py-1 border rounded text-sm"
                            value={component.styles.borderRadius || ''}
                            onChange={(e) => updateComponent(component.id, {
                              styles: { ...component.styles, borderRadius: e.target.value }
                            })}
                            placeholder="8px"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-gray-700 border-b pb-2">Aparência</h4>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs font-medium text-gray-600">Cor de Fundo</label>
                            <div className="flex gap-2 mt-1">
                              <input
                                type="color"
                                className="w-8 h-8 border rounded cursor-pointer"
                                value={component.styles.backgroundColor || '#ffffff'}
                                onChange={(e) => updateComponent(component.id, {
                                  styles: { ...component.styles, backgroundColor: e.target.value }
                                })}
                              />
                              <input
                                type="text"
                                className="flex-1 px-2 py-1 border rounded text-sm"
                                value={component.styles.backgroundColor || ''}
                                onChange={(e) => updateComponent(component.id, {
                                  styles: { ...component.styles, backgroundColor: e.target.value }
                                })}
                                placeholder="#ffffff"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600">Cor do Texto</label>
                            <div className="flex gap-2 mt-1">
                              <input
                                type="color"
                                className="w-8 h-8 border rounded cursor-pointer"
                                value={component.styles.color || '#000000'}
                                onChange={(e) => updateComponent(component.id, {
                                  styles: { ...component.styles, color: e.target.value }
                                })}
                              />
                              <input
                                type="text"
                                className="flex-1 px-2 py-1 border rounded text-sm"
                                value={component.styles.color || ''}
                                onChange={(e) => updateComponent(component.id, {
                                  styles: { ...component.styles, color: e.target.value }
                                })}
                                placeholder="#000000"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-gray-600">Border</label>
                          <input
                            type="text"
                            className="w-full mt-1 px-2 py-1 border rounded text-sm"
                            value={component.styles.border || ''}
                            onChange={(e) => updateComponent(component.id, {
                              styles: { ...component.styles, border: e.target.value }
                            })}
                            placeholder="1px solid #e2e8f0"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-gray-600">Box Shadow</label>
                          <select
                            className="w-full mt-1 px-2 py-1 border rounded text-sm"
                            value={component.styles.boxShadow || 'none'}
                            onChange={(e) => updateComponent(component.id, {
                              styles: { ...component.styles, boxShadow: e.target.value }
                            })}
                          >
                            <option value="none">Nenhuma</option>
                            <option value="0 1px 3px rgba(0,0,0,0.1)">Pequena</option>
                            <option value="0 4px 6px rgba(0,0,0,0.1)">Média</option>
                            <option value="0 10px 15px rgba(0,0,0,0.1)">Grande</option>
                            <option value="0 20px 25px rgba(0,0,0,0.15)">Extra Grande</option>
                          </select>
                        </div>
                      </div>

                      {(component.type === 'text' || component.type === 'heading' || component.type === 'button') && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm text-gray-700 border-b pb-2">Tipografia</h4>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs font-medium text-gray-600">Tamanho da Fonte</label>
                              <input
                                type="text"
                                className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                value={component.styles.fontSize || ''}
                                onChange={(e) => updateComponent(component.id, {
                                  styles: { ...component.styles, fontSize: e.target.value }
                                })}
                                placeholder="16px"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-600">Peso da Fonte</label>
                              <select
                                className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                value={component.styles.fontWeight || 'normal'}
                                onChange={(e) => updateComponent(component.id, {
                                  styles: { ...component.styles, fontWeight: e.target.value }
                                })}
                              >
                                <option value="normal">Normal</option>
                                <option value="bold">Negrito</option>
                                <option value="lighter">Mais Leve</option>
                                <option value="bolder">Mais Pesado</option>
                                <option value="100">100</option>
                                <option value="200">200</option>
                                <option value="300">300</option>
                                <option value="400">400</option>
                                <option value="500">500</option>
                                <option value="600">600</option>
                                <option value="700">700</option>
                                <option value="800">800</option>
                                <option value="900">900</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-medium text-gray-600">Alinhamento</label>
                            <select
                              className="w-full mt-1 px-2 py-1 border rounded text-sm"
                              value={component.styles.textAlign || 'left'}
                              onChange={(e) => updateComponent(component.id, {
                                styles: { ...component.styles, textAlign: e.target.value }
                              })}
                            >
                              <option value="left">Esquerda</option>
                              <option value="center">Centro</option>
                              <option value="right">Direita</option>
                              <option value="justify">Justificado</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-xs font-medium text-gray-600">Altura da Linha</label>
                            <input
                              type="text"
                              className="w-full mt-1 px-2 py-1 border rounded text-sm"
                              value={component.styles.lineHeight || ''}
                              onChange={(e) => updateComponent(component.id, {
                                styles: { ...component.styles, lineHeight: e.target.value }
                              })}
                              placeholder="1.6"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-medium text-gray-600">Família da Fonte</label>
                            <select
                              className="w-full mt-1 px-2 py-1 border rounded text-sm"
                              value={component.styles.fontFamily || 'inherit'}
                              onChange={(e) => updateComponent(component.id, {
                                styles: { ...component.styles, fontFamily: e.target.value }
                              })}
                            >
                              <option value="inherit">Padrão</option>
                              <option value="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">Sistema</option>
                              <option value="Georgia, serif">Georgia</option>
                              <option value="'Times New Roman', serif">Times New Roman</option>
                              <option value="Arial, sans-serif">Arial</option>
                              <option value="Helvetica, sans-serif">Helvetica</option>
                              <option value="'Courier New', monospace">Courier New</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {component.type === 'image' && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm text-gray-700 border-b pb-2">Imagem</h4>
                          
                          <div>
                            <label className="text-xs font-medium text-gray-600">URL da Imagem</label>
                            <input
                              type="text"
                              className="w-full mt-1 px-2 py-1 border rounded text-sm"
                              value={component.content}
                              onChange={(e) => updateComponent(component.id, { content: e.target.value })}
                              placeholder="https://exemplo.com/imagem.jpg"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs font-medium text-gray-600">Largura</label>
                              <input
                                type="text"
                                className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                value={component.styles.width || ''}
                                onChange={(e) => updateComponent(component.id, {
                                  styles: { ...component.styles, width: e.target.value }
                                })}
                                placeholder="100%"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-600">Altura</label>
                              <input
                                type="text"
                                className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                value={component.styles.height || ''}
                                onChange={(e) => updateComponent(component.id, {
                                  styles: { ...component.styles, height: e.target.value }
                                })}
                                placeholder="auto"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-medium text-gray-600">Ajuste do Objeto</label>
                            <select
                              className="w-full mt-1 px-2 py-1 border rounded text-sm"
                              value={component.styles.objectFit || 'cover'}
                              onChange={(e) => updateComponent(component.id, {
                                styles: { ...component.styles, objectFit: e.target.value }
                              })}
                            >
                              <option value="cover">Cobrir</option>
                              <option value="contain">Conter</option>
                              <option value="fill">Preencher</option>
                              <option value="none">Nenhum</option>
                              <option value="scale-down">Reduzir</option>
                            </select>
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-gray-700 border-b pb-2">Posicionamento</h4>
                        
                        <div>
                          <label className="text-xs font-medium text-gray-600">Display</label>
                          <select
                            className="w-full mt-1 px-2 py-1 border rounded text-sm"
                            value={component.styles.display || 'block'}
                            onChange={(e) => updateComponent(component.id, {
                              styles: { ...component.styles, display: e.target.value }
                            })}
                          >
                            <option value="block">Block</option>
                            <option value="inline">Inline</option>
                            <option value="inline-block">Inline Block</option>
                            <option value="flex">Flex</option>
                            <option value="grid">Grid</option>
                            <option value="none">None</option>
                          </select>
                        </div>

                        {component.styles.display === 'flex' && (
                          <>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs font-medium text-gray-600">Justify Content</label>
                                <select
                                  className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                  value={component.styles.justifyContent || 'flex-start'}
                                  onChange={(e) => updateComponent(component.id, {
                                    styles: { ...component.styles, justifyContent: e.target.value }
                                  })}
                                >
                                  <option value="flex-start">Start</option>
                                  <option value="center">Center</option>
                                  <option value="flex-end">End</option>
                                  <option value="space-between">Space Between</option>
                                  <option value="space-around">Space Around</option>
                                  <option value="space-evenly">Space Evenly</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-600">Align Items</label>
                                <select
                                  className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                  value={component.styles.alignItems || 'stretch'}
                                  onChange={(e) => updateComponent(component.id, {
                                    styles: { ...component.styles, alignItems: e.target.value }
                                  })}
                                >
                                  <option value="stretch">Stretch</option>
                                  <option value="flex-start">Start</option>
                                  <option value="center">Center</option>
                                  <option value="flex-end">End</option>
                                  <option value="baseline">Baseline</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-600">Flex Direction</label>
                              <select
                                className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                value={component.styles.flexDirection || 'row'}
                                onChange={(e) => updateComponent(component.id, {
                                  styles: { ...component.styles, flexDirection: e.target.value }
                                })}
                              >
                                <option value="row">Row</option>
                                <option value="column">Column</option>
                                <option value="row-reverse">Row Reverse</option>
                                <option value="column-reverse">Column Reverse</option>
                              </select>
                            </div>
                          </>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs font-medium text-gray-600">Largura Mínima</label>
                            <input
                              type="text"
                              className="w-full mt-1 px-2 py-1 border rounded text-sm"
                              value={component.styles.minWidth || ''}
                              onChange={(e) => updateComponent(component.id, {
                                styles: { ...component.styles, minWidth: e.target.value }
                              })}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600">Altura Mínima</label>
                            <input
                              type="text"
                              className="w-full mt-1 px-2 py-1 border rounded text-sm"
                              value={component.styles.minHeight || ''}
                              onChange={(e) => updateComponent(component.id, {
                                styles: { ...component.styles, minHeight: e.target.value }
                              })}
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-gray-700 border-b pb-2">Efeitos</h4>
                        
                        <div>
                          <label className="text-xs font-medium text-gray-600">Opacidade</label>
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              className="flex-1"
                              value={component.styles.opacity || '1'}
                              onChange={(e) => updateComponent(component.id, {
                                styles: { ...component.styles, opacity: e.target.value }
                              })}
                            />
                            <span className="text-xs text-gray-500 w-8">
                              {Math.round((parseFloat(component.styles.opacity || '1') * 100))}%
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-gray-600">Transform</label>
                          <input
                            type="text"
                            className="w-full mt-1 px-2 py-1 border rounded text-sm"
                            value={component.styles.transform || ''}
                            onChange={(e) => updateComponent(component.id, {
                              styles: { ...component.styles, transform: e.target.value }
                            })}
                            placeholder="rotate(0deg) scale(1)"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-gray-600">Transição</label>
                          <select
                            className="w-full mt-1 px-2 py-1 border rounded text-sm"
                            value={component.styles.transition || 'none'}
                            onChange={(e) => updateComponent(component.id, {
                              styles: { ...component.styles, transition: e.target.value }
                            })}
                          >
                            <option value="none">Nenhuma</option>
                            <option value="all 0.2s ease">Rápida (0.2s)</option>
                            <option value="all 0.3s ease">Normal (0.3s)</option>
                            <option value="all 0.5s ease">Lenta (0.5s)</option>
                            <option value="all 0.8s ease">Muito Lenta (0.8s)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-sm">Selecione um componente para editar suas propriedades</p>
                <p className="text-xs mt-1 opacity-75">Clique em qualquer elemento na tela para começar</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Editor Modal */}
      {showContentEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[600px] max-w-full max-h-[80vh] flex flex-col">
            <h3 className="text-lg font-semibold mb-4">Editar Conteúdo</h3>
            <div className="flex-1 min-h-0">
              <textarea
                className="w-full h-48 p-3 border rounded-lg resize-none font-mono text-sm"
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                placeholder="Digite o conteúdo... (HTML é suportado)"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={saveContentEdit}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button variant="outline" onClick={() => setShowContentEditor(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Code View Modal */}
      {showCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[800px] max-w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Código HTML Gerado</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(generateCode());
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
            <div className="flex-1 min-h-0">
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto h-full border">
                <code>{generateCode()}</code>
              </pre>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowCode(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced hook for managing page builder data
export function usePageBuilder() {
  const [data, setData] = useState<Data | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveData = async (newData: Data) => {
    setIsLoading(true);
    setError(null);
    try {
      setData(newData);
      console.log('Dados salvos:', newData);
      // Here you could add API calls to save to a backend
    } catch (err) {
      setError('Erro ao salvar os dados');
      console.error('Erro ao salvar:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadData = (): Data | undefined => {
    return data || undefined;
  };

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
          const data = JSON.parse(e.target?.result as string);
          setData(data);
          resolve(data);
        } catch (err) {
          reject(new Error('Arquivo inválido'));
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  };

  return {
    data,
    isLoading,
    error,
    saveData,
    loadData,
    exportData,
    importData,
  };
}

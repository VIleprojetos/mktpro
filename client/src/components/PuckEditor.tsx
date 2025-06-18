import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Eye, Code, Loader2, Plus, Move, Trash2, Edit3 } from 'lucide-react';

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
}

// Available component types
const COMPONENT_TYPES = {
  text: {
    label: 'Texto',
    icon: '📝',
    defaultContent: 'Clique para editar este texto',
    defaultStyles: {
      padding: '16px',
      fontSize: '16px',
      lineHeight: '1.6',
      color: '#333333'
    }
  },
  heading: {
    label: 'Título',
    icon: '📰',
    defaultContent: 'Título Principal',
    defaultStyles: {
      padding: '16px',
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#1a202c',
      lineHeight: '1.2'
    }
  },
  button: {
    label: 'Botão',
    icon: '🔘',
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
      textDecoration: 'none'
    }
  },
  image: {
    label: 'Imagem',
    icon: '🖼️',
    defaultContent: 'https://via.placeholder.com/400x200/e2e8f0/64748b?text=Sua+Imagem',
    defaultStyles: {
      width: '100%',
      maxWidth: '400px',
      height: 'auto',
      borderRadius: '8px'
    }
  },
  container: {
    label: 'Container',
    icon: '📦',
    defaultContent: '',
    defaultStyles: {
      padding: '24px',
      margin: '16px 0',
      border: '2px dashed #e2e8f0',
      borderRadius: '8px',
      minHeight: '100px',
      backgroundColor: '#f8f9fa'
    }
  },
  hero: {
    label: 'Seção Hero',
    icon: '🌟',
    defaultContent: `
      <div style="text-align: center; color: white;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem; font-weight: bold;">Título Impactante</h1>
        <p style="font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9;">Subtítulo que explica seu valor</p>
        <button style="background: white; color: #667eea; padding: 16px 32px; border: none; border-radius: 8px; font-size: 1.1rem; font-weight: bold; cursor: pointer;">Call to Action</button>
      </div>
    `,
    defaultStyles: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '80px 20px',
      textAlign: 'center',
      minHeight: '400px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  },
  card: {
    label: 'Card',
    icon: '🃏',
    defaultContent: `
      <h3 style="margin: 0 0 12px 0; color: #1a202c; font-size: 1.5rem;">Título do Card</h3>
      <p style="margin: 0; color: #4a5568; line-height: 1.6;">Descrição do card. Você pode editar este conteúdo.</p>
    `,
    defaultStyles: {
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '24px',
      margin: '16px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      backgroundColor: 'white'
    }
  }
};

export function PuckEditor({ initialData, onSave, onBack }: PuckEditorProps) {
  const [components, setComponents] = useState<EditorComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingContent, setEditingContent] = useState<string>('');
  const [showContentEditor, setShowContentEditor] = useState(false);

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
    } else {
      // Start with a default hero section
      setComponents([
        {
          id: 'hero_1',
          type: 'hero',
          content: COMPONENT_TYPES.hero.defaultContent,
          styles: COMPONENT_TYPES.hero.defaultStyles
        }
      ]);
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
    
    setComponents(prev => [...prev, newComponent]);
    setSelectedComponent(newComponent.id);
  };

  const updateComponent = (id: string, updates: Partial<EditorComponent>) => {
    setComponents(prev =>
      prev.map(comp =>
        comp.id === id ? { ...comp, ...updates } : comp
      )
    );
  };

  const deleteComponent = (id: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== id));
    if (selectedComponent === id) {
      setSelectedComponent(null);
    }
  };

  const moveComponent = (id: string, direction: 'up' | 'down') => {
    setComponents(prev => {
      const index = prev.findIndex(comp => comp.id === id);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newComponents = [...prev];
      [newComponents[index], newComponents[newIndex]] = [newComponents[newIndex], newComponents[index]];
      return newComponents;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Generate HTML and CSS from components
      let html = '';
      let css = '';
      
      components.forEach(component => {
        const styleString = Object.entries(component.styles)
          .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
          .join('; ');
        
        if (component.type === 'image') {
          html += `<img id="${component.id}" src="${component.content}" style="${styleString}" alt="Image" />`;
        } else if (component.type === 'button') {
          html += `<button id="${component.id}" style="${styleString}">${component.content}</button>`;
        } else {
          const tag = component.type === 'heading' ? 'h1' : 'div';
          html += `<${tag} id="${component.id}" style="${styleString}">${component.content}</${tag}>`;
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
        html += `<img src="${component.content}" style="${styleString}" alt="Image" />`;
      } else if (component.type === 'button') {
        html += `<button style="${styleString}">${component.content}</button>`;
      } else {
        const tag = component.type === 'heading' ? 'h1' : 'div';
        html += `<${tag} style="${styleString}">${component.content}</${tag}>`;
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
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Carregando editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          )}
          <h1 className="text-xl font-semibold">Editor Visual</h1>
        </div>
        <div className="flex items-center gap-2">
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
        {/* Left sidebar - Components */}
        <div className="w-64 bg-muted/30 border-r flex flex-col">
          <div className="p-3 border-b bg-background">
            <h3 className="font-medium">Componentes</h3>
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-2">
            {Object.entries(COMPONENT_TYPES).map(([type, config]) => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => addComponent(type as keyof typeof COMPONENT_TYPES)}
              >
                <span className="mr-2">{config.icon}</span>
                {config.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Main canvas area */}
        <div className="flex-1 flex flex-col bg-gray-100">
          <div className="flex-1 overflow-auto p-4">
            <div className="max-w-4xl mx-auto bg-white min-h-full shadow-lg">
              {components.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Adicione componentes para começar a construir sua página</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {components.map((component, index) => (
                    <div
                      key={component.id}
                      className={`relative group ${
                        selectedComponent === component.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedComponent(component.id)}
                    >
                      {/* Component Controls */}
                      <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white border rounded shadow-sm p-1 flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            openContentEditor(component);
                          }}
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveComponent(component.id, 'up');
                          }}
                          disabled={index === 0}
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

        {/* Right sidebar - Properties */}
        <div className="w-64 bg-muted/30 border-l flex flex-col">
          <div className="p-3 border-b bg-background">
            <h3 className="font-medium">Propriedades</h3>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {selectedComponent ? (
              <div className="space-y-4">
                {(() => {
                  const component = components.find(c => c.id === selectedComponent);
                  if (!component) return null;
                  
                  return (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Tipo</label>
                        <p className="text-sm text-muted-foreground">
                          {COMPONENT_TYPES[component.type as keyof typeof COMPONENT_TYPES]?.label}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Padding</label>
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
                        <label className="text-sm font-medium">Cor de Fundo</label>
                        <input
                          type="color"
                          className="w-full mt-1 h-8 border rounded"
                          value={component.styles.backgroundColor || '#ffffff'}
                          onChange={(e) => updateComponent(component.id, {
                            styles: { ...component.styles, backgroundColor: e.target.value }
                          })}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Cor do Texto</label>
                        <input
                          type="color"
                          className="w-full mt-1 h-8 border rounded"
                          value={component.styles.color || '#000000'}
                          onChange={(e) => updateComponent(component.id, {
                            styles: { ...component.styles, color: e.target.value }
                          })}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Tamanho da Fonte</label>
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
                        <label className="text-sm font-medium">Alinhamento</label>
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
                        </select>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Selecione um componente para editar suas propriedades</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Editor Modal */}
      {showContentEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full">
            <h3 className="text-lg font-semibold mb-4">Editar Conteúdo</h3>
            <textarea
              className="w-full h-32 p-2 border rounded resize-none"
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              placeholder="Digite o conteúdo..."
            />
            <div className="flex gap-2 mt-4">
              <Button onClick={saveContentEdit}>
                Salvar
              </Button>
              <Button variant="outline" onClick={() => setShowContentEditor(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for managing page builder data
export function usePageBuilder() {
  const [data, setData] = useState<Data | null>(null);

  const saveData = (newData: Data) => {
    setData(newData);
    console.log('Dados salvos:', newData);
  };

  const loadData = (): Data | undefined => {
    return data || undefined;
  };

  return {
    data,
    saveData,
    loadData,
  };
}

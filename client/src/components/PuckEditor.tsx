import { Puck, type Config, type Data } from "@puckeditor/core";
import { Puck as PuckReact } from "@puckeditor/react";
import "@puckeditor/core/index.css";

// Define os componentes que poderão ser usados dentro do editor
// Para começar, vamos criar alguns componentes simples de exemplo.
const config: Config = {
  components: {
    HeadingBlock: {
      fields: {
        text: { type: "text" },
        level: {
          type: "number",
          label: "Nível (1-6)",
          min: 1,
          max: 6,
        },
      },
      defaultProps: {
        text: "Cabeçalho",
        level: 1,
      },
      render: ({ level, text }) => {
        const Tag = `h${level}` as keyof JSX.IntrinsicElements;
        return <Tag style={{ padding: "10px" }}>{text}</Tag>;
      },
    },
    TextBlock: {
      fields: {
        text: { type: "textarea" },
      },
      defaultProps: {
        text: "Este é um bloco de texto. Você pode editar este conteúdo.",
      },
      render: ({ text }) => {
        return <p style={{ padding: "10px" }}>{text}</p>;
      },
    },
    Card: {
      fields: {
        title: { type: "text" },
        description: { type: "textarea" },
      },
      defaultProps: {
        title: "Título do Card",
        description: "Descrição do card",
      },
      render: ({ title, description }) => (
        <div style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "20px", margin: "10px" }}>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      ),
    },
  },
};

// Interface para as propriedades do nosso componente
interface PuckEditorProps {
  initialData?: Data;
  onSave: (data: Data) => void;
}

// O componente do editor
export function PuckEditor({ initialData, onSave }: PuckEditorProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
      <header style={{ 
        padding: '12px', 
        borderBottom: '1px solid #e2e8f0', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: '#fff'
      }}>
        <span style={{ fontWeight: 600, color: '#000' }}>Editor de Landing Page</span>
        <button
          onClick={() => {
            // Acessa os dados atuais do editor e chama a função onSave
            const currentData = puck.getData();
            onSave(currentData);
          }}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Salvar
        </button>
      </header>
      <div style={{ flexGrow: 1 }}>
        <PuckReact config={config} data={initialData} onPublish={onSave} />
      </div>
    </div>
  );
}

// Exporta a instância do Puck para podermos acessar seus dados de fora
export const puck = new Puck();

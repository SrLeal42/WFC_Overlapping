import { useState } from 'react';

import * as C from './constants/Constants';

import { DrawingCanvas } from './components/DrawingCanvas';
import { BabylonScene } from './components/BabylonScene'

import { BuildWFCModel } from './wfc/PatternBuilder';

function App() {
  const [inputGrid, setInputGrid] = useState<C.ColorGrid | null>(null);
  
  const HandlePatternBuilder = () => {

    if (!inputGrid) {
      alert("Por favor, desenhe algo antes de gerar o modelo!");
      return;
    }

    console.log("--- INICIANDO BUILDER ---");
    
    // 2. Chama a função que criamos
    // O N=3 é o padrão, mas você pode passar 2 ou 4 se quiser testar
    const model = BuildWFCModel(inputGrid, 3);

    // 3. Mostra o resultado no console para validarmos
    console.log("MODELO GERADO COM SUCESSO:");
    console.log("Padrões Únicos encontrados:", model.patterns.length);
    console.log("Objeto Completo:", model);
    console.log("Regras de Adjacência:", model.rules);
    console.log("-------------------------");
  };

  return (
    <div style={{ display: 'flex', gap: '50px', padding: '20px' }}>
      
      {/* Lado Esquerdo: O Input */}
      <div>
        <h2>1. Desenhe aqui</h2>
        <DrawingCanvas 
          onGridChange={(grid) => {
            setInputGrid(grid);
            // console.log("Matriz atualizada:", grid); 
          }} 
        />
        
        <div style={{ marginTop: '20px' }}>
            <button 
                onClick={HandlePatternBuilder}
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px'
                }}
            > 
              GERAR REGRAS (Console)
            </button>
        </div>

      </div>

      {/* Lado Direito: Debug (só pra ver se funcionou) */}
      <div>
        <h2>2. Dados (Debug)</h2>
        <p>Abra o console do navegador (F12) para ver a matriz gerada.</p>
        <BabylonScene />
      </div>

    </div>
  );
}

export default App;
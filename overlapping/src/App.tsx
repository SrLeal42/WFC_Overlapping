import { useState } from 'react';

import * as C from './constants/Constants';

import { DrawingCanvas } from './components/DrawingCanvas';
// import { BabylonScene } from './components/BabylonScene'

function App() {
  const [wfcInput, setWfcInput] = useState<C.ColorGrid | null>(null);

  return (
    <div style={{ display: 'flex', gap: '50px', padding: '20px' }}>
      
      {/* Lado Esquerdo: O Input */}
      <div>
        <h2>1. Desenhe aqui</h2>
        <DrawingCanvas 
          onGridChange={(grid) => {
            // Essa função roda toda vez que você solta o mouse
            setWfcInput([...grid]); // O ... cria uma cópia para o React detectar mudança
            console.log("Matriz atualizada:", grid); 
          }} 
        />
      </div>

      {/* Lado Direito: Debug (só pra ver se funcionou) */}
      <div>
        <h2>2. Dados (Debug)</h2>
        <p>Abra o console do navegador (F12) para ver a matriz gerada.</p>
        <div style={{ fontFamily: 'monospace', fontSize: '10px', whiteSpace: 'pre' }}>
            {wfcInput ? "Matriz carregada na memória!" : "Desenhe algo..."}
        </div>
      </div>

    </div>
  );
}

export default App;
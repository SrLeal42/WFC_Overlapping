// import { useState } from 'react';

// import * as C from './constants/Constants';

import { DrawingCanvas } from './components/DrawingCanvas';
import { BabylonScene } from './components/BabylonScene'

function App() {

  return (
    <div style={{ display: 'flex', gap: '50px', padding: '20px' }}>
      
      {/* Lado Esquerdo: O Input */}
      <div>
        <h2>1. Desenhe aqui</h2>
        <DrawingCanvas 
          onGridChange={(grid) => {
            console.log("Matriz atualizada:", grid); 
          }} 
        />
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
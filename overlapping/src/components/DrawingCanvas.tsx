import React, { useRef, useState, useEffect } from 'react';

import styles from "../styles/Drawing.module.css";

import * as C from '../constants/Constants';



interface Props {
  // Função que vamos chamar toda vez que o desenho mudar
  // para avisar o "Pai" (App.tsx) que tem dados novos
  onGridChange: (grid: C.ColorGrid) => void;
}

export const DrawingCanvas: React.FC<Props> = ({ onGridChange }) => {
  // REFERÊNCIAS
  // O useRef guarda valores que não precisam fazer a tela renderizar de novo quando mudam
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Aqui guardamos os dados "puros" da grade na memória
  // Criamos um Array de 20 linhas, onde cada linha é um Array de 20 cores brancas
  const gridDataRef = useRef<C.ColorGrid>(
    Array(C.DRAW_GRID_SIZE).fill(null).map(() => Array(C.DRAW_GRID_SIZE).fill(C.DEFAULT_COLOR))
  );

  // ESTADOS
  // isDrawing: Verdadeiro se o mouse estiver clicado e arrastando
  const [isDrawing, setIsDrawing] = useState(false);
  // Cor atual selecionada (começa com preto)
  const [selectedColor, setSelectedColor] = useState<string>(C.ALL_COLORS[0]);

  // EFEITO INICIAL
  // Roda uma vez quando o componente nasce para pintar o fundo de branco
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Pinta tudo de branco inicialmente
    ctx.fillStyle = C.DEFAULT_COLOR;
    ctx.fillRect(0, 0, C.DRAW_CANVAS_SIZE, C.DRAW_CANVAS_SIZE);
    
    // Avisa o pai do estado inicial
    onGridChange(gridDataRef.current);
  }, []);

  // --- A LÓGICA DE DESENHO ---
  
  const PaintPixel = (mouseX: number, mouseY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Descobrir em qual coordenada da grade (0-19) estamos
    // getBoundingClientRect pega a posição exata do canvas na tela do navegador
    const rect = canvas.getBoundingClientRect();
    
    // Matemática: (Posição Mouse - Onde começa o canvas) / Tamanho do bloquinho
    const x = Math.floor((mouseX - rect.left) / C.DRAW_PIXEL_SCALE);
    const y = Math.floor((mouseY - rect.top) / C.DRAW_PIXEL_SCALE);

    // Verificação de segurança: Estamos dentro do limite 20x20?
    if (x >= 0 && x < C.DRAW_GRID_SIZE && y >= 0 && y < C.DRAW_GRID_SIZE) {
      
      // 2. Atualizar a MEMÓRIA (Nossa matriz)
      gridDataRef.current[y][x] = selectedColor;

      // 3. Atualizar o VISUAL (O Canvas)
      ctx.fillStyle = selectedColor;
      // fillRect(posicaoX, posicaoY, largura, altura)
      ctx.fillRect(x * C.DRAW_PIXEL_SCALE, y * C.DRAW_PIXEL_SCALE, C.DRAW_PIXEL_SCALE, C.DRAW_PIXEL_SCALE);
    }
  };

  // --- EVENTOS DO MOUSE ---

  const HandleMouseDown = (e: React.MouseEvent) => {
    setIsDrawing(true); // Começou a clicar
    PaintPixel(e.clientX, e.clientY); // Pinta o primeiro pixel
  };

  const HandleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return; // Se não estiver segurando o clique, não faz nada
    PaintPixel(e.clientX, e.clientY); // Pinta enquanto arrasta
  };

  const HandleMouseUp = () => {
    // Agora que o usuário terminou o traço, avisamos o componente Pai
    if (isDrawing) onGridChange(gridDataRef.current);

    setIsDrawing(false); // Soltou o clique
    
  };

  return (
    <div className={styles.containerDrawing} >

      <div className={styles.containerColorButtons}>
        {C.ALL_COLORS.map(color => (
          <button
            key={color}
            onClick={() => setSelectedColor(color)}
            className={styles.buttonColor}
            style={{
                backgroundColor: color,
                border: selectedColor === color ? '3px solid gold' : '1px solid gray',
            }}
          />
        ))}
      </div>

      <canvas
        ref={canvasRef}
        width={C.DRAW_CANVAS_SIZE}
        height={C.DRAW_CANVAS_SIZE}
        onMouseDown={HandleMouseDown}
        onMouseMove={HandleMouseMove}
        onMouseUp={HandleMouseUp}
        onMouseLeave={HandleMouseUp} // Se o mouse sair do canvas, para de desenhar
        className={styles.canvasDrawing}
      />

    </div>
  );


  
};
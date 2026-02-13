import React, { useRef, useState, useEffect, useCallback } from 'react';

import styles from "../styles/Drawing.module.css";

import * as C from '../constants/Constants';
import * as DrawUtils from '../drawing/DrawingUtils';
import * as Painter from '../drawing/CanvasPainter';

// ICONS
import ClearToolIcon from '../assets/react.svg?react';


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
  const gridDataRef = useRef<C.ColorGrid>(DrawUtils.CreateEmptyGrid());

  // ESTADOS
  // isDrawing: Verdadeiro se o mouse estiver clicado e arrastando
  const [isDrawing, setIsDrawing] = useState(false);
  // Cor atual selecionada (começa com preto)
  const [selectedColor, setSelectedColor] = useState<string>(C.ALL_COLORS[0]);

  const [currentTool, setCurrentTool] = useState<C.ToolType>('pencil');

  // --- SISTEMA DE HISTÓRICO ---
  // Começamos com um histórico contendo a grade vazia
  const [history, setHistory] = useState<C.ColorGrid[]>([DrawUtils.CreateEmptyGrid()]);
  const [historyStep, setHistoryStep] = useState(0);

  const getContext = () => canvasRef.current?.getContext('2d');

  const SaveToHistory = () => {
    const newHistory = history.slice(0, historyStep + 1);
    
    const currentGridState = DrawUtils.CloneGrid(gridDataRef.current);
    
    newHistory.push(currentGridState);
    
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
    
    onGridChange(currentGridState);
  };


  // --- EVENT HANDLERS ---
  const HandleFloodFill = (x: number, y: number) => {
      const ctx = getContext();
      if (!ctx) return;
      
      // Chama a função externa para fazer o trabalho sujo
      Painter.FloodFill(ctx, gridDataRef.current, x, y, selectedColor);
      
      // Só salva no histórico, pois o Painter já atualizou o visual e a ref
      SaveToHistory();
  };



  // --- EVENTOS DO MOUSE ---
const HandleMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const coords = DrawUtils.GetMouseCoords(e, canvasRef.current);
    
    if (!coords) return;

    if (currentTool === 'bucket') {
      HandleFloodFill(coords.x, coords.y);
    } else {
      setIsDrawing(true);
      // Pinta o primeiro pixel
      const ctx = getContext();
      if (ctx) {
          gridDataRef.current[coords.y][coords.x] = selectedColor;
          Painter.PaintPixel(ctx, coords.x, coords.y, selectedColor);
      }
    }
  };

  const HandleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || currentTool === 'bucket' || !canvasRef.current) return;
    
    const coords = DrawUtils.GetMouseCoords(e, canvasRef.current);
    const ctx = getContext();

    if(coords && ctx) {
        gridDataRef.current[coords.y][coords.x] = selectedColor;
        Painter.PaintPixel(ctx, coords.x, coords.y, selectedColor);
    }
  };

  const HandleMouseUp = () => {
    // Agora que o usuário terminou o traço, avisamos o componente Pai
    if (isDrawing) SaveToHistory();

    setIsDrawing(false); // Soltou o clique
    
  };


  const HandleClearDraw = () => {
    const ctx = getContext();
    if (!ctx) return;

    gridDataRef.current = DrawUtils.CreateEmptyGrid();
    
    // Usa o Painter para limpar visualmente (ou redesenhar a grid vazia)
    Painter.RedrawCanvas(ctx, gridDataRef.current);
    
    SaveToHistory();
  }

  // --- FUNÇÃO: UNDO (Desfazer) ---
  const HandleUndo = useCallback(() => {
    if (historyStep === 0) return;

    const previousStep = historyStep - 1;
    const previousGrid = history[previousStep];

    // Atualiza Referência Lógica
    gridDataRef.current = DrawUtils.CloneGrid(previousGrid);
    
    // Atualiza Visual (Delega para o Painter)
    const ctx = getContext();
    if (ctx) Painter.RedrawCanvas(ctx, previousGrid);

    setHistoryStep(previousStep);
    onGridChange(previousGrid);
  }, [historyStep, history, onGridChange]);




  // Inicialização
  useEffect(() => {
    const ctx = getContext();
    if (ctx) {
        // Pinta fundo inicial
        Painter.RedrawCanvas(ctx, gridDataRef.current);
        onGridChange(gridDataRef.current);
    }
  }, []);

  // Atalho Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        HandleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [HandleUndo]);




  return (
    <div 
      className={styles.containerDrawing} 
      style={{cursor: currentTool === 'bucket' ? 'cell' : 'crosshair'}}
      >

      <div className={styles.containerToolsButtons} >
 
        <button
          onClick={HandleClearDraw}
          className={styles.buttonTool}
        >
        <ClearToolIcon className={styles.iconTool}/>
        </button>
        
        <button 
          onClick={HandleUndo} 
          className={styles.buttonTool} 
          title="Desfazer (Ctrl+Z)"
          disabled={historyStep === 0} // Desabilita se não tiver o que desfazer
          style={{ opacity: historyStep === 0 ? 0.5 : 1 }}
        >
          ↩️
        </button>

        <button 
            onClick={() => setCurrentTool('pencil')} 
            className={styles.buttonTool}
            style={{ border: currentTool === 'pencil' ? '2px solid gold' : '1px solid gray' }}
        >
            ✏️
        </button>
        
        <button 
            onClick={() => setCurrentTool('bucket')} 
            className={styles.buttonTool}
            style={{ border: currentTool === 'bucket' ? '2px solid gold' : '1px solid gray' }}
        >
            🪣
        </button>

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


    </div>
  );


  
};
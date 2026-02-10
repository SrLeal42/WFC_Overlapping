import { Cell } from "./Cell";

import { MinHeap } from "./MinHeap";
import { type WFCModelData } from "../interfaces/WFCModelData";
import { type Rules } from "../interfaces/Rules";

export class WFCSolver {
    private grid: Cell[][];
    private width: number;
    private height: number;
    private model: WFCModelData;
    
    private heap: MinHeap<Cell>;

    // Stack para propagação (coordenadas x, y)
    private propagationStack: { x: number, y: number }[] = [];

    constructor(grid: Cell[][], model: WFCModelData) {
        this.grid = grid;
        this.height = grid.length;
        this.width = grid[0].length;
        this.model = model;

        this.heap = new MinHeap<Cell>((a, b) => a.totalEntropy - b.totalEntropy);
        this.InitializeHeap();
    }

    private InitializeHeap() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.heap.push(this.grid[y][x]);
            }
        }
    }


    public Step(): boolean {
        
        const cell = this.FindLowestEntropyCell();
        
        if (!cell) return true;

        cell.Collapse(this.model.weights);
        
        this.Propagate(cell);

        return false;
    }


    private FindLowestEntropyCell(): Cell | null {
        // Loop "preguiçoso": Tira itens da heap até achar um válido não colapsado
        while (this.heap.size() > 0) {
            const cell = this.heap.pop();
            
            // Se a célula já colapsou, ignoramos (era uma "duplicata" antiga na heap)
            if (cell && !cell.collapsed) {
                return cell;
            }
        }
        return null;
    }

    
    private Propagate(startCell: Cell) {
    
        this.propagationStack = [{ x: startCell.x, y: startCell.y }];

        const neighbors = [
            { dx: 0, dy: 1, dir: 'up' },    // Vizinho de Cima
            { dx: 0, dy: -1, dir: 'down' }, // Vizinho de Baixo
            { dx: -1, dy: 0, dir: 'left' }, // Vizinho da Esquerda
            { dx: 1, dy: 0, dir: 'right' }  // Vizinho da Direita
        ];

        while (this.propagationStack.length > 0) {
    
    
            const currentCoords = this.propagationStack.pop()!;
            const cx = currentCoords.x;
            const cy = currentCoords.y;
            const currentCell = this.grid[cy][cx];

            /*
               NOTA SOBRE DIREÇÃO: 
               Se estamos olhando o vizinho da DIREITA (dx=1),
               a regra que aplica é: "O que o currentCell permite à sua DIREITA?"
            */

            for (const n of neighbors) {
                const nx = cx + n.dx;
                const ny = cy + n.dy;

                
                if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                    const neighborCell = this.grid[ny][nx];

                    if (!neighborCell.collapsed) {
                        
                        const allowedNeighborTiles = new Set<number>();

                        for (const tileId of currentCell.possibleTiles) {
                            const rules = this.model.rules[tileId];
                            
                            const allowedInDir = rules[n.dir as keyof Rules]; 
                            
                            for (const allowedId of allowedInDir) {
                                allowedNeighborTiles.add(allowedId);
                            }
                        }

                        const changed = neighborCell.Constrain(allowedNeighborTiles);

                        if (changed) {
                            this.propagationStack.push({ x: nx, y: ny });
                            this.heap.push(neighborCell);
                            // Se vizinho mudou, atualizamos o visual (opcional aqui, pode ser no loop principal)
                            // neighborCell.updateVisuals(this.model.patterns);
                        }
                    }
                }
            }
    
        }
    
    }




}
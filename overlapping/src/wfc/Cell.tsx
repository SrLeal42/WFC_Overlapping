import * as B from "@babylonjs/core"; 

import * as C from '../constants/Constants';

import { type Pattern } from "../constants/types/PatternBuilder.type";

// import { AffinitiesNumeric } from "../interfaces/AffinitiesNumeric";
// import { WFCChange, WFCChangeNumeric } from "../interfaces/WFCState";


// import { ChooseWeightedRandomBy, CollapsedNeighbors, Direction } from "../Utilities";

export class Cell {
    
    public thinIndex: number; // Posição no Array de Thin Instances

    public x: number;
    public y: number;

    public possibleTilesStart: Set<number>;
    public possibleTiles: Set<number>;
    public collapsed: boolean;
    public chosenTile: number | null;
    
    public entropyNoise: number;

    public currentColor: B.Color4;

    constructor(
        thinIndex: number,
        x: number,
        y: number,
        totalNumTiles: number,
    ) {


        this.thinIndex = thinIndex;
        this.x = x;
        this.y = y;

        const allPossibleNumericIDs = new Set<number>();
        for (let i = 0; i < totalNumTiles; i++) {
            allPossibleNumericIDs.add(i);
        }

        this.possibleTilesStart = new Set(allPossibleNumericIDs);
        this.possibleTiles = new Set(allPossibleNumericIDs);

        this.collapsed = false;
        this.chosenTile = null;

        const defColor = B.Color3.FromHexString(C.DEFAULT_COLOR);
        this.currentColor = new B.Color4(defColor.r, defColor.g, defColor.b, 1);

        this.entropyNoise = Math.random() * 0.1;

    }


    // --- LÓGICA DO WFC ---

    /**
     * Força a célula a escolher um único padrão baseada nos pesos.
     */
    public Collapse(weights: number[]): void {
        const options = Array.from(this.possibleTiles);
        
        // Escolha ponderada (Weighted Random)
        let totalWeight = 0;
        for (const id of options) totalWeight += weights[id];

        let randomVal = Math.random() * totalWeight;
        let selectedId = options[0];

        for (const id of options) {
            randomVal -= weights[id];
            if (randomVal <= 0) {
                selectedId = id;
                break;
            }
        }

        this.chosenTile = selectedId;
        this.possibleTiles.clear();
        this.possibleTiles.add(selectedId);
        this.collapsed = true;
    }

    /**
     * Restringe as possibilidades desta célula baseado no que os vizinhos permitem.
     * Retorna TRUE se algo mudou (para avisar o propagador).
     */
    public Constrain(allowedMap: Set<number>): boolean {
        let changed = false;
        
        // Interseção: Mantém apenas o que está em possibleTiles E em allowedMap
        for (const id of this.possibleTiles) {
            if (!allowedMap.has(id)) {
                this.possibleTiles.delete(id);
                changed = true;
            }
        }

        // Se sobrou apenas 1, marcamos como colapsado
        if (this.possibleTiles.size === 1) {
            this.chosenTile = this.possibleTiles.values().next().value || 0;
            this.collapsed = true;
        }

        // Se chegou a 0, temos uma CONTRADIÇÃO (Bug no algoritmo ou beco sem saída)
        // if (this.possibleTiles.size === 0) {
        //     // console.warn(`Contradição na célula ${this.x}, ${this.y}`);
        //     // Aqui poderíamos pintar de roxo ou reiniciar
        //     this.material.emissiveColor = B.Color3.Magenta(); 
        // }

        return changed;
    }


    /**
     * Agora o UpdateVisuals apenas calcula qual cor a célula DEVERIA ter.
     * Quem aplica isso na tela é a Scene.
     */
    public UpdateVisuals(allPatterns: Pattern[]): void {
        if (this.collapsed && this.chosenTile !== null) {
            const pattern = allPatterns[this.chosenTile];
            const hex = pattern[0][0]; 
            const c = B.Color3.FromHexString(hex);
            this.currentColor.set(c.r, c.g, c.b, 1);
        } 
        else {
            const c = B.Color3.FromHexString(C.DEFAULT_COLOR );
            this.currentColor.set(c.r, c.g, c.b, 1);
        }
    }


    public ResetWithNewData(allPatterns: Pattern[]) : void {
    
        const allPossibleNumericIDs = new Set<number>();
        for (let i = 0; i < allPatterns.length; i++) {
            allPossibleNumericIDs.add(i);
        }

        this.possibleTilesStart = new Set(allPossibleNumericIDs);
        this.possibleTiles = new Set(allPossibleNumericIDs);

        this.collapsed = false;
        this.chosenTile = null;
        
        this.UpdateVisuals(allPatterns);

    }

    
    get entropy(): number {
        return this.possibleTiles.size;
    }

    get totalEntropy(): number {
        return this.possibleTiles.size + this.entropyNoise;
    }



}


import * as B from "@babylonjs/core";

import * as C from '../constants/Constants';

import { Cell } from "../wfc/Cell";
import { type WFCModelData } from "../interfaces/WFCModelData";
// import { type Pattern } from "../constants/types/PatternBuilder.type";
import { WFCSolver } from "../wfc/WFCSolver";


export class OverlappingScene {
    scene: B.Scene;
    engine: B.Engine;

    public gridCell : Cell[][] = []; 

    public cellSize = C.BABYLON_PIXEL_SCALE;

    // --- THIN INSTANCES ---
    private masterMesh: B.Mesh | null = null;
    private colorBuffer: Float32Array | null = null;
    private matrixBuffer: Float32Array | null = null;
    private totalCells = 0;

    private solver: WFCSolver | null = null;
    private modelData: WFCModelData | null = null;
    
    private isRunning = false;
    

    constructor(engine: B.Engine) {
        this.engine = engine;
        this.scene = new B.Scene(engine);
        this.scene.clearColor = new B.Color4(1, 1, 1, 1);
        
        this.CreateCamera();
        this.CreateLight();

        this.CreateGrid();
        
        this.scene.onBeforeRenderObservable.add(() => {
            if (this.isRunning && this.solver && this.modelData) {
                
                const stepsPerFrame = 10;

                for(let i=0; i<stepsPerFrame; i++) {
                    const finished = this.solver.Step();
                    
                    if (finished) {
                        console.log("WFC Concluído!");
                        this.isRunning = false;
                        this.SyncVisuals();
                        break;
                    }
                }
                // Atualiza visual a cada frame
                this.SyncVisuals();
            }
        });

    }

    private CreateCamera() : B.ArcRotateCamera {

        const camera = new B.ArcRotateCamera(
            "camera",
            -(Math.PI / 2),
            Math.PI / 2,
            1,
            B.Vector3.Zero(),
            this.scene
        );
        // camera.attachControl();
        camera.mode = B.Camera.ORTHOGRAPHIC_CAMERA;

        return camera;
    }


    private CreateLight() : B.HemisphericLight {
        return new B.HemisphericLight("light", new B.Vector3(0, 1, 0), this.scene);
    }

    public StartWFC(model: WFCModelData) {
        this.modelData = model;
        
        // 1. Recria a grid baseada no tamanho desejado (ex: 30x30)
        // Nota: Podemos usar model.n para ajustar bordas se quisermos perfeição
        this.ResetGridWithNewData()

        // 2. Instancia o Solver
        this.solver = new WFCSolver(this.gridCell, model);
        this.isRunning = true;
    }


    private CreateGrid() : void {
        const size = C.BABYLON_GRID_SIZE;
        this.totalCells = size * size;

        // 1. Criar o Mesh Mestre (Um único plano)
        this.masterMesh = B.MeshBuilder.CreatePlane("MasterCell", { size: this.cellSize }, this.scene);
        // this.masterMesh.useVertexColors = true;

        // Material especial que aceita cores de instância
        const material = new B.StandardMaterial("MasterMat", this.scene);
        material.disableLighting = true; 
        material.emissiveColor = B.Color3.White(); // Base branca para ser tintada pela cor da instância
        
        (material as any).useVertexColors = true;
        this.masterMesh.material = material;

        // 2. Preparar Buffers para Thin Instances
        this.matrixBuffer = new Float32Array(this.totalCells * 16); // 16 floats por matriz
        this.colorBuffer = new Float32Array(this.totalCells * 4);   // 4 floats (RGBA) por cor


        const startX = -(C.BABYLON_GRID_SIZE * this.cellSize) / 2 + (this.cellSize / 2);
        const startY = -(C.BABYLON_GRID_SIZE * this.cellSize) / 2 + (this.cellSize / 2);
        
        let index = 0;

        for (let y = 0; y < C.BABYLON_GRID_SIZE; y++) {
            
            const row: Cell[] = [];

            for (let x = 0; x < C.BABYLON_GRID_SIZE; x++) {

                // Nota: Invertendo Y visualmente para combinar com matrizes (0,0 no topo) ou mantendo cartesiano?
                // Vamos manter cartesiano padrão: Y sobe. Se precisar inverter depois ajustamos.
                const posX = startX + x * this.cellSize;
                const posY = startY + y * this.cellSize;
                
                const cell = new Cell(index, x, y, 1);
                row.push(cell);

                const matrix = B.Matrix.Translation(posX, posY, 0);
                matrix.copyToArray(this.matrixBuffer, index * 16);

                // -- Visual (Cor Inicial) --
                const c = B.Color3.FromHexString(C.DEFAULT_COLOR );
                this.colorBuffer[index * 4 + 0] = c.r;
                this.colorBuffer[index * 4 + 1] = c.g;
                this.colorBuffer[index * 4 + 2] = c.b;
                this.colorBuffer[index * 4 + 3] = 1.0;

                index++;
            }
        
            this.gridCell.push(row);
        }

        this.masterMesh.thinInstanceSetBuffer("matrix", this.matrixBuffer, 16, true);
        this.masterMesh.thinInstanceSetBuffer("color", this.colorBuffer, 4, false);
    }


    /**
     * Sincroniza os dados das células (lógica) com o buffer do Babylon (visual)
     */
    private SyncVisuals() {
        if (!this.masterMesh || !this.colorBuffer || !this.modelData) return;

        // let needsUpdate = false;

        // Percorre todas as células
        for (let y = 0; y < C.BABYLON_GRID_SIZE; y++) {
            for (let x = 0; x < C.BABYLON_GRID_SIZE; x++) {
                const cell = this.gridCell[y][x];
                
                // Pede para a célula calcular sua cor atual baseada no estado
                cell.UpdateVisuals(this.modelData.patterns);

                // Escreve no buffer de cor na posição correta (index * 4)
                // O buffer é [R, G, B, A,  R, G, B, A, ...]
                const idx = cell.thinIndex * 4;
                
                // Otimização: Só escreve se mudar? 
                // Por simplicidade, vamos escrever sempre, arrays tipados são rápidos.
                this.colorBuffer[idx + 0] = cell.currentColor.r;
                this.colorBuffer[idx + 1] = cell.currentColor.g;
                this.colorBuffer[idx + 2] = cell.currentColor.b;
                this.colorBuffer[idx + 3] = 1.0; 
            }
        }

        // Avisa ao Babylon para re-enviar o buffer para a GPU
        this.masterMesh.thinInstanceBufferUpdated("color");
    }


    private ResetGridWithNewData(): void {
        if (!this.modelData) return;
        for (let y = 0; y < C.BABYLON_GRID_SIZE; y++) {
            for (let x = 0; x < C.BABYLON_GRID_SIZE; x++) {
                this.gridCell[y][x].ResetWithNewData(this.modelData.patterns)
            }
        }

    }


    public render() {
        this.scene.render();
    }

    public dispose() {
        this.scene.dispose();
    }

}
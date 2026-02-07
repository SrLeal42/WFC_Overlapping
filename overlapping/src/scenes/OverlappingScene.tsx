import * as B from "@babylonjs/core";

import * as C from '../constants/Constants';

import { Cell } from "./Cell";

export class OverlappingScene {
    scene: B.Scene;
    engine: B.Engine;

    public gridCell : Cell[][] = []; 

    public cellSize = C.BABYLON_PIXEL_SCALE;

    constructor(engine: B.Engine) {
        this.engine = engine;
        this.scene = new B.Scene(engine);
        this.scene.clearColor = new B.Color4(0.1, 0.1, 0.1, 1);
        
        this.CreateCamera();
        this.CreateLight();

        this.CreateGrid();
        
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


    private CreateGrid() : void {

        const startX = -(C.BABYLON_GRID_SIZE * this.cellSize) / 2 + (this.cellSize / 2);
        const startY = -(C.BABYLON_GRID_SIZE * this.cellSize) / 2 + (this.cellSize / 2);
 
        for (let y = 0; y < C.BABYLON_GRID_SIZE; y++) {
            
            const row: Cell[] = [];

            for (let x = 0; x < C.BABYLON_GRID_SIZE; x++) {

                // Nota: Invertendo Y visualmente para combinar com matrizes (0,0 no topo) ou mantendo cartesiano?
                // Vamos manter cartesiano padrão: Y sobe. Se precisar inverter depois ajustamos.
                const posX = startX + x * this.cellSize;
                const posY = startY + y * this.cellSize;
                
                const cell = new Cell(this.scene, posX,posY, 1, this.cellSize);

                if ((x+y) % 2 == 0){
                    cell.ChangeColor(new B.Color3(0,1,1))
                }
                if (x == 0 && y == 0) {
                    cell.ChangeColor(new B.Color3(1,0,0))
                }
                    

                row.push(cell);
            }
        
            this.gridCell.push(row);
        }


    }


    public render() {
        this.scene.render();
    }

    public dispose() {
        this.scene.dispose();
    }

}
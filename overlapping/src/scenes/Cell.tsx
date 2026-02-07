import * as B from "@babylonjs/core"; 

import * as C from '../constants/Constants';

// import { AffinitiesNumeric } from "../interfaces/AffinitiesNumeric";
// import { WFCChange, WFCChangeNumeric } from "../interfaces/WFCState";

// import { MaterialInstance } from "../managers/MaterialManager";
// import { ModelsInstance } from "../managers/ModelsManager";

// import { ChooseWeightedRandomBy, CollapsedNeighbors, Direction } from "../Utilities";

export class Cell {
    
    public scene : B.Scene;

    public x: number;
    public y: number;

    public possibleTilesStart: Set<number>;
    public possibleTiles: Set<number>;
    public collapsed: boolean;
    public chosenTile: number | null;
  
    public cellSize = C.BABYLON_PIXEL_SCALE;
    public meshSize = this.cellSize; // * .5;
    public mesh!: B.Mesh;

    constructor(
        scene: B.Scene,
        x: number,
        y: number,
        totalNumTiles: number,
        cellSize: number,
    ) {

        this.scene = scene;

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

        this.cellSize = cellSize;
        this.meshSize = cellSize; // * .5;

        this.CreateMesh();

    }


    private CreateMesh(): void {

        const mat = new B.StandardMaterial(`Mat_${this.x},${this.y}`, this.scene);
        mat.disableLighting = true;
        mat.emissiveColor = B.Color3.FromHexString(C.DEFAULT_COLOR);

        const plane = B.MeshBuilder.CreatePlane(`Cell_${this.x},${this.y}`, {size:this.meshSize}, this.scene);
        plane.material = mat;
        plane.position = new B.Vector3(this.x, this.y, 0);
        
        this.mesh = plane;
    
    }


    public ChangeColor(newColor: B.Color3) : void {
        const mat = this.mesh.material as B.StandardMaterial;
        mat.emissiveColor = newColor;
    }



/*

    public ChangeMesh(key:string, x = 0, y = 0) : void {
        // this.meshNode.material = MaterialInstance.GetMaterial(key);
        if (this.meshNode)
            this.meshNode.dispose();

        this.meshNode = ModelsInstance.CreateInstance(key)!;
        
        this.meshNode.scaling = new B.Vector3(this.meshSize, this.meshSize, this.meshSize);
        // this.meshNode.rotation = new B.Vector3(-(Math.PI/2), 0, 0);
        this.meshNode.position = new B.Vector3((this.x * this.cellSize ), (this.y * this.cellSize ), (this.z * this.cellSize ));
    }

    public Collapse(
        neighbors: CollapsedNeighbors, 
        changeLog : WFCChangeNumeric[],
        allWeights: number[],
        allAffinities: AffinitiesNumeric
    ) : number | null{
    
        if (this.collapsed || this.possibleTiles.size === 0) return null;

        const getDynamicWeight = (tileId: number): number => {
            let dynamicWeight = allWeights[tileId] ?? 1;

            const affinitiesForThisTile = allAffinities[tileId];
            if (!affinitiesForThisTile) {
                return Math.max(0.1, dynamicWeight);
            }
            
            for (const dir in neighbors) {
                const neighborCell = neighbors[dir as Direction];
                
                if (neighborCell && neighborCell.chosenTile) {
                    const neighborTileID = neighborCell.chosenTile;
                    
                    const multiplier = affinitiesForThisTile[neighborTileID]
                        ? affinitiesForThisTile[neighborTileID]
                        : 1;
                        
                    dynamicWeight *= multiplier;
                    
                }
            }

            return Math.max(0.1, dynamicWeight);
        };
        
        // console.log(this.possibleTiles);

        // Converte o Set de possibilidades para um Array para o sorteio
        const possibleTilesArray = Array.from(this.possibleTiles);
        const chosenTileID = ChooseWeightedRandomBy(possibleTilesArray, getDynamicWeight);

        changeLog.push({ cell: this, oldTiles: this.possibleTiles });

        this.chosenTile = chosenTileID;
        this.possibleTiles = new Set([chosenTileID]);
        this.collapsed = true;

        // this.mesh.material = MaterialInstance.GetMaterial(this.chosenTile.matKey);
        // this.ChangeMesh(this.chosenTile.modelKey);
            
        return chosenTileID;

    }

    public Constrain(
        allowedTileIDs: Set<number>,
        changeLog: WFCChangeNumeric[]
    ) : { success : boolean, changed : boolean} {
        
        if (allowedTileIDs.size <= 0)
            return { success: true, changed: false};

        const initialCount = this.possibleTiles.size;
        let changed = false;

        for (const tileID of this.possibleTiles) {
            if (!allowedTileIDs.has(tileID)) {
                if (!changed) {
                    // Se esta é a primeira mudança, registre o estado "antigo"
                    changeLog.push({ cell: this, oldTiles: new Set(this.possibleTiles) });
                    changed = true;
                }
                this.possibleTiles.delete(tileID);
            }
        }

        const newCount = this.possibleTiles.size;
        // const changed = newCount < initialCount;

        if (newCount === 0 && initialCount > 0) {
            console.error(`Contradição na célula (${this.x}, ${this.y})!`);
            return { success: false, changed: true};
        }

        return { success: true, changed: changed};
    }

    public RestoreTiles(tiles: Set<number>): void {
        this.possibleTiles = new Set(tiles); // Restaura uma cópia
        this.collapsed = (tiles.size === 1);
        this.chosenTile = (tiles.size === 1) ? tiles[0] : null;

        if (this.collapsed) {
            // Pega o único item do Set
            this.chosenTile = this.possibleTiles.values().next().value ? this.possibleTiles.values().next().value! : null;
        } else {
            this.chosenTile = null;
        }

    }
    

    public BanTile(
        tileToBan: number,
        changeLog: WFCChangeNumeric[]
    ): { success: boolean, changed: boolean } {
        
        if (this.possibleTiles.has(tileToBan)) {
            // Crie um novo Set sem o tile banido
            const newPossibleIDs = new Set(this.possibleTiles);
            newPossibleIDs.delete(tileToBan);
            
            // Chame Constrain com o novo set (que registrará a mudança)
            return this.Constrain(newPossibleIDs, changeLog);
        }
        
        return { success: true, changed: false };
    }


    public Reset() : void {

        this.possibleTiles = new Set(this.possibleTilesStart);
        this.collapsed = false;
        this.chosenTile = null;

        this.ChangeMesh('defaultUnlit');

        // this.mesh.material = MaterialInstance.GetMaterial('defaultUnlit');

    }

    get entropy(): number {
        return this.possibleTiles.size;
    }

*/

}

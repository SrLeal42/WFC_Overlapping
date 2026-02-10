import { useEffect, useRef } from "react";
import { Engine } from "@babylonjs/core";
import { OverlappingScene } from "../scenes/OverlappingScene";

import * as C from '../constants/Constants';

import { type WFCModelData } from "../interfaces/WFCModelData";

// import styles from "../styles/Babylon.module.css";

// Definimos a interface das Props
interface Props {
  wfcData: WFCModelData | null;
}

export function BabylonScene({ wfcData }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlappingSceneRef = useRef<OverlappingScene | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new Engine(canvasRef.current, true);
    const scene: OverlappingScene = new OverlappingScene(engine);

    overlappingSceneRef.current = scene;

    engine.runRenderLoop(() => {
      scene.render();
    });

    const resize = () => engine.resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      scene.dispose();
      engine.dispose();
    };
  }, []);

  
  // NOVO EFFECT: Reage quando wfcData muda
  useEffect(() => {
    if (wfcData && overlappingSceneRef.current) {
        console.log("BabylonScene recebeu novos dados, iniciando WFC...");
        // Chama o método que vamos criar na classe OverlappingScene
        overlappingSceneRef.current.StartWFC(wfcData);
    }
  }, [wfcData]);



  return <canvas ref={canvasRef} /*className={styles.babylonCanvas}*/ style={{ width: C.BABYLON_CANVAS_SIZE, height: C.BABYLON_CANVAS_SIZE}} />;
}

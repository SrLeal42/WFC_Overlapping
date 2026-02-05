import { useEffect, useRef } from "react";
import { Engine, Scene } from "@babylonjs/core";
import { CreateOverlappingScene } from "../scenes/OverlappingScene";

import styles from "../styles/Babylon.module.css";

export function BabylonScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new Engine(canvasRef.current, true);
    const scene: Scene = CreateOverlappingScene(engine);

    engine.runRenderLoop(() => {
      scene.render();
    });

    const resize = () => engine.resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      engine.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.babylonCanvas} />;
}

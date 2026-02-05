import * as B from "@babylonjs/core";

export function CreateOverlappingScene( engine: B.Engine ) {
  const scene = new B.Scene(engine);
  scene.clearColor = new B.Color4(.1, .1, .1, 1);
    
  CreateCamera(scene);
  CreateLight(scene);
    
  B.MeshBuilder.CreatePlane("Plane",{size:25}, scene);

  return scene;
}


function CreateCamera(scene : B.Scene) : B.ArcRotateCamera {

    const camera = new B.ArcRotateCamera(
        "camera",
        -(Math.PI / 2),
        Math.PI / 2,
        1,
        B.Vector3.Zero(),
        scene
    );
    // camera.attachControl();
    camera.mode = B.Camera.ORTHOGRAPHIC_CAMERA;

    return camera;
}


function CreateLight(scene : B.Scene) : B.HemisphericLight {
    return new B.HemisphericLight("light", new B.Vector3(0, 1, 0), scene);
}



"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Box3, Group, OrthographicCamera, Sphere, Vector3 } from "three";
import { PARK_MODELS } from "@/lib/park/models";

useGLTF.preload(PARK_MODELS.yard);
useGLTF.preload(PARK_MODELS.l1);
useGLTF.preload(PARK_MODELS.l2);

function FittedModel({
  url,
  onFit,
}: {
  url: string;
  onFit: (center: [number, number, number]) => void;
}) {
  const { scene } = useGLTF(url);
  const clone = useMemo(() => scene.clone(true), [scene]);
  const group = useRef<Group>(null);
  const { camera, size, invalidate } = useThree();

  useLayoutEffect(() => {
    const target = group.current;
    if (!target) return;
    const box = new Box3().setFromObject(target);
    const center = box.getCenter(new Vector3());
    const sphere = box.getBoundingSphere(new Sphere());
    const cam = camera as OrthographicCamera;
    const radius = Math.max(sphere.radius, 1);
    cam.position.set(center.x + radius, center.y + radius * 0.85, center.z + radius);
    cam.lookAt(center);
    cam.zoom = Math.min(size.width, size.height) / (radius * 2.55);
    cam.updateProjectionMatrix();
    onFit([center.x, center.y, center.z]);
    invalidate();
  }, [camera, clone, invalidate, onFit, size.height, size.width]);

  return (
    <group ref={group}>
      <primitive object={clone} />
    </group>
  );
}

export function ParkCanvas({ src }: { src: string | null }) {
  const [aim, setAim] = useState<[number, number, number]>([0, 0.4, 0]);
  const onFit = useCallback((center: [number, number, number]) => {
    setAim((prev) =>
      prev[0] === center[0] && prev[1] === center[1] && prev[2] === center[2]
        ? prev
        : center,
    );
  }, []);

  if (!src) {
    return (
      <div className="flex h-full items-center justify-center bg-[#e8ecee] px-6 text-center text-sm text-ink-soft">
        负一楼还在搭建
      </div>
    );
  }

  return (
    <Canvas
      orthographic
      dpr={[1, 1.75]}
      camera={{ position: [14, 12, 14], zoom: 28, near: -120, far: 240 }}
      gl={{ antialias: true, alpha: false }}
      style={{ touchAction: "none", background: "#e8ecee" }}
    >
      <color attach="background" args={["#e8ecee"]} />
      <ambientLight intensity={0.92} />
      <directionalLight position={[8, 14, 6]} intensity={1.3} />
      <directionalLight position={[-6, 6, 4]} intensity={0.38} />
      <Suspense fallback={null}>
        <FittedModel key={src} url={src} onFit={onFit} />
      </Suspense>
      <OrbitControls
        makeDefault
        target={aim}
        enablePan={false}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
        enableDamping
      />
    </Canvas>
  );
}

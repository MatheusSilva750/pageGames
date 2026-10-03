import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AntFieldProps {
  count: number;
}

export default function AntField({ count }: AntFieldProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        angle: (index / count) * Math.PI * 2,
        radius: 2.5 + (index % 30) * 0.08,
        speed: 0.15 + (index % 7) * 0.01,
      })),
    [count],
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const time = clock.getElapsedTime();

    seeds.forEach((ant, index) => {
      const angle = ant.angle + time * ant.speed;
      dummy.position.set(Math.cos(angle) * ant.radius, 0.14, Math.sin(angle) * ant.radius);
      dummy.rotation.set(0, -angle, 0);
      dummy.scale.set(0.22, 0.12, 0.45);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(index, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow>
      <sphereGeometry args={[1, 12, 8]} />
      <meshStandardMaterial color="#2b2118" roughness={0.8} />
    </instancedMesh>
  );
}

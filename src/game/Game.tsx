import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import AntField from './rendering/AntField';

export default function Game() {
  return (
    <section className="game-canvas">
      <Canvas camera={{ position: [8, 8, 10], fov: 45 }} shadows>
        <color attach="background" args={['#20261f']} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[6, 10, 4]} intensity={2} castShadow />
        <Physics gravity={[0, -9.81, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[30, 30]} />
            <meshStandardMaterial color="#6b7557" />
          </mesh>
          <AntField count={180} />
        </Physics>
        <OrbitControls makeDefault maxPolarAngle={Math.PI / 2.05} />
      </Canvas>
    </section>
  );
}

import { Canvas } from '@react-three/fiber';
import RtsScene from './rendering/RtsScene';

export default function Game() {
  return (
    <section className="game-canvas">
      <Canvas camera={{ position: [11, 13, 14], fov: 48 }} shadows>
        <RtsScene />
      </Canvas>
    </section>
  );
}

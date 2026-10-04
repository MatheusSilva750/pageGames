import { Html, OrbitControls } from '@react-three/drei';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { useGameStore } from '../../stores/gameStore';
import type { BeeUnit, Building, EnemyUnit, ResourceNode, Vec3 } from '../types';

const stop = (event: ThreeEvent<MouseEvent>) => event.stopPropagation();

function BeeModel({ unit }: { unit: BeeUnit }) {
  const selected = useGameStore((state) => state.selectedUnitIds.includes(unit.id));
  const selectUnit = useGameStore((state) => state.selectUnit);
  const bodyColor = unit.type === 'guard' ? '#d99112' : '#f2b51d';

  return (
    <group
      position={unit.position}
      onClick={(event) => {
        stop(event);
        selectUnit(unit.id, event.nativeEvent.shiftKey);
      }}
    >
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.28, 0]}>
          <ringGeometry args={[0.52, 0.62, 32]} />
          <meshBasicMaterial color="#57ff70" />
        </mesh>
      )}
      <mesh castShadow scale={unit.type === 'guard' ? [0.55, 0.34, 0.8] : [0.42, 0.28, 0.62]}>
        <sphereGeometry args={[0.55, 16, 12]} />
        <meshStandardMaterial color={bodyColor} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0, -0.3]} scale={[0.58, 0.32, 0.4]}>
        <sphereGeometry args={[0.5, 12, 10]} />
        <meshStandardMaterial color="#2a1a12" />
      </mesh>
      <mesh position={[0, 0, 0.18]} rotation={[0, 0, Math.PI / 2]} scale={[0.78, 0.08, 0.9]}>
        <sphereGeometry args={[0.5, 10, 8]} />
        <meshStandardMaterial color="#21150f" />
      </mesh>
      <mesh position={[-0.32, 0.18, 0]} rotation={[0.2, 0.2, -0.45]} scale={[0.55, 0.05, 0.85]}>
        <sphereGeometry args={[0.5, 10, 6]} />
        <meshStandardMaterial color="#dff6ff" transparent opacity={0.62} />
      </mesh>
      <mesh position={[0.32, 0.18, 0]} rotation={[-0.2, -0.2, 0.45]} scale={[0.55, 0.05, 0.85]}>
        <sphereGeometry args={[0.5, 10, 6]} />
        <meshStandardMaterial color="#dff6ff" transparent opacity={0.62} />
      </mesh>
      {unit.cargo > 0.5 && (
        <mesh position={[0.45, -0.18, -0.1]} scale={0.18}>
          <sphereGeometry args={[1, 12, 8]} />
          <meshStandardMaterial color="#ffcf36" emissive="#6d3a00" emissiveIntensity={0.25} />
        </mesh>
      )}
    </group>
  );
}

function BuildingModel({ building }: { building: Building }) {
  const colorByType: Record<Building['type'], string> = {
    hive: '#d99010',
    nursery: '#b97612',
    tower: '#845a21',
    depot: '#c98a21',
  };
  const scaleByType: Record<Building['type'], Vec3> = {
    hive: [2.2, 2.4, 2.2],
    nursery: [1.5, 1.2, 1.5],
    tower: [0.9, 2.1, 0.9],
    depot: [1.3, 1.1, 1.3],
  };

  return (
    <group position={building.position}>
      <mesh castShadow receiveShadow scale={scaleByType[building.type]} position={[0, scaleByType[building.type][1] * 0.38, 0]}>
        <cylinderGeometry args={[0.75, 0.95, 1.4, 6]} />
        <meshStandardMaterial color={colorByType[building.type]} roughness={0.75} />
      </mesh>
      <mesh position={[0, scaleByType[building.type][1] * 0.55, 0]} scale={0.72}>
        <torusGeometry args={[0.65, 0.09, 8, 6]} />
        <meshStandardMaterial color="#4a2a12" />
      </mesh>
      <Html position={[0, scaleByType[building.type][1] + 0.45, 0]} center distanceFactor={14}>
        <div className="world-label">
          {building.type === 'hive' ? 'Colmeia' : building.type === 'nursery' ? 'Berçário' : building.type === 'tower' ? 'Torre Guardiã' : 'Depósito'}
        </div>
      </Html>
    </group>
  );
}

function ResourceModel({ node }: { node: ResourceNode }) {
  const gather = useGameStore((state) => state.commandGather);

  return (
    <group
      position={node.position}
      onClick={(event) => {
        stop(event);
        gather(node.id);
      }}
    >
      {Array.from({ length: 7 }, (_, index) => {
        const angle = (index / 7) * Math.PI * 2;
        return (
          <group key={index} rotation={[0, angle, 0]} position={[Math.cos(angle) * 0.7, 0, Math.sin(angle) * 0.7]}>
            <mesh position={[0, 0.38, 0]}>
              <cylinderGeometry args={[0.05, 0.08, 0.7, 6]} />
              <meshStandardMaterial color="#3f772e" />
            </mesh>
            <mesh position={[0, 0.8, 0]} scale={0.32}>
              <sphereGeometry args={[1, 10, 8]} />
              <meshStandardMaterial color={index % 2 ? '#a970ff' : '#f2c14d'} emissive="#412149" emissiveIntensity={0.1} />
            </mesh>
          </group>
        );
      })}
      <Html position={[0, 1.5, 0]} center distanceFactor={14}>
        <div className="world-label nectar">{Math.ceil(node.amount)} néctar</div>
      </Html>
    </group>
  );
}

function EnemyModel({ enemy }: { enemy: EnemyUnit }) {
  const attack = useGameStore((state) => state.commandAttack);

  return (
    <group
      position={enemy.position}
      onClick={(event) => {
        stop(event);
        attack(enemy.id);
      }}
    >
      <mesh castShadow scale={[0.5, 0.32, 0.8]}>
        <sphereGeometry args={[0.65, 14, 10]} />
        <meshStandardMaterial color="#8d241c" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, -0.36]} scale={[0.65, 0.36, 0.45]}>
        <sphereGeometry args={[0.52, 12, 8]} />
        <meshStandardMaterial color="#1e1210" />
      </mesh>
      <mesh position={[-0.35, 0.2, 0]} rotation={[0.2, 0.2, -0.5]} scale={[0.6, 0.04, 0.95]}>
        <sphereGeometry args={[0.45, 10, 6]} />
        <meshStandardMaterial color="#d6b8b2" transparent opacity={0.58} />
      </mesh>
      <mesh position={[0.35, 0.2, 0]} rotation={[-0.2, -0.2, 0.5]} scale={[0.6, 0.04, 0.95]}>
        <sphereGeometry args={[0.45, 10, 6]} />
        <meshStandardMaterial color="#d6b8b2" transparent opacity={0.58} />
      </mesh>
      <Html position={[0, 0.95, 0]} center distanceFactor={15}>
        <div className="enemy-health">
          <span style={{ width: `${Math.max(0, enemy.health / enemy.maxHealth) * 100}%` }} />
        </div>
      </Html>
    </group>
  );
}

export default function RtsScene() {
  const units = useGameStore((state) => state.units);
  const buildings = useGameStore((state) => state.buildings);
  const resourceNodes = useGameStore((state) => state.resourceNodes);
  const enemies = useGameStore((state) => state.enemies);
  const buildMode = useGameStore((state) => state.buildMode);
  const commandMove = useGameStore((state) => state.commandMove);
  const placeBuilding = useGameStore((state) => state.placeBuilding);
  const simulate = useGameStore((state) => state.simulate);

  useFrame((_, delta) => simulate(delta));

  const handleGroundClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const point: Vec3 = [event.point.x, 0.35, event.point.z];

    if (buildMode && buildMode !== 'hive') {
      placeBuilding(buildMode, [event.point.x, 0, event.point.z]);
      return;
    }

    commandMove(point);
  };

  return (
    <>
      <color attach="background" args={['#243522']} />
      <fog attach="fog" args={['#243522', 20, 42]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[8, 14, 6]} intensity={2.1} castShadow />
      <hemisphereLight args={['#d8ecff', '#394321', 0.55]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow onClick={handleGroundClick}>
        <planeGeometry args={[34, 26, 1, 1]} />
        <meshStandardMaterial color="#52663d" roughness={1} />
      </mesh>

      <gridHelper args={[34, 34, '#607147', '#405233']} position={[0, 0.015, 0]} />

      {buildings.map((building) => (
        <BuildingModel key={building.id} building={building} />
      ))}
      {resourceNodes.filter((node) => node.amount > 0).map((node) => (
        <ResourceModel key={node.id} node={node} />
      ))}
      {units.map((unit) => (
        <BeeModel key={unit.id} unit={unit} />
      ))}
      {enemies.map((enemy) => (
        <EnemyModel key={enemy.id} enemy={enemy} />
      ))}

      <OrbitControls
        makeDefault
        enableDamping
        minDistance={8}
        maxDistance={24}
        maxPolarAngle={Math.PI / 2.25}
        target={[0, 0, 0]}
      />
    </>
  );
}

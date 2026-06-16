'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, useGLTF, useAnimations } from '@react-three/drei';
import { Physics, RigidBody, CuboidCollider, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4'];

function Character() {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('/models/Capoeira.glb');
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    const action = actions[names[0]];
    if (action) action.play();
  }, [actions, names]);

  return (
    <RigidBody type="fixed" position={[0, -2, 0]} colliders={false}>
      <CapsuleCollider args={[0.55, 0.35]} position={[0, 0.9, 0]} />
      <group ref={group} rotation={[-Math.PI / 2, 0, 0]}>
        <primitive object={scene} scale={100} />
      </group>
    </RigidBody>
  );
}

function Ball({ position, color, radius }: { position: [number, number, number]; color: string; radius: number }) {
  return (
    <RigidBody position={position} restitution={0.6} friction={0.3}>
      <mesh castShadow>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.1} />
      </mesh>
    </RigidBody>
  );
}

function Box({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <RigidBody position={position} restitution={0.4} friction={0.5}>
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
    </RigidBody>
  );
}


function Ground() {
  return (
    <RigidBody type="fixed" friction={0.8}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
      </mesh>
      <CuboidCollider args={[15, 0.1, 15]} position={[0, -2.1, 0]} />
    </RigidBody>
  );
}

function Walls() {
  return (
    <RigidBody type="fixed">
      <CuboidCollider args={[0.1, 10, 15]} position={[-6, 3, 0]} />
      <CuboidCollider args={[0.1, 10, 15]} position={[6, 3, 0]} />
      <CuboidCollider args={[15, 10, 0.1]} position={[0, 3, -6]} />
      <CuboidCollider args={[15, 10, 0.1]} position={[0, 3, 6]} />
    </RigidBody>
  );
}

type Item = { id: number; type: 'ball' | 'box'; position: [number, number, number]; color: string; radius: number };

function Scene3D({ items }: { items: Item[] }) {
  return (
    <>
      <color attach="background" args={['#0f172a']} />
      <ambientLight intensity={1.2} />
      <directionalLight position={[8, 12, 6]} intensity={2.5} castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-far={50}
        shadow-camera-left={-10} shadow-camera-right={10}
        shadow-camera-top={10} shadow-camera-bottom={-10}
      />
      <pointLight position={[-6, 8, -4]} intensity={1.0} color="#c0d8ff" />
      <pointLight position={[6, 4, 6]} intensity={0.8} color="#ffeedd" />
      <Physics gravity={[0, -15, 0]}>
        <Ground />
        <Walls />
        <Character />
        {items.map(item =>
          item.type === 'ball' ? (
            <Ball key={item.id} position={item.position} color={item.color} radius={item.radius} />
          ) : (
            <Box key={item.id} position={item.position} color={item.color} />
          )
        )}
      </Physics>
      <ContactShadows position={[0, -1.99, 0]} opacity={0.4} blur={2} far={6} />
      <OrbitControls
        makeDefault
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2.1}
        enablePan={false}
        minDistance={4}
        maxDistance={20}
      />
    </>
  );
}

useGLTF.preload('/models/Capoeira.glb');

export default function GraphicsScene() {
  const [items, setItems] = useState<Item[]>(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      type: (i % 3 === 0 ? 'box' : 'ball') as 'ball' | 'box',
      position: [
        (Math.random() - 0.5) * 8,
        4 + i * 0.8,
        (Math.random() - 0.5) * 8,
      ] as [number, number, number],
      color: COLORS[i % COLORS.length],
      radius: 0.25 + Math.random() * 0.25,
    }))
  );
  const nextId = useRef(items.length);

  function spawnBall() {
    const id = nextId.current++;
    setItems(prev => [...prev, {
      id,
      type: 'ball',
      position: [(Math.random() - 0.5) * 4, 8, (Math.random() - 0.5) * 4],
      color: COLORS[id % COLORS.length],
      radius: 0.25 + Math.random() * 0.25,
    }]);
  }

  function spawnBox() {
    const id = nextId.current++;
    setItems(prev => [...prev, {
      id,
      type: 'box',
      position: [(Math.random() - 0.5) * 4, 8, (Math.random() - 0.5) * 4],
      color: COLORS[id % COLORS.length],
      radius: 0.3,
    }]);
  }

  function reset() {
    nextId.current = 8;
    setItems(Array.from({ length: 8 }, (_, i) => ({
      id: i,
      type: (i % 3 === 0 ? 'box' : 'ball') as 'ball' | 'box',
      position: [
        (Math.random() - 0.5) * 8,
        4 + i * 0.8,
        (Math.random() - 0.5) * 8,
      ] as [number, number, number],
      color: COLORS[i % COLORS.length],
      radius: 0.25 + Math.random() * 0.25,
    })));
  }

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Canvas
        shadows
        camera={{ position: [0, 4, 10], fov: 50 }}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        resize={{ scroll: false, debounce: { scroll: 50, resize: 1 } }}
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}
        onCreated={(state) => {
          state.scene.background = new THREE.Color('#0f172a');
          state.setSize(window.innerWidth, window.innerHeight);
        }}
      >
        <Scene3D items={items} />
      </Canvas>

      <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 12 }}>
        <button
          onClick={spawnBall}
          className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl shadow-lg transition-all active:scale-95"
        >
          공 추가
        </button>
        <button
          onClick={spawnBox}
          className="px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold rounded-xl shadow-lg transition-all active:scale-95"
        >
          상자 추가
        </button>
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-slate-600 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl shadow-lg transition-all active:scale-95"
        >
          초기화
        </button>
      </div>

      <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', color: '#94a3b8', fontSize: 12, background: 'rgba(0,0,0,0.4)', padding: '6px 12px', borderRadius: 20 }}>
        마우스 드래그로 시점 변경 · 스크롤로 줌
      </div>
    </div>
  );
}

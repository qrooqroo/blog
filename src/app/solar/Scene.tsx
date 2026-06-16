'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// ── Constants ──────────────────────────────────────────────────
const G = 0.1;
const SUN_MASS = 10000;
const MAX_TRAIL = 350;

// ── Types ──────────────────────────────────────────────────────
interface Body {
  id: string;
  name: string;
  mass: number;
  radius: number;
  color: string;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rotSpeed: number;   // rad/s, 양수 = 자전축 기준 반시계
  tilt: number;       // 황도면 기준 자전축 기울기 (radians)
  spinAxis: THREE.Vector3; // 세계좌표 자전축 방향
  trail: THREE.Vector3[];
  isStar?: boolean;
}

// ── Preset factory ─────────────────────────────────────────────
function ov(r: number, M: number) {
  return Math.sqrt(G * M / r);
}

// 자전축: Y축에서 Z축 방향으로 tilt만큼 기울임
// 금성(177.4°), 천왕성(97.8°)처럼 tilt > 90° 이면 자연스럽게 역방향 공전처럼 보임
function spinAxis(tiltRad: number): THREE.Vector3 {
  return new THREE.Vector3(0, Math.cos(tiltRad), Math.sin(tiltRad)).normalize();
}

function makePreset(): Body[] {
  function planet(
    id: string, name: string, m: number, r: number, c: string,
    d: number, rs: number, tiltDeg: number,
  ): Body {
    const tilt = THREE.MathUtils.degToRad(tiltDeg);
    return {
      id, name, mass: m, radius: r, color: c, isStar: false,
      pos: new THREE.Vector3(d, 0, 0),
      vel: new THREE.Vector3(0, 0, -ov(d, SUN_MASS)),
      rotSpeed: rs, tilt, spinAxis: spinAxis(tilt), trail: [],
    };
  }

  const earthTilt = THREE.MathUtils.degToRad(23.5);
  const earth: Body = {
    id: 'earth', name: '지구', mass: 5, radius: 0.65, color: '#4FA3D9', isStar: false,
    pos: new THREE.Vector3(13, 0, 0),
    vel: new THREE.Vector3(0, 0, -ov(13, SUN_MASS)),
    rotSpeed: 4.0, tilt: earthTilt, spinAxis: spinAxis(earthTilt), trail: [],
  };

  const moonDist = 2.0;
  const moonTilt = THREE.MathUtils.degToRad(6.7);
  const moon: Body = {
    id: 'moon', name: '달', mass: 0.01, radius: 0.2, color: '#BBBBBB', isStar: false,
    pos: earth.pos.clone().add(new THREE.Vector3(moonDist, 0, 0)),
    vel: new THREE.Vector3(0, 0, earth.vel.z - ov(moonDist, earth.mass)),
    rotSpeed: 0.5, tilt: moonTilt, spinAxis: spinAxis(moonTilt), trail: [],
  };

  const sunTilt = THREE.MathUtils.degToRad(7.25);
  return [
    {
      id: 'sun', name: '태양', mass: SUN_MASS, radius: 2.5,
      color: '#FFD060', isStar: true,
      pos: new THREE.Vector3(0, 0, 0),
      vel: new THREE.Vector3(0, 0, 0),
      rotSpeed: 0.35, tilt: sunTilt, spinAxis: spinAxis(sunTilt), trail: [],
    },
    // 수성: 자전축 거의 수직(0.03°), 순행
    planet('mercury', '수성', 0.5, 0.28, '#9E9E9E',  6,   3.0,   0.03),
    // 금성: 177.4° 기울기 → spinAxis가 -Y 방향 → 순행 rotSpeed로도 역방향 자전
    planet('venus',   '금성', 2,   0.55, '#E8D080',  9,   2.0, 177.4),
    earth,
    moon,
    // 화성: 25.2° 기울기, 순행
    planet('mars',    '화성', 0.5, 0.38, '#C1440E',  18,  3.5,  25.2),
    // 목성: 3.1° 기울기, 빠른 순행
    planet('jupiter', '목성', 200, 1.5,  '#C88B3A',  30,  9.0,   3.1),
    // 토성: 26.7° 기울기, 순행
    planet('saturn',  '토성', 100, 1.15, '#E8D5A3',  42,  7.5,  26.7),
    // 천왕성: 97.8° → 옆으로 누운 자전축, 역방향
    planet('uranus',  '천왕성', 15, 0.8, '#7DE8E8',  55,  5.5,  97.8),
    // 해왕성: 28.3°, 순행
    planet('neptune', '해왕성', 17, 0.75, '#4169E1', 68,  5.0,  28.3),
  ];
}

// ── Pre-allocated temporaries (no GC pressure in useFrame) ─────
const _spinQuat = new THREE.Quaternion();
const _acc: THREE.Vector3[] = Array.from({ length: 20 }, () => new THREE.Vector3());
const _diff = new THREE.Vector3();

// ── Simulation ─────────────────────────────────────────────────
function Simulation({ timeScale, paused, resetKey }: {
  timeScale: number; paused: boolean; resetKey: number;
}) {
  const { scene } = useThree();
  const bodies = useRef<Body[]>([]);
  const meshes = useRef<THREE.Mesh[]>([]);
  const trails = useRef<THREE.Line[]>([]);

  useEffect(() => {
    // Dispose previous objects
    meshes.current.forEach(m => { m.clear(); scene.remove(m); m.geometry.dispose(); (m.material as THREE.Material).dispose(); });
    trails.current.forEach(l => { scene.remove(l); l.geometry.dispose(); (l.material as THREE.Material).dispose(); });
    meshes.current = [];
    trails.current = [];

    bodies.current = makePreset();

    bodies.current.forEach(b => {
      // ── Sphere ──
      const geo = new THREE.SphereGeometry(b.radius, 48, 24);
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(b.color),
        emissive: b.isStar ? new THREE.Color(b.color) : new THREE.Color(0, 0, 0),
        emissiveIntensity: b.isStar ? 0.7 : 0,
        roughness: b.isStar ? 1 : 0.65,
        metalness: 0,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(b.pos);

      // ── 올바른 자전축 초기 방향 설정 (쿼터니언) ──
      // X축 기준 tilt만큼 회전 → 극점(+Y local)이 (0, cos(tilt), sin(tilt)) 방향을 향함
      const initQuat = new THREE.Quaternion();
      initQuat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), b.tilt);
      mesh.quaternion.copy(initQuat);

      // ── 자전축 표시선 (별 제외) ──
      if (!b.isStar) {
        const axisLen = b.radius * 2.8;
        const axisGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, -axisLen, 0),
          new THREE.Vector3(0,  axisLen, 0),
        ]);
        const axisLine = new THREE.Line(
          axisGeo,
          new THREE.LineBasicMaterial({ color: '#aabbff', transparent: true, opacity: 0.55 }),
        );
        mesh.add(axisLine); // local +Y = 자전축, 별과 같이 움직임
      }

      // ── 토성 고리 ──
      if (b.id === 'saturn') {
        const ringGeo = new THREE.RingGeometry(b.radius * 1.55, b.radius * 2.7, 128);
        const ringMat = new THREE.MeshBasicMaterial({ color: '#C8A870', side: THREE.DoubleSide, transparent: true, opacity: 0.75 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        // local XZ 평면 = 적도면 → +Y 극축과 수직
        ring.rotation.x = Math.PI / 2;
        mesh.add(ring);
      }

      // ── 천왕성 고리 ──
      if (b.id === 'uranus') {
        const ringGeo = new THREE.RingGeometry(b.radius * 1.3, b.radius * 1.75, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: '#7DE8E8', side: THREE.DoubleSide, transparent: true, opacity: 0.28 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        mesh.add(ring);
      }

      scene.add(mesh);
      meshes.current.push(mesh);

      // ── 궤적 선 ──
      const trailGeo = new THREE.BufferGeometry();
      trailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_TRAIL * 3), 3));
      trailGeo.setDrawRange(0, 0);
      const trailMat = new THREE.LineBasicMaterial({ color: new THREE.Color(b.color), transparent: true, opacity: b.isStar ? 0 : 0.35 });
      const line = new THREE.Line(trailGeo, trailMat);
      scene.add(line);
      trails.current.push(line);
    });

    return () => {
      meshes.current.forEach(m => { m.clear(); scene.remove(m); m.geometry.dispose(); (m.material as THREE.Material).dispose(); });
      trails.current.forEach(l => { scene.remove(l); l.geometry.dispose(); (l.material as THREE.Material).dispose(); });
    };
  }, [scene, resetKey]);

  useFrame((_, delta) => {
    if (paused || bodies.current.length === 0) return;

    const substeps = Math.max(1, Math.ceil(timeScale / 3));
    const dt = Math.min(delta, 0.05) * timeScale / substeps;
    const bs = bodies.current;
    const n = bs.length;

    // N체 중력 (substep)
    for (let s = 0; s < substeps; s++) {
      for (let i = 0; i < n; i++) _acc[i].set(0, 0, 0);

      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          _diff.subVectors(bs[j].pos, bs[i].pos);
          const d2 = Math.max(_diff.lengthSq(), 0.5);
          const f = G / d2;
          _diff.normalize();
          _acc[i].addScaledVector(_diff,  f * bs[j].mass);
          _acc[j].addScaledVector(_diff, -f * bs[i].mass);
        }
      }

      for (let i = 0; i < n; i++) {
        bs[i].vel.addScaledVector(_acc[i], dt);
        bs[i].pos.addScaledVector(bs[i].vel, dt);
      }
    }

    const rotDt = Math.min(delta, 0.05) * timeScale;

    for (let i = 0; i < n; i++) {
      const mesh = meshes.current[i];
      if (!mesh) continue;

      // 위치 갱신
      mesh.position.copy(bs[i].pos);

      // ── 올바른 자전: spinAxis(세계좌표 극축) 기준 쿼터니언 회전 ──
      // premultiply = 세계좌표 축 기준 회전 (극축이 고정됨)
      _spinQuat.setFromAxisAngle(bs[i].spinAxis, bs[i].rotSpeed * rotDt);
      mesh.quaternion.premultiply(_spinQuat);

      // 궤적 갱신
      if (!bs[i].isStar) {
        const trail = bs[i].trail;
        trail.push(bs[i].pos.clone());
        if (trail.length > MAX_TRAIL) trail.shift();

        const line = trails.current[i];
        if (line && trail.length >= 2) {
          const buf = line.geometry.getAttribute('position') as THREE.BufferAttribute;
          for (let k = 0; k < trail.length; k++) {
            buf.setXYZ(k, trail[k].x, trail[k].y, trail[k].z);
          }
          buf.needsUpdate = true;
          line.geometry.setDrawRange(0, trail.length);
        }
      }
    }
  });

  return null;
}

// ── Scene (조명 + 별 배경) ─────────────────────────────────────
function SceneContent({ timeScale, paused, resetKey }: {
  timeScale: number; paused: boolean; resetKey: number;
}) {
  return (
    <>
      <ambientLight intensity={0.08} />
      <pointLight position={[0, 0, 0]} intensity={12} distance={300} decay={1.2} color="#FFF8E0" />
      <Stars radius={300} depth={100} count={8000} factor={4} saturation={0} fade speed={0.3} />
      <Simulation timeScale={timeScale} paused={paused} resetKey={resetKey} />
    </>
  );
}

// ── 범례 ───────────────────────────────────────────────────────
const LEGEND = [
  { name: '태양',   color: '#FFD060' },
  { name: '수성',   color: '#9E9E9E' },
  { name: '금성',   color: '#E8D080' },
  { name: '지구',   color: '#4FA3D9' },
  { name: '달',     color: '#BBBBBB' },
  { name: '화성',   color: '#C1440E' },
  { name: '목성',   color: '#C88B3A' },
  { name: '토성',   color: '#E8D5A3' },
  { name: '천왕성', color: '#7DE8E8' },
  { name: '해왕성', color: '#4169E1' },
];

// ── Main ───────────────────────────────────────────────────────
export default function SolarScene() {
  const [timeScale, setTimeScale] = useState(1.0);
  const [paused, setPaused] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#00000F' }}>
      <Canvas
        camera={{ position: [0, 85, 100], fov: 50, near: 0.1, far: 3000 }}
        gl={{ antialias: true }}
        resize={{ scroll: false, debounce: { scroll: 50, resize: 1 } }}
        onCreated={state => state.setSize(window.innerWidth, window.innerHeight)}
      >
        <SceneContent timeScale={timeScale} paused={paused} resetKey={resetKey} />
        <OrbitControls makeDefault minDistance={5} maxDistance={600} />
      </Canvas>

      {/* 제어 패널 */}
      <div style={{
        position: 'absolute', top: 20, right: 20,
        display: 'flex', flexDirection: 'column', gap: 12,
        background: 'rgba(2,4,20,0.82)', padding: '18px 20px',
        borderRadius: 14, backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.09)', minWidth: 220,
      }}>
        <div style={{ color: '#64748b', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          시뮬레이션 제어
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e2e8f0', fontSize: 13 }}>
            <span>배속</span>
            <span style={{ fontVariantNumeric: 'tabular-nums', color: '#a5b4fc' }}>{timeScale.toFixed(1)}×</span>
          </div>
          <input type="range" min={0.1} max={20} step={0.1} value={timeScale}
            onChange={e => setTimeScale(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer' }} />
        </div>
        <button onClick={() => setPaused(p => !p)}
          style={{ padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'background 0.15s', background: paused ? '#16a34a' : '#475569', color: '#fff' }}>
          {paused ? '▶ 재생' : '⏸ 일시정지'}
        </button>
        <button onClick={() => { setResetKey(k => k + 1); setPaused(false); }}
          style={{ padding: '9px 0', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, background: 'transparent', color: '#64748b', border: '1px solid rgba(255,255,255,0.1)' }}>
          ↺ 초기화
        </button>
      </div>

      {/* 범례 */}
      <div style={{
        position: 'absolute', bottom: 20, left: 20,
        display: 'flex', flexDirection: 'column', gap: 5,
        background: 'rgba(2,4,20,0.75)', padding: '14px 18px',
        borderRadius: 12, backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}>
        {LEGEND.map(p => (
          <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
            <span style={{ color: '#94a3b8', fontSize: 12 }}>{p.name}</span>
          </div>
        ))}
      </div>

      {/* 힌트 */}
      <div style={{
        position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
        color: '#334155', fontSize: 12,
        background: 'rgba(2,4,20,0.6)', padding: '6px 14px',
        borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'nowrap',
      }}>
        드래그로 시점 변경 · 스크롤로 줌 · 배속 슬라이더로 속도 조절
      </div>
    </div>
  );
}

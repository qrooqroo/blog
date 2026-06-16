'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// ── 텍스처 캐시 (모듈 레벨, 재사용) ────────────────────────────
const _loader = new THREE.TextureLoader();
const _texCache: Record<string, THREE.Texture> = {};
function tex(path: string) {
  if (!_texCache[path]) _texCache[path] = _loader.load(path);
  return _texCache[path];
}
const PLANET_TEX: Record<string, string> = {
  sun:     '/textures/planets/sun.jpg',
  mercury: '/textures/planets/mercury.jpg',
  venus:   '/textures/planets/venus.jpg',
  earth:   '/textures/planets/earth.jpg',
  mars:    '/textures/planets/mars.jpg',
  jupiter: '/textures/planets/jupiter.jpg',
  saturn:  '/textures/planets/saturn.jpg',
  uranus:  '/textures/planets/uranus.jpg',
  neptune: '/textures/planets/neptune.jpg',
  saturn_ring: '/textures/planets/saturn_ring.png',
};
// 앱 로드 시 즉시 캐싱 시작
Object.values(PLANET_TEX).forEach(url => tex(url));

// 행성별 재질 속성
const PLANET_MAT: Record<string, { roughness: number; metalness: number }> = {
  sun:     { roughness: 1.0, metalness: 0 },
  mercury: { roughness: 0.9, metalness: 0 },
  venus:   { roughness: 0.7, metalness: 0 },
  earth:   { roughness: 0.75, metalness: 0.05 },
  mars:    { roughness: 0.95, metalness: 0 },
  jupiter: { roughness: 0.8, metalness: 0 },
  saturn:  { roughness: 0.85, metalness: 0 },
  uranus:  { roughness: 0.6, metalness: 0 },
  neptune: { roughness: 0.65, metalness: 0 },
};

// ── 물리 단위 ──────────────────────────────────────────────────
// 위치: 1 scene unit = 1 AU / AU_SCALE
// 시간: 1 simulation 단위 = 1 일(day)
// 질량: 태양 질량 = 1
//
// G_AU = 2.959e-4  AU³/(M_sun·day²)  (가우스 중력 상수)
// G_scene = G_AU * AU_SCALE³          (단위 변환)
const AU_SCALE = 5;
const G = 2.959e-4 * (AU_SCALE ** 3); // ≈ 0.036988
const MAX_TRAIL = 400;

function au(d: number) { return d * AU_SCALE; }
function circV(r: number, M: number) { return Math.sqrt(G * M / r); }
function spinAxis(tiltRad: number): THREE.Vector3 {
  return new THREE.Vector3(0, Math.cos(tiltRad), Math.sin(tiltRad)).normalize();
}

// ── 타입 ───────────────────────────────────────────────────────
interface Body {
  id: string; name: string;
  mass: number;    // 태양 질량 단위
  radius: number;  // scene units (시각적, 비현실 크기)
  color: string;
  pos: THREE.Vector3;
  vel: THREE.Vector3;  // scene_units / day
  rotSpeed: number;    // rad / sim-day (시각적 과장)
  tilt: number; spinAxis: THREE.Vector3;
  trail: THREE.Vector3[];
  isStar?: boolean;
}

// ── 행성 프리셋 ────────────────────────────────────────────────
function makePreset(): Body[] {
  const Ms = 1.0;

  function planet(
    id: string, name: string,
    mass: number, vr: number, color: string,
    distAU: number, rotSpd: number, tiltDeg: number,
  ): Body {
    const r = au(distAU);
    const tilt = THREE.MathUtils.degToRad(tiltDeg);
    return {
      id, name, mass, radius: vr, color, isStar: false,
      pos: new THREE.Vector3(r, 0, 0),
      vel: new THREE.Vector3(0, 0, -circV(r, Ms)),
      rotSpeed: rotSpd, tilt, spinAxis: spinAxis(tilt), trail: [],
    };
  }

  const sunTilt = THREE.MathUtils.degToRad(7.25);
  return [
    {
      // 태양 시각 크기: 실제 비율(21.86)은 수성 궤도보다 커서 시각적으로 1.5로 고정
      id: 'sun', name: '태양', mass: Ms, radius: 1.5, color: '#FFD060', isStar: true,
      pos: new THREE.Vector3(0, 0, 0), vel: new THREE.Vector3(0, 0, 0),
      rotSpeed: 0.5, tilt: sunTilt, spinAxis: spinAxis(sunTilt), trail: [],
    },
    // 행성 시각 반지름: 실제 비율 적용 (지구=0.200 기준, scale=3.139e-5 scene/km)
    // 공전 거리: 실제 AU · 공전 주기: 수성 88일, 금성 225일, 지구 365일, 화성 687일
    //           목성 11.9년, 토성 29.5년, 천왕성 84년, 해왕성 165년
    planet('mercury', '수성',   1.659e-7, 0.077, '#9E9E9E',  0.387,  3.0,   0.03),
    planet('venus',   '금성',   2.448e-6, 0.190, '#E8D080',  0.723,  2.0, 177.4),
    planet('earth',   '지구',   3.003e-6, 0.200, '#4FA3D9',  1.000,  4.0,  23.5),
    planet('mars',    '화성',   3.227e-7, 0.106, '#C1440E',  1.524,  3.5,  25.2),
    planet('jupiter', '목성',   9.543e-4, 2.244, '#C88B3A',  5.203,  9.0,   3.1),
    planet('saturn',  '토성',   2.857e-4, 1.892, '#E8D5A3',  9.537,  7.5,  26.7),
    planet('uranus',  '천왕성', 4.365e-5, 0.802, '#7DE8E8', 19.190,  5.5,  97.8),
    planet('neptune', '해왕성', 5.149e-5, 0.777, '#4169E1', 30.070,  5.0,  28.3),
  ];
}

// ── 사전 할당 임시 벡터 ────────────────────────────────────────
const _spinQuat = new THREE.Quaternion();
const _acc: THREE.Vector3[] = Array.from({ length: 12 }, () => new THREE.Vector3());
const _diff = new THREE.Vector3();

// ── 시뮬레이션 ─────────────────────────────────────────────────
function Simulation({ timeScale, paused, resetKey, onElapsed }: {
  timeScale: number; paused: boolean; resetKey: number;
  onElapsed: (days: number) => void;
}) {
  const { scene } = useThree();
  const bodies  = useRef<Body[]>([]);
  const meshes  = useRef<THREE.Mesh[]>([]);
  const trails  = useRef<THREE.Line[]>([]);
  const elapsed = useRef(0);
  const frame   = useRef(0);

  useEffect(() => {
    meshes.current.forEach(m => { m.clear(); scene.remove(m); m.geometry.dispose(); (m.material as THREE.Material).dispose(); });
    trails.current.forEach(l => { scene.remove(l); l.geometry.dispose(); (l.material as THREE.Material).dispose(); });
    meshes.current = []; trails.current = [];
    elapsed.current = 0;

    bodies.current = makePreset();

    bodies.current.forEach(b => {
      const matProps = PLANET_MAT[b.id] ?? { roughness: 0.8, metalness: 0 };
      const planetTex = PLANET_TEX[b.id] ? tex(PLANET_TEX[b.id]) : null;
      const mat = new THREE.MeshStandardMaterial({
        map: planetTex,
        color: planetTex ? undefined : new THREE.Color(b.color),
        emissive: b.isStar ? new THREE.Color('#FF9900') : new THREE.Color(0, 0, 0),
        emissiveMap: b.isStar ? planetTex : null,
        emissiveIntensity: b.isStar ? 0.6 : 0,
        roughness: matProps.roughness,
        metalness: matProps.metalness,
      });
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(b.radius, 64, 32), mat);
      mesh.position.copy(b.pos);
      const initQ = new THREE.Quaternion();
      initQ.setFromAxisAngle(new THREE.Vector3(1, 0, 0), b.tilt);
      mesh.quaternion.copy(initQ);

      // 자전축 표시선
      if (!b.isStar) {
        const al = b.radius * 2.8;
        mesh.add(new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -al, 0), new THREE.Vector3(0, al, 0)]),
          new THREE.LineBasicMaterial({ color: '#aabbff', transparent: true, opacity: 0.5 }),
        ));
      }

      // 토성 고리 (ring_alpha 텍스처 — PNG 알파 채널로 투명도 처리)
      if (b.id === 'saturn') {
        const ringTex = tex(PLANET_TEX['saturn_ring']);
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(b.radius * 1.55, b.radius * 2.7, 128),
          new THREE.MeshBasicMaterial({
            map: ringTex,
            side: THREE.DoubleSide,
            transparent: true,
            depthWrite: false,
          }),
        );
        ring.rotation.x = Math.PI / 2;
        mesh.add(ring);
      }
      // 천왕성 고리
      if (b.id === 'uranus') {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(b.radius * 1.3, b.radius * 1.75, 64),
          new THREE.MeshBasicMaterial({ color: '#7DE8E8', side: THREE.DoubleSide, transparent: true, opacity: 0.28 }),
        );
        ring.rotation.x = Math.PI / 2;
        mesh.add(ring);
      }

      scene.add(mesh);
      meshes.current.push(mesh);

      // 궤적
      const trailGeo = new THREE.BufferGeometry();
      trailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_TRAIL * 3), 3));
      trailGeo.setDrawRange(0, 0);
      const line = new THREE.Line(
        trailGeo,
        new THREE.LineBasicMaterial({ color: new THREE.Color(b.color), transparent: true, opacity: b.isStar ? 0 : 0.35 }),
      );
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

    const bs = bodies.current;
    const n  = bs.length;

    // timeScale = 시뮬레이션 일수/실제 초
    // substeps: 배속이 높을수록 1 substep당 dt를 작게 유지
    const substeps = Math.max(1, Math.ceil(timeScale / 60));
    const dt = Math.min(delta, 0.05) * timeScale / substeps; // days/substep

    for (let s = 0; s < substeps; s++) {
      for (let i = 0; i < n; i++) _acc[i].set(0, 0, 0);
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          _diff.subVectors(bs[j].pos, bs[i].pos);
          const d2 = Math.max(_diff.lengthSq(), 0.5);
          const f  = G / d2;
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
    elapsed.current += rotDt;
    frame.current++;
    if (frame.current % 30 === 0) onElapsed(elapsed.current);

    for (let i = 0; i < n; i++) {
      const mesh = meshes.current[i];
      if (!mesh) continue;

      mesh.position.copy(bs[i].pos);
      _spinQuat.setFromAxisAngle(bs[i].spinAxis, bs[i].rotSpeed * rotDt);
      mesh.quaternion.premultiply(_spinQuat);

      if (!bs[i].isStar) {
        const trail = bs[i].trail;
        trail.push(bs[i].pos.clone());
        if (trail.length > MAX_TRAIL) trail.shift();
        const line = trails.current[i];
        if (line && trail.length >= 2) {
          const buf = line.geometry.getAttribute('position') as THREE.BufferAttribute;
          for (let k = 0; k < trail.length; k++) buf.setXYZ(k, trail[k].x, trail[k].y, trail[k].z);
          buf.needsUpdate = true;
          line.geometry.setDrawRange(0, trail.length);
        }
      }
    }
  });

  return null;
}

// ── Scene 조명 ─────────────────────────────────────────────────
function SceneContent({ timeScale, paused, resetKey, onElapsed }: {
  timeScale: number; paused: boolean; resetKey: number;
  onElapsed: (d: number) => void;
}) {
  return (
    <>
      <ambientLight intensity={0.08} />
      <pointLight position={[0, 0, 0]} intensity={15} distance={600} decay={1.2} color="#FFF8E0" />
      <Stars radius={600} depth={150} count={8000} factor={5} saturation={0} fade speed={0.3} />
      <Simulation timeScale={timeScale} paused={paused} resetKey={resetKey} onElapsed={onElapsed} />
    </>
  );
}

// ── 경과 시간 포맷 ─────────────────────────────────────────────
function fmtElapsed(days: number): string {
  const y = Math.floor(days / 365.25);
  const d = Math.floor(days % 365.25);
  return y > 0 ? `${y}년 ${d}일` : `${d}일`;
}

// ── 범례 ───────────────────────────────────────────────────────
const LEGEND = [
  { name: '태양',   color: '#FFD060' },
  { name: '수성',   color: '#9E9E9E' },
  { name: '금성',   color: '#E8D080' },
  { name: '지구',   color: '#4FA3D9' },
  { name: '화성',   color: '#C1440E' },
  { name: '목성',   color: '#C88B3A' },
  { name: '토성',   color: '#E8D5A3' },
  { name: '천왕성', color: '#7DE8E8' },
  { name: '해왕성', color: '#4169E1' },
];

// ── 메인 ───────────────────────────────────────────────────────
export default function SolarScene() {
  const [timeScale, setTimeScale] = useState(30); // 기본: 30일/초 → 지구 365/30≈12초 공전
  const [paused, setPaused] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [elapsedDays, setElapsedDays] = useState(0);

  const earthOrbitSec = (365.25 / timeScale).toFixed(1);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#00000F' }}>
      <Canvas
        camera={{ position: [0, 300, 400], fov: 50, near: 0.1, far: 5000 }}
        gl={{ antialias: true }}
        resize={{ scroll: false, debounce: { scroll: 50, resize: 1 } }}
        onCreated={state => state.setSize(window.innerWidth, window.innerHeight)}
      >
        <SceneContent
          timeScale={timeScale} paused={paused}
          resetKey={resetKey} onElapsed={setElapsedDays}
        />
        <OrbitControls makeDefault minDistance={3} maxDistance={2000} />
      </Canvas>

      {/* 제어 패널 */}
      <div style={{
        position: 'absolute', top: 20, right: 20,
        display: 'flex', flexDirection: 'column', gap: 12,
        background: 'rgba(2,4,20,0.82)', padding: '18px 20px',
        borderRadius: 14, backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.09)', minWidth: 240,
      }}>
        <div style={{ color: '#64748b', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          시뮬레이션 제어
        </div>

        {/* 경과 시간 */}
        <div style={{ background: 'rgba(99,102,241,0.12)', borderRadius: 8, padding: '8px 12px' }}>
          <div style={{ color: '#64748b', fontSize: 10, marginBottom: 2 }}>경과 시간</div>
          <div style={{ color: '#a5b4fc', fontSize: 16, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
            {fmtElapsed(elapsedDays)}
          </div>
        </div>

        {/* 배속 슬라이더 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e2e8f0', fontSize: 13 }}>
            <span>배속</span>
            <span style={{ fontVariantNumeric: 'tabular-nums', color: '#a5b4fc' }}>
              {timeScale}일/초
            </span>
          </div>
          <input type="range" min={1} max={365} step={1} value={timeScale}
            onChange={e => setTimeScale(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer' }} />
          <div style={{ color: '#475569', fontSize: 11 }}>
            지구 공전: {earthOrbitSec}초 · 1× = 1일/초(6분/공전)
          </div>
        </div>

        <button onClick={() => setPaused(p => !p)}
          style={{ padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, background: paused ? '#16a34a' : '#475569', color: '#fff' }}>
          {paused ? '▶ 재생' : '⏸ 일시정지'}
        </button>
        <button onClick={() => { setResetKey(k => k + 1); setPaused(false); setElapsedDays(0); }}
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
        드래그로 시점 변경 · 스크롤로 줌 · 슬라이더 = 시뮬레이션 일수/초
      </div>
    </div>
  );
}

'use client';

// three.js shader values are changed in place every frame, by design
/* eslint-disable react-hooks/immutability */

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTheme } from 'next-themes';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

const { clamp, damp } = THREE.MathUtils;

const FIELD = { width: 48, near: 7, far: -26, spacing: 0.17 };

const buildGrid = () => {
  const columns = Math.round(FIELD.width / FIELD.spacing);
  const rows = Math.round((FIELD.near - FIELD.far) / FIELD.spacing);
  const positions = new Float32Array(columns * rows * 3);
  let i = 0;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      positions[i] = -FIELD.width / 2 + column * FIELD.spacing;
      positions[i + 1] = 0;
      positions[i + 2] = FIELD.far + row * FIELD.spacing;
      i += 3;
    }
  }
  return positions;
};

const GRID = buildGrid();

const VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uIntro;
  uniform float uScroll;
  uniform float uSize;
  uniform vec2 uPointer;
  uniform float uPointerStrength;
  varying float vAlpha;
  varying float vMix;

  vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec3 p = position;

    // A long slow swell with a finer chop on top
    float swell = snoise(vec2(p.x * 0.085 + uTime * 0.045, p.z * 0.085 - uTime * 0.06));
    float chop = snoise(vec2(p.x * 0.27 - uTime * 0.09, p.z * 0.27 + uTime * 0.07));
    float height = (swell * 1.2 + chop * 0.26) * (0.8 + uScroll * 0.9);

    // Dot size follows the sea only, never the cursor
    float wave = height;

    // The surface rises under the cursor and sends a ring outwards
    float d = distance(p.xz, uPointer);
    float near = exp(-d * d * 0.13) * uPointerStrength;
    height += near * 0.55;
    height += sin(d * 1.7 - uTime * 2.2) * exp(-d * 0.4) * 0.14 * uPointerStrength;

    p.y = height * uIntro;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float dist = -mv.z;

    gl_PointSize = uSize * (1.0 + max(wave, 0.0) * 0.25) / dist;

    float fadeFar = 1.0 - smoothstep(15.0, 31.0, dist);
    float fadeNear = smoothstep(1.5, 6.0, dist);
    float fadeSide = 1.0 - smoothstep(17.0, 24.0, abs(p.x));
    float crest = smoothstep(-0.7, 1.5, height);
    vAlpha = fadeFar * fadeNear * fadeSide * (0.2 + crest * 0.75 + near * 0.45) * uIntro;
    vMix = clamp(near * 0.7 + smoothstep(0.9, 1.9, height) * 0.4, 0.0, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uAccent;
  uniform float uOpacity;
  uniform vec2 uResolution;
  uniform float uColumn;
  varying float vAlpha;
  varying float vMix;

  void main() {
    float r = length(gl_PointCoord - 0.5);
    float dotShape = 1.0 - smoothstep(0.3, 0.5, r);
    if (dotShape < 0.01) discard;
    // Keep the reading column in the middle of the page quiet
    float fromCentre = abs(gl_FragCoord.x / uResolution.x - 0.5);
    float quiet = mix(0.35, 1.0, smoothstep(uColumn, uColumn + 0.09, fromCentre));
    gl_FragColor = vec4(mix(uBase, uAccent, vMix), dotShape * vAlpha * uOpacity * quiet);
  }
`;

/** Turns any CSS colour (the site tokens are oklch) into 0 to 1 red, green, blue */
const readToken = (name: string) => {
  const probe = document.createElement('canvas');
  probe.width = 1;
  probe.height = 1;
  const context = probe.getContext('2d', { willReadFrequently: true });
  if (!context) return new THREE.Vector3(0.5, 0.5, 0.5);
  context.fillStyle = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  context.fillRect(0, 0, 1, 1);
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return new THREE.Vector3(r / 255, g / 255, b / 255);
};

const Waves = ({ still }: { still: boolean }) => {
  const { resolvedTheme } = useTheme();
  const { gl } = useThree();
  const pointer = useRef({ x: 0, y: 0, active: false });
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const surface = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
    [],
  );
  const hit = useMemo(() => new THREE.Vector3(), []);

  const material = useRef<THREE.ShaderMaterial>(null);
  const initialUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntro: { value: 0 },
      uScroll: { value: 0 },
      uSize: { value: 22 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uColumn: { value: 0.25 },
      uOpacity: { value: 1 },
      uPointer: { value: new THREE.Vector2(0, -4) },
      uPointerStrength: { value: 0 },
      uBase: { value: new THREE.Vector3(0.5, 0.5, 0.5) },
      uAccent: { value: new THREE.Vector3(0.5, 0.5, 0.5) },
    }),
    [],
  );

  // Colours come from the site tokens, and follow the light and dark themes
  useEffect(() => {
    const uniforms = material.current?.uniforms;
    if (!uniforms) return;
    uniforms.uBase.value = readToken('--foreground');
    // One colour, like a calm sea at night: crests just get brighter
    uniforms.uAccent.value = readToken('--foreground');
  }, [resolvedTheme]);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -((event.clientY / window.innerHeight) * 2 - 1),
        active: true,
      };
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame(({ camera, clock, size }, delta) => {
    const uniforms = material.current?.uniforms;
    if (!uniforms) return;

    uniforms.uTime.value = still ? 12 : clock.elapsedTime;
    uniforms.uIntro.value = still
      ? 1
      : damp(uniforms.uIntro.value, 1, 1.4, delta);
    uniforms.uSize.value = 20 * gl.getPixelRatio();
    uniforms.uResolution.value.set(
      size.width * gl.getPixelRatio(),
      size.height * gl.getPixelRatio(),
    );
    // Half the width of the 712px reading column, as a share of the screen
    uniforms.uColumn.value = Math.min(0.5, 356 / size.width);

    // The camera stays put: the page scrolls over the sea, not through it
    camera.position.set(
      damp(camera.position.x, pointer.current.x * 0.5, 2, delta),
      2.6,
      9,
    );
    camera.lookAt(0, 0.9, -6);

    // Where the cursor touches the surface
    raycaster.setFromCamera(
      new THREE.Vector2(pointer.current.x, pointer.current.y),
      camera,
    );
    if (
      !still &&
      pointer.current.active &&
      raycaster.ray.intersectPlane(surface, hit)
    ) {
      const target = uniforms.uPointer.value;
      target.x = damp(target.x, hit.x, 5, delta);
      target.y = damp(target.y, clamp(hit.z, FIELD.far, FIELD.near), 5, delta);
      uniforms.uPointerStrength.value = damp(
        uniforms.uPointerStrength.value,
        1,
        2,
        delta,
      );
    }
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[GRID, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        uniforms={initialUniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
};

export default function WaveField({
  still,
  paused,
}: {
  /** Draw one calm frame instead of animating (reduced motion) */
  still: boolean;
  /** Stop drawing while the background is off screen */
  paused: boolean;
}) {
  return (
    <Canvas
      flat
      frameloop={paused ? 'never' : 'always'}
      dpr={[1, 2]}
      camera={{ position: [0, 3, 9], fov: 50, near: 0.1, far: 60 }}
      gl={{ alpha: true, antialias: true }}
      aria-hidden="true"
    >
      <Waves still={still} />
    </Canvas>
  );
}

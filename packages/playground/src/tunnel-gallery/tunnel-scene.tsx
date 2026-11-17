'use client';

// three.js objects and shader values are changed in place every frame, by design
/* eslint-disable react-hooks/immutability */

import { Canvas, type ThreeEvent, useFrame } from '@react-three/fiber';
import { useTheme } from 'next-themes';
import {
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';

import { cn } from '../lib/utils';

export type TunnelItem = {
  title: string;
  /** Picture shown on the tile. Without one the tile shows the title instead */
  image?: string;
  href?: string;
  newTab?: boolean;
};

const { clamp, damp, euclideanModulo, smoothstep } = THREE.MathUtils;

/** Tiles fill a long tube around an empty centre, and the tube repeats for ever */
const TUNNEL = { tiles: 150, depth: 26, radius: 7 };
const DEPTH = TUNNEL.depth;
/** How far past the camera a tile travels before it rejoins at the far end */
const BEHIND = 2;
const SLOTS = TUNNEL.tiles;
/** How far each tile turns from facing the viewer towards the tunnel's centre line */
const FUNNEL = 0.5;
/** A click on empty space sends you flying forward this fast */
const SURPRISE = 46;
const DRAG_THRESHOLD = 6;

const SPEED = {
  // The default forward flight should read as a steady zoom through the gallery.
  drift: 2.4,
  drag: 0.03,
  scroll: 0.012,
  wheel: 0.03,
  turn: 0.0025,
};

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uOpacity;
  uniform float uImageAspect;
  uniform float uPlaneAspect;
  varying vec2 vUv;

  void main() {
    // Fill the tile with the picture, cropping whichever side overflows
    vec2 uv = vUv - 0.5;
    float ratio = uPlaneAspect / uImageAspect;
    if (ratio > 1.0) uv.y /= ratio;
    else uv.x *= ratio;
    vec4 colour = texture2D(uMap, uv + 0.5);

    // Rounded corners
    vec2 size = vec2(uPlaneAspect, 1.0);
    vec2 corner = abs((vUv - 0.5) * size) - size * 0.5 + 0.07;
    float edge = length(max(corner, 0.0)) + min(max(corner.x, corner.y), 0.0) - 0.07;
    float shape = 1.0 - smoothstep(-0.004, 0.004, edge);

    gl_FragColor = vec4(colour.rgb, colour.a * shape * uOpacity);
  }
`;

type Travel = {
  distance: number;
  velocity: number;
  dragging: boolean;
  /** True once a press has moved far enough to count as a drag, not a click */
  dragged: boolean;
  moved: number;
  pointer: { x: number; y: number };
  hovered: number | null;
  lastScroll: number;
};

const readToken = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/** A tile for an item with no picture: its title on a quiet card */
const titleCard = (title: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = 960;
  canvas.height = 540;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = readToken('--muted');
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = readToken('--foreground');
    context.font = `600 64px ${getComputedStyle(document.body).fontFamily}`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(title, canvas.width / 2, canvas.height / 2, 820);
  }
  return new THREE.CanvasTexture(canvas);
};

/** One texture per item, filled in as each picture loads */
const useItemTextures = (items: TunnelItem[]) => {
  const { resolvedTheme } = useTheme();
  const [textures, setTextures] = useState<Array<THREE.Texture | null>>([]);

  useEffect(() => {
    let cancelled = false;
    const made: THREE.Texture[] = [];
    const loader = new THREE.TextureLoader();
    const place = (index: number, texture: THREE.Texture) => {
      made.push(texture);
      if (cancelled) return;
      setTextures((current) => {
        const next = items.map((_, i) => current[i] ?? null);
        next[index] = texture;
        return next;
      });
    };

    items.forEach((item, index) => {
      if (item.image)
        loader.load(item.image, (texture) => place(index, texture));
      else queueMicrotask(() => place(index, titleCard(item.title)));
    });

    return () => {
      cancelled = true;
      made.forEach((texture) => texture.dispose());
      setTextures([]);
    };
    // Title cards use the theme colours, so they are redrawn when it changes
  }, [items, resolvedTheme]);

  return textures;
};

/** The same pseudo-random number every time for a given tile and purpose */
const chance = (slot: number, salt: number) => {
  let n = Math.imul(slot + 1, 374761393) ^ Math.imul(salt + 1, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
};

/** Where one tile sits on the tunnel wall, and which way it faces */
const placeTile = (slot: number) => {
  const angle = chance(slot, 1) * Math.PI * 2;
  // Spread out from the wall towards the middle, always leaving the centre empty
  const radius = TUNNEL.radius * (0.95 + chance(slot, 2) * 0.25);
  const inward = new THREE.Vector3(-Math.cos(angle), -Math.sin(angle), 0);

  // Mostly facing the viewer and upright, leaned in towards the centre line
  const facing = new THREE.Vector3(0, 0, 1)
    .multiplyScalar(1 - FUNNEL)
    .add(inward.clone().multiplyScalar(FUNNEL))
    .normalize();
  const turn = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    facing,
  );
  // A loose, hand-scattered feel: each tile is rolled a little differently
  const roll = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(0, 0, 1),
    (chance(slot, 3) - 0.5) * 0.3,
  );

  return {
    x: -inward.x * radius,
    y: -inward.y * radius,
    start: chance(slot, 4) * DEPTH,
    size: 0.95 + chance(slot, 5) * 0.3,
    quaternion: turn.multiply(roll),
  };
};

const Tile = ({
  slot,
  item,
  texture,
  travel,
  onHover,
  onOpen,
}: {
  slot: number;
  item: TunnelItem;
  texture: THREE.Texture | null;
  travel: RefObject<Travel>;
  onHover: (slot: number | null) => void;
  onOpen: (item: TunnelItem) => void;
}) => {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const focus = useRef(0);
  const place = useMemo(() => placeTile(slot), [slot]);

  const initialUniforms = useMemo(
    () => ({
      uMap: { value: null as THREE.Texture | null },
      uOpacity: { value: 0 },
      uImageAspect: { value: 1 },
      uPlaneAspect: { value: 1 },
    }),
    [],
  );

  useFrame((_, delta) => {
    const tile = mesh.current;
    const uniforms = material.current?.uniforms;
    if (!tile || !uniforms) return;

    const { distance, hovered } = travel.current;
    const z = euclideanModulo(place.start + distance, DEPTH) - DEPTH + BEHIND;
    const ahead = -z;

    // Fade in from the dark far end, and out again just before passing the camera
    // Keep the closest cards out of the frame and let the next ring grow into view.
    // Close tiles stay until they leave the frame; far ones sink into the dark
    const fade = smoothstep(ahead, 0.2, 1.4) * (1 - smoothstep(ahead, 9, 19));
    const isHovered = hovered === slot;
    focus.current = damp(focus.current, isHovered ? 1 : 0, 8, delta);
    const dimmed = hovered !== null && !isHovered ? 0.45 : 1;

    // Keep each picture's own shape: wide ones wide, tall ones tall
    const aspect = uniforms.uImageAspect.value as number;
    const grow = place.size * (1 + focus.current * 0.1);
    tile.position.set(place.x, place.y, z);
    tile.quaternion.copy(place.quaternion);
    tile.scale.set(grow * Math.sqrt(aspect), grow / Math.sqrt(aspect), 1);

    uniforms.uOpacity.value = damp(
      uniforms.uOpacity.value,
      texture ? fade * dimmed : 0,
      10,
      delta,
    );
    tile.visible = uniforms.uOpacity.value > 0.01;

    if (texture && uniforms.uMap.value !== texture) {
      const picture = texture.image as { width: number; height: number };
      uniforms.uMap.value = texture;
      uniforms.uImageAspect.value = picture.width / picture.height;
      uniforms.uPlaneAspect.value = picture.width / picture.height;
    }
  });

  return (
    <mesh
      ref={mesh}
      visible={false}
      onPointerOver={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        onHover(slot);
      }}
      onPointerOut={() => onHover(null)}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        if (!travel.current.dragged) onOpen(item);
      }}
    >
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={material}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        uniforms={initialUniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

/** Moves the tunnel and the camera every frame */
const Motion = ({
  travel,
  still,
}: {
  travel: RefObject<Travel>;
  still: boolean;
}) => {
  useFrame(({ camera }, delta) => {
    const state = travel.current;

    // Scrolling the page carries you through the tunnel as it passes by
    const scroll = window.scrollY;
    state.distance += (scroll - state.lastScroll) * SPEED.scroll;
    state.lastScroll = scroll;

    if (!state.dragging) {
      // Keep gliding after a drag, and drift on its own unless motion is reduced
      const drift = still
        ? 0
        : SPEED.drift * (state.hovered === null ? 1 : 0.15);
      state.velocity = damp(state.velocity, drift, 2.5, delta);
      state.distance += state.velocity * delta;
    }

    camera.position.x = damp(
      camera.position.x,
      state.pointer.x * 0.7,
      3,
      delta,
    );
    camera.position.y = damp(
      camera.position.y,
      state.pointer.y * 0.45,
      3,
      delta,
    );
    camera.lookAt(0, 0, -12);
    // The whole tunnel slowly turns as you travel, like a corkscrew
    camera.rotateZ(state.distance * SPEED.turn);
  });

  return null;
};

export default function TunnelScene({
  items,
  still,
  paused,
  onHover,
  onOpen,
  surprise,
}: {
  items: TunnelItem[];
  /** No drifting on its own (reduced motion). Dragging still works */
  still: boolean;
  /** Stop drawing while the gallery is off screen */
  paused: boolean;
  onHover: (item: TunnelItem | null) => void;
  onOpen: (item: TunnelItem) => void;
  /** Goes up by one each time the visitor asks for a surprise */
  surprise: number;
}) {
  const textures = useItemTextures(items);
  const [grabbing, setGrabbing] = useState(false);
  const [pointing, setPointing] = useState(false);
  const travel = useRef<Travel>({
    distance: 0,
    velocity: 0,
    dragging: false,
    dragged: false,
    moved: 0,
    pointer: { x: 0, y: 0 },
    hovered: null,
    lastScroll: 0,
  });

  const surface = useRef<HTMLDivElement>(null);

  useEffect(() => {
    travel.current.lastScroll = window.scrollY;
  }, []);

  // The surprise: a sudden rush forward that glides back to the usual drift
  useEffect(() => {
    if (surprise > 0) travel.current.velocity = SURPRISE;
  }, [surprise]);

  // Scrolling over the gallery flies you in (or back out) instead of moving the
  // page. React's own wheel handler cannot stop the page scroll, so this is
  // attached by hand.
  useEffect(() => {
    const element = surface.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const state = travel.current;
      state.velocity = clamp(
        state.velocity + event.deltaY * SPEED.wheel,
        -32,
        32,
      );
    };
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => element.removeEventListener('wheel', onWheel);
  }, []);

  const hover = (slot: number | null) => {
    travel.current.hovered = slot;
    const item = slot === null ? null : items[slot % items.length];
    setPointing(Boolean(item?.href));
    onHover(item);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = travel.current;
    state.dragging = true;
    state.dragged = false;
    state.moved = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
    setGrabbing(true);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = travel.current;
    const box = event.currentTarget.getBoundingClientRect();
    state.pointer = {
      x: clamp(((event.clientX - box.left) / box.width) * 2 - 1, -1, 1),
      y: clamp(-(((event.clientY - box.top) / box.height) * 2 - 1), -1, 1),
    };
    if (!state.dragging) return;

    // Pulling down or to the right moves you forward
    const pull = event.movementX + event.movementY;
    state.moved += Math.abs(event.movementX) + Math.abs(event.movementY);
    if (state.moved > DRAG_THRESHOLD) state.dragged = true;
    state.distance += pull * SPEED.drag;
    state.velocity = clamp(pull * SPEED.drag * 60, -24, 24);
  };

  const endDrag = () => {
    travel.current.dragging = false;
    setGrabbing(false);
  };

  return (
    <div
      ref={surface}
      className={cn(
        'absolute inset-0 touch-pan-y',
        grabbing
          ? 'cursor-grabbing'
          : pointing
            ? 'cursor-pointer'
            : 'cursor-grab',
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={() => {
        travel.current.pointer = { x: 0, y: 0 };
      }}
    >
      <Canvas
        flat
        frameloop={paused ? 'never' : 'always'}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 0], fov: 80, near: 0.1, far: DEPTH + 4 }}
        gl={{ alpha: true, antialias: true }}
        aria-hidden="true"
      >
        <Motion travel={travel} still={still} />
        {Array.from({ length: SLOTS }, (_, slot) => (
          <Tile
            key={slot}
            slot={slot}
            item={items[slot % items.length]}
            texture={textures[slot % items.length] ?? null}
            travel={travel}
            onHover={hover}
            onOpen={onOpen}
          />
        ))}
      </Canvas>
    </div>
  );
}

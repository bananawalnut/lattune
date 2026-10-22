import type { JsonValue } from '../core/index.js';
export type Vec3 = readonly [number, number, number];
export interface SampleContext {
  readonly phase: number; readonly time: number; readonly duration: number; readonly seed: number;
  readonly params: Readonly<Record<string, JsonValue>>;
  random(key?: string | number): number;
}
export interface Camera { distance: number; yaw: number; pitch: number; }
export interface SceneDescriptor {
  version: 2; seed: number; duration: number; fps: number; camera: Camera;
  surfaces: unknown[]; objects: unknown[];
}
export interface SampledFrame {
  descriptor: SceneDescriptor; buffers: Map<string, Float32Array>; context: SampleContext;
}
export class Surface<C extends SampleContext = SampleContext> {
  constructor(evaluate: (u: number, v: number, context: C) => Vec3, options?: {
    u?: [number, number]; v?: [number, number]; wrapU?: boolean; wrapV?: boolean;
    du?: (u: number, v: number, context: C) => Vec3;
    dv?: (u: number, v: number, context: C) => Vec3;
  });
  readonly u: readonly [number, number]; readonly v: readonly [number, number];
  at(u: number, v: number, context?: C): number[];
  derivative(axis: 'u' | 'v', u: number, v: number, context?: C, epsilon?: number): number[];
  normal(u: number, v: number, context?: C): number[];
}
export class Path<C extends SampleContext = SampleContext> {
  constructor(evaluate: (t: number, context: C) => readonly number[], options?: {
    domain?: [number, number]; closed?: boolean; dimensions?: 2 | 3;
    tangent?: (t: number, context: C) => readonly number[];
  });
  at(t: number, context?: C): number[];
  tangent(t: number, context?: C): number[];
  on(surface: Surface<C>): Path<C>;
}
export class BufferGeometry {
  constructor(count: number, write: (buffer: Float32Array, context: SampleContext) => void);
}
export interface LayerOptions {
  count?: number; rows?: number; columns?: number;
  transform?: readonly number[] | ((context: SampleContext) => readonly number[]);
  deform?: (position: readonly number[], context: SampleContext & { u: number; v: number; index: number }) => Vec3;
  color?: 'white' | 'mint' | 'cyan' | 'amber' | 'acid' | 'rainbow'; opacity?: number; size?: number;
  text?: string; characters?: string; mode?: 'hold' | 'flicker' | 'stream'; rate?: number; dynamic?: boolean;
}
export class Layer {
  constructor(id: string, geometry: Surface | Path | BufferGeometry, options?: LayerOptions);
}
export class Composite {
  constructor(children: (Layer | Composite)[], options?: { transform?: LayerOptions['transform'] });
}
export class Program {
  constructor(options: { root: Layer | Composite; duration?: number; fps?: number; seed?: number;
    params?: Record<string, JsonValue>; camera?: Camera; maxPoints?: number });
  readonly params: Readonly<Record<string, JsonValue>>;
  readonly renderDescriptor: SceneDescriptor;
  sample(phase: number): SampledFrame;
  context(phase: number): SampleContext;
  setParams(params: Record<string, JsonValue>): this;
  at(id: string, u: number, v?: number, phase?: number): number[];
  snapshot(phase?: number): unknown;
  audit(options?: { frames?: number }): { valid: true; frames: number; points: number; maxRadius: number; note: string };
}
export function cubic(points: readonly (readonly number[])[]): Path;
export const math: {
  readonly TAU: number;
  add(a: readonly number[], b: readonly number[]): number[];
  sub(a: readonly number[], b: readonly number[]): number[];
  scale(a: readonly number[], scale: number): number[];
  dot(a: readonly number[], b: readonly number[]): number;
  cross(a: readonly number[], b: readonly number[]): number[];
  normalize(a: readonly number[]): number[];
  identity(): number[];
  multiply(a: readonly number[], b: readonly number[]): number[];
  translate(x: number, y: number, z: number): number[];
  rotateY(angle: number): number[];
  point(matrix: readonly number[], point: readonly number[]): number[];
  random(seed: string | number, key?: string | number): number;
};

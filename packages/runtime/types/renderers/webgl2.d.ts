import type { SceneDescriptor } from '../geometry/index.js';
export interface RendererOptions {
  renderer?: 'webgl2' | 'canvas'; transparent?: boolean; capture?: boolean;
  fallback?: (canvas: HTMLCanvasElement, scene: SceneDescriptor, phase: number, selected: string | null, handles: boolean) => void;
}
export class Renderer {
  constructor(canvas: HTMLCanvasElement, options?: RendererOptions);
  readonly kind: 'webgl2' | 'canvas';
  readonly stats: { renderer: string; geometry: string; instances: number; drawCalls: number | null };
  setPointBuffers(scene: SceneDescriptor, buffers: Map<string, Float32Array>, colors?: Map<string, Float32Array> | null): this;
  render(scene: SceneDescriptor, phase: number, selected?: string | null, handles?: boolean): void;
  useWasm(url: string | URL): Promise<this>;
  dispose(): void;
}
export function createRenderer(canvas: HTMLCanvasElement, options?: RendererOptions): Renderer;
export function validateScene(scene: SceneDescriptor): SceneDescriptor;
export function loadWasm(url: string | URL): Promise<(parameters: Float64Array) => Float32Array>;

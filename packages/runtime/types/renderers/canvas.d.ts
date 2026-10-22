import type { Renderer, RendererOptions } from './webgl2.js';
export function createCanvasRenderer(canvas: HTMLCanvasElement, options?: Omit<RendererOptions, 'renderer'>): Renderer;

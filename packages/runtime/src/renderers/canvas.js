import { createRenderer } from './webgl2.js';
export const createCanvasRenderer = (canvas, options = {}) => createRenderer(canvas, { ...options, renderer: 'canvas' });

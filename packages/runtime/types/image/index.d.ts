import type { CommittedReceipt, InvokeOptions, InterfaceDescription } from '../core/index.js';
import type { SampleContext, SampledFrame, Camera, Vec3, Surface } from '../geometry/index.js';
export interface PixelData { width: number; height: number; data: Uint8Array | Uint8ClampedArray; }
export interface ImageCell {
  readonly index: number; readonly id: number; readonly column: number; readonly row: number;
  readonly u: number; readonly v: number; readonly color: Vec3; readonly luminance: number;
}
export interface ImageGrid {
  readonly type: 'glyph-image-cells'; readonly width: number; readonly height: number;
  readonly aspect: number; readonly columns: number; readonly rows: number; readonly count: number;
  readonly width3D: number; readonly height3D: number; readonly cells: readonly ImageCell[];
}
export interface SamplingOptions { columns?: number; rows?: number; alphaCutoff?: number; }
export type Preset = 'plane' | 'bend' | 'ripple' | 'fold' | 'relief' | 'anamorphic' | 'sphere' | 'torus';
export type ImageContext = SampleContext & ImageCell & { width: number; height: number; aspect: number; depth: number };
export interface TransitionOptions {
  duration?: number; mode?: 'fade' | 'sweep' | 'radial' | 'spiral' | 'scatter';
  stagger?: number; easing?: 'linear' | 'smoothstep' | 'cubic';
  sample?: (context: ImageCell & { from: Vec3; to: Vec3; progress: number }) => number;
}
export interface TransitionState { active: boolean; progress: number; duration: number; mode: string; }
export interface PhotoOffer { photo: string; }
export interface ImageState { revision: number; hasPhoto: boolean; cells: number; width: number; height: number; }
export interface ImageFrame extends SampledFrame { colors: Map<string, Float32Array>; }
export interface ImageSurfaceOptions {
  id?: string; pixels: PixelData; sampling?: SamplingOptions;
  preset?: Preset; depth?: number; animate?: boolean; characters?: string; size?: number;
  duration?: number; fps?: number; camera?: Partial<Camera>;
  surface?: Surface | ((u: number, v: number, context: ImageContext) => Vec3);
  colorField?: (context: ImageContext) => Vec3;
  transition?: TransitionOptions; resourceTTL?: number; now?: () => number;
}
export interface ImageSurface {
  readonly id: string; readonly revision: number; readonly disposed: boolean; readonly cellCount: number;
  read(): ImageState;
  describe(): { id: string; revision: number; kind: 'image-surface'; atomic: 'molecule';
    commitPolicy: 'before-presentation'; resourceScope: 'receiver-local'; interface: InterfaceDescription };
  stagePhoto(pixels: PixelData): PhotoOffer;
  releasePhoto(offer: PhotoOffer): void;
  invoke(method: 'receivePhoto', input: PhotoOffer, options?: InvokeOptions): CommittedReceipt<ImageState>;
  invoke(method: 'resetPhoto', input: Record<string, never>, options?: InvokeOptions): CommittedReceipt<ImageState>;
  sample(phase?: number): ImageFrame;
  readonly transition: TransitionState;
  advance(seconds: number): TransitionState;
  seek(progress: number): TransitionState;
  finishTransition(): TransitionState;
  dispose(): void;
}
export function createImageSurface(options: ImageSurfaceOptions): ImageSurface;
export function fromPixels(pixels: PixelData, sampling?: SamplingOptions): ImageGrid;
export const presets: readonly { readonly id: Preset; readonly name: string; readonly description: string }[];

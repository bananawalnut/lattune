import * as Geometry from '../geometry/index.js';
import { createInstance, ContractError } from '../core/index.js';
import { createProgram, fromPixels, photoBehavior, presets } from './legacy-image.js';
export { fromPixels, presets } from './legacy-image.js';
/** A photo's cells own their color; its surface independently owns their position. */
export function createImageSurface({ id = 'image-surface', pixels, sampling, transition, resourceTTL = 60000, now = Date.now, ...settings }) {
    if (!Number.isFinite(resourceTTL) || resourceTTL < 1 || resourceTTL > 300000 || typeof now !== 'function') {
        throw new ContractError('invalid_resource_policy', 'Resource TTL must be 1..300000ms and clock callable.');
    }
    let grid = fromPixels(pixels, sampling);
    let bundle = photoBehavior(createProgram(Geometry, grid, settings), { transition });
    const staged = new Map();
    const time = () => {
        const value = now();
        if (!Number.isFinite(value))
            throw new ContractError('invalid_clock', 'Clock must be finite.');
        return value;
    };
    const purge = () => {
        const current = time();
        for (const [photo, expires] of staged) {
            if (expires <= current) {
                staged.delete(photo);
                bundle.appearance.release(photo);
            }
        }
    };
    const description = bundle.appearance.describe();
    const methods = Object.fromEntries(Object.entries(description.methods).map(([name, schema]) => [name, {
            ...schema,
            handle(_state, payload) {
                if (name === 'receivePhoto') {
                    purge();
                    if (!staged.has(payload.photo)) {
                        throw new ContractError('invalid_resource', 'Stage an unexpired photo on this receiver.');
                    }
                }
                const result = bundle.appearance.invoke(name, payload);
                if (name === 'receivePhoto')
                    staged.delete(payload.photo);
                return { state: result, result };
            },
        }]));
    const instance = createInstance({
        id, initial: bundle.appearance.state,
        interface: { description: description.description, state: description.state, methods },
    });
    const assertLive = () => {
        if (instance.disposed)
            throw new ContractError('disposed', 'The image surface is disposed.');
    };
    return Object.freeze({
        id,
        get revision() { return instance.revision; },
        get disposed() { return instance.disposed; },
        get cellCount() { assertLive(); return grid.count; },
        read: instance.read,
        describe() {
            const result = instance.describe();
            return { ...result, kind: 'image-surface', atomic: 'molecule',
                commitPolicy: 'before-presentation', resourceScope: 'receiver-local' };
        },
        stagePhoto(photoPixels) {
            assertLive();
            purge();
            const expires = time() + resourceTTL;
            const offer = bundle.appearance.offer(photoPixels);
            if (staged.size >= 4) {
                const oldest = staged.keys().next().value;
                staged.delete(oldest);
                bundle.appearance.release(oldest);
            }
            staged.set(offer.photo, expires);
            return offer;
        },
        releasePhoto({ photo }) {
            assertLive();
            staged.delete(photo);
            bundle.appearance.release(photo);
        },
        invoke: instance.invoke,
        sample(phase = 0) { assertLive(); return bundle.sample(phase); },
        get transition() { assertLive(); return { ...bundle.appearance.transitionState }; },
        advance(seconds) { assertLive(); return bundle.appearance.advance(seconds); },
        seek(progress) { assertLive(); return bundle.appearance.seek(progress); },
        finishTransition() { assertLive(); return bundle.appearance.seek(1); },
        dispose() {
            if (instance.disposed)
                return;
            instance.dispose();
            staged.clear();
            bundle.appearance.dispose();
            bundle = null;
            grid = null;
        },
    });
}

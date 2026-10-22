/* Optional image cells: stable UV identity, independent XYZ geometry and per-cell RGB. */
const MAX_CELLS = 24000, MAX_PIXELS = 16777216;
let photoReceiverSerial = 0;
const presets = Object.freeze([
    { id: 'plane', name: 'Image plane', description: 'Image aspect ratio, with one RGB color per cell.' },
    { id: 'bend', name: 'Curved sheet', description: 'Bend the image around a vertical cylinder without changing its UV colors.' },
    { id: 'ripple', name: 'Ripple field', description: 'Concentric depth waves under a stable image grid.' },
    { id: 'fold', name: 'Accordion', description: 'Fold a colored sheet along vertical creases.' },
    { id: 'relief', name: 'Luminance relief', description: 'Use image brightness as authored depth; this is not measured depth.' },
    { id: 'anamorphic', name: 'Perspective illusion', description: 'Depth compensated for the front camera: aligned head-on, distorted from the side.' },
    { id: 'sphere', name: 'Sphere wrap', description: 'Image UVs and per-cell colors wrapped around a spherical carrier.' },
    { id: 'torus', name: 'Torus wrap', description: 'Image UVs and per-cell colors carried around a toroidal surface.' }
].map(Object.freeze));
function number(x, min, max, name) { if (!Number.isFinite(x) || x < min || x > max)
    throw Error(name + ' needs ' + min + '..' + max + '.'); return x; }
function integer(x, min, max, name) { number(x, min, max, name); if (!Number.isInteger(x))
    throw Error(name + ' must be an integer.'); return x; }
function rgb(v) { if (!v || v.length !== 3)
    throw Error('Return three RGB channels.'); return Array.from(v, x => number(x, 0, 1, 'RGB')); }
// Copy pixels once. Sampling is CPU-side, not a texture overlay or a CSS mask.
function fromPixels(image, { columns = 128, rows, alphaCutoff = 128 } = {}) {
    const width = integer(image?.width, 1, 8192, 'Image width'), height = integer(image?.height, 1, 8192, 'Image height');
    if (width * height > MAX_PIXELS || !image.data || image.data.length !== width * height * 4)
        throw Error('Supply at most 16 megapixels of RGBA bytes.');
    if (!(image.data instanceof Uint8Array || image.data instanceof Uint8ClampedArray))
        throw Error('RGBA data needs a byte array.');
    const aspect = width / height;
    if (aspect < 1 / 32 || aspect > 32)
        throw Error('Image aspect needs 1:32..32:1.');
    integer(columns, 2, 512, 'Columns');
    rows = rows ?? Math.max(2, Math.round(columns / aspect));
    integer(rows, 2, 512, 'Rows');
    integer(alphaCutoff, 1, 255, 'Alpha cutoff');
    if (columns * rows > MAX_CELLS)
        throw Error('Image cell budget exceeds ' + MAX_CELLS + '.');
    const cells = [];
    for (let y = 0; y < rows; y++)
        for (let x = 0; x < columns; x++) {
            const u = (x + .5) / columns, v = (y + .5) / rows, offset = (Math.min(height - 1, Math.floor(v * height)) * width + Math.min(width - 1, Math.floor(u * width))) * 4;
            if (image.data[offset + 3] < alphaCutoff)
                continue;
            const color = Object.freeze([image.data[offset] / 255, image.data[offset + 1] / 255, image.data[offset + 2] / 255]);
            cells.push(Object.freeze({ index: cells.length, id: y * columns + x, column: x, row: y, u, v, color, luminance: color[0] * .2126 + color[1] * .7152 + color[2] * .0722 }));
        }
    if (!cells.length)
        throw Error('The image has no visible cells.');
    const height3D = aspect >= 1 ? 3.2 / aspect : 3.2, width3D = height3D * aspect;
    return Object.freeze({ type: 'glyph-image-cells', width, height, aspect, columns, rows, count: cells.length, width3D, height3D, cells: Object.freeze(cells) });
}
function options(value = {}) {
    if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(k => !['preset', 'depth', 'animate', 'characters', 'size', 'camera', 'surface', 'colorField', 'duration', 'fps'].includes(k)))
        throw Error('Use documented image surface options.');
    const o = { preset: 'anamorphic', depth: .75, animate: false, characters: '●', size: 8, duration: 12, fps: 30, ...value };
    if (!presets.some(p => p.id === o.preset))
        throw Error('Unknown image surface preset.');
    number(o.depth, 0, 1.5, 'Depth');
    number(o.size, 3, 24, 'Glyph size');
    number(o.duration, 1, 120, 'Duration');
    integer(o.fps, 1, 60, 'FPS');
    if (typeof o.animate !== 'boolean' || typeof o.characters !== 'string' || !o.characters.length || o.characters.length > 128)
        throw Error('Invalid glyph or animation options.');
    if (o.surface !== undefined && typeof o.surface !== 'function' && typeof o.surface?.at !== 'function')
        throw Error('Surface needs a function or GlyphProgram.Surface.');
    if (o.colorField !== undefined && o.colorField !== null && typeof o.colorField !== 'function')
        throw Error('Color field needs a synchronous RGB evaluator.');
    const camera = { distance: 5, yaw: 0, pitch: 0, ...o.camera };
    number(camera.distance, 3.5, 10, 'Camera distance');
    number(camera.yaw, -Math.PI * 2, Math.PI * 2, 'Yaw');
    number(camera.pitch, -1.5, 1.5, 'Pitch');
    return { ...o, camera };
}
function point(image, cell, o, c) {
    const x = (cell.u - .5) * image.width3D, y = (.5 - cell.v) * image.height3D, depth = o.depth, phase = o.animate ? c.phase * 2 * Math.PI : 0;
    const context = { ...c, ...cell, width: image.width3D, height: image.height3D, aspect: image.aspect, depth };
    if (o.surface) {
        if (typeof o.surface === 'function')
            return o.surface(cell.u, cell.v, context);
        const s = o.surface;
        return s.at(s.u[0] + cell.u * (s.u[1] - s.u[0]), s.v[0] + cell.v * (s.v[1] - s.v[0]), context);
    }
    if (o.preset === 'bend') {
        const bend = depth * 1.8;
        if (bend < 1e-8)
            return [x, y, 0];
        const radius = image.width3D / bend, angle = (cell.u - .5) * bend;
        return [radius * Math.sin(angle), y, radius * (1 - Math.cos(angle))];
    }
    if (o.preset === 'fold')
        return [x, y, depth * (Math.abs(((cell.u * 6) % 2) - 1) - .5)];
    if (o.preset === 'relief')
        return [x, y, depth * (cell.luminance - .5)];
    if (o.preset === 'ripple')
        return [x, y, depth * .5 * Math.cos(Math.hypot(x, y) * 5 - phase)];
    if (o.preset === 'sphere') {
        const a = cell.u * Math.PI * 2, b = (.5 - cell.v) * Math.PI;
        return [1.25 * Math.cos(b) * Math.sin(a), 1.25 * Math.sin(b), 1.25 * Math.cos(b) * Math.cos(a)];
    }
    if (o.preset === 'torus') {
        const a = cell.u * Math.PI * 2, b = cell.v * Math.PI * 2, r = 1 + .38 * Math.cos(b);
        return [r * Math.cos(a), .38 * Math.sin(b), r * Math.sin(a)];
    }
    if (o.preset === 'anamorphic') {
        // For the reference view yaw=pitch=0: x'/(distance-z) == x/distance.
        const z = depth * (.65 * Math.sin(cell.u * Math.PI * 4 + phase) + .35 * Math.cos(cell.v * Math.PI * 4 - phase));
        return [x * (5 - z) / 5, y * (5 - z) / 5, z];
    }
    return [x, y, 0];
}
function createProgram(A, image, settings = {}) {
    if (image?.type !== 'glyph-image-cells' || !Object.isFrozen(image) || !image.count || image.count > MAX_CELLS)
        throw Error('Use fromPixels() to create image cells.');
    const o = options(settings), colors = new Float32Array(image.count * 3), scratchColors = new Float32Array(image.count * 3);
    for (const cell of image.cells)
        colors.set(cell.color, cell.index * 3);
    const geometry = new A.BufferGeometry(image.count, (out, c) => { for (const cell of image.cells) {
        const p = point(image, cell, o, c);
        if (!p || p.length !== 3 || !Array.from(p).every(Number.isFinite))
            throw Error('Surface must return finite XYZ.');
        out.set([...p, cell.id, cell.u, cell.v], cell.index * 6);
    } });
    const program = new A.Program({ root: new A.Layer('image', geometry, { color: 'white', characters: o.characters, size: o.size, dynamic: o.animate || !!o.surface }), camera: o.camera, duration: o.duration, fps: o.fps });
    const bundle = { image, program, options: o, sample(phase) {
            // Validate RGB before sampling geometry; an invalid color field cannot corrupt the last frame.
            if (o.colorField) {
                const context = program.context(phase);
                for (const cell of image.cells)
                    scratchColors.set(rgb(o.colorField({ ...context, ...cell, width: image.width3D, height: image.height3D, aspect: image.aspect, depth: o.depth })), cell.index * 3);
            }
            const frame = program.sample(phase);
            if (o.colorField)
                colors.set(scratchColors);
            return { ...frame, colors: new Map([['image', colors]]) };
        } };
    bundle.sample(0);
    return bundle;
}
function definition(value) {
    const keys = (o, allowed) => { if (!o || typeof o !== 'object' || Array.isArray(o) || Object.keys(o).length !== allowed.length || Object.keys(o).some(k => !allowed.includes(k)))
        throw Error('Invalid image component definition.'); };
    keys(value, ['version', 'kind', 'id', 'atomic', 'surface', 'appearance', 'sampling', 'animation', 'camera', ...(Object.hasOwn(value || {}, 'transition') ? ['transition'] : [])]);
    if (value.transition !== undefined) {
        keys(value.transition, ['duration', 'mode', 'stagger', 'easing']);
        photoTransition(value.transition);
    }
    if (value.version !== 1 || value.kind !== 'image-surface-component' || value.id !== 'image-surface' || value.atomic !== 'molecule')
        throw Error('Use a version 1 image-surface molecule.');
    keys(value.surface, ['preset', 'depth']);
    keys(value.appearance, ['behavior', 'characters', 'size']);
    keys(value.sampling, ['columns', 'alphaCutoff']);
    keys(value.animation, ['enabled', 'duration']);
    keys(value.camera, ['yaw', 'pitch', 'distance']);
    if (value.appearance.behavior !== 'image-color')
        throw Error('Use the image-color appearance behavior.');
    integer(value.sampling.columns, 2, 128, 'Columns');
    integer(value.sampling.alphaCutoff, 1, 255, 'Alpha cutoff');
    options({ preset: value.surface.preset, depth: value.surface.depth, characters: value.appearance.characters, size: value.appearance.size, animate: value.animation.enabled, duration: value.animation.duration, camera: value.camera });
    return structuredClone(value);
}
function fromDefinition(A, pixels, value) { const d = definition(value), bundle = createProgram(A, fromPixels(pixels, d.sampling), { preset: d.surface.preset, depth: d.surface.depth, characters: d.appearance.characters, size: d.appearance.size, animate: d.animation.enabled, duration: d.animation.duration, camera: d.camera }); return { ...bundle, ...(d.transition ? { photoTransition: d.transition } : {}) }; }
function map(A, image, surface, settings = {}) { if (!surface)
    throw Error('Supply the receiving surface evaluator.'); return createProgram(A, image, { ...settings, surface }); }
function photoTransition(value) {
    if (value === undefined)
        return { duration: 0, mode: 'fade', stagger: .65, easing: 'smoothstep' };
    if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(k => !['duration', 'mode', 'stagger', 'easing', 'sample'].includes(k)))
        throw Error('Use documented photo transition settings.');
    const c = { duration: 2.4, mode: 'radial', stagger: .65, easing: 'smoothstep', ...value };
    number(c.duration, 0, 12, 'Transition duration');
    number(c.stagger, 0, .95, 'Transition stagger');
    if (!['fade', 'sweep', 'radial', 'spiral', 'scatter'].includes(c.mode) || !['linear', 'smoothstep', 'cubic'].includes(c.easing) || c.sample !== undefined && typeof c.sample !== 'function')
        throw Error('Invalid photo transition mode, easing or sample function.');
    return c;
}
// A color-only decorator with an explicit, reproducible transition clock.
function photoBehavior(bundle, settings = {}) {
    if (!bundle?.image?.cells || typeof bundle.sample !== 'function' || !bundle.program)
        throw Error('Attach photo reception to an image-cell program.');
    const image = bundle.image, pending = new Map(), output = new Float32Array(image.count * 3), scratch = new Float32Array(output.length), identity = globalThis.crypto?.randomUUID?.() || 'receiver-' + (++photoReceiverSerial);
    let serial = 0, revision = 0, active = null, origin = null, progress = 1, lastPhase = 0, flightInputs = null, configured = photoTransition(settings.transition ?? bundle.photoTransition), flight = configured, dimensions = { width: 0, height: 0 };
    const state = () => ({ revision, hasPhoto: !!active, cells: image.count, ...dimensions });
    function inputs(from, to) { return image.cells.map(cell => Object.freeze({ ...cell, from: Object.freeze(Array.from(from.subarray(cell.index * 3, cell.index * 3 + 3))), to: Object.freeze(Array.from(to.subarray(cell.index * 3, cell.index * 3 + 3))) })); }
    function interpolate(from, to, config, p, out, contexts) {
        for (const cell of image.cells) {
            let t = p;
            if (p > 0 && p < 1) {
                if (config.sample)
                    t = number(config.sample({ ...contexts[cell.index], progress: p }), 0, 1, 'Transition sample');
                else {
                    const u = cell.u, v = cell.v, r = Math.hypot(u - .5, v - .5) / Math.SQRT1_2, rank = config.mode === 'sweep' ? u : config.mode === 'radial' ? r : config.mode === 'spiral' ? ((Math.atan2(v - .5, u - .5) / Math.PI / 2 + 1) % 1 + r) * .5 : config.mode === 'scatter' ? ((Math.imul(cell.id + 1, 1664525) + 1013904223) >>> 0) / 4294967296 : 0;
                    t = config.mode === 'fade' ? p : Math.max(0, Math.min(1, (p - rank * config.stagger) / (1 - config.stagger)));
                    if (config.easing === 'smoothstep')
                        t = t * t * (3 - 2 * t);
                    if (config.easing === 'cubic')
                        t = 1 - Math.pow(1 - t, 3);
                }
            }
            for (let k = 0; k < 3; k++) {
                const n = cell.index * 3 + k;
                out[n] = from[n] + (to[n] - from[n]) * t;
            }
        }
    }
    function current() { if (!active)
        return bundle.sample(lastPhase).colors.get('image'); interpolate(origin, active, flight, progress, scratch, flightInputs); return scratch; }
    const object = properties => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false }), int = { type: 'integer', minimum: 0, maximum: Number.MAX_SAFE_INTEGER }, result = object({ revision: int, hasPhoto: { type: 'boolean' }, cells: int, width: int, height: int });
    const signature = { description: 'Receive a local photo as per-cell color state while preserving geometry and component logic.', state: result, methods: {
            receivePhoto: { description: 'Commit a staged local photo to RGB state and animate its colors using the component’s transition. The receipt acknowledges target state; the visual transition may still be running.', input: object({ photo: { type: 'string', minLength: 1, maxLength: 120 } }), output: result },
            resetPhoto: { description: 'Remove received photo colors and restore the underlying appearance.', input: object({}), output: result }
        } };
    const appearance = {
        get state() { return state(); }, get colors() { return active ? active.slice() : null; }, get displayColors() { return current().slice(); },
        get transitionState() { return { active: !!active && progress < 1, progress, duration: flight.duration, mode: flight.sample ? 'custom' : flight.mode }; },
        configureTransition(value) { configured = photoTransition(value); },
        seek(value) { number(value, 0, 1, 'Transition progress'); if (active)
            interpolate(origin, active, flight, value, scratch, flightInputs); progress = value; return this.transitionState; },
        advance(seconds) { number(seconds, 0, 60, 'Transition elapsed seconds'); return this.seek(Math.min(1, progress + (flight.duration ? seconds / flight.duration : 1))); },
        describe: () => structuredClone(signature),
        offer(pixels) {
            const width = integer(pixels?.width, 1, 8192, 'Photo width'), height = integer(pixels?.height, 1, 8192, 'Photo height');
            if (width * height > MAX_PIXELS || !(pixels.data instanceof Uint8Array || pixels.data instanceof Uint8ClampedArray) || pixels.data.length !== width * height * 4)
                throw Error('Supply at most 16 megapixels of local RGBA bytes.');
            const rgba = new Float32Array(image.count * 4);
            for (const c of image.cells) {
                const source = (Math.min(height - 1, Math.floor(c.v * height)) * width + Math.min(width - 1, Math.floor(c.u * width))) * 4;
                for (let k = 0; k < 4; k++)
                    rgba[c.index * 4 + k] = pixels.data[source + k] / 255;
            }
            if (pending.size >= 4)
                pending.delete(pending.keys().next().value);
            const photo = 'photo-' + identity + '-' + (++serial);
            pending.set(photo, { rgba, width, height });
            return { photo };
        },
        release(photo) { return pending.delete(photo); },
        dispose() { pending.clear(); active = null; origin = null; flightInputs = null; output.fill(0); scratch.fill(0); },
        invoke(method, payload) {
            if (!payload || typeof payload !== 'object' || Array.isArray(payload))
                throw Error('Use the photo method’s object contract.');
            if (method === 'receivePhoto') {
                if (Object.keys(payload).length !== 1 || typeof payload.photo !== 'string' || !pending.has(payload.photo))
                    throw Error('Stage a local photo on this component before receiving it.');
                const photo = pending.get(payload.photo), base = current().slice(), next = new Float32Array(image.count * 3);
                for (let i = 0; i < image.count; i++) {
                    const alpha = photo.rgba[i * 4 + 3];
                    for (let k = 0; k < 3; k++)
                        next[i * 3 + k] = base[i * 3 + k] * (1 - alpha) + photo.rgba[i * 4 + k] * alpha;
                }
                // Reject invalid custom math before consuming the resource or committing state.
                const candidateInputs = configured.sample ? inputs(base, next) : null;
                if (configured.sample)
                    for (const p of [.001, .25, .5, .75, .999])
                        interpolate(base, next, configured, p, scratch, candidateInputs);
                origin = base;
                active = next;
                flightInputs = candidateInputs;
                flight = { ...configured };
                progress = flight.duration ? 0 : 1;
                dimensions = { width: photo.width, height: photo.height };
                pending.delete(payload.photo);
            }
            else if (method === 'resetPhoto') {
                if (Object.keys(payload).length)
                    throw Error('resetPhoto accepts an empty object.');
                active = null;
                origin = null;
                flightInputs = null;
                progress = 1;
                dimensions = { width: 0, height: 0 };
            }
            else
                throw Error('Choose receivePhoto or resetPhoto.');
            revision++;
            return state();
        }
    };
    return { ...bundle, appearance, sample(phase) { lastPhase = phase; const frame = bundle.sample(phase); if (!active)
            return frame; output.set(current()); const colors = new Map(frame.colors); colors.set('image', output); return { ...frame, colors }; } };
}
export { presets, MAX_CELLS, fromPixels, createProgram, options, definition, fromDefinition, map, photoTransition, photoBehavior };

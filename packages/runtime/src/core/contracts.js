/* Optional Glyph Flow: JSON contracts, functional state, deterministic navigation. */
class FlowError extends Error {
    constructor(code, message) { super(message); this.name = 'ContractError'; this.code = code; }
}
const fail = (code, message) => { throw new FlowError(code, message); };
function json(value) { let nodes = 0; const seen = new Set(); function copy(v, depth) { if (++nodes > 8192 || depth > 16)
    fail('payload_limit', 'Content exceeds the JSON size/depth limit.'); if (v === null || typeof v === 'boolean' || typeof v === 'string')
    return v; if (typeof v === 'number' && Number.isFinite(v))
    return v; if (typeof v !== 'object' || seen.has(v))
    fail('invalid_json', 'Use finite JSON values without cycles.'); seen.add(v); let out; if (Array.isArray(v)) {
    if (v.length > 1024)
        fail('payload_limit', 'Arrays are limited to 1024 entries.');
    out = Array.from(v, x => copy(x, depth + 1));
}
else {
    if (Object.getPrototypeOf(v) !== Object.prototype && Object.getPrototypeOf(v) !== null)
        fail('invalid_json', 'Use plain JSON objects.');
    out = {};
    for (const key of Object.keys(v)) {
        if (['__proto__', 'constructor', 'prototype'].includes(key))
            fail('invalid_json', 'Reserved object key.');
        out[key] = copy(v[key], depth + 1);
    }
} seen.delete(v); return out; } const result = copy(value, 0); if (new TextEncoder().encode(JSON.stringify(result)).length > 65536)
    fail('payload_limit', 'Content is limited to 64 KiB.'); return result; }
function freeze(v) { if (v && typeof v === 'object') {
    for (const x of Object.values(v))
        freeze(x);
    Object.freeze(v);
} return v; }
function canonical(v) { if (v === null || typeof v !== 'object')
    return JSON.stringify(v); if (Array.isArray(v))
    return '[' + v.map(canonical).join(',') + ']'; return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}'; }
const common = ['type', 'enum'], keywords = { object: ['properties', 'required', 'additionalProperties'], array: ['items', 'minItems', 'maxItems'], string: ['minLength', 'maxLength'], number: ['minimum', 'maximum'], integer: ['minimum', 'maximum'], boolean: [], null: [] };
function contract(value) { const c = json(value); function visit(s, depth) { if (depth > 8 || !s || typeof s !== 'object' || Array.isArray(s) || !Object.hasOwn(keywords, s.type))
    fail('invalid_contract', 'Every contract needs a supported type.'); for (const k of Object.keys(s))
    if (![...common, ...keywords[s.type]].includes(k))
        fail('invalid_contract', 'Unsupported contract keyword: ' + k); if (s.enum !== undefined && (!Array.isArray(s.enum) || !s.enum.length))
    fail('invalid_contract', 'enum must be nonempty.'); if (s.type === 'object') {
    if (!s.properties || typeof s.properties !== 'object' || Array.isArray(s.properties))
        fail('invalid_contract', 'Object contracts need properties.');
    if (s.additionalProperties !== false)
        fail('invalid_contract', 'Object contracts require additionalProperties:false.');
    if (s.required !== undefined && (!Array.isArray(s.required) || s.required.some(k => typeof k !== 'string' || !Object.hasOwn(s.properties, k))))
        fail('invalid_contract', 'required must name defined properties.');
    for (const child of Object.values(s.properties))
        visit(child, depth + 1);
} if (s.type === 'array')
    visit(s.items, depth + 1); for (const k of ['minItems', 'maxItems', 'minLength', 'maxLength'])
    if (s[k] !== undefined && (!Number.isSafeInteger(s[k]) || s[k] < 0))
        fail('invalid_contract', 'Contract bounds must be nonnegative integers.'); for (const k of ['minimum', 'maximum'])
    if (s[k] !== undefined && (typeof s[k] !== 'number' || !Number.isFinite(s[k])))
        fail('invalid_contract', 'Number bounds must be finite.'); for (const [lo, hi] of [['minItems', 'maxItems'], ['minLength', 'maxLength'], ['minimum', 'maximum']])
    if (s[lo] !== undefined && s[hi] !== undefined && s[lo] > s[hi])
        fail('invalid_contract', 'Contract bounds are reversed.'); } visit(c, 0); return freeze(c); }
function validate(schema, value) { const v = json(value); function check(s, x, path) { const ok = s.type === 'null' ? x === null : s.type === 'array' ? Array.isArray(x) : s.type === 'object' ? x !== null && !Array.isArray(x) && typeof x === 'object' : s.type === 'integer' ? Number.isSafeInteger(x) : typeof x === s.type; if (!ok)
    fail('contract_mismatch', path + ' must be ' + s.type + '.'); if (s.enum && !s.enum.some(e => canonical(e) === canonical(x)))
    fail('contract_mismatch', path + ' is outside enum.'); if (s.type === 'object') {
    for (const k of s.required || [])
        if (!Object.hasOwn(x, k))
            fail('contract_mismatch', path + '.' + k + ' is required.');
    for (const k of Object.keys(x)) {
        if (!Object.hasOwn(s.properties, k))
            fail('contract_mismatch', path + '.' + k + ' is not accepted.');
        check(s.properties[k], x[k], path + '.' + k);
    }
} if (s.type === 'array') {
    if (x.length < (s.minItems || 0) || x.length > (s.maxItems ?? 1024))
        fail('contract_mismatch', path + ' has an invalid item count.');
    x.forEach((e, i) => check(s.items, e, path + '[' + i + ']'));
} if (s.type === 'string' && (x.length < (s.minLength || 0) || x.length > (s.maxLength ?? 65536)))
    fail('contract_mismatch', path + ' has an invalid length.'); if (['number', 'integer'].includes(s.type) && (x < (s.minimum ?? -Infinity) || x > (s.maximum ?? Infinity)))
    fail('contract_mismatch', path + ' is outside its numeric range.'); } check(schema, v, 'input'); return freeze(v); }
// Presentation is data, separate from the state handler and input/result contracts.
function interaction(value = {}) { const spec = json(value); if (!spec || Array.isArray(spec) || typeof spec !== 'object' || Object.keys(spec).some(k => !['travel', 'receive', 'duration', 'textField'].includes(k)))
    fail('invalid_interaction', 'Use travel, receive, duration and textField interaction options.'); const next = { travel: spec.travel ?? 'stream', receive: spec.receive ?? 'none', duration: spec.duration ?? .9, textField: spec.textField ?? null }; if (!['stream', 'hop'].includes(next.travel) || !['none', 'pixel-sort', 'categorize'].includes(next.receive) || !Number.isFinite(next.duration) || next.duration < 0 || next.duration > 3 || !(next.textField === null || typeof next.textField === 'string' && /^[a-zA-Z][a-zA-Z0-9_-]{0,39}$/.test(next.textField)))
    fail('invalid_interaction', 'Unsupported interaction or duration outside 0..3 seconds.'); return freeze(next); }
// Interface objects own typed method dispatch; transport and visual form stay separate.
class ComponentInterface {
    constructor({ state, methods, description }) { if (description !== undefined && (typeof description !== 'string' || description.length > 1000))
        fail('invalid_interface', 'Description must be text up to 1000 characters.'); this.description = description; this.state = contract(state); if (!methods || typeof methods !== 'object' || Array.isArray(methods) || !Object.keys(methods).length || Object.keys(methods).length > 16)
        fail('invalid_interface', 'Define 1..16 methods.'); const entries = {}; for (const [name, m] of Object.entries(methods)) {
        if (!/^[a-zA-Z][a-zA-Z0-9_-]{0,39}$/.test(name) || ['constructor', 'prototype', '__proto__'].includes(name) || !m || typeof m.handle !== 'function')
            fail('invalid_interface', 'Each named method needs a handler.');
        if (m.description !== undefined && (typeof m.description !== 'string' || m.description.length > 1000))
            fail('invalid_interface', 'Method description must be text up to 1000 characters.');
        entries[name] = Object.freeze({ ...(m.description !== undefined ? { description: m.description } : {}), input: contract(m.input), output: contract(m.output), handle: m.handle, interaction: interaction(m.interaction) });
    } this.methods = Object.freeze(entries); Object.freeze(this); }
    signature(name) { const method = Object.hasOwn(this.methods, name) ? this.methods[name] : null; if (!method)
        fail('unknown_method', 'Unknown component method: ' + name); return method; }
    run(state, name, payload) { const m = this.signature(name), current = validate(this.state, state), input = validate(m.input, payload), next = m.handle(current, input); if (!next || !Object.hasOwn(next, 'state') || !Object.hasOwn(next, 'result'))
        fail('invalid_result', 'A method handler returns { state, result }.'); return { state: validate(this.state, next.state), result: validate(m.output, next.result) }; }
    describe() { return json({ ...(this.description !== undefined ? { description: this.description } : {}), state: this.state, methods: Object.fromEntries(Object.entries(this.methods).map(([name, m]) => [name, { ...(m.description !== undefined ? { description: m.description } : {}), input: m.input, output: m.output, interaction: m.interaction }])) }); }
}
export { FlowError as ContractError, ComponentInterface, json, freeze, canonical, contract, validate };

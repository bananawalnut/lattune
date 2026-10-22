import { ComponentInterface, ContractError, canonical, json, validate } from './contracts.js';
/** Headless, synchronous state owner. Presentation and persistence are host concerns. */
export function createInstance({ id, interface: specification, initial }) {
    if (typeof id !== 'string' || !/^[a-z][a-z0-9_/-]{0,127}$/i.test(id)) {
        throw new ContractError('invalid_id', 'Supply a stable component id.');
    }
    const contract = specification instanceof ComponentInterface
        ? specification : new ComponentInterface(specification);
    // Validate without invoking a method or trusting the caller's mutable initial state.
    let state = json(initial);
    validate(contract.state, state);
    let revision = 0;
    let disposed = false;
    const receipts = new Map();
    const assertLive = () => {
        if (disposed)
            throw new ContractError('disposed', 'The component is disposed.');
    };
    return Object.freeze({
        id,
        get revision() { return revision; },
        get disposed() { return disposed; },
        read() { assertLive(); return json(state); },
        describe() {
            assertLive();
            return { id, revision, interface: contract.describe() };
        },
        invoke(method, input, options = {}) {
            assertLive();
            if (!options || typeof options !== 'object' || Array.isArray(options)
                || Object.keys(options).some(k => !['expectedRevision', 'requestId'].includes(k))) {
                throw new ContractError('invalid_options', 'Use expectedRevision and requestId.');
            }
            const { expectedRevision, requestId } = options;
            if (expectedRevision !== undefined && (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0)) {
                throw new ContractError('invalid_revision', 'Expected revision must be a nonnegative integer.');
            }
            if (requestId !== undefined && (typeof requestId !== 'string' || !requestId.length || requestId.length > 120)) {
                throw new ContractError('invalid_request', 'Request id must contain 1..120 characters.');
            }
            if (typeof method !== 'string')
                throw new ContractError('unknown_method', 'Method name must be text.');
            const payload = json(input);
            const fingerprint = canonical({ method, payload, expectedRevision: expectedRevision ?? null });
            if (requestId && receipts.has(requestId)) {
                const prior = receipts.get(requestId);
                if (prior.fingerprint !== fingerprint) {
                    throw new ContractError('request_conflict', 'Request id already has different arguments.');
                }
                return json(prior.receipt);
            }
            if (expectedRevision !== undefined && expectedRevision !== revision) {
                throw new ContractError('revision_conflict', 'Component state changed.');
            }
            const next = contract.run(state, method, payload);
            state = next.state;
            revision += 1;
            const receipt = {
                status: 'committed', id, method, revision, result: json(next.result),
            };
            if (requestId) {
                if (receipts.size >= 128)
                    receipts.delete(receipts.keys().next().value);
                receipts.set(requestId, { fingerprint, receipt });
            }
            return json(receipt);
        },
        dispose() {
            if (disposed)
                return;
            disposed = true;
            state = null;
            receipts.clear();
        },
    });
}

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
/** Deliberately bounded JSON Schema subset; unknown keywords are rejected. */
export interface Schema {
  readonly type: 'object' | 'array' | 'string' | 'number' | 'integer' | 'boolean' | 'null';
  readonly enum?: readonly JsonValue[];
  readonly properties?: Readonly<Record<string, Schema>>;
  readonly required?: readonly string[];
  readonly additionalProperties?: false;
  readonly items?: Schema;
  readonly minItems?: number; readonly maxItems?: number;
  readonly minLength?: number; readonly maxLength?: number;
  readonly minimum?: number; readonly maximum?: number;
}
export class ContractError extends Error { readonly code: string; constructor(code: string, message: string); }
export interface Method<State = JsonValue> {
  description?: string; input: Schema; output: Schema;
  handle(state: Readonly<State>, input: JsonValue): { state: State; result: JsonValue };
}
export interface InterfaceSpecification<State = JsonValue> {
  description?: string; state: Schema; methods: Record<string, Method<State>>;
}
export interface InterfaceDescription {
  description?: string; state: Schema;
  methods: Record<string, { description?: string; input: Schema; output: Schema; interaction: JsonValue }>;
}
export class ComponentInterface<State = JsonValue> {
  constructor(specification: InterfaceSpecification<State>);
  readonly state: Schema;
  run(state: State, method: string, input: JsonValue): { state: State; result: JsonValue };
  describe(): InterfaceDescription;
}
export interface InvokeOptions { expectedRevision?: number; requestId?: string; }
export interface CommittedReceipt<Result = JsonValue> {
  status: 'committed'; id: string; method: string; revision: number; result: Result;
}
export interface ComponentInstance<State = JsonValue> {
  readonly id: string; readonly revision: number; readonly disposed: boolean;
  read(): State;
  describe(): { id: string; revision: number; interface: InterfaceDescription };
  invoke(method: string, input: JsonValue, options?: InvokeOptions): CommittedReceipt;
  dispose(): void;
}
export function createInstance<State>(options: {
  id: string; interface: ComponentInterface<State> | InterfaceSpecification<State>; initial: State;
}): ComponentInstance<State>;
export function json<T extends JsonValue>(value: T): T;
export function freeze<T>(value: T): Readonly<T>;
export function canonical(value: JsonValue): string;
export function contract(schema: Schema): Readonly<Schema>;
export function validate<T extends JsonValue = JsonValue>(schema: Schema, value: unknown): Readonly<T>;

declare var __dirname: string;
declare var __filename: string;

declare interface NodeModule {
  exports: any;
  id: string;
}

declare interface NodeRequire {
  (id: string): any;
  main?: NodeModule;
}

declare var require: NodeRequire;
declare var module: NodeModule;

declare var process: {
  env: Record<string, string | undefined>;
  uptime(): number;
  exit(code?: number): never;
  on(event: string, listener: (...args: any[]) => void): void;
};

declare module "path" {
  export function resolve(...pathSegments: string[]): string;
  export function join(...paths: string[]): string;
}

declare module "fs" {
  export function existsSync(path: string): boolean;
}

declare module "assert" {
  function assert(value: unknown, message?: string | Error): asserts value;
  namespace assert {
    function ok(value: unknown, message?: string | Error): asserts value;
    function strictEqual<T>(actual: unknown, expected: T, message?: string | Error): asserts actual is T;
    function deepStrictEqual<T>(actual: unknown, expected: T, message?: string | Error): asserts actual is T;
  }
  export = assert;
}

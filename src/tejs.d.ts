declare module "te.js" {
  import type { IncomingMessage, ServerResponse } from "node:http";

  export class Target {
    constructor(base?: string);
    register(path: string, ...middlewaresOrHandler: unknown[]): void;
  }

  export default class Tejas {
    constructor(options?: { port?: number; log?: { http_requests?: boolean; exceptions?: boolean } });
    takeoff(): void;
  }
}

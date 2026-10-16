export interface Storage {
  load(): any | Promise<any>;
  save(db: any): void | Promise<void>;
}
export interface Backend {
  handle(method: string, path: string, body: unknown, token: string | null): Promise<{ status: number; data: any }>;
}
export declare const ASSETS: { symbol: string; name: string; price: number; color: string }[];
export declare function emptyDb(): any;
export declare function createBackend(storage: Storage): Backend;

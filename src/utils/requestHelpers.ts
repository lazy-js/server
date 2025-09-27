import { requestStorage } from "../server/App";

export function Query<T extends readonly string[]>(...properties: T): { [K in T[number]]: any } {
        const req = requestStorage.getStore();
        if (!req) throw new Error("Query helper should run inside a async hook");
        const result: Partial<{ [K in T[number]]: any }> = {};

        for (const prop of properties) {
                result[prop as T[number]] = (req.query as any)[prop];
        }

        return result as { [K in T[number]]: any };
}

export function Param<T extends readonly string[]>(...properties: T): { [K in T[number]]: any } {
        const req = requestStorage.getStore();
        if (!req) throw new Error("Query helper should run inside a async hook");
        const result: Partial<{ [K in T[number]]: any }> = {};

        for (const prop of properties) {
                result[prop as T[number]] = (req.params as any)[prop];
        }

        return result as { [K in T[number]]: any };
}

export function Body<T extends readonly string[]>(...properties: T): { [K in T[number]]: any } {
        const req = requestStorage.getStore();
        if (!req) throw new Error("Query helper should run inside a async hook");
        const result: Partial<{ [K in T[number]]: any }> = {};

        for (const prop of properties) {
                result[prop as T[number]] = (req.body as any)[prop];
        }

        return result as { [K in T[number]]: any };
}

export function Token() {
        const req = requestStorage.getStore();
        if (!req) throw new Error("Query helper should run inside a async hook");
        return req.headers.authorization;
}

export function UserId(userIdPropperty: string = "user_id") {
        const req = requestStorage.getStore() as unknown as any;
        if (!req) throw new Error("Query helper should run inside a async hook");

        return req[userIdPropperty] as string | undefined;
}

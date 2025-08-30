export declare function Query<T extends readonly string[]>(...properties: T): {
    [K in T[number]]: any;
};
export declare function Param<T extends readonly string[]>(...properties: T): {
    [K in T[number]]: any;
};
export declare function Body<T extends readonly string[]>(...properties: T): {
    [K in T[number]]: any;
};
export declare function Token(): string | undefined;
export declare function UserId(userIdPropperty?: string): string | undefined;
//# sourceMappingURL=requestHelpers.d.ts.map
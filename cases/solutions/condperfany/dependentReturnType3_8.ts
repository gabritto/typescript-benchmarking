export {};

declare const rand: { a?: never };
type Missing = typeof rand.a;

// Detection of valid optional parameter references

// Ok, will narrow return type
function bar1<T extends string | Missing>(x?: T):
    T extends Missing ? 0 : T extends string ? 1 : never {
    if (x === undefined) {
        return 0 as any;
    }
    return 1 as any;
}

// Ok, will narrow return type
function bar2<T extends string | undefined>(x?: T):
    T extends undefined ? 0 : T extends string ? 1 : never {
    if (x === undefined) {
        return 0 as any;
    }
    return 1 as any;
}
export {};

declare const rand: { a?: never };
type Missing = typeof rand.a;

// Detection of valid optional parameter references

// Ok, will narrow return type
function bar(x: string): 1;
function bar(x?: Missing): 0;
function bar(x?: string | Missing): 0 | 1;
function bar(x?: string | Missing): 0 | 1 {
    if (x === undefined) {
        return 0;
    }
    return 1;
}

// Ok, will narrow return type
function bar2(x: string): 1;
function bar2(x?: undefined): 0;
function bar2(x?: string | undefined): 0 | 1;
function bar2(x?: string | undefined): 0 | 1 {
    if (x === undefined) {
        return 0;
    }
    return 1;
}
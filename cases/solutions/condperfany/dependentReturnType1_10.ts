export {};

interface A {
    1: number;
    2: string;
}

function f1<T extends 1 | 2>(x: T): A[T] {
    if (x === 1) {
        return 0 as any; // Ok
    }
    else {
        return 1 as any; // Good error
    }
}

interface C {
    1: number;
    2: string;
    3: boolean;
}

function f2<T extends 1 | 2 | 3>(x: T): C[T] {
    if (x === 1) {
        return 0 as any; // Ok
    }
    else {
        return "" as any; // Error, returned expression needs to have type string & boolean (= never)
    }
}

function f3<T extends 1 | 2 | 3>(x: T): T extends 1 ? number : T extends 2 ? string : T extends 3 ? boolean : never {
    if (x === 1) {
        return 0 as any; // Ok
    }
    else {
        return "" as any; // Error, returned expression needs to have type string & boolean (= never)
    }
}

interface One {
    a: "a";
    b: "b";
    c: "c";
    d: "d";
}

interface Two {
    a: "a";
    b: "b";
    e: "e";
    f: "f";
}

interface Three {
    a: "a";
    c: "c";
    e: "e";
    g: "g";
}

interface Four {
    a: "a";
    d: "d";
    f: "f";
    g: "g";
}

// Well written conditional
function f101<T extends 1 | 2 | 3 | 4>(x: T): T extends 1 ? One : T extends 2 ? Two : T extends 3 ? Three : T extends 4 ? Four : never {
    if (x === 1 || x === 2) {
        return { a: "a", b: "b", c: "c", d: "d", e: "e", f: "f" } as any; // Ok
    }
    // Excess property becomes a problem with the change,
    // because we now check assignability to a narrower type...
    return { a: "a", b: "b", c: "c", d: "d", e: "e", f: "f", g: "g" } as any; // EPC Error
}


class Unnamed {
    root!: { name: string };

    // Good conditional
    name2<T extends string | undefined>(name?: T): T extends string ? this : T extends undefined ? string : never {
        if (typeof name === 'undefined') {
            return this.root.name as any; // Ok
        }
        this.root.name = name;
        return this as any; // Ok
    }

    // Good conditional, wrong return expressions
    name3<T extends string | undefined>(name?: T): T extends string ? this : T extends undefined ? string : never {
        if (typeof name === 'undefined') {
            return this as any; // Error
        }
        this.root.name = name;
        return name as any; // Error
    }
}

// Conditional expressions
interface Aa {
    1: number;
    2: string;
    3: boolean;
}

function trivialConditional<T extends 1 | 2 | 3>(x: T): Aa[T] {
    if (x !== 1) {
        return (x === 2 ? "" : true) as any;
    }
    else {
        return 0 as any;
    }
}

function conditional<T extends boolean>(x: T):
 T extends true ? 1 : T extends false ? 2 : never {
    return (x ? 1 : 2) as any; // Ok
}

function contextualConditional<T extends "a" | "b">(
    x: T
): T extends "a" ? "a" : T extends "b" ? number : never {
    return (x === "a" ? x : parseInt(x)) as any; // Ok
}

function conditionalWithError<T extends "a" | "b">(
    x: T
): T extends "a" ? number : T extends "b" ? string : never {
    return (x === "a" ? x : parseInt(x)) as any; // Error
}

// Multiple indexed type reductions
interface BB {
    "a": number;
    [y: number]: string;
}

interface AA<T extends keyof BB> {
    "c": BB[T];
    "d": boolean,
}

function reduction<T extends keyof BB, U extends "c" | "d">(x: T, y: U): AA<T>[U] {
    if (y === "c" && x === "a") {
        // AA<T>[U='c'] -> BB[T]
        // BB[T='a'] -> number
        return 0 as any; // Ok
    }

    return undefined as never;
}

// Unsafe: check types overlap
declare function q(x: object): x is { b: number };
function foo<T extends { a: string } | { b: number }>(
    x: T,
): T extends { a: string } ? number : T extends { b: number } ? string : never {
    if (q(x)) {
        x.b;
        return "" as any;
    }
    x.a;
    return 1 as any;
}

let y = { a: "", b: 1 }
const r = foo<{ a: string }>(y); // type says number but actually string

type HelperCond<T, A, R1, B, R2> = T extends A ? R1 : T extends B ? R2 : never;

// From https://github.com/microsoft/TypeScript/issues/24929#issue-332087943
declare function isString(s: unknown): s is string;
// capitalize a string or each element of an array of strings
function capitalize<T extends string | string[]>(
    input: T
): T extends string[] ? string[] : T extends string ? string : never {
    if (isString(input)) {
        return (input[0].toUpperCase() + input.slice(1)) as any; // Ok
    } else {
        return input.map(elt => capitalize(elt)) as any; // Ok
    }
}

function badCapitalize<T extends string | string[]>(
    input: T
): T extends string[] ? string[] : T extends string ? string : never {
    if (isString(input)) {
        return (input[0].toUpperCase() + input.slice(1)) as any; // Ok
    } else {
        return (input[0].toUpperCase() + input.slice(1)) as any; // Bad, error
    }
}


// Multiple type parameters at once
function woo<T extends string | number, U extends string | number>(
    x: T,
    y: U,
): T extends string
    ? U extends string
        ? 1
        : U extends number
          ? 2
          : never
    : T extends number
      ? U extends number
          ? 3
          : U extends string
            ? 4
            : never
      : never {
    if (typeof x === "number" && typeof y === "string") {
        return 1 as any; // Good error
    }
    return undefined as any;
}

function ttt<T extends string | number, U extends string | number>(
    x: T,
    y: U,
): T extends string
    ? U extends string
        ? 1
        : U extends number
          ? 2
          : never
    : T extends number
      ? U extends number
          ? 3
          : U extends string
            ? 4
            : never
      : never {
    if (typeof x === "number" && typeof y === "string") {
        return 4 as any; // Ok
    }
    
    return undefined as any;
}

function noShadowing<T extends 1 | 2>(x: T): T extends 1 ? number : T extends 2 ? string : never {
    if (true) {
        if (x === 1) {
            return 1 as any; // Ok
        }
        return "" as any; // Ok
    }
}

// If the narrowing reference is out of scope, we simply won't narrow its type
declare let someX: boolean;
function scope2<T extends boolean>(a: T): T extends true ? 1 : T extends false ? 2 : never {
    if ((true)) {
        const someX = a;
        if (someX) { // We narrow `someX` and the return type here
            return 1 as any;
        }
    }
    if (!someX) { // This is a different `someX`, so we don't narrow here
        return 2 as any;
    }

    return undefined as any;
}

function moreShadowing<T extends 1 | 2>(x: T): T extends 1 ? number : T extends 2 ? string : never {
    if (x === 2) {
        let x: number = Math.random() ? 1 : 2;
        if (x === 1) {
            return 1 as any; // Error
        }
        return "" as any; // Ok
    }
    return 0 as any; // Ok
}

// Ok
async function abool<T extends true | false>(x: T): Promise<T extends true ? 1 : T extends false ? 2 : never> {
    if (x) {
        return 1 as any;
    }
    return 2 as any;
}

// Ok
function* bbool<T extends true | false>(x: T): Generator<number, T extends true ? 1 : T extends false ? 2 : never, unknown> {
    yield 3;
    if (x) {
        return 1 as any;
    }
    return 2 as any;
}


// Return conditional expressions with parentheses
function returnStuff1<T extends boolean>(x: T ): T extends true ? 1 : T extends false ? 2 : never {
    return (x ? (1) : 2) as any;
}

function returnStuff2<T extends 1 | 2 | "a">(x: T ):
    T extends 1 ? "one" : T extends 2 ? "two" : T extends "a" ? 0 : never {
    return (typeof x === "string" ? 0 : (x === 1 ? ("one") : "two")) as any;
}

// If the conditional type's input is `never`, then it resolves to `never`:
function neverOk<T extends boolean>(x: T): T extends true ? 1 : T extends false ? 2 : never {
    if (x === true) {
        return 1 as any;
    }
    if (x === false) {
        return 2 as any;
    }
    return 1 as any;
}
export {};

function f1(x: 1): number;
function f1(x: 2): string;
function f1(x: 1 | 2): number | string;
function f1(x: 1 | 2): number | string {
    if (x === 1) {
        return 0; // Ok
    }
    else {
        return 1; // Good error
    }
}

function f2(x: 1): number;
function f2(x: 2): string;
function f2(x: 3): boolean;
function f2(x: 1 | 2 | 3): number | string | boolean;
function f2(x: 1 | 2 | 3): number | string | boolean {
    if (x === 1) {
        return 0; // Ok
    }
    else {
        return ""; // Error, returned expression needs to have type string & boolean (= never)
    }
}

function f3(x: 1): number;
function f3(x: 2): string;
function f3(x: 3): boolean;
function f3(x: 1 | 2 | 3): number | string | boolean;
function f3(x: 1 | 2 | 3): number | string | boolean {
    if (x === 1) {
        return 0; // Ok
    }
    else {
        return ""; // Error, returned expression needs to have type string & boolean (= never)
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
function f101(x: 1): One;
function f101(x: 2): Two;
function f101(x: 3): Three;
function f101(x: 4): Four;
function f101(x: 1 | 2 | 3 | 4): One | Two | Three | Four;
function f101(x: 1 | 2 | 3 | 4): One | Two | Three | Four {
    if (x === 1 || x === 2) {
        return { a: "a", b: "b", c: "c", d: "d", e: "e", f: "f" }; // Ok
    }
    // Excess property becomes a problem with the change,
    // because we now check assignability to a narrower type...
    return { a: "a", b: "b", c: "c", d: "d", e: "e", f: "f", g: "g" }; // EPC Error
}


class Unnamed {
    root!: { name: string };

    // Good conditional
    name2(name: string): this;
    name2(name?: undefined): string;
    name2(name?: string | undefined): this | string;
    name2(name?: string | undefined): this | string {
        if (typeof name === 'undefined') {
            return this.root.name; // Ok
        }
        this.root.name = name;
        return this; // Ok
    }

    // Good conditional, wrong return expressions
    name3(name: string): this;
    name3(name?: undefined): string;
    name3(name?: string | undefined): this | string;
    name3(name?: string | undefined): this | string {
        if (typeof name === 'undefined') {
            return this; // Error
        }
        this.root.name = name;
        return name; // Error
    }
}

// Conditional expressions

function trivialConditional(x: 1 | 2 | 3): number | string | boolean {
    if (x !== 1) {
        return x === 2 ? "" : true;
    }
    else {
        return 0;
    }
}

function conditional(x: true): 1;
function conditional(x: false): 2;
function conditional(x: boolean): 1 | 2;
function conditional(x: boolean): 1 | 2 {
    return x ? 1 : 2; // Ok
}

function contextualConditional(x: "a"): "a";
function contextualConditional(x: "b"): number;
function contextualConditional(x: "a" | "b"): "a" | number;
function contextualConditional(x: "a" | "b"): "a" | number {
    return x === "a" ? x : parseInt(x); // Ok
}

function conditionalWithError(x: "a"): number;
function conditionalWithError(x: "b"): string;
function conditionalWithError(x: "a" | "b"): string | number;
function conditionalWithError(x: "a" | "b"): string | number {
    return x === "a" ? x : parseInt(x); // Ok
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

function reduction(x: "a", y: "c"): number;
function reduction(x: `${number}`, y: "c"): number | string;
function reduction(x: "a" | `${number}`, y: "d"): boolean;
function reduction(x: "a" | `${number}`, y: "c" | "d"): number | string | boolean;
function reduction(x: "a" | `${number}`, y: "c" | "d"): number | string | boolean {
    if (y === "c" && x === "a") {
        // AA<T>[U='c'] -> BB[T]
        // BB[T='a'] -> number
        return 0; // Ok
    }

    return undefined as never;
}

// Unsafe: check types overlap
declare function q(x: object): x is { b: number };

function foo(x: { a: string }): number;
function foo(x: { b: number }): string;
function foo(x: { a: string } | { b: number }): number | string;
function foo(x: { a: string } | { b: number }): number | string {
    if (q(x)) {
        x.b;
        return "";
    }
    x.a;
    return 1;
}

let y = { a: "", b: 1 }
const r = foo(y as { a: string }); // type says number but actually string


// From https://github.com/microsoft/TypeScript/issues/24929#issue-332087943
declare function isString(s: unknown): s is string;

// capitalize a string or each element of an array of strings
function capitalize(input: string): string;
function capitalize(input: string[]): string[];
function capitalize(input: string | string[]): string[] | string;
function capitalize(input: string | string[]): string[] | string {
    if (isString(input)) {
        return input[0].toUpperCase() + input.slice(1); // Ok
    } else {
        return input.map(elt => capitalize(elt)); // Ok
    }
}


function badCapitalize(input: string): string;
function badCapitalize(input: string[]): string[];
function badCapitalize(input: string | string[]): string[] | string;
function badCapitalize(input: string | string[]): string[] | string {
    if (isString(input)) {
        return input[0].toUpperCase() + input.slice(1); // Ok
    } else {
        return input[0].toUpperCase() + input.slice(1); // Bad, error
    }
}


// Multiple type parameters at once
function woo(x: string, y: string): 1;
function woo(x: string, y: number): 2;
function woo(x: number, y: number): 3;
function woo(x: number, y: string): 4;
function woo(x: string | number, y: string | number): 1 | 2 | 3 | 4;
function woo(x: string | number, y: string | number): 1 | 2 | 3 | 4 {
    if (typeof x === "number" && typeof y === "string") {
        return 1; // Good error
    }
    return undefined as any;
}


function ttt(x: string, y: string): 1;
function ttt(x: string, y: number): 2;
function ttt(x: number, y: number): 3;
function ttt(x: number, y: string): 4;
function ttt(x: string | number, y: string | number): 1 | 2 | 3 | 4;
function ttt(x: string | number, y: string | number): 1 | 2 | 3 | 4{
    if (typeof x === "number" && typeof y === "string") {
        return 4; // Ok
    }
    
    return undefined as any;
}

function noShadowing(x: 2): string;
function noShadowing(x: 1): number;
function noShadowing(x: 1 | 2): number | string;
function noShadowing(x: 1 | 2): number | string {
    if (true) {
        if (x === 1) {
            return 1; // Ok
        }
        return ""; // Ok
    }
}

// If the narrowing reference is out of scope, we simply won't narrow its type
declare let someX: boolean;
function scope2(a: true): 1;
function scope2(a: false): 2;
function scope2(a: boolean): 1 | 2;
function scope2(a: boolean): 1 | 2 {
    if ((true)) {
        const someX = a;
        if (someX) { // We narrow `someX` and the return type here
            return 1;
        }
    }
    if (!someX) { // This is a different `someX`, so we don't narrow here
        return 2;
    }

    return undefined as any;
}

function moreShadowing(x: 2): string;
function moreShadowing(x: 1): number;
function moreShadowing(x: 1 | 2): number | string;
function moreShadowing(x: 1 | 2): number | string {
    if (x === 2) {
        let x: number = Math.random() ? 1 : 2;
        if (x === 1) {
            return 1; // Error
        }
        return ""; // Ok
    }
    return 0; // Ok
}

// Ok
async function abool(x: true): Promise<1>;
async function abool(x: false): Promise<2>;
async function abool(x: boolean): Promise<1 | 2>;
async function abool(x: boolean): Promise<1 | 2> {
    if (x) {
        return 1;
    }
    return 2;
}

// Ok
function bbool(x: true): Generator<number, 1, unknown>;
function bbool(x: false): Generator<number, 2, unknown>;
function bbool(x: boolean): Generator<number, 1 | 2, unknown>;
function* bbool(x: boolean): Generator<number, 1 | 2, unknown> {
    yield 3;
    if (x) {
        return 1;
    }
    return 2;
}

// Return conditional expressions with parentheses
function returnStuff1(x: true): 1;
function returnStuff1(x: false): 2;
function returnStuff1(x: boolean): 1 | 2;
function returnStuff1(x: boolean): 1 | 2 {
    return (x ? (1) : 2);
}

function returnStuff2(x: 1): "one";
function returnStuff2(x: 2): "two";
function returnStuff2(x: "a"): 0;
function returnStuff2(x: 1 | 2 | "a"): "one" | "two" | 0;
function returnStuff2(x: 1 | 2 | "a"): "one" | "two" | 0 {
    return (typeof x === "string" ? 0 : (x === 1 ? ("one") : "two"));
}

// If the conditional type's input is `never`, then it resolves to `never`:
function neverOk(x: true): 1;
function neverOk(x: false): 2;
function neverOk(x: boolean): 1 | 2;
function neverOk(x: boolean): 1 | 2 {
    if (x === true) {
        return 1;
    }
    if (x === false) {
        return 2;
    }
    return 1;
}
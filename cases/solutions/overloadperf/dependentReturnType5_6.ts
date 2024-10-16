export {};

// Tests for when return type narrowing can and cannot happen

// @filename: file.ts
// Type parameter in outer scope
function outer(x: boolean): number {
    return inner();

    function inner(): 1 | 2 { // Cannot express it with overload
        return x ? 1 : 2;
    }
}

// Overloads
function fun6(x: true, y: string): string;
function fun6(x: false, y: string): 2;
function fun6(x: true, y: undefined): 1;
function fun6(x: false, y: undefined): 2;
function fun6(x: boolean): 1 | 2 | string;
function fun6(x: boolean, y?: string): 1 | string | 2 {
    return x ? y !== undefined ? y : 1 : 2;
}

// Indexed access with conditional inside

// Narrows nested conditional type of right shape
interface SomeInterfaceGood<T> {
    prop1: T extends true ? 2 : T extends false ? 1 : never;
    prop2: T extends true ? 1 : T extends false ? 2 : never;
}

function fun4good(x: true, y: "prop1"): 2;
function fun4good(x: false, y: "prop1"): 1;
function fun4good(x: true, y: "prop2"): 1;
function fun4good(x: false, y: "prop2"): 2;
function fun4good(x: boolean, y: keyof SomeInterfaceGood<unknown>): 1 | 2;
function fun4good(x: boolean, y: keyof SomeInterfaceGood<unknown>): 1 | 2 {
    if (y === "prop1") {
        return x ? 2 : 1;
    }
    return x ? 1 : 2;
}

// Indexed access with indexed access inside - OK, narrows
interface BB {
    "a": number;
    "b": string;
}

interface AA<T extends keyof BB> {
    "c": BB[T];
    "d": boolean,
}

function reduction(x: "a", y: "c"): number;
function reduction(x: "b", y: "c"): string;
function reduction(x: "a" | "b", y: "d"): boolean;
function reduction(x: "a" | "b", y: "c" | "d"): number | string | boolean;
function reduction(x: "a" | "b", y: "c" | "d"): number | string | boolean {
    if (x === "a" && y === "c") {
        return 0; // Ok
    }

    return undefined as never;
}

// Conditional with indexed access inside - OK, narrows
function fun5(x: 1, y: "a"): number;
function fun5(x: 1, y: "b"): string;
function fun5(x: 2, y: "a" | "b"): boolean;
function fun5(x: 1 | 2, y: "a" | "b"): number | string | boolean;
function fun5(x: 1 | 2, y: "a" | "b"): number | string | boolean {
    if (x === 1) {
        if (y === "a") {
            return 0;
        }
        return "";
    }
    return true;
}

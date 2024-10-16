export {};

// Tests for when return type narrowing can and cannot happen

// @filename: file.ts
// Type parameter in outer scope
function outer<T extends boolean>(x: T): number {
    return inner();

    function inner(): T extends true ? 1 : T extends false ? 2 : never {
        return (x ? 1 : 2) as any;
    }
}

// Overloads
function fun6<T extends boolean>(x: T, y: string): T extends true ? string : T extends false ? 2 : never;
function fun6<T extends boolean>(x: T, y: undefined): T extends true ? 1 : T extends false ? 2 : never;
function fun6(x: boolean): 1 | 2 | string;
function fun6<T extends boolean>(x: T, y?: string): T extends true ? 1 | string : T extends false ? 2 : never {
    return (x ? y !== undefined ? y : 1 : 2) as any;
}

// Indexed access with conditional inside

// Narrows nested conditional type of right shape
interface SomeInterfaceGood<T> {
    prop1: T extends true ? 2 : T extends false ? 1 : never;
    prop2: T extends true ? 1 : T extends false ? 2 : never;
}

function fun4good<T extends boolean, U extends keyof SomeInterfaceGood<unknown>>(x: T, y: U): SomeInterfaceGood<T>[U] {
    if (y === "prop1") {
        return (x ? 2 : 1) as any;
    }
    return (x ? 1 : 2) as any;
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

function reduction<T extends keyof BB, U extends keyof AA<any>>(x: T, y: U): AA<T>[U] {
    if (x === "a" && y === "c") {
        return 0 as any; // Ok
    }

    return undefined as never;
}

// Conditional with indexed access inside - OK, narrows
function fun5<T extends 1 | 2, U extends keyof BB>(x: T, y: U): T extends 1 ? BB[U] : T extends 2 ? boolean : never {
    if (x === 1) {
        if (y === "a") {
            return 0 as any;
        }
        return "" as any;
    }
    return true as any;
}

export {};

// Indexed access return type
interface A2 {
    "prop": true;
    [n: number]: string;
}

// We could soundly allow that, because `"prop"` and `[n: number]` are disjoint types.
function foo2(x: "prop"): true;
function foo2(x: number): string;
function foo2(x: "prop" | number): true | string;
function foo2(x: "prop" | number): true | string {
    if (x === "prop") {
        return true;
    }
    return "some string";
}
const rfoo2 = foo2("prop");
const rfoo22 = foo2(34);
const rfoo222 = foo2(Math.random() ? "prop" : 34);

interface Comp {
    foo: 2;
    [n: number]: 3;
    [s: string]: 2 | 3 | 4;
}

function indexedComp(x: number): 3;
function indexedComp(x: string): 2 | 3 | 4;
function indexedComp(x: number | string): 2 | 3 | 4;
function indexedComp(x: number | string): 2 | 3 | 4 {
    if (x === "foo") {
        if (Math.random()) {
            return 3; // Error
        }
        return 2; // Ok
    }
    if (typeof x === "number") {
        if (Math.random()) {
            return 2; // Error
        }
        return 3; // Ok
    }
    return 4; // Ok
}

// Most common case supported:
interface F {
    "t": number,
    "f": boolean,
}

// Ok
function depLikeFun(str: "t"): number;
function depLikeFun(str: "f"): boolean;
function depLikeFun(str: "t" | "f"): number | boolean;
function depLikeFun(str: "t" | "f"): number | boolean {
    if (str === "t") {
        return 1;
    } else {
        return true;
    }
}

depLikeFun("t"); // has type number
depLikeFun("f"); // has type boolean


// Ok
function depLikeFun2(str: "t"): number;
function depLikeFun2(str: "f"): boolean;
function depLikeFun2(str: "t" | "f"): number | boolean;
function depLikeFun2(str: "t" | "f"): number | boolean {
    if (str === "t") {
        return 1;
    } else {
        return true;
    }
}
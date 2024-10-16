export {};

// Indexed access return type
interface A2 {
    "prop": true;
    [n: number]: string;
}

// We could soundly allow that, because `"prop"` and `[n: number]` are disjoint types.
function foo2<T extends "prop" | number>(x: T): A2[T] {
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

function indexedComp<T extends number | string>(x: T): Comp[T] {
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
function depLikeFun<T extends "t" | "f">(str: T): F[T] {
    if (str === "t") {
        return 1;
    } else {
        return true;
    }
}

depLikeFun("t"); // has type number
depLikeFun("f"); // has type boolean

type IndirectF<T extends keyof F> = F[T];

// Ok
function depLikeFun2<T extends "t" | "f">(str: T): IndirectF<T> {
    if (str === "t") {
        return 1;
    } else {
        return true;
    }
}
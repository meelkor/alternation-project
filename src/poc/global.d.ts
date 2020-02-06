import assertType from "assert";

export {};

declare global {
    var assert: typeof assertType;

    interface Window {
        assert: typeof assertType;
    }
}

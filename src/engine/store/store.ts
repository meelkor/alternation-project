import { Injectable } from '@alt/common';

export abstract class Store extends Injectable {
    public readonly events = new Map<number, string[]>();

    protected emit(storeEvent: number, arg?: string) {
        let argStack: string[];

        if (this.events.has(storeEvent)) {
            argStack = this.events.get(storeEvent);
        } else {
            argStack = [];
            this.events.set(storeEvent, argStack);
        }

        if (arg) {
            argStack.push(arg);
        }
    }
}

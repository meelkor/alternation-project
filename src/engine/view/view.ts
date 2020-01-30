import { Injectable, Injector } from '@alt/common';
import { Renderer, Component } from '../renderer';
import { Reaction } from './reaction';
import { Store } from '../store';

export abstract class View extends Injectable {
    protected renderer = this.inject(Renderer);

    protected store: Store;

    private reactions: Reaction[] = [];

    constructor(parent: Injector) {
        super(parent);

        this.renderer.registerView(this);
    }

    public update(hrt: number): void {
        this.onUpdate(hrt);

        if (this.store) {
            const events = [...this.store.events];
            this.store.events.clear();

            this.reactions = this.reactions.filter(reaction => {
                const payloads = events
                    .filter(ev => reaction.events.has(ev[0]))
                    .map(ev => ev[1]);

                if (payloads) {
                    return reaction.react(payloads.flat());
                } else {
                    return true;
                }
            });
        }
    }

    protected abstract onUpdate(hrt: number): void;

    protected react(): Reaction {
        const reaction = new Reaction();

        this.reactions.push(reaction);

        return reaction;
    }

    protected bindComponent(comp: Component) {
        this.renderer.bindComponent(comp, this.pane);
    }
}

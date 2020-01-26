import { Injectable } from '@alt/common';
import { Pos } from '@alt/common/geometry/pos';
import { Component } from './component';

export abstract class Renderer<T extends Component> extends Injectable {
    protected components: BoundComponent<T>[] = [];

    public bind(component: T, pane: number): void {
        const boundComp = { pane, component };
        this.components.push(boundComp);
        this.registerComponent(boundComp);
        component.onBind();
    }

    public render(hrt: DOMHighResTimeStamp): void {
        for (const boundComponent of this.components) {
            boundComponent.component.render(hrt);
        }
    }

    public registerComponent(_bound: BoundComponent<T>): void { }
}

export class ViewportSize extends Pos {
    public get width(): number {
        return this.x;
    }

    public get height(): number {
        return this.y;
    }
}

export type BoundComponent<T> = {
    pane: number;
    component: T;
};

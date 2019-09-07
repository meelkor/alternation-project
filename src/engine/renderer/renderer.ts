import { ReplaySubject } from 'rxjs';

import { Injectable } from '@alt/common';
import { Pos } from '@alt/common/geometry/pos';
import { Component } from './component';

export abstract class Renderer<T extends Component> extends Injectable {
    public viewport$ = new ReplaySubject<ViewportSize>(1);

    protected components: BoundComponent<T>[] = [];

    public bind(component: T, pane: number): void {
        const boundComp = { pane, component };
        this.components.push(boundComp);
        this.registerComponent(boundComp);
        component.onBind();
        this.renderComponent(boundComp);
    }

    public renderComponent(_component: BoundComponent<T>): void { }

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

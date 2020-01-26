import { Injectable } from '@alt/common';

import { ComponentContext } from './componentContext';

export abstract class Component extends Injectable {
    protected context: ComponentContext;

    public abstract render(hrt: number): void;
    public abstract onBind(): void;

    public setRenderingContext(context: ComponentContext): void {
        this.context = context;
    }
}

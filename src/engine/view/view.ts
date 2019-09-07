import { Injectable } from '@alt/common';
import { Renderer, Component } from '../renderer';
import { ViewRegistry } from './viewRegistry';

export abstract class View extends Injectable {
    protected viewRegistry = this.inject(ViewRegistry);
    protected renderer = this.inject(Renderer);

    public pane = this.viewRegistry.topPane++;

    protected bindComponent(comp: Component) {
        this.renderer.bind(comp, this.pane);
    }
}

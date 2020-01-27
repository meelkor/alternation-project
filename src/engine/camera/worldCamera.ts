import { Subject } from 'rxjs';

import { Injectable, Injector } from '@alt/common';

import { TilePos } from '../projection/tile';


export class WorldCamera extends Injectable {
    public position$: Subject<TilePos>;
    public zoom$: Subject<number>;
    public delta$: Subject<TilePos>;
    public position = new TilePos(0, 0);
    public zoom = 1;

    private INITIAL_DELTA = new TilePos(0, 0);
    private delta: TilePos = this.INITIAL_DELTA;

    constructor(parent: Injector) {
        super(parent);

        this.position$ = new Subject<TilePos>();
        this.zoom$ = new Subject<number>();
        this.delta$ = new Subject<TilePos>();
        this.position$.subscribe(pos => this.position = pos);
        this.zoom$.subscribe(pos => this.zoom = pos);
    }

    public updateDelta(pos: TilePos): void {
        this.delta = this.delta.add(pos);
    }

    /**
     * Apply delta and actually update the camera
     */
    public update(): void {
        if (this.delta !== this.INITIAL_DELTA) {
            this.position$.next(this.position.add(this.delta));
            this.delta$.next(this.delta);
            this.delta = this.INITIAL_DELTA;
        }
    }

    public setZoom(z: number) {
        this.zoom$.next(z);
    }
}

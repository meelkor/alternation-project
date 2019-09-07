import { ReplaySubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { Injectable } from '@alt/common';

import { PxPos, Tile, TilePos, ProjectedTile } from './tile';
import { Renderer } from '../renderer';
import { ViewportSize } from '../renderer/renderer';

export abstract class TileProjector extends Injectable {
    public abstract visibleTiles$: Observable<ProjectedTile[]>;

    public camera$ = new ReplaySubject<PxPos>(1);

    protected cameraPos: PxPos;
    protected renderer = this.inject(Renderer);

    constructor(...args: any[]) {
        super(...args);

        this.camera$.subscribe((pos) => this.cameraPos = pos);
        this.camera$.next(new PxPos(0, 0));
    }

    protected abstract project(pos: TilePos, cameraPos: PxPos, viewport: ViewportSize): PxPos;
    protected abstract unproject(pos: TilePos, cameraPos: PxPos, viewport: ViewportSize): TilePos;

    protected projectTile(tile: Tile, cameraPos: PxPos, viewport: ViewportSize): ProjectedTile {
        return new ProjectedTile(
            tile.x,
            tile.y,
            [
                this.project(tile.topLeft, cameraPos, viewport),
                this.project(tile.topRight, cameraPos, viewport),
                this.project(tile.bottomRight, cameraPos, viewport),
                this.project(tile.bottomLeft, cameraPos, viewport),
            ],
            this.project(tile.center, cameraPos, viewport),
        );
    }

    public panCamera(byPos: PxPos): void {
        this.camera$.next(this.cameraPos.add(byPos));
    }

    public getTileProjection(tile: Tile): Observable<ProjectedTile> {
        return combineLatest(
            this.camera$,
            this.renderer.viewport$,
        ).pipe(
            map(([camPos, viewport]) => this.projectTile(tile, camPos, viewport)),
        );
    }

    public getPositionProjection(pos: TilePos): Observable<PxPos> {
        return combineLatest(
            this.camera$,
            this.renderer.viewport$,
        ).pipe(
            map(([camPos, viewport]) => this.project(pos, camPos, viewport)),
        );
    }
}

import { Observable, Subject } from 'rxjs';

import { Injectable } from '@alt/common';

export class RenderingConfigProvider extends Injectable {
    public config: ComputedRenderingConfig;

    private updatesSubject = new Subject<ComputedRenderingConfig>();

    public get updates$(): Observable<ComputedRenderingConfig> {
        return this.updatesSubject.asObservable();
    }

    public update(opts: RenderingConfig): void {
        const newWidth = Math.sqrt(opts.tileSize ** 2 * 2);

        this.config = {
            ...opts,
            projectedTileWidth: newWidth,
            projectedTileHeight: newWidth / 2,
        };
        this.updatesSubject.next(this.config);
    }
}

export interface RenderingConfig {
    width: number;
    height: number;
    tileSize: number;
}

export interface ComputedRenderingConfig extends RenderingConfig {
    projectedTileWidth: number;
    projectedTileHeight: number;
}

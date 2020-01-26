import { combineLatest } from 'rxjs';
import { startWith } from 'rxjs/operators';

import { Injector, Injectable } from '@alt/common';

import { RenderingConfig, RenderingConfigProvider } from '.';
import { PxPos, TilePos } from '../projection/tile';
import { Dimensions } from '../projection/geometry';
import { Camera } from '../camera';

export class Projector extends Injectable {
    private virtualTileWidth: number;
    private virtualTileHeight: number;
    private virtualWidth: number;
    private virtualHeight: number;
    private virtualWidthHalf: number;
    private height: number;

    private camera = this.inject(Camera);
    private renderingConfigProvider = this.inject(RenderingConfigProvider);

    constructor(parent: Injector) {
        super(parent);

        combineLatest(
            this.renderingConfigProvider.updates$
                .pipe(startWith(this.renderingConfigProvider.config)),
            this.camera.zoom$
                .pipe(startWith(this.camera.zoom)),
        ).subscribe(args => this.updateIntermediateValues(...args));
    }

    public unprojectToWorld({ x, y }: PxPos): TilePos {
        return this.unprojectToCamera(new PxPos(
            x,
            y + this.height / 2,
        )).add(this.camera.position);
    }

    public unprojectToCamera({ x, y }: PxPos): TilePos {
        const virtualTileX = x / this.virtualTileWidth;
        const virtualTileY = this.virtualHeight - y / this.virtualTileHeight;

        const tileX = virtualTileY + (virtualTileX - this.virtualWidthHalf);
        const tileY = virtualTileY - (virtualTileX - this.virtualWidthHalf);

        return new TilePos(tileX, tileY);
    }

    public unprojectDimensions({ width, height }: Dimensions): Dimensions {
        const tileSize = this.renderingConfigProvider.config.tileSize;

        return {
            width: width / tileSize,
            height: height / tileSize,
        };
    }

    private updateIntermediateValues(options: RenderingConfig, zoom: number) {
        const tileSize = options.tileSize * zoom;
        this.height = options.height;
        this.virtualTileWidth = Math.sqrt(2 * tileSize ** 2);
        this.virtualTileHeight = this.virtualTileWidth / 2;
        this.virtualWidth = options.width / this.virtualTileWidth;
        this.virtualHeight = options.height / this.virtualTileHeight;
        this.virtualWidthHalf = this.virtualWidth / 2;
    }
}

import { UVMapping, ClampToEdgeWrapping, NearestFilter, CanvasTexture, Texture } from 'three';

import { AssetData } from '../assets/assetIndex';

export class SpriteTexture {
    public readonly texture: CanvasTexture;

    private mapWidth: number;
    private mapHeight: number;

    public get width(): number {
        return this.mapWidth;
    }

    public get height(): number {
        return this.mapHeight;
    }

    constructor(private resInfo: AssetData) {
        this.mapWidth = resInfo.canvas.width;
        this.mapHeight = resInfo.canvas.height;

        this.texture = new CanvasTexture(
            resInfo.canvas,
            UVMapping,
            ClampToEdgeWrapping,
            ClampToEdgeWrapping,
            NearestFilter,
            NearestFilter,
        );
    }

    public setState(_state: string) {
        // TODO: change texture params
    }

    public getTexture(): Texture {
        return this.texture;
    }

    /**
     * Create new Texture instance for this sprite.
     */
    public clone(): SpriteTexture {
        return new SpriteTexture(this.resInfo);
    }
}

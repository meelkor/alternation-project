import { CanvasTexture, UVMapping, ClampToEdgeWrapping, NearestFilter, DataTexture, RGBAFormat, UnsignedByteType } from 'three';

import { Injectable } from '@alt/common';

import { AssetIndex } from '../assets/assetIndex';
import { RenderingConfigProvider } from '.';
import { AssetState, MaskAssetState } from '../assets/libraryIndex';

/**
 * Maximal size of the tile atlas in single dimension
 */
const MAX_ATLAS_SIZE = 2048;

export class TileTextureProvider extends Injectable {
    private assetIndex = this.inject(AssetIndex);
    private renderingConfigProvider = this.inject(RenderingConfigProvider);

    public getTextureAtlas(
        families: string[],
        maskFamilies: string[] = [],
    ): TileTextureAtlas {
        const allTiles: TextureFamilyTile[] = [];

        for (const family of families) {
            const assets = this.assetIndex.getAssetFamily(family);

            for (const { canvas, state } of assets) {
                allTiles.push({ canvas, family, state });
            }
        }

        for (const family of maskFamilies) {
            const assets = this.assetIndex.getAssetFamily(family);

            for (const { canvas, state } of assets) {
                allTiles.push({ canvas, family, state, mask: true });
            }
        }

        const regularTiles = allTiles.filter(t => !t.mask);
        const maskTiles = allTiles.filter(t => t.mask);

        const tileSize = this.renderingConfigProvider.config.tileSize;
        const maxAtlasTileSize = Math.floor(MAX_ATLAS_SIZE / tileSize);
        const numOfTilePositions = regularTiles.length
            + Math.ceil(Math.max(0, maskTiles.length - regularTiles.length) / 4);
        const columns = Math.min(maxAtlasTileSize, numOfTilePositions);
        const rows = Math.ceil(numOfTilePositions / columns);

        const atlasCanvas = document.createElement('canvas');
        atlasCanvas.width = columns * tileSize;
        atlasCanvas.height = rows * tileSize;
        const atlasContext = atlasCanvas.getContext('2d');
        const index: AtlasIndex = Object.fromEntries(families.concat(maskFamilies).map(fam => [fam, []]));

        for (let offset = 0; offset < regularTiles.length; offset++) {
            const band = 0;
            const col = offset % columns;
            const row = Math.floor(offset / columns);
            atlasContext.drawImage(
                allTiles[offset].canvas,
                col * tileSize,
                row * tileSize,
                tileSize,
                tileSize,
            );

            index[allTiles[offset].family].push({
                bandOffset: offset * 4 + band,
                col,
                row,
                state: allTiles[offset].state,
            });
        }

        const atlasImage = atlasContext.getImageData(0, 0, atlasCanvas.width, atlasCanvas.height);

        let offset: number = 0;
        let band: number = 0;

        for (let tile of maskTiles) {
            if (offset < regularTiles.length) {
                band = 3;
            }

            const tileImage = tile.canvas.getContext('2d').getImageData(0, 0, tileSize, tileSize);

            const col = offset % columns;
            const row = Math.floor(offset / columns);

            const startingByteOffset = row * columns * tileSize + col * tileSize;

            for (let i = 0; i < tileSize ** 2; i++) {
                const byteOffset = (startingByteOffset
                    + Math.floor(i / tileSize) * tileSize * columns + i % tileSize) * 4 + band;

                atlasImage.data[byteOffset] = tileImage.data[i * 4];
            }

            index[tile.family].push({
                bandOffset: offset * 4 + band,
                row,
                col,
                state: tile.state,
            });

            band++;
            if (band > 3) {
                band = 0;
                offset++;
            }
        }

        atlasContext.putImageData(atlasImage, 0, 0);
        console.log(atlasContext.getImageData(0, 0, tileSize, tileSize));

        // atlasCanvas.style.position = "absolute";
        // atlasCanvas.style.zIndex = "10000";
        // document.body.append(atlasCanvas);
        // atlasCanvas.style.width = "auto";
        // atlasCanvas.style.height = "auto";
        // atlasCanvas.style.top = "0";
        // atlasCanvas.style.left = "0";

        const texture = new DataTexture(
            atlasImage.data,
            atlasImage.width,
            atlasImage.height,
            RGBAFormat,
            UnsignedByteType,
            UVMapping,
            ClampToEdgeWrapping,
            ClampToEdgeWrapping,
            NearestFilter,
            NearestFilter,
        );

        return new TileTextureAtlas({
            index,
            texture,
            columns,
            rows,
        });
    }
}

export class TileTextureAtlas implements TileTextureAtlasInit {
    public texture: CanvasTexture;
    public index: AtlasIndex;
    public rows: number;
    public columns: number;

    constructor(init: TileTextureAtlasInit) {
        this.texture = init.texture;
        this.index = init.index;
        this.rows = init.rows;
        this.columns = init.columns;
    }

    public getRandomState<T extends AtlasPos = AtlasPos>(family: string): T {
        assert(this.index[family]);
        return this.index[family][Math.floor(Math.random() * this.index[family].length)] as T;
    }

    public getRandomLayeredState(family: string): AtlasPos<MaskAssetState>[] {
        const pos = this.getRandomState<AtlasPos<MaskAssetState>>(family);

        assert(pos.state.mask);

        return this.index[family]
            .filter(t => 'mask' in t.state && t.state.mask === pos.state.mask) as AtlasPos<MaskAssetState>[];
    }
}

interface TileTextureAtlasInit {
    texture: CanvasTexture;
    index: AtlasIndex;
    rows: number;
    columns: number;
}

type AtlasIndex = { [tilename: string]: AtlasPos[] };

export interface TextureFamilyTile {
    family: string;
    canvas: HTMLCanvasElement;
    state: AssetState;
    mask?: boolean;
}

export interface AtlasPos<T extends AssetState = AssetState> {
    state: T;
    bandOffset: number;
    row: number;
    col: number;
}

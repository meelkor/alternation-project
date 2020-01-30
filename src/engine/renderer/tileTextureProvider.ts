import { CanvasTexture, UVMapping, ClampToEdgeWrapping, NearestFilter } from 'three';

import { Injectable } from '@alt/common';

import { AssetIndex } from '../assets/assetIndex';
import { RenderingConfigProvider } from '.';

/**
 * Maximal size of the tile atlas in single dimension
 */
const MAX_ATLAS_SIZE = 2048;

export class TileTextureProvider extends Injectable {
    private assetIndex = this.inject(AssetIndex);
    private renderingConfigProvider = this.inject(RenderingConfigProvider);

    public getTextureAtlas(families: string[]): TileTextureAtlas {
        const tiles: { canvas: HTMLCanvasElement, family: string }[] = [];

        for (const family of families) {
            const assets = this.assetIndex.getAssetFamily(family);

            for (const { canvas } of assets) {
                tiles.push({ canvas, family });
            }
        }

        const tileSize = this.renderingConfigProvider.config.tileSize;
        const maxAtlasTileSize = Math.floor(MAX_ATLAS_SIZE / tileSize);
        const columns = Math.min(maxAtlasTileSize, tiles.length);
        const rows = Math.ceil(tiles.length / columns);

        const atlasCanvas = document.createElement('canvas');
        atlasCanvas.width = columns * tileSize;
        atlasCanvas.height = rows * tileSize;
        const atlasContext = atlasCanvas.getContext('2d');
        const index: AtlasIndex = Object.fromEntries(families.map(fam => [fam, []]));

        for (let i = 0; i < tiles.length; i++) {
            const col = i % columns;
            const row = Math.floor(i / columns);
            atlasContext.drawImage(
                tiles[i].canvas,
                col * tileSize,
                row * tileSize,
                tileSize,
                tileSize,
            );

            index[tiles[i].family].push([col, row]);
        }

        const texture = new CanvasTexture(
            atlasCanvas,
            UVMapping,
            ClampToEdgeWrapping,
            ClampToEdgeWrapping,
            NearestFilter,
            NearestFilter,
        );

        return {
            index,
            texture,
        };
    }
}

interface TileTextureAtlas {
    texture: CanvasTexture;
    index: AtlasIndex;
}

type AtlasIndex = { [tilename: string]: [number, number][] };

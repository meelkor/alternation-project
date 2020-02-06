import {
    Mesh,
    AmbientLight,
    MeshLambertMaterial,
} from 'three';

import { Component } from '@alt/engine/renderer';
import { TileTextureProvider } from '@alt/engine/renderer/tileTextureProvider';
import { TilePlaneBufferGeometry } from '@alt/engine/renderer/extensions/tilePlaneBufferGeometry';

const CHUNK_SIZE = 32;
const TILE_SEGMENTS = 2;

export class OverworldMapComponent extends Component {
    private tileTextureProvider = this.provide(TileTextureProvider);

    private rndrd = false;

    public onBind(): void { }

    public render(): void {
        if (this.rndrd) return;
        this.rndrd = true;

        const moon = new AmbientLight('#ffffff', 0.4);
        // const moon = new AmbientLight('#9999ff', 0.06);

        this.context.scene.add(moon);

        this.renderChunk({ x: 0, y: 0 });
    }

    private renderChunk(chunk: MapChunk): void {
        const atlas = this.tileTextureProvider.getTextureAtlas(
            ['grass', 'dirt'],
            ['transition-basic'],
        );

        const geometry = new TilePlaneBufferGeometry(
            CHUNK_SIZE,
            CHUNK_SIZE,
            TILE_SEGMENTS,
        );

        const tile0Map: [number, number][][] = new Array(CHUNK_SIZE);
        const tile1Map: [number, number, number, number][][] = new Array(CHUNK_SIZE);

        for (let x = 0; x < CHUNK_SIZE; x++) {
            tile0Map[x] = new Array(CHUNK_SIZE);
            tile1Map[x] = new Array(CHUNK_SIZE);

            for (let y = 0; y < CHUNK_SIZE; y++) {
                if (y > 6) {
                    tile0Map[x][y] = [atlas.getRandomState('grass').bandOffset, 0];
                    tile1Map[x][y] = [-1, 0, -1, 0];
                } else if (y < 6) {
                    tile0Map[x][y] = [atlas.getRandomState('dirt').bandOffset, 0];
                    tile1Map[x][y] = [-1, 0, -1, 0];
                } else {
                    const mask = atlas.getRandomState('transition-basic');
                    tile0Map[x][y] = [atlas.getRandomState('dirt').bandOffset, -1];
                    tile1Map[x][y] = [atlas.getRandomState('grass').bandOffset, 0, mask.bandOffset, 1];
                }
            }
        }

        geometry.setTileAttribute('aTile0', 2, tile0Map);
        geometry.setTileAttribute('aTile1', 4, tile1Map);

        const material = new MeshLambertMaterial({
            map: atlas.texture,
        });
        material.defines = { ATLAS_EXTENSION: true };
        material.userData = {
            atlasColumns: atlas.columns,
            atlasRows: atlas.rows,
        };

        const mesh = new Mesh(geometry, material);
        mesh.userData.terrain = true;

        mesh.position.x = chunk.x * CHUNK_SIZE;
        mesh.position.y = chunk.y * CHUNK_SIZE;
        mesh.position.z = 0;

        this.context.scene.add(mesh);
    }
}

interface MapChunk {
    x: number;
    y: number;
}

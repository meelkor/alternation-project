import {
    Mesh,
    PlaneBufferGeometry,
    AmbientLight,
    MeshLambertMaterial,
    RepeatWrapping,
} from 'three';

import { Component } from '@alt/engine/renderer';
import { TileTextureProvider } from '@alt/engine/renderer/tileTextureProvider';

export class OverworldMapComponent extends Component {
    private tileTextureProvider = this.provide(TileTextureProvider);

    private CHUNK_SIZE = 32;

    private rndrd = false;

    public onBind(): void { }

    public render(): void {
        if (this.rndrd) return;
        this.rndrd = true;

        // const moon = new AmbientLight('#ffffff', 1);
        const moon = new AmbientLight('#9999ff', 0.06);

        this.context.scene.add(moon);

        this.renderChunkGroups({ x: 0, y: 0 });
        this.renderChunkGroups({ x: -1 * this.CHUNK_SIZE, y: -1 * this.CHUNK_SIZE });
        this.renderChunkGroups({ x: -2 * this.CHUNK_SIZE, y: -2 * this.CHUNK_SIZE });
        this.renderChunkGroups({ x: -3 * this.CHUNK_SIZE, y: -3 * this.CHUNK_SIZE });
        this.renderChunkGroups({ x: -4 * this.CHUNK_SIZE, y: -4 * this.CHUNK_SIZE });
        this.renderChunkGroups({ x: -5 * this.CHUNK_SIZE, y: -5 * this.CHUNK_SIZE });
    }

    private renderChunkGroups(chunk: MapChunk): void {
        const { texture } = this.tileTextureProvider.getTextureAtlas(['grass']);

        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(Math.floor(this.CHUNK_SIZE / 6), this.CHUNK_SIZE);

        const geometry = new PlaneBufferGeometry(
            this.CHUNK_SIZE,
            this.CHUNK_SIZE,
            this.CHUNK_SIZE * 2,
            this.CHUNK_SIZE * 2,
        );

        const material = new MeshLambertMaterial({
            map: texture,
        });

        const mesh = new Mesh(
            geometry,
            [material],
        );
        mesh.userData.terrain = true;

        const vertices = (this.CHUNK_SIZE * 2) ** 2 * 6;

        geometry.addGroup(0, vertices / 2, 0);
        geometry.addGroup(vertices / 2, vertices / 2, 0);

        mesh.position.x = chunk.x + this.CHUNK_SIZE / 2;
        mesh.position.y = chunk.y + this.CHUNK_SIZE / 2;
        mesh.position.z = 0;

        this.context.scene.add(mesh);
    }
}

interface MapChunk {
    x: number;
    y: number;
}

import {
    Mesh,
    PlaneBufferGeometry,
    TextureLoader,
    AmbientLight,
    MeshLambertMaterial,
    RepeatWrapping,
} from 'three';

import { Component } from '@alt/engine/renderer';
import { GameMap } from '@alt/game';

export class OverworldMapComponent extends Component {
    // @ts-ignore
    private map: GameMap;

    private CHUNK_SIZE = 32;

    private rndrd = false;

    public setMap(map: GameMap): void {
        this.map = map;
    }

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
        var grass = new TextureLoader().load('/library/images/grass.webp');
        grass.wrapS = RepeatWrapping;
        grass.wrapT = RepeatWrapping;
        grass.repeat.set(this.CHUNK_SIZE, this.CHUNK_SIZE);

        const geometry = new PlaneBufferGeometry(
            this.CHUNK_SIZE,
            this.CHUNK_SIZE,
            this.CHUNK_SIZE * 2,
            this.CHUNK_SIZE * 2,
        );

        const material = new MeshLambertMaterial({
            map: grass,
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

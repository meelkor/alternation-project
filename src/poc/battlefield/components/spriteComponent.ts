import { PlaneGeometry, Mesh, MeshLambertMaterial, SpotLight } from 'three';
import noiseModule = require('noisejs');

import { Sprite } from '@alt/game/forms/sprite';
import { Component, RenderingConfigProvider } from '@alt/engine/renderer';
import { AssetIndex } from '@alt/engine/assets/assetIndex';
import { SpriteTexture } from '@alt/engine/renderer/spriteTexture';
import { TilePos } from '@alt/engine/projection/tile';

const Noise: any = (noiseModule as any).Noise;

export abstract class SpriteComponent<S extends Sprite> extends Component {
    protected resourceIndex = this.inject(AssetIndex);
    protected renderingConfigProvider = this.inject(RenderingConfigProvider);

    protected sprite: S;
    protected mesh: Mesh;
    protected light: SpotLight;
    protected spriteTexture: SpriteTexture;

    private zOffset: number = 0;
    private xOffset: number = 0;

    private lightNoise = new Noise(Math.random());

    protected abstract getPosition(hrt: number): TilePos;

    public setSprite(sprite: S): void {
        this.sprite = sprite;

        if (!this.resourceIndex.getAssetFamily(this.sprite.asset)) {
            throw new Error(`Asset doesn't exist: ${this.sprite.asset}`);
        }
    }

    public onBind(): void {
        this.spriteTexture = new SpriteTexture(this.resourceIndex.getAssetFamily(this.sprite.asset)[0]);

        this.mesh = this.createMesh();
        this.context.scene.add(this.mesh);

        this.light = this.createLight();
        this.context.scene.add(this.light);
        this.context.scene.add(this.light.target);
    }

    public render(hrt: number): void {
        const pos = this.getPosition(hrt);

        this.light.visible = this.sprite.light > 0;
        this.light.intensity = this.sprite.light;

        this.light.position.set(pos.x, pos.y, 10);
        const xd = this.lightNoise.perlin2(1, hrt);
        const yd = this.lightNoise.perlin2(2, hrt);
        this.light.target.position.set(pos.x + xd * 0.06, pos.y + yd * 0.06, 0);
        this.mesh.position.set(pos.x + this.xOffset, pos.y + this.xOffset, this.zOffset);

    }

    protected createMesh(): Mesh {
        const width = this.spriteTexture.width / this.renderingConfigProvider.config.tileSize;
        const height = this.spriteTexture.height / this.renderingConfigProvider.config.tileSize;
        const material = new MeshLambertMaterial({
            map: this.spriteTexture.getTexture(),
        });
        const geometry = new PlaneGeometry(
            width,
            height,
        );
        geometry.rotateX(60 / 180 * Math.PI);
        geometry.rotateZ(-1 / 4 * Math.PI);
        geometry.faces.forEach(face => face.vertexNormals.forEach(v => v.set(0, 0, 1)));

        material.transparent = true;

        this.zOffset = Math.cos(30 / 180 * Math.PI) * height / 2;
        const sin = Math.sin(30 / 180 * Math.PI) * height / 2;
        this.xOffset = Math.sqrt(sin ** 2 / 2);

        const mesh = new Mesh(
            geometry,
            material,
        );

        mesh.userData.role = 'sprite';

        return mesh;
    }

    protected createLight(): SpotLight {
        const light = new SpotLight('#df7d4f', this.sprite.light);
        light.distance = 100;
        light.angle = 0.45;
        light.penumbra = 1;

        return light;
    }
}

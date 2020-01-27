import { PlaneGeometry, Mesh, MeshLambertMaterial, SpotLight } from 'three';

import { TilePos } from '@alt/engine/projection/tile';
import { Sprite } from '@alt/game/piece/sprite';
import { Component, Projector } from '@alt/engine/renderer';
import { ResourceIndex } from '@alt/engine/resources/resourceIndex';
import { SpriteTexture } from '@alt/engine/renderer/spriteTexture';

export class SpriteComponent extends Component {
    private sprite: Sprite;

    private renderedPosition: TilePos;
    private renderedSprite: RenderedSprite;

    private spriteTexture: SpriteTexture;
    private mesh: Mesh;
    private light: SpotLight;

    private resourceIndex = this.inject(ResourceIndex);
    private projector = this.inject(Projector);
    private z: number = 0;
    private x: number = 0;

    public setPiece(piece: Sprite): void {
        this.sprite = piece;

        if (!this.resourceIndex.getResource(this.sprite.asset)) {
            throw new Error(`Asset doesn't exist: ${this.sprite.asset}`);
        }
    }

    public onBind(): void { }

    public render(): void {
        if (
            this.renderedSprite
            && this.renderedPosition
            && this.renderedPosition.eq(this.sprite.position)
            && this.renderedSprite.state === this.sprite.state
        ) {
            return;
        }

        if (!this.spriteTexture) {
            this.spriteTexture = new SpriteTexture(this.resourceIndex.getResource(this.sprite.asset));
        }

        if (!this.mesh) {
            const dimensions = this.projector.unprojectDimensions(this.spriteTexture);
            const material = new MeshLambertMaterial({
                map: this.spriteTexture.getTexture(),
            });
            const geometry = new PlaneGeometry(
                dimensions.width,
                dimensions.height,
            );
            geometry.rotateX(60 / 180 * Math.PI);
            geometry.rotateZ(-1 / 4 * Math.PI);
            geometry.faces.forEach(face => face.vertexNormals.forEach(v => v.set(0, 0, 1)));

            material.transparent = true;
            this.z = Math.cos(30 / 180 * Math.PI) * dimensions.height / 2;
            const t = Math.sin(30 / 180 * Math.PI) * dimensions.height / 2;
            this.x = Math.sqrt(t ** 2 / 2);
            this.mesh = new Mesh(
                geometry,
                material,
            );
            this.mesh.userData.role = 'sprite';

            this.context.scene.add(this.mesh);
        }

        if (!this.light && this.sprite.light > 0) {
            this.light = new SpotLight('#ffccaa', this.sprite.light);
            this.light.distance = 100;
            this.light.angle = 0.45;
            this.light.penumbra = 1;
            this.light.target.position.set(this.sprite.position.x, this.sprite.position.y, 0);
            this.context.scene.add(this.light);
            this.context.scene.add(this.light.target);
        }

        if (this.light) {
            this.light.position.set(this.sprite.position.x, this.sprite.position.y, 10);
        }
        this.mesh.position.set(this.sprite.position.x + this.x, this.sprite.position.y + this.x, this.z);
    }
}

type RenderedSprite = {
    name: string;
    state: string;
};

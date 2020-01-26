import { PlaneGeometry, Mesh, MeshLambertMaterial, SpotLight } from 'three';

import { TilePos } from '@alt/engine/projection/tile';
import { Piece } from '@alt/game/piece/piece';
import { ThreeComponent, ThreeProjector } from '@alt/engine/threeRenderer';
import { ResourceIndex } from '@alt/engine/resources/resourceIndex';
import { ThreeSprite } from '@alt/engine/threeRenderer/threeSprite';

export class PieceComponent extends ThreeComponent {
    private piece: Piece;

    private renderedPosition: TilePos;
    private renderedSprite: RenderedSprite;

    private sprite: ThreeSprite;
    private mesh: Mesh;
    private light: SpotLight;

    private resourceIndex = this.inject(ResourceIndex);
    private projector = this.inject(ThreeProjector);
    private z: number = 0;
    private x: number = 0;

    public setPiece(piece: Piece): void {
        this.piece = piece;

        if (!this.resourceIndex.getResource(this.piece.asset)) {
            throw new Error(`Asset doesn't exist: ${this.piece.asset}`);
        }
    }

    public onBind(): void { }

    public render(): void {
        if (
            this.renderedSprite
            && this.renderedPosition
            && this.renderedPosition.eq(this.piece.position)
            && this.renderedSprite.state === this.piece.state
        ) {
            return;
        }

        if (!this.sprite) {
            this.sprite = new ThreeSprite(this.resourceIndex.getResource(this.piece.asset));
        }

        if (!this.mesh) {
            const dimensions = this.projector.unprojectDimensions(this.sprite);
            const material = new MeshLambertMaterial({
                map: this.sprite.getTexture(),
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

            this.scene.add(this.mesh);
        }

        if (!this.light && this.piece.light > 0) {
            this.light = new SpotLight('#ffccaa', this.piece.light);
            this.light.distance = 100;
            this.light.angle = 0.45;
            this.light.penumbra = 1;
            this.light.target.position.set(this.piece.position.x, this.piece.position.y, 0);
            this.scene.add(this.light);
            this.scene.add(this.light.target);
        }

        if (this.light) {
            this.light.position.set(this.piece.position.x, this.piece.position.y, 10);
        }
        this.mesh.position.set(this.piece.position.x + this.x, this.piece.position.y + this.x, this.z);
    }
}

type RenderedSprite = {
    name: string;
    state: string;
};

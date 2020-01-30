import { Mesh, TextureLoader, MeshLambertMaterial, PlaneGeometry } from 'three';

import { CharacterSprite } from '@alt/game/character/characterSprite';
import { getPositionByAction } from '@alt/game/character';

import { SpriteComponent } from './spriteComponent';
import { TilePos } from '@alt/engine/projection/tile';

export class CharacterSpriteComponent extends SpriteComponent<CharacterSprite> {
    private selectionCircle: Mesh;

    protected getPosition(hrt: number): TilePos {
        return getPositionByAction(this.sprite.action, hrt);
    }

    public onBind(): void {
        super.onBind();

        this.mesh.userData.character = this.sprite.character;

        var selectionCircle = new TextureLoader().load('/library/images/selection_circle.webp');
        const material = new MeshLambertMaterial({ map: selectionCircle });
        material.transparent = true;
        const geometry = new PlaneGeometry(1, 1);

        this.selectionCircle = new Mesh(geometry, material);
        this.context.scene.add(this.selectionCircle);

        this.selectionCircle.renderOrder = 0;
        this.mesh.renderOrder = 1;
    }

    public render(hrt: number) {
        super.render(hrt);

        const position = this.getPosition(hrt);

        this.selectionCircle.visible = this.sprite.selected || this.sprite.hovered;
        (this.selectionCircle.material as MeshLambertMaterial).opacity = this.sprite.selected ? 1 : 0.3;
        this.selectionCircle.position.set(
            position.x,
            position.y,
            0.001,
        );
    }
}

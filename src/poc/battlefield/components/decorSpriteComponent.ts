import { Mesh } from 'three';

import { DecorSprite } from '@alt/game/forms/sprite';
import { TilePos } from '@alt/engine/projection/tile';

import { SpriteComponent } from './spriteComponent';

export class DecorSpriteComponent extends SpriteComponent<DecorSprite> {
    protected getPosition(): TilePos {
        return this.sprite.position;
    }

    protected createMesh(): Mesh {
        const mesh = super.createMesh();

        mesh.userData.ignore = true;

        return mesh;
    }
}

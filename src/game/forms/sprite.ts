import { TilePos } from '@alt/engine/projection/tile';

export interface Sprite {
    asset: string;
    light: number;
}

export interface DecorSprite extends Sprite {
    state: string;
    position: TilePos;
}

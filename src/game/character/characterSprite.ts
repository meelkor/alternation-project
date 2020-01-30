import { Sprite } from '../forms/sprite';
import { CharacterAction } from '.';

export interface CharacterSprite extends Sprite {
    character: string;
    action: CharacterAction;
    selected: boolean;
    hovered: boolean;
}

import { CharacterAction } from './actions';

export interface Character {
    // template
    id: string;
    spriteName: string;
    action: CharacterAction;
}

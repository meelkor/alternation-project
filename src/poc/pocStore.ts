import { Store } from '@alt/engine/store';
import { getPositionByAction, Character } from '@alt/game/character';
import { Tile } from '@alt/engine/projection/tile';

export class PocStore extends Store {
    public characters: { [k: string]: Character } = {
        test: {
            id: 'test',
            spriteName: 'bitch',
            action: {
                name: 'idle',
                pos: new Tile(10, 10),
            },
        },
        test2: {
            id: 'test2',
            spriteName: 'bitch',
            action: {
                name: 'idle',
                pos: new Tile(14, 8),
            },
        },
    };
    public selectedCharacter: string;
    public hoveredCharacter: string;

    public addCharacter(char: Character) {
        this.characters[char.id] = char;

        this.emit(PocStoreEvents.AddCharacter, char.id);
    }

    public selectCharacter(charId: string) {
        if (this.selectedCharacter !== charId) {
            this.selectedCharacter = charId;
            this.emit(PocStoreEvents.SelectCharacter);
        }
    }

    public hoverCharacter(charId: string) {
        if (this.hoveredCharacter !== charId) {
            this.hoveredCharacter = charId;
            this.emit(PocStoreEvents.HoverCharacter);
        }
    }

    public walkCharacter(charId: string, tile: Tile, hrt: number) {
        const from = getPositionByAction(this.characters[charId].action, hrt);
        const to = tile.center;
        const path = from.sub(to);
        const duration = Math.sqrt(path.x ** 2 + path.y ** 2) * 300;
        this.characters[charId].action = {
            name: 'walk',
            to,
            from,
            started: hrt,
            expires: hrt + duration,
        };
        this.emit(PocStoreEvents.UpdateCharacter);
    }

    public idleCharacter(charId: string, tile: Tile) {
        this.characters[charId].action = {
            name: 'idle',
            pos: tile,
        };
        this.emit(PocStoreEvents.UpdateCharacter);
    }

    public expireEvents(hrt: number) {
        for (const char of Object.values(this.characters)) {
            if ('expires' in char.action && char.action.expires < hrt) {
                this.idleCharacter(char.id, char.action.to.tile);
            }
        }
    }
}

export enum PocStoreEvents {
    AddCharacter,
    SelectCharacter,
    HoverCharacter,
    UpdateCharacter,
}

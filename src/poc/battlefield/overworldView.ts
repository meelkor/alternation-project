import { View } from '@alt/engine/view';
import { GameMap } from '@alt/game';
import { EventHandler } from '@alt/engine/events';
import { CharacterSprite } from '@alt/game/character/characterSprite';
import { Character } from '@alt/game/character';

import { OverworldMapComponent } from './components/overworldMapComponent';
import { PocStore, PocStoreEvents } from '../pocStore';

import { CharacterSpriteComponent } from './components/characterSpriteComponent';
import { CameraControls } from './services/cameraControls';

export class OverworldView extends View {
    protected store = this.inject(PocStore);
    private eventHandler = this.inject(EventHandler);
    private cameraControls = this.instantiate(CameraControls);

    protected onUpdate(hrt: number): void {
        this.store.expireEvents(hrt);
        const eventMap = this.eventHandler.getEvents();

        if (!this.cameraControls.performDragScroll(eventMap)) {
            this.cameraControls.performEdgeScroll(eventMap);
        }

        this.cameraControls.performWheelScroll(eventMap);

        if (eventMap.mousemove) {
            if (eventMap.mousemove.objectData.character) {
                this.store.hoverCharacter(eventMap.mousemove.objectData.character);
            } else {
                this.store.hoverCharacter(null);
            }
        }
        if (eventMap.click) {
            if (eventMap.click.objectData.character) {
                this.store.selectCharacter(eventMap.click.objectData.character);
            } else if (
                eventMap.click.objectData.terrain
                && this.store.selectedCharacter
            ) {
                this.store.walkCharacter(
                    this.store.selectedCharacter,
                    eventMap.click.tile,
                    hrt,
                );
            }
        }
    }

    public async createOverworld(map: GameMap): Promise<void> {
        const mapComponent = this.provide(OverworldMapComponent);
        mapComponent.setMap(map);
        this.bindComponent(mapComponent);

        this.react().to(PocStoreEvents.AddCharacter)
            .do(e => this.onAddCharacters(e));

        this.onAddCharacters(Object.keys(this.store.characters));
    }

    private onAddCharacters(charIds: string[]) {
        for (const id of charIds) {
            this.addCharacter(this.store.characters[id]);
        }
    }

    private addCharacter(char: Character) {
        const pieceComponent = this.instantiate(CharacterSpriteComponent);
        pieceComponent.setSprite(this.computeCharacterSprite(char));
        this.bindComponent(pieceComponent);

        this.react()
            .to(PocStoreEvents.SelectCharacter)
            .to(PocStoreEvents.HoverCharacter)
            .to(PocStoreEvents.UpdateCharacter)
            .do(() => pieceComponent.setSprite(this.computeCharacterSprite(char)));
    }

    private computeCharacterSprite(char: Character): CharacterSprite {
        return {
            asset: 'bitch',
            action: char.action,
            light: 1,
            character: char.id,
            selected: char.id === this.store.selectedCharacter,
            hovered: char.id === this.store.hoveredCharacter,
        };
    }
}

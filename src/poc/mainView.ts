import { View } from '@alt/engine/view';
import { Injector } from '@alt/common';
import { GameMap } from '@alt/game';
import { GameMapTile } from '@alt/game/gameMap';

import { OverworldView } from './battlefield/battlefieldView';
import { ProjectionHelperComponent } from './debug/components/projectionHelperComponent';

const DEBUG = false;

export class MainView extends View {
    constructor(parent: Injector) {
        super(parent);

        this.createOverworld();

        if (DEBUG) {
            this.bindComponent(this.provide(ProjectionHelperComponent));
        }
    }

    private createOverworld(): void {
        const battlefield = this.provide(OverworldView);

        battlefield.createOverworld(new GameMap([
            new GameMapTile(0, 0, 'grass'),
            new GameMapTile(0, 1, 'grass'),
            new GameMapTile(1, 0, 'water'),
            new GameMapTile(1, 1, 'water'),
            new GameMapTile(2, 0, 'dirt'),
            new GameMapTile(2, 1, 'dirt'),
            new GameMapTile(2, 2, 'dirt'),
            new GameMapTile(2, 3, 'dirt'),
        ]));
    }
}

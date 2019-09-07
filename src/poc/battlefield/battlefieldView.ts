import { View } from '@alt/engine/view';
import { GameMap } from '@alt/game';

import { OverworldMapComponent } from './components/overworldMapComponent';

export class BattlefieldView extends View {
    public async init(map: GameMap): Promise<void> {
        const mapComponent = this.provide(OverworldMapComponent);
        mapComponent.setMap(map);
        this.bindComponent(mapComponent);
    }
}

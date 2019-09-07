import { Tile } from '@alt/engine/projection/tile';

export class GameMap {
    private emptyTile = new GameMapTile(null, null, 'none');
    private tileMap: Map<number, GameMapTile>;

    constructor(tiles: GameMapTile[]) {
        this.tileMap = new Map(tiles.map(gmTile => [gmTile.id, gmTile]));
    }

    public getTile(tile: Tile): GameMapTile {
        return this.tileMap.get(tile.id) || this.emptyTile;
    }
}

export class GameMapTile extends Tile {
    constructor(x: number, y: number, public ground: string) {
        super(x, y);
    }
}

import { View } from '@alt/engine/view';
import { GameMap } from '@alt/game';

import { OverworldMapComponent } from './components/overworldMapComponent';
import { PieceComponent } from './components/pieceComponent';
import { Piece } from '@alt/game/piece/piece';
import { TilePos } from '@alt/engine/projection/tile';

export class OverworldView extends View {
    public async createOverworld(map: GameMap): Promise<void> {
        const mapComponent = this.provide(OverworldMapComponent);
        mapComponent.setMap(map);
        this.bindComponent(mapComponent);


        this.makePiece(new TilePos(10, 10), 1);
        this.makePiece(new TilePos(10 - 3 - 1, 10 - 4), 1);
        this.makePiece(new TilePos(10 - 3, 10 - 3), 1);
        this.makePiece(new TilePos(10 - 2, 10 - 2), 1);
        this.makePiece(new TilePos(10 - 1, 10 - 1), 1);
        this.makePiece(new TilePos(10 + 3 + 1, 10 + 4), 1);
        this.makePiece(new TilePos(1 + 10 - 3 - 1, 10 - 4), 1);
        this.makePiece(new TilePos(1 + 10 - 3, 10 - 3), 1);
        this.makePiece(new TilePos(1 + 10 - 2, 10 - 2), 1);
        this.makePiece(new TilePos(1 + 10 - 1, 10 - 1), 1);
        this.makePiece(new TilePos(1 + 10 + 3 + 1, 10 + 4), 1);
        this.makePiece(new TilePos(21, 21), 1);

        // let i = 0;
        // setInterval(() => {
        //     piece.position.y = 10 + (i++ % 6) + 0.5;
        // }, 1000);
    }

    private makePiece(pos: TilePos, light: number): void {
        const piece = new Piece();

        piece.asset = 'bitch';
        piece.state = 'idle';
        piece.light = light;
        piece.position = pos.add({ x: 0.5, y: 0.5 });

        const pieceComponent = this.instantiate(PieceComponent);
        pieceComponent.setPiece(piece);
        this.bindComponent(pieceComponent);
    }
}

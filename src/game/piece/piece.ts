import { TilePos } from '@alt/engine/projection/tile';

export class Piece {
    public asset: string;
    public state: string;
    public position: TilePos;
    public light: number;
}

import { TilePos } from '@alt/engine/projection/tile';

export class Sprite {
    public asset: string;
    public state: string;
    public position: TilePos;
    public light: number;
}

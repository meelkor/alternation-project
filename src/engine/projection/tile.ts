import { Pos } from '@alt/common/geometry/pos';

export class Tile {
    public x: number;
    public y: number;

    public get id(): number {
        return this.y << 10 | this.x;
    }

    public get center(): TilePos {
        return new TilePos(this.x + 0.5, this.y + 0.5);
    }

    public get topLeft(): TilePos {
        return new TilePos(this.x, this.y);
    }

    public get topRight(): TilePos {
        return new TilePos(this.x + 1, this.y);
    }

    public get bottomRight(): TilePos {
        return new TilePos(this.x + 1, this.y + 1);
    }

    public get bottomLeft(): TilePos {
        return new TilePos(this.x, this.y + 1);
    }

    constructor(x: number, y: number) {
        this.x = Math.floor(x);
        this.y = Math.floor(y);
    }
}


export class TilePos extends Pos {
    public get tile(): Tile {
        return new Tile(Math.floor(this.x), Math.floor(this.y));
    }
}

export class PxPos extends Pos {
}

export class ProjectedTile extends Tile {
    constructor(
        x: number,
        y: number,
        public path: PxPos[],
        public pathCenter: PxPos,
    ) {
        super(x, y);
    }
}

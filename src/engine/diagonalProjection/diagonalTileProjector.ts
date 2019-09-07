import { Observable, combineLatest } from 'rxjs';

import { TileProjector } from '../projection';
import { TilePos, PxPos, Tile, ProjectedTile } from '../projection/tile';
import { ViewportSize } from '../renderer/renderer';
import { pickPos } from '@alt/common/geometry/pos';
import { map } from 'rxjs/operators';

export class DiagonalTileProjector extends TileProjector {
    public readonly MIN_TILES_X = 4;
    public readonly MIN_TILES_Y = 4;
    public readonly MAX_TILES_X = 10;
    public readonly MAX_TILES_Y = 10;
    public readonly MIN_TILE_SIZE = 40; // px
    public readonly MAX_TILE_SIZE = 64; // px
    // public readonly MAX_TILE_SIZE = 130; // px
    public readonly Y_SCALE = 1;

    public readonly sin = Math.cos(45 / 180 * Math.PI);

    // TODO: compute using viewport and max/min values
    public tileSize = this.MAX_TILE_SIZE;

    public visibleTiles$: Observable<ProjectedTile[]> = this.createVisibleTiles$();

    protected project(pos: TilePos, cameraPos: PxPos, viewport: ViewportSize): PxPos {
        return new PxPos(
            this.rotateX(pos, -1) * this.tileSize,
            this.rotateY(pos, -1) * this.tileSize,
        ).sub(cameraPos).add(viewport.div(2)).div(1, this.Y_SCALE);
    }

    protected unproject(pos: PxPos, cameraPos: PxPos, viewport: ViewportSize): TilePos {
        pos = cameraPos.sub(viewport.div(2)).add(pos.mul(1, this.Y_SCALE));

        return new TilePos(
            this.rotateX(pos) / this.tileSize,
            this.rotateY(pos) / this.tileSize,
        );
    }

    private createVisibleTiles$(): Observable<ProjectedTile[]> {
        return combineLatest(
            this.camera$,
            this.renderer.viewport$,
        ).pipe(
            map(([camPos, viewport]) => this.getVisibleTiles(camPos, viewport)
                .map(tile => this.projectTile(tile, camPos, viewport))),
        );
    }

    private getVisibleTiles(camPos: PxPos, viewport: ViewportSize): Tile[] {
        const topLeftPx = new PxPos(0, 0);
        const botRightPx = topLeftPx.add(viewport);

        const topLeft = this.unproject(topLeftPx, camPos, viewport);
        const botRight = this.unproject(botRightPx, camPos, viewport);
        const topRight = this.unproject(pickPos(botRightPx, topLeftPx), camPos, viewport);
        const botLeft = this.unproject(pickPos(topLeftPx, botRightPx), camPos, viewport);

        const topLeftTile = topLeft.tile;
        const topRightTile = topRight.tile;
        const botLeftTile = botLeft.tile;
        const botRightTile = botRight.tile;

        const topLeftZero = topLeft.sub(topLeft.floor());
        const topRightZero = topRight.sub(topRight.floor());

        const addTop = topLeftZero.x % 1 + (1 - topLeftZero.y % 1) >= 1;
        const addLeft = topLeftZero.x % 1 + topLeftZero.y % 1 < 1;
        const addRight = topRightZero.x % 1 + topRightZero.y % 1 >= 1;

        const tileHeight = Math.SQRT2;

        const vHeight = Math.sqrt((botLeft.y - topLeft.y) ** 2 + (topLeft.x - botLeft.x) ** 2);

        const w = Math.min(topLeftZero.x % 1, topLeftZero.y % 1) * tileHeight;
        const t =  Math.max(topLeftZero.x % 1, topLeftZero.y % 1) * tileHeight;
        const f = (tileHeight - (w + t)) / 2;

        const tileOffset = f + topLeftZero.y % 1 * tileHeight;

        const colHeight = Math.ceil(Math.abs((vHeight + tileOffset)) / tileHeight);
        const col2Height = Math.ceil(Math.abs((vHeight + (tileOffset + tileHeight / 2) % tileHeight)) / tileHeight);

        const leftCount = Math.max(topLeftTile.x - botLeftTile.x, botLeftTile.y - topLeftTile.y);
        const rightCount = Math.max(topRightTile.x - botRightTile.x, botRightTile.y - topRightTile.y);

        // TODO: calc size
        const tiles: Tile[] = new Array();
        let p = 0;

        if (addLeft) {
            const x = topLeftTile.x - 1;
            const y = topLeftTile.y;

            for (let r = 0; r < leftCount; r++) {
                tiles[p++] = new Tile(x - r, y + r);
            }
        }

        for (let i = 0, x = topLeftTile.x, y = topLeftTile.y; x <= topRightTile.x && y <= topRightTile.y; i++) {
            const col2 = i % 2;

            const height = col2 ? col2Height : colHeight;

            for (let r = 0; r < height; r++) {
                tiles[p++] = new Tile(x - r, y + r);
            }

            if (!col2 && addTop || col2 && !addTop) {
                x++;
            } else {
                y++;
            }
        }

        if (addRight) {
            const x = topRightTile.x;
            const y = topRightTile.y + 1;

            for (let r = 0; r < rightCount; r++) {
                tiles[p++] = new Tile(x - r, y + r);
            }
        }

        return tiles;
    }

    /**
     * Apply simplified rotation matrix for 45° for x coordinate
     */
    private rotateX({x, y}: { x: number, y: number }, direction: number = 1): number {
        return this.sin * (x - y * direction);
    }

    /**
     * Apply simplified rotation matrix for 45° for y coordinate
     */
    private rotateY({x, y}: { x: number, y: number }, direction: number = 1): number {
        return this.sin * (x * direction + y);
    }
}

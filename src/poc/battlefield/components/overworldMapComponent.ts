import { Subject, fromEvent, merge, empty, animationFrameScheduler } from 'rxjs';

import { ThreeComponent } from '@alt/engine/threeRenderer';
import { GameMap } from '@alt/game';
import { MeshBasicMaterial, Mesh, ShapeGeometry, Shape, Color } from 'three';
import { TileProjector } from '@alt/engine/projection';
import { ProjectedTile, PxPos } from '@alt/engine/projection/tile';
import { tap, switchMap, observeOn } from 'rxjs/operators';
import { MeshStack } from '@alt/engine/threeRenderer/meshStask';

export class OverworldMapComponent extends ThreeComponent {
    public rerender$ = new Subject<null>();

    private map: GameMap;
    private tileProjector = this.inject(TileProjector);

    private meshStack: MeshStack;

    public setMap(map: GameMap): void {
        this.map = map;
    }

    public onBind(): void {
        this.tileProjector.visibleTiles$.subscribe(tiles => this.drawTiles(tiles));
        this.registerDragPanning();
    }

    private drawTiles(tiles: ProjectedTile[]): void {
        if (!this.meshStack) {
            const geometry = this.makeTileTemplate(tiles[0]);
            this.meshStack = new MeshStack(() => new Mesh(
                geometry,
                new MeshBasicMaterial({
                    color: '#ffffff',
                }),
            ));
        }


        const toAdd = this.meshStack.run(getMesh => {
            for (const tile of tiles) {
                const mesh = getMesh();
                mesh.position.x = tile.pathCenter.x;
                mesh.position.y = tile.pathCenter.y;

                const ground = this.map.getTile(tile).ground;
                if (ground == 'water') {
                    (mesh.material as MeshBasicMaterial).color = new Color('#0000ff');
                } else if (ground == 'dirt') {
                    (mesh.material as MeshBasicMaterial).color = new Color('#ff00ff');
                } else {
                    (mesh.material as MeshBasicMaterial).color = new Color('#000000');
                }
            }
        });

        if (toAdd.length) {
            this.scene.add(...toAdd);
        }

        this.rerender$.next();
    }

    private makeTileTemplate(tile: ProjectedTile): ShapeGeometry {
        const originTilePath = tile.path.map(pos => pos.sub(tile.pathCenter));

        const shape = new Shape();
        const start = originTilePath[0];

        shape.moveTo(start.x, start.y);
        for (let i = 1; i < 4; i++) {
            shape.lineTo(originTilePath[i].x, originTilePath[i].y);
        }
        shape.lineTo(start.x, start.y);

        return new ShapeGeometry(shape);
    }

    private registerDragPanning(): void {
        // FIXME: not body! canvas! Get it here somehow
        const mousemove$ = fromEvent<MouseEvent>(document.body, 'mousemove').pipe(
            observeOn(animationFrameScheduler),
            tap(e => this.tileProjector.panCamera(
                new PxPos(e.movementX, e.movementY).mul(-1, 1),
            )),
        );

        merge(
            fromEvent<MouseEvent>(document.body, 'mousedown'),
            fromEvent<MouseEvent>(document.body, 'mouseup'),
        ).pipe(
            switchMap(e => e.type === 'mousedown' ? mousemove$ : empty()),
        ).subscribe();
    }
}

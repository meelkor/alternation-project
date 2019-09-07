import { createElement } from 'jsx-dom';
import { fromEvent, merge, empty } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';

import { SvgComponent } from '@alt/engine/svgRenderer';
import { TileProjector } from '@alt/engine/projection';
import { ProjectedTile, PxPos } from '@alt/engine/projection/tile';
import { GameMap } from '@alt/game';
import { ElementStack } from '@alt/common/dom/elementStack';

export class BattlefieldMapComponent extends SvgComponent {
    private svgGroup = (<g className='tile-container'></g>) as any as SVGGElement;

    private gameMap: GameMap;

    private tileProjector = this.inject(TileProjector);

    private tileStack = new ElementStack<SVGPathElement>(
        this.svgGroup,
        () => <path></path> as any as SVGPathElement,
    );
    private textStack = new ElementStack<SVGTextElement>(
        this.svgGroup,
        () => <text className='debug-coord'></text> as any as SVGTextElement,
    );

    public getComponentElement(): SVGGElement {
        return this.svgGroup;
    }

    public setMap(map: GameMap) {
        this.gameMap = map;
    }

    public onBind(): void {
        this.tileProjector.visibleTiles$.subscribe(bboxes => this.drawTiles(bboxes));
        this.registerDragPanning();
    }

    private drawTiles(tiles: ProjectedTile[]): void {
        this.tileStack.run(getElement => {
            tiles.map(tile => [this.projectedTileToPath(tile), tile] as const)
                .forEach(([path, tile]) => {
                    const pathElement = getElement();
                    pathElement.setAttribute('d', path);
                    pathElement.setAttribute('class', this.gameMap.getTile(tile).ground);
                });
        });

        this.textStack.run(getElement => {
            tiles.forEach(tile => {
                const textElement = getElement();
                textElement.setAttribute('x', tile.path[0].x.toString());
                textElement.setAttribute('y', tile.path[0].y.toString());
            });
        });
    }

    private registerDragPanning(): void {
        const mousemove$ = fromEvent<MouseEvent>(document.body, 'mousemove').pipe(
            tap(e => this.tileProjector.panCamera(new PxPos(e.movementX, e.movementY).mul(-1))),
        );

        merge(
            fromEvent<MouseEvent>(document.body, 'mousedown'),
            fromEvent<MouseEvent>(document.body, 'mouseup'),
        ).pipe(
            switchMap(e => e.type === 'mousedown' ? mousemove$ : empty()),
        ).subscribe();
    }

    private projectedTileToPath(tile: ProjectedTile): string {
        const [a, b, c, d] = tile.path;

        return `M${a.x} ${a.y} L${b.x} ${b.y} L${c.x} ${c.y} L${d.x} ${d.y} L${a.x} ${a.y}`;
    }
}

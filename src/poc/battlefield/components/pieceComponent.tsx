import { createElement } from 'jsx-dom';
import { Subject, Observable, of, NEVER } from 'rxjs';
import { switchMap, take, map, filter, tap, publish, refCount, publishReplay } from 'rxjs/operators';

import { sleep } from '@alt/common/promise';
import { TilePos, PxPos, Tile } from '@alt/engine/projection/tile';
import { TileProjector } from '@alt/engine/projection';
import { SvgComponent } from '@alt/engine/svgRenderer';
import { Piece } from '@alt/game/piece/piece';
import { Timer } from '@alt/game/timer';

const SHAPE = [
    new PxPos(0, 0),
    new PxPos(40, -40),
    new PxPos(0, -80),
    new PxPos(-40, -40),
];

export class PieceComponent extends SvgComponent {
    private piece: Piece;

    private idle$ = NEVER;
    private animation$ = new Subject<Observable<RenderEvent>>();
    private render$ = this.animation$.pipe(
            switchMap(obs$ => obs$.pipe(
                tap({ complete: () => this.animation$.next(this.idle$) }),
            )),
            publish(),
            refCount(),
    );
    private position$ = this.render$.pipe(
        filter(e => 'position' in e),
        map(({ position }) => position),
        publishReplay(1),
        refCount(),
    );

    private pieceGroup: SVGGElement = (<g></g>) as any;
    private path: SVGPathElement;

    private tileProjector = this.inject(TileProjector);
    private timer = this.inject(Timer);

    public getComponentElement(): SVGElement {
        return this.pieceGroup;
    }

    public onBind(): void {
        this.position$.pipe(
            switchMap(position => this.tileProjector.getPositionProjection(position)),
        ).subscribe(pos => this.drawFigure(pos));
    }

    public setPiece(piece: Piece): void {
        this.piece = piece;
    }

    public setPosition(tile: Tile): void {
        this.setExactPosition(tile.center);
    }

    public setExactPosition(pos: TilePos): void {
        this.animation$.next(of({ position: pos }));
    }

    public async moveTo(tile: Tile, duration: number): Promise<void> {
        const current = await this.position$.pipe(take(1)).toPromise();
        const travelDistance = tile.center.sub(current);

        this.animation$.next(
            this.timer.getFiniteTimer(duration).pipe(map(progress => ({
                position: current.add(travelDistance.mul(progress)),
            }))),
        );

        return sleep(duration);
    }

    private drawFigure(pos: PxPos): void {
        const path = 'M ' + SHAPE
            .map(shapePos => shapePos.mul(1, this.piece.height / 80).add(pos))
            .map(shapePos => `${shapePos.x} ${shapePos.y}`)
            .join(' L ');

        if (!this.path) {
            this.path = (<path fill={this.piece.color}></path>) as any;
            this.path.setAttribute('d', path);
            this.pieceGroup.append(this.path);
        } else {
            this.path.setAttribute('d', path);
        }
    }
}

type RenderEvent = AtLeastOne<{
    position?: TilePos;
}>;

type AtLeastOne<T, U = {[K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];

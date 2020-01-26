import { Mesh, PlaneBufferGeometry, BoxBufferGeometry, TextureLoader, AmbientLight, MeshLambertMaterial } from 'three';
import { fromEvent, merge, empty } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';

import { ThreeComponent } from '@alt/engine/threeRenderer';
import { GameMap } from '@alt/game';
import { PxPos } from '@alt/engine/projection/tile';
import { Camera } from '@alt/engine/camera';
import { Projector } from '@alt/engine/renderer';

export class OverworldMapComponent extends ThreeComponent {
    // @ts-ignore
    private map: GameMap;
    private camera = this.inject(Camera);
    private projector = this.inject(Projector);

    private rndrd = false;

    public setMap(map: GameMap): void {
        this.map = map;
    }

    public onBind(): void {
        this.registerDragPanning();
    }

    public render(): void {
        if (this.rndrd) return;
        this.rndrd = true;

        const moon = new AmbientLight('#9999ff', 0.06);

        this.scene.add(moon);

        const CHUNK_SIZE = 30;

        for (let i = 0; i < CHUNK_SIZE ** 2; i++) {
            this.scene.add(this.makeTile(Math.floor(i / CHUNK_SIZE), i % CHUNK_SIZE, 0));
        }
    }

    private registerDragPanning(): void {
        let movementBase: PxPos = this.projector.unprojectToCamera(new PxPos(0, 0));

        this.camera.zoom$.subscribe(() => {
            movementBase = this.projector.unprojectToCamera(new PxPos(0, 0));
        });

        const mousemove$ = fromEvent<MouseEvent>(this.eventTarget, 'mousemove').pipe(
            tap(e => this.camera.updateDelta(
                this.projector
                    .unprojectToCamera(new PxPos(-e.movementX, -e.movementY))
                    .sub(movementBase),
            )),
        );

        merge(
            fromEvent<MouseEvent>(this.eventTarget, 'mousedown'),
            fromEvent<MouseEvent>(this.eventTarget, 'mouseup'),
        ).pipe(
            switchMap(e => e.type === 'mousedown' ? mousemove$ : empty()),
        ).subscribe();

        fromEvent<WheelEvent>(this.eventTarget, 'wheel').subscribe(({ deltaY }) => {
            this.camera.setZoom(this.camera.zoom * (deltaY > 0 ? 0.9 : 1.1));
        });
    }

    private makeTile(x: number, y: number, z: number = 0): Mesh {
        var grass = new TextureLoader().load('/library/images/grass.webp');
        const geometry = z ? new BoxBufferGeometry(1, 1, z) : new PlaneBufferGeometry(1, 1, 2, 2);
        const mesh = new Mesh(
            geometry,
            new MeshLambertMaterial({
                map: grass,
            }),
        );

        mesh.position.x = x + 0.5;
        mesh.position.y = y + 0.5;
        mesh.position.z = z / 2;

        return mesh;
    }
}

import { fromEvent, merge, empty } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';

import { Injectable, Injector } from '@alt/common';
import { Projector, Renderer } from '@alt/engine/renderer';
import { WorldCamera } from '@alt/engine/camera';
import { PxPos } from '@alt/engine/projection/tile';

export class CameraControls extends Injectable {
    constructor(parent: Injector) {
        super(parent);

        const projector = this.inject(Projector);
        const renderer = this.inject(Renderer);
        const camera = this.inject(WorldCamera);

        let movementBase: PxPos = projector.unprojectToCamera(new PxPos(0, 0));

        camera.zoom$.subscribe(() => {
            movementBase = projector.unprojectToCamera(new PxPos(0, 0));
        });

        const mousemove$ = fromEvent<MouseEvent>(renderer.eventTarget, 'mousemove').pipe(
            tap(e => camera.updateDelta(
                projector
                    .unprojectToCamera(new PxPos(-e.movementX, -e.movementY))
                    .sub(movementBase),
            )),
        );

        merge(
            fromEvent<MouseEvent>(renderer.eventTarget, 'mousedown'),
            fromEvent<MouseEvent>(renderer.eventTarget, 'mouseup'),
        ).pipe(
            switchMap(e => e.type === 'mousedown' ? mousemove$ : empty()),
        ).subscribe();

        fromEvent<WheelEvent>(renderer.eventTarget, 'wheel').subscribe(({ deltaY }) => {
            camera.setZoom(camera.zoom * (deltaY > 0 ? 0.9 : 1.1));
        });
    }
}

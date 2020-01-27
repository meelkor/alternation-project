import { Raycaster, Mesh, MeshLambertMaterial } from 'three';
import { Subject, Observable, fromEvent } from 'rxjs';

import { Injectable, Injector } from '@alt/common';

import { Renderer } from '../renderer';
import { Tile } from '../projection/tile';

export class EventHandler extends Injectable {
    public clickSubject = new Subject<WorldMouseEvent>();

    private renderer = this.inject(Renderer);
    private raycaster = new Raycaster();

    public get click$(): Observable<WorldMouseEvent> {
        return this.clickSubject;
    }

    constructor(parent: Injector) {
        super(parent);

        const bRect = this.renderer.eventTarget.getBoundingClientRect();

        // TODO: observe frustrum
        fromEvent<MouseEvent>(this.renderer.eventTarget, 'click').subscribe(e => {
            const x = (e.x - bRect.left) / bRect.width * 2 - 1;
            const y = (1 - (e.y - bRect.top) / bRect.height) * 2 - 1;

            this.raycaster.setFromCamera({ x, y }, this.renderer.camera);

            const intersections = this.raycaster.intersectObjects(this.renderer.worldScene.children);

            const intersection = intersections.find(intersection => {
                const mesh = intersection.object as Mesh;

                if (!mesh.isMesh || mesh.userData.ignore) {
                    return false;
                }

                if (mesh.userData.role === 'sprite') {
                    const material = mesh.material as MeshLambertMaterial;
                    const canvas: HTMLCanvasElement = material.map.image;

                    const pixel = canvas.getContext('2d').getImageData(
                        intersection.uv.x * canvas.width,
                        (1 - intersection.uv.y) * canvas.height,
                        1,
                        1,
                    );

                    return pixel.data[3] > 0;
                } else {
                    return true;
                }
            });

            if (intersection) {
                const mesh = intersection.object as Mesh;
                // Position calculation will not work for sprites higher than
                // 1000 px, sprite's angle then needs to be incorporated.
                const position = mesh.userData.role === 'sprite'
                    ? mesh.position
                    : intersection.point;
                const tile = new Tile(
                    Math.floor(position.x),
                    Math.floor(position.y),
                );

                this.clickSubject.next({
                    tile,
                    objectData: intersection.object.userData,
                });
            }
        });
    }
}

export type WorldMouseEvent = {
    tile: Tile;
    objectData: { [k: string]: any };
};

import { Raycaster, Mesh, MeshLambertMaterial } from 'three';

import { Injectable, Injector } from '@alt/common';

import { Renderer, RenderingConfigProvider } from '../renderer';
import { Tile, PxPos } from '../projection/tile';

export class EventHandler extends Injectable {
    private renderer = this.inject(Renderer);
    private renderingConfigProvider = this.inject(RenderingConfigProvider);
    private raycaster = new Raycaster();

    private click: MouseEvent;

    private x = 0;
    private y = 0;
    private lastFrameX = 0;
    private lastFrameY = 0;
    private mouseDownX = 0;
    private mouseDownY = 0;
    private mouseDown: MouseEvent = null;
    private wheel: number = 0;

    constructor(parent: Injector) {
        super(parent);

        const target = this.renderer.eventTarget;

        this.x = this.renderingConfigProvider.config.width / 2;
        this.y = this.renderingConfigProvider.config.height / 2;

        target.addEventListener('mousemove', e => {
            this.x = e.offsetX;
            this.y = e.offsetY;
        });

        target.addEventListener('mouseleave', e => {
            this.x = e.offsetX;
            this.y = e.offsetY;
        });

        target.addEventListener('mousedown', e => {
            this.mouseDownX = this.x;
            this.mouseDownY = this.y;
            this.mouseDown = e;

            e.preventDefault();
        });

        target.addEventListener('mouseup', e => {
            if (
                Math.abs(this.mouseDownX - this.x) < 4
                && Math.abs(this.mouseDownY - this.y) < 4
            ) {
                this.click = e;
            }

            this.mouseDown = null;

            e.preventDefault();
        });

        target.addEventListener('wheel', e => {
            this.wheel += Math.sign(e.deltaY);

            e.preventDefault();
        });

        target.addEventListener('contextmenu', e => {
            e.preventDefault();
        });
    }

    public getEvents(): EventMap {
        const drag = this.mouseDown
            ? {
                x: this.x - this.lastFrameX,
                y: this.y - this.lastFrameY,
                init: this.mouseDown,
            }
            : null;

        const mousemove = this.lastFrameX !== this.x || this.lastFrameY !== this.y
            ? this.createWorldMouseEvent({ x: this.x, y: this.y })
            : null;

        const click = this.click;
        const wheel = this.wheel;

        this.lastFrameX = this.x;
        this.lastFrameY = this.y;
        this.click = null;
        this.wheel = 0;

        return {
            currentPosition: new PxPos(this.x, this.y),
            click: click ? this.createWorldMouseEvent(click) : null,
            mousemove,
            drag,
            wheel,
        };
    }

    private createWorldMouseEvent(e: { x: number; y: number }): WorldMouseEvent | void {
        const x = e.x / this.renderingConfigProvider.config.width * 2 - 1;
        const y = (1 - e.y / this.renderingConfigProvider.config.height) * 2 - 1;

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

            return {
                tile,
                objectData: intersection.object.userData,
            };
        }
    }
}

export type WorldMouseEvent = {
    tile: Tile;
    objectData: { [k: string]: any };
};

export type EventMap = {
    currentPosition: PxPos;
    wheel: number;
    click?: WorldMouseEvent | void;
    mousemove?: WorldMouseEvent | void;
    drag?: DragEvent;
};

export type DragEvent = {
    x: number;
    y: number;
    /**
     * Mousedown event that init'd the drag
     */
    init: MouseEvent;
};

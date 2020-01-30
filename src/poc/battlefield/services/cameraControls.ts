import { Injectable } from '@alt/common';
import { Renderer, RenderingConfigProvider } from '@alt/engine/renderer';
import { EventMap } from '@alt/engine/events/eventHandler';

const SCROLL_TRAP_SIZE = 8;
/**
 * In fraction of height or width
 */
const CORNER_TRAP_SIZE = 0.2;
/**
 * As of now, the speed is also affected by FPS.
 */
const SCROLL_SPEED = 0.15;
const EDGE_SCROLL_MODE = EdgeScrollMode.VisuallyEqual;

export class CameraControls extends Injectable {
    private renderingConfigProvider = this.inject(RenderingConfigProvider);
    private renderer = this.inject(Renderer);

    public performEdgeScroll(events: EventMap): boolean {
        const conf = this.renderingConfigProvider.config;

        const cornerSizeY = this.renderingConfigProvider.config.height * CORNER_TRAP_SIZE;
        const cornerSizeX = this.renderingConfigProvider.config.width * CORNER_TRAP_SIZE;

        let overLeft = events.currentPosition.x < SCROLL_TRAP_SIZE;
        let overRight = events.currentPosition.x > conf.width - SCROLL_TRAP_SIZE;
        let overTop = events.currentPosition.y < SCROLL_TRAP_SIZE;
        let overBottom = events.currentPosition.y > conf.height - SCROLL_TRAP_SIZE;

        overLeft = overLeft || ((overTop || overBottom) && events.currentPosition.x < SCROLL_TRAP_SIZE + cornerSizeY);
        overRight = overRight || ((overTop || overBottom) && events.currentPosition.x > conf.width - SCROLL_TRAP_SIZE - cornerSizeY);

        overTop = overTop || ((overLeft || overRight) && events.currentPosition.y < SCROLL_TRAP_SIZE + cornerSizeX);
        overBottom = overBottom || ((overLeft || overRight) && events.currentPosition.y > conf.height - SCROLL_TRAP_SIZE - cornerSizeX);

        let r = false;

        if (overLeft) {
            const moveX = SCROLL_SPEED;
            this.renderer.camera.position.x += (-moveX) / this.renderer.camera.zoom;
            this.renderer.camera.position.y += (moveX) / this.renderer.camera.zoom;
            r = true;
        } else if (overRight) {
            const moveX = -SCROLL_SPEED;
            this.renderer.camera.position.x += (-moveX) / this.renderer.camera.zoom;
            this.renderer.camera.position.y += (moveX) / this.renderer.camera.zoom;
            r = true;
        }

        if (overTop) {
            const moveY = SCROLL_SPEED / this.renderer.camera.zoom * EDGE_SCROLL_MODE;
            this.renderer.camera.position.x += moveY;
            this.renderer.camera.position.y += moveY;
            r = true;
        } else if (overBottom) {
            const moveY = -SCROLL_SPEED / this.renderer.camera.zoom * EDGE_SCROLL_MODE;
            this.renderer.camera.position.x += moveY;
            this.renderer.camera.position.y += moveY;
            r = true;
        }

        return r;
    }

    public performDragScroll(events: EventMap): boolean {
        if (events.drag && events.drag.init.button === 2) {
            const moveX = events.drag.x / this.renderingConfigProvider.config.projectedTileWidth;
            const moveY = events.drag.y / this.renderingConfigProvider.config.projectedTileHeight;
            this.renderer.camera.position.x += (-moveX + moveY) / this.renderer.camera.zoom;
            this.renderer.camera.position.y += (moveX + moveY) / this.renderer.camera.zoom;
            return true;
        }

        return false;
    }

    public performWheelScroll(events: EventMap): boolean {
        if (events.wheel !== 0) {
            this.renderer.camera.zoom += events.wheel * this.renderer.camera.zoom / -10;
            this.renderer.camera.updateProjectionMatrix();
            return true;
        }

        return false;
    }
}

const enum EdgeScrollMode {
    TileGridFollowing = 1,
    VisuallyEqual = 2,
}

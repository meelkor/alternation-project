import { fromEvent } from 'rxjs';
import { createElement } from 'jsx-dom';

import { Injectable } from '@alt/common';
import { RenderingConfigProvider, Renderer, Projector } from '@alt/engine/renderer';
import { ViewRegistry } from '@alt/engine/view/viewRegistry';
import { Timer } from '@alt/game/timer';
import { ResourceIndex } from '@alt/engine/resources/resourceIndex';
import { Camera } from '@alt/engine/camera';

import { MainView } from './mainView';
import { CameraControls } from './battlefield/services/cameraControls';

export class PocMain extends Injectable {
    private renderer: Renderer;
    private camera: Camera;

    private active = true;

    public async runGameExample() {
        await this.setup();
        this.setupRenderer();
        this.provide(MainView);
        this.instantiate(CameraControls);
        this.loop(performance.now());

        fromEvent(window, 'blur').subscribe(() => {
            this.active = false;
        });
        fromEvent(window, 'focus').subscribe(() => {
            if (!this.active) {
                this.active = true;
            }
        });
    }

    private loop(hrt: DOMHighResTimeStamp): void {
        window.requestAnimationFrame(this.loop.bind(this));
        if (this.active) {
            this.frame(hrt);
        }
    }

    private async setup() {
        this.provide(ViewRegistry);
        this.provide(RenderingConfigProvider).update({
            width: window.innerWidth,
            height: window.innerHeight,
            tileSize: 128,
        });
        await this.provide(ResourceIndex).init('/library/index.json');

        this.provide(Timer);
        this.camera = this.provide(Camera);
        this.provide(Projector);
        this.renderer = this.provide(Renderer);
    }

    private frame(hrt: DOMHighResTimeStamp): void {
        this.camera.update();
        this.renderer.render(hrt);
    }

    private setupRenderer(): void {
        const canvas = (<canvas></canvas>) as HTMLCanvasElement;
        document.body.append(canvas);
        this.renderer.setCanvas(canvas);
    }
}

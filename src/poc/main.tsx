import { fromEvent } from 'rxjs';
import { createElement } from 'jsx-dom';

import { Injectable } from '@alt/common';
import { RenderingConfigProvider, Renderer } from '@alt/engine/renderer';
import { Timer } from '@alt/game/timer';
import { ResourceIndex } from '@alt/engine/resources/resourceIndex';
import { GameMap } from '@alt/game';
import { EventHandler } from '@alt/engine/events';
import { Store } from '@alt/engine/store';

import { OverworldView } from './battlefield/overworldView';
import { PocStore } from './pocStore';

export class PocMain extends Injectable {
    private renderer: Renderer;

    private active = true;

    public async runGameExample() {
        await this.setup();
        this.setupRenderer();
        this.provide(EventHandler);
        this.provide(PocStore, Store);
        this.loop(performance.now());

        this.createOverworld();

        fromEvent(window, 'blur').subscribe(() => {
            this.active = false;
        });
        fromEvent(window, 'focus').subscribe(() => {
            if (!this.active) {
                this.active = true;
            }
        });
    }

    private createOverworld() {
        this.provide(OverworldView).createOverworld(new GameMap([]));
    }

    private loop(hrt: DOMHighResTimeStamp): void {
        window.requestAnimationFrame(this.loop.bind(this));
        if (this.active) {
            this.frame(hrt);
        }
    }

    private async setup() {
        this.provide(RenderingConfigProvider).update({
            width: window.innerWidth,
            height: window.innerHeight,
            tileSize: 128,
        });
        await this.provide(ResourceIndex).init('/library/index.json');

        this.provide(Timer);
        this.renderer = this.provide(Renderer);
    }

    private frame(hrt: DOMHighResTimeStamp): void {
        this.renderer.render(hrt);
    }

    private setupRenderer(): void {
        const canvas = (<canvas></canvas>) as HTMLCanvasElement;
        document.body.append(canvas);
        this.renderer.setCanvas(canvas);
    }
}

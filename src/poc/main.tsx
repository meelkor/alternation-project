import { createElement } from 'jsx-dom';

import { Injectable } from '@alt/common';
import { Renderer } from '@alt/engine/renderer';
import { GameMap } from '@alt/game';
import { ViewRegistry } from '@alt/engine/view/viewRegistry';
import { RendererConfig } from '@alt/engine/renderer/rendererConfig';
import { GameMapTile } from '@alt/game/gameMap';
import { Timer } from '@alt/game/timer';
import { ThreeRenderer } from '@alt/engine/threeRenderer';
import { TileProjector } from '@alt/engine/projection';
import { DiagonalTileProjector } from '@alt/engine/diagonalProjection';

import { BattlefieldView } from './battlefield/battlefieldView';

export class PocMain extends Injectable {
    private renderer: ThreeRenderer;

    constructor() {
        super();

        this.provide(ViewRegistry);

        this.provide(Timer);
        this.provide(RendererConfig);
        this.renderer = this.provide(ThreeRenderer, Renderer);
        this.provide(DiagonalTileProjector, TileProjector);
    }

    public runGameExample() {
        this.setupRenderer();

        const battlefield = this.provide(BattlefieldView);

        battlefield.init(new GameMap([
            new GameMapTile(0, 0, 'grass'),
            new GameMapTile(0, 1, 'grass'),
            new GameMapTile(1, 0, 'water'),
            new GameMapTile(1, 1, 'water'),
            new GameMapTile(2, 0, 'dirt'),
            new GameMapTile(2, 1, 'dirt'),
            new GameMapTile(2, 2, 'dirt'),
            new GameMapTile(2, 3, 'dirt'),
        ]));
    }

    private setupRenderer(): void {
        const canvas = (<canvas></canvas>) as HTMLCanvasElement;
        document.body.append(canvas);
        this.renderer.setCanvas(
            canvas,
            window.innerWidth,
            window.innerHeight,
        );
    }
}

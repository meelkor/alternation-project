import { WebGLRenderer, OrthographicCamera, Scene } from 'three';
import { Injectable } from '@alt/common';
import { DEBUG } from '@alt/common/env';

import { RenderingConfigProvider, RenderingConfig } from '.';
import { Component } from './component';
import { View } from '../view';
import { preventLambertOverlitExtension } from './extensions/preventLambertOverlit';
import { meshAtlasMaterialExtension } from './extensions/meshAtlasMaterial';

export class Renderer extends Injectable {
    private renderingConfig = this.inject(RenderingConfigProvider);

    private canvas: HTMLCanvasElement;

    private renderer: WebGLRenderer;
    private threeCamera: OrthographicCamera;

    private _worldScene: Scene;

    private components: BoundComponent[] = [];
    private views: View[] = [];

    public get eventTarget(): HTMLCanvasElement {
        return this.canvas;
    }

    public get camera(): OrthographicCamera {
        return this.threeCamera;
    }

    public get worldScene(): Scene {
        return this._worldScene;
    }

    public bindComponent(component: Component): void {
        const boundComp = { component };
        this.components.push(boundComp);
        this.registerComponent(boundComp);
        component.onBind();
    }

    public registerView(view: View) {
        this.views.push(view);
    }


    public registerComponent({ component }: BoundComponent) {
        component.setRenderingContext({
            scene: this.worldScene,
            eventTarget: this.canvas,
            events: {},
        });
    }

    public setCanvas(canvas: HTMLCanvasElement): void {
        this.canvas = canvas;
        this.setupThree();
        this.extendThree();
    }

    public render(hrt: DOMHighResTimeStamp): void {
        for (const view of this.views) {
            view.update(hrt);
        }

        for (const boundComponent of this.components) {
            boundComponent.component.render(hrt);
        }

        this.renderer.render(this.worldScene, this.threeCamera);
    }

    private setupThree(): void {
        const startingConfig = this.renderingConfig.config;

        this.canvas.width = startingConfig.width;
        this.canvas.height = startingConfig.height;

        this.renderer = new WebGLRenderer({
            canvas: this.canvas,
            antialias: false,
        });
        if (!DEBUG) {
            this.renderer.debug = {
                checkShaderErrors: false,
            };
        }

        const frustum = this.calculateFrustum(startingConfig);

        this.threeCamera = new OrthographicCamera(
            frustum.left,
            frustum.right,
            frustum.top,
            frustum.bottom,
        );

        const zPos = 10000 / 128;
        this.threeCamera.position.z = zPos;
        this.threeCamera.rotateZ(-45 / 180 * Math.PI);
        this.threeCamera.rotateX(60 / 180 * Math.PI);
        const baseOffset = Math.sqrt((Math.tan(60 / 180 * Math.PI) * zPos) ** 2  / 2);
        this.threeCamera.position.y = -baseOffset;
        this.threeCamera.position.x = -baseOffset;

        this._worldScene = new Scene();
    }

    private extendThree(): void {
        preventLambertOverlitExtension();
        meshAtlasMaterialExtension();
    }

    private calculateFrustum({ width, height, tileSize }: RenderingConfig): Frustum {
        return {
            left: -width / 2 / tileSize,
            right: width / 2 / tileSize,
            top: height / 2 / tileSize,
            bottom: height / -2 / tileSize,
        };
    }
}

interface Frustum {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

export type BoundComponent = {
    component: Component;
};

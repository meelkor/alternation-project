import { WebGLRenderer, OrthographicCamera, Scene, ShaderChunk } from 'three';
import { Injectable } from '@alt/common';

import { RenderingConfigProvider, RenderingConfig } from '.';
import { Component } from './component';
import { WorldCamera } from '../camera';

export class Renderer extends Injectable {
    private worldCamera = this.inject(WorldCamera);
    private renderingConfig = this.inject(RenderingConfigProvider);

    private canvas: HTMLCanvasElement;

    private renderer: WebGLRenderer;
    private threeCamera: OrthographicCamera;

    private _worldScene: Scene;

    private components: BoundComponent[] = [];

    public get eventTarget(): HTMLCanvasElement {
        return this.canvas;
    }

    public get camera(): OrthographicCamera {
        return this.threeCamera;
    }

    public get worldScene(): Scene {
        return this._worldScene;
    }

    public bind(component: Component, pane: number): void {
        const boundComp = { pane, component };
        this.components.push(boundComp);
        this.registerComponent(boundComp);
        component.onBind();
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
    }

    public render(hrt: DOMHighResTimeStamp): void {
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

        this.worldCamera.position$.subscribe(pos => {
            this.threeCamera.position.x = pos.x - baseOffset;
            this.threeCamera.position.y = pos.y - baseOffset;
        });
        this.worldCamera.zoom$.subscribe(z => {
            this.threeCamera.zoom = z;
            this.threeCamera.updateProjectionMatrix();
        });

        this.preventLambertOverlit();
    }

    private calculateFrustum({ width, height, tileSize }: RenderingConfig): Frustum {
        return {
            left: -width / 2 / tileSize,
            right: width / 2 / tileSize,
            top: height / 2 / tileSize,
            bottom: height / -2 / tileSize,
        };
    }

    private preventLambertOverlit() {
        ShaderChunk.lights_lambert_vertex = ShaderChunk.lights_lambert_vertex.replace(
            `#pragma unroll_loop
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		getSpotDirectLightIrradiance( spotLights[ i ], geometry, directLight );
		dotNL = dot( geometry.normal, directLight.direction );
		directLightColor_Diffuse = PI * directLight.color;
		vLightFront += saturate( dotNL ) * directLightColor_Diffuse;
		#ifdef DOUBLE_SIDED
			vLightBack += saturate( -dotNL ) * directLightColor_Diffuse;
		#endif
	}`,
			`vec3 maxLight = vec3(0.0); vec3 currentLight = vec3(0.0);
			#pragma unroll_loop
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		getSpotDirectLightIrradiance( spotLights[ i ], geometry, directLight );
		dotNL = dot( geometry.normal, directLight.direction );
		directLightColor_Diffuse = PI * directLight.color;

		currentLight = saturate( dotNL ) * directLightColor_Diffuse;

		if (all(lessThan(maxLight, currentLight)))
			maxLight = currentLight;
	}
	vLightFront += maxLight;`,
        );
    }
}

interface Frustum {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

export type BoundComponent = {
    pane: number;
    component: Component;
};

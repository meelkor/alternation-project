import { Subject, Observable, animationFrameScheduler } from 'rxjs';
import { WebGLRenderer, OrthographicCamera, Scene } from 'three';
import { mergeAll, observeOn } from 'rxjs/operators';

import { Renderer, BoundComponent } from '../renderer';
import { ThreeComponent } from './threeComponent';
import { ViewportSize } from '../renderer/renderer';

export class ThreeRenderer extends Renderer<ThreeComponent> {
    private rerender$ = new Subject<Observable<null>>();

    private canvas: HTMLCanvasElement;
    private width: number;
    private height: number;

    private renderer: WebGLRenderer;
    private camera: OrthographicCamera;

    private worldScene: Scene;

    public registerComponent({ component }: BoundComponent<ThreeComponent>) {
        // FIXME: ugly, find a better way to get component's meshes into scene
        component.scene = this.worldScene;
        this.rerender$.next(component.rerender$);
    }

    public setCanvas(canvas: HTMLCanvasElement, width: number, height: number): void {
        this.canvas = canvas;
        this.resize(width, height);
        this.setupThree();
    }

    public resize(width: number, height: number): void {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
        this.viewport$.next(new ViewportSize(width, height));
    }

    private setupThree(): void {
        this.renderer = new WebGLRenderer({
            canvas: this.canvas,
            // for now
            antialias: false,
        });

        this.camera = new OrthographicCamera(0, this.width, this.height, 0, 1, 1000);
        this.camera.position.z = 1000;

        this.worldScene = new Scene();

        this.rerender$.pipe(
            mergeAll(),
            observeOn(animationFrameScheduler),
        ).subscribe(() => {
            this.renderer.render(this.worldScene, this.camera);
        });
    }
}

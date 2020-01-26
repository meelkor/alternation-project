import { Component } from '../renderer';
import { Scene, Camera } from 'three';

export abstract class ThreeComponent extends Component {
    protected scene: Scene;
    protected eventTarget: HTMLCanvasElement;
    protected threeCamera: Camera;

    public setRenderingContext(scene: Scene, eventTarget: HTMLCanvasElement, threeCamera: Camera) {
        this.scene = scene;
        this.eventTarget = eventTarget;
        this.threeCamera = threeCamera;
    }
}

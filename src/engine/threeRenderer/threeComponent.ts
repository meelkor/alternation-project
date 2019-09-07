import { Observable } from 'rxjs';

import { Component } from '../renderer';
import { Scene } from 'three';

export abstract class ThreeComponent extends Component {
    public abstract rerender$: Observable<null>;

    public scene: Scene;
}

import { Component } from '../renderer';

export abstract class SvgComponent extends Component {
    public abstract getComponentElement(): SVGElement;
}

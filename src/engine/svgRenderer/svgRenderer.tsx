import { createElement } from 'jsx-dom';

import { Renderer, BoundComponent, ViewportSize } from '../renderer/renderer';
import { SvgComponent } from './svgComponent';

import './styles/svgRenderer.sass';

export class SvgRenderer extends Renderer<SvgComponent> {
    private html: HTMLElement;
    private svg: SVGSVGElement;

    public renderComponent({ component }: BoundComponent<SvgComponent>): void {
        this.svg.append(component.getComponentElement());
    }

    public setContainer(element: HTMLElement): void {
        this.html = element;

        this.createSvgContainer();
        this.observeContainer();
    }

    private observeContainer(): void {
        const observer = new ResizeObserver(() => this.updateViewportSize());
        observer.observe(this.html);
    }

    private createSvgContainer(): void {
        this.svg = <svg className='svg-container'></svg> as any as SVGSVGElement;
        this.html.append(this.svg);
    }

    private updateViewportSize(): void {
        const rect = this.html.getBoundingClientRect();
        this.viewport$.next(new ViewportSize(rect.width, rect.height));
    }
}

import { createElement } from 'jsx-dom';

import { ThreeComponent } from '@alt/engine/threeRenderer';
import { PxPos } from '@alt/engine/projection/tile';
import { Projector } from '@alt/engine/renderer';

export class ProjectionHelperComponent extends ThreeComponent {
    private coordElement = <p id='real'></p>;
    private coordsToProject: PxPos;

    private projector = this.inject(Projector);

    public onBind(): void {
        document.body.append(
            <div style='
                width: 200px;
                height: 60px;
                position: absolute;
                right: 20px;
                bottom: 20px;
                background: #ffffffc0;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column
            '>
                {this.coordElement}
            </div>,
        );

        this.eventTarget.addEventListener('mousemove', e => {
            this.coordsToProject = new PxPos(e.x, e.y);
        });
    }

    public render(): void {
        if (this.coordsToProject) {
            const tilePos = this.projector.unprojectToCamera(this.coordsToProject);
            this.coordElement.textContent = `${tilePos.x}, ${tilePos.y}`;
            this.coordsToProject = null;
        }
    }
}

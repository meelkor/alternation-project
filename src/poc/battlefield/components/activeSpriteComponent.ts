import { Observable, Subject } from 'rxjs';

import { SpriteComponent } from './spriteComponent';

export class ActiveSpriteComponent extends SpriteComponent {
    public clickSubject = new Subject<MouseEvent>();

    public get click$(): Observable<MouseEvent> {
        return this.clickSubject;
    }

    // public onBind() {
    //     super.onBind();

    //     this.eventTarget.add
    // }
}

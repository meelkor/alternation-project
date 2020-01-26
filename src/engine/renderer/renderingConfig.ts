import { Observable, Subject } from 'rxjs';

import { Injectable } from '@alt/common';

export class RenderingConfigProvider extends Injectable {
    public config: RenderingConfig;

    private updatesSubject = new Subject<RenderingConfig>();

    public get updates$(): Observable<RenderingConfig> {
        return this.updatesSubject.asObservable();
    }

    public update(opts: RenderingConfig): void {
        this.config = opts;
        this.updatesSubject.next(opts);
    }
}

export interface RenderingConfig {
    width: number;
    height: number;
    tileSize: number;
}

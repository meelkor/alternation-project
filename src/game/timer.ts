import { interval, Observable } from 'rxjs';

import { Injectable } from '@alt/common';
import { refCount, publish, map, takeWhile } from 'rxjs/operators';

export class Timer extends Injectable {
    public renderTimer$ = interval(1000 / 60).pipe(
        publish(),
        refCount(),
    );

    public getFiniteTimer(duration: number): Observable<number> {
        const start = Date.now();

        return this.renderTimer$.pipe(
            map(() => (Date.now() - start) / duration),
            takeWhile(v => v < 1, true),
            map(v => Math.min(1, v)),
        );
    }
}
